// ============================================
// 🚀 English AI Tutor - Main Server
// ============================================

import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import pool from './backend/db.js';
import authRoutes from './backend/routes/auth.js';
import teacherRoutes from './backend/routes/teacher.js';
import studentRoutes from './backend/routes/student.js';
import { authenticateToken, requireRole } from './backend/middleware/auth.js';

// טוען את כל המשתנים מקובץ .env
dotenv.config();

// יוצר את השרת
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware - תוספים שעוזרים לשרת לעבוד
// ============================================

app.use(cors()); // מאפשר קריאות מדפדפן
app.use(bodyParser.json()); // מאפשר לקרוא JSON
app.use(bodyParser.urlencoded({ extended: true })); // מאפשר לקרוא forms

// ============================================
// 🔐 Authentication Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// ============================================
// 📊 מאגר זמני לשיחות (בהמשך נעביר ל-DB)
// ============================================

const calls = {};

// ============================================
// 🎯 נושאי השיחה - 4 נושאים מוכנים
// ============================================

const conversationTopics = {
  hobbies: {
    name: "Hobbies & Interests",
    nameHebrew: "תחביבים ותחומי עניין",
    systemPrompt: `You are a friendly English conversation tutor speaking with a student.

TOPIC: Hobbies and Interests

YOUR ROLE:
- Help the student practice English conversation about their hobbies
- Ask follow-up questions to keep the conversation flowing
- Correct major grammar mistakes gently (e.g., "You mean 'I like reading', not 'I like read'")
- Use simple, clear English appropriate for language learners
- Be encouraging and supportive

STRICT RULES - NEVER DISCUSS:
- Politics or controversial topics
- Religion
- Inappropriate content
- Personal contact information
- Anything outside of hobbies and interests

IF STUDENT TRIES TO CHANGE TOPIC:
Gently redirect: "That's interesting, but let's focus on practicing English through talking about hobbies today. What do you like to do in your free time?"

START THE CONVERSATION:
"Hi! I'm so excited to practice English with you today! Let's talk about hobbies. What do you like to do in your free time?"`,
  },

  dailyRoutine: {
    name: "Daily Routine",
    nameHebrew: "שגרת יום",
    systemPrompt: `You are a friendly English conversation tutor speaking with a student.

TOPIC: Daily Routine

YOUR ROLE:
- Help the student describe their typical day in English
- Ask about morning routine, school, afternoon, evening
- Teach time-related vocabulary naturally
- Correct mistakes gently
- Keep the conversation positive and educational

STRICT RULES - NEVER DISCUSS:
- Politics or controversial topics
- Religion
- Inappropriate content
- Personal identifying information
- Anything outside of daily routines

IF STUDENT TRIES TO CHANGE TOPIC:
Redirect gently: "Let's keep practicing English by talking about your daily routine. What time do you usually wake up?"

START THE CONVERSATION:
"Hello! Today let's practice English by talking about your daily routine. Can you tell me what a typical day looks like for you?"`,
  },

  foodAndCooking: {
    name: "Food & Cooking",
    nameHebrew: "אוכל ובישול",
    systemPrompt: `You are a friendly English conversation tutor speaking with a student.

TOPIC: Food and Cooking

YOUR ROLE:
- Help the student talk about their favorite foods
- Discuss recipes, restaurants, or cooking experiences
- Teach food-related vocabulary
- Ask engaging questions about taste, preferences
- Be enthusiastic about food culture

STRICT RULES - NEVER DISCUSS:
- Politics or controversial topics
- Religion
- Diet culture or body image
- Inappropriate content
- Anything outside of food and cooking

IF STUDENT TRIES TO CHANGE TOPIC:
Redirect: "That sounds interesting! But let's keep our focus on food today to practice English. What's your favorite meal?"

START THE CONVERSATION:
"Hi there! I love talking about food! Let's practice English by discussing what you like to eat. What's your favorite food?"`,
  },

  travel: {
    name: "Travel & Places",
    nameHebrew: "טיולים ומקומות",
    systemPrompt: `You are a friendly English conversation tutor speaking with a student.

TOPIC: Travel and Places

YOUR ROLE:
- Help the student talk about places they've visited or want to visit
- Discuss different countries, cities, or attractions
- Teach geography and travel-related vocabulary
- Ask about travel experiences or dream destinations
- Make the conversation fun and imaginative

STRICT RULES - NEVER DISCUSS:
- Politics or controversial topics
- Religion
- Border conflicts or sensitive political geography
- Inappropriate content
- Anything outside of travel and tourism

IF STUDENT TRIES TO CHANGE TOPIC:
Redirect: "That's nice, but let's stay on topic and practice English through talking about travel. Where would you love to visit?"

START THE CONVERSATION:
"Hello! I'm excited to talk about travel with you today! Have you been to any interesting places? Or where would you love to visit?"`,
  }
};

// ============================================
// 🎤 ElevenLabs - יצירת Agent שיחה
// ============================================

