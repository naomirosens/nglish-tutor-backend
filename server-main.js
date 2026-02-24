// ============================================
// 🚀 English AI Tutor - Main Server
// ============================================

import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import https from 'https';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teacher.js';
import studentRoutes from './routes/student.js';

dotenv.config();

// Fix SSL certificate issue for ElevenLabs API
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// ============================================
// 📊 מאגר זמני לשיחות
// ============================================

const calls = {};

// ============================================
// 🎯 נושאי השיחה
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
- Correct major grammar mistakes gently
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
                voice: {
                    voice_id: "21m00Tcm4TlvDq8ikWAM",
                },
                conversation_config: {
                    max_duration_seconds: 900,
                },
                language: "en",
            },
            {
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                httpsAgent: httpsAgent
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

    try {
        // מציאת התלמידה לפי מספר טלפון
        const userResult = await pool.query(
            'SELECT id FROM users WHERE phone = $1 AND role = $2',
            [from, 'student']
        );

        let studentId = null;
        if (userResult.rows.length > 0) {
            studentId = userResult.rows[0].id;
        }

        // שומר את פרטי השיחה ב-DB
        const callResult = await pool.query(
            `INSERT INTO calls (student_id, call_sid, phone_number, topic, start_time, status)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING id`,
            [studentId, callSid, from, 'hobbies', 'started']
        );

        const callId = callResult.rows[0].id;

        // שומר גם במאגר הזמני
        calls[callSid] = {
            id: callId,
            studentId: studentId,
            from: from,
            startTime: new Date(),
            topic: 'hobbies',
            status: 'started'
        };

        // יוצר agent ב-ElevenLabs
        const agentId = await createElevenLabsAgent('hobbies');
        calls[callSid].agentId = agentId;

        // מחזיר ל-Twilio הוראות
        const twiml = new twilio.twiml.VoiceResponse();
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

app.post('/call-status', async (req, res) => {
    const callSid = req.body.CallSid;
    const status = req.body.CallStatus;

    console.log(`📊 סטטוס שיחה: ${callSid} - ${status}`);

    if (calls[callSid]) {
        calls[callSid].status = status;

        if (status === 'completed') {
            const endTime = new Date();
            const duration = (endTime - calls[callSid].startTime) / 1000;

            // עדכון ב-DB
            await pool.query(
                `UPDATE calls 
         SET status = $1, end_time = $2, duration_seconds = $3
         WHERE call_sid = $4`,
                [status, endTime, Math.floor(duration), callSid]
            );

            console.log(`✅ שיחה הסתיימה: ${duration} שניות`);
        }
    }

    res.sendStatus(200);
});

// ============================================
// 📋 API - נושאי שיחה
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
// 🏠 דף בית
// ============================================

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>English AI Tutor</title>
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 English AI Tutor</h1>
        <div class="status">
          <strong>✅ השרת פועל!</strong>
          <p>המערכת מוכנה לקבל שיחות.</p>
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
    console.log('   ========================================');
    console.log('');
});
