// ============================================
// 🚀 English AI Tutor - Simple Server (No DB)
// ============================================

import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import https from 'https';

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
// 📊 מאגר זמני לשיחות (בזיכרון)
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

START THE CONVERSATION:
"Hi! I'm so excited to practice English with you today! Let's talk about hobbies. What do you like to do in your free time?"`,
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
        // שומר את פרטי השיחה בזיכרון
        calls[callSid] = {
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
            console.log(`✅ שיחה הסתיימה: ${duration} שניות`);
        }
    }

    res.sendStatus(200);
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
          <p>התקשרי ל: ${process.env.TWILIO_PHONE_NUMBER || '+15074194796'}</p>
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