async function createElevenLabsAgent(topic) {
  const topicData = conversationTopics[topic];

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/convai/agents',
      {
        name: `English Tutor - ${topicData.name}`,
        prompt: {
          prompt: topicData.systemPrompt,
        },
        // קול נשי נעים (את יכולה לשנות את ה-voice_id)
        voice: {
          voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel - קול אמריקאי נעים
        },
        // הגדרות שיחה
        conversation_config: {
          max_duration_seconds: 900, // 15 דקות מקסימום
        },
        // שפה
        language: "en",
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.agent_id;
  } catch (error) {
    console.error('Error creating ElevenLabs agent:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 📞 TWILIO - טיפול בשיחות נכנסות
// ============================================

app.post('/incoming-call', async (req, res) => {
  console.log('📞 שיחה נכנסת!');

  const callSid = req.body.CallSid;
  const from = req.body.From;

  // שומר את פרטי השיחה
  calls[callSid] = {
    from: from,
    startTime: new Date(),
    topic: 'hobbies', // בשלב הראשון נתחיל עם נושא קבוע
    status: 'started'
  };

  try {
    // יוצר agent ב-ElevenLabs עבור השיחה הזו
    const agentId = await createElevenLabsAgent('hobbies');
    calls[callSid].agentId = agentId;

    // מחזיר ל-Twilio הוראות להתחיל את השיחה
    const twiml = new twilio.twiml.VoiceResponse();

    // מחבר את השיחה ל-ElevenLabs דרך WebSocket
    const connect = twiml.connect();
    connect.stream({
      url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`,
      parameters: {
        'api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    res.type('text/xml');
    res.send(twiml.toString());

    console.log('✅ שיחה התחברה בהצלחה!');
  } catch (error) {
    console.error('❌ שגיאה בהתחברות:', error);

    // אם יש בעיה, מודיע לתלמידה בטלפון
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Sorry, there was an error connecting to the tutor. Please try again later.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// ============================================
// 🔚 TWILIO - סיום שיחה
// ============================================

app.post('/call-status', (req, res) => {
  const callSid = req.body.CallSid;
  const status = req.body.CallStatus;

  console.log(`📊 סטטוס שיחה: ${callSid} - ${status}`);

  if (calls[callSid]) {
    calls[callSid].status = status;

    if (status === 'completed') {
      calls[callSid].endTime = new Date();
      const duration = (calls[callSid].endTime - calls[callSid].startTime) / 1000;
      calls[callSid].durationSeconds = Math.floor(duration);

      console.log(`✅ שיחה הסתיימה: ${duration} שניות`);
    }
  }

  res.sendStatus(200);
});

// ============================================
// 📋 API - קבלת רשימת שיחות
// ============================================

app.get('/api/calls', (req, res) => {
  // ממיר את האובייקט למערך לצורך תצוגה
  const callsList = Object.keys(calls).map(callSid => ({
    callSid,
    ...calls[callSid]
  }));

  res.json({
    success: true,
    calls: callsList
  });
});

// ============================================
// 📋 API - קבלת נושאי שיחה זמינים
// ============================================

app.get('/api/topics', (req, res) => {
  const topicsList = Object.keys(conversationTopics).map(key => ({
    id: key,
    name: conversationTopics[key].name,
    nameHebrew: conversationTopics[key].nameHebrew
  }));

  res.json({
    success: true,
    topics: topicsList
  });
});

// ============================================
// 📊 דשבורד
// ============================================

app.get('/dashboard', (req, res) => {
  res.sendFile('/home/claude/english-ai-tutor/dashboard.html');
});

// ============================================
// 🏠 דף בית פשוט
// ============================================

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>English AI Tutor - מורה AI לאנגלית</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2c3e50;
          text-align: center;
        }
        .status {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          padding: 15px;
          margin: 20px 0;
        }
        .info {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 15px;
          margin: 20px 0;
        }
        .topics {
          margin: 20px 0;
        }
        .topic-item {
          background: #fafafa;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
          border-right: 3px solid #9c27b0;
        }
        code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 English AI Tutor</h1>
        <div class="status">
          <strong>✅ השרת פועל!</strong>
          <p>המערכת מוכנה לקבל שיחות.</p>
        </div>
        
        <div class="info">
          <h3>📞 איך להתחיל?</h3>
          <ol>
            <li>התקשרי למספר הטלפון של Twilio שלך</li>
            <li>המערכת תתחיל שיחה אוטומטית באנגלית</li>
            <li>תוכלי לדבר בחופשיות על הנושא שנבחר</li>
          </ol>
        </div>

        <div class="topics">
          <h3>🎯 נושאי שיחה זמינים:</h3>
          <div class="topic-item">
            <strong>תחביבים ותחומי עניין</strong> (Hobbies & Interests)
          </div>
          <div class="topic-item">
            <strong>שגרת יום</strong> (Daily Routine)
          </div>
          <div class="topic-item">
            <strong>אוכל ובישול</strong> (Food & Cooking)
          </div>
          <div class="topic-item">
            <strong>טיולים ומקומות</strong> (Travel & Places)
          </div>
        </div>

        <div class="info">
          <h3>🔍 APIs זמינים:</h3>
          <p><code>GET /api/calls</code> - רשימת כל השיחות</p>
          <p><code>GET /api/topics</code> - נושאי שיחה זמינים</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ============================================
// 🚀 הפעלת השרת
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('🎓 ========================================');
  console.log('   English AI Tutor - Server Started!');
  console.log('   ========================================');
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log(`   📞 Twilio webhook: ${process.env.SERVER_URL || 'Not configured'}/incoming-call`);
  console.log('   ========================================');
  console.log('');
});
