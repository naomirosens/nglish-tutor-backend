// ============================================
// 🚀 English AI Tutor - Twilio Simple Version
// ============================================

import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// 📞 TWILIO - טיפול בשיחות נכנסות
// ============================================

app.post('/incoming-call', (req, res) => {
    console.log('📞 שיחה נכנסת!');
    console.log('From:', req.body.From);
    console.log('CallSid:', req.body.CallSid);

    const twiml = new twilio.twiml.VoiceResponse();

    // הודעת ברוכים הבאים
    twiml.say({
        voice: 'Polly.Joanna',
        language: 'en-US'
    }, 'Hi! Welcome to English AI Tutor. This is a test call. The system is working!');

    // שאלה פשוטה
    const gather = twiml.gather({
        input: 'speech',
        action: '/handle-response',
        language: 'en-US',
        timeout: 3
    });

    gather.say({
        voice: 'Polly.Joanna'
    }, 'What is your name?');

    // אם אין תשובה
    twiml.say({
        voice: 'Polly.Joanna'
    }, 'I did not hear anything. Goodbye!');

    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());

    console.log('✅ TwiML נשלח בהצלחה');
});

// ============================================
// 🎤 טיפול בתשובה
// ============================================

app.post('/handle-response', (req, res) => {
    console.log('🎤 תשובה התקבלה!');
    console.log('Speech:', req.body.SpeechResult);

    const twiml = new twilio.twiml.VoiceResponse();

    const name = req.body.SpeechResult || 'friend';

    twiml.say({
        voice: 'Polly.Joanna'
    }, `Nice to meet you, ${name}! This is a test of the English tutor system. Everything is working correctly. Goodbye!`);

    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
});

// ============================================
// 🔚 סטטוס שיחה
// ============================================

app.post('/call-status', (req, res) => {
    console.log('📊 סטטוס:', req.body.CallStatus);
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
      <title>English AI Tutor - Test</title>
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
        h1 { color: #2c3e50; text-align: center; }
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
        <h1>🎓 English AI Tutor - Test Version</h1>
        <div class="status">
          <strong>✅ השרת פועל!</strong>
          <p>גרסת בדיקה עם Twilio בלבד (ללא ElevenLabs)</p>
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
    console.log('   English AI Tutor - Test Server');
    console.log('   ========================================');
    console.log(`   🌐 Server: http://localhost:${PORT}`);
    console.log('   📞 Twilio: ${process.env.TWILIO_PHONE_NUMBER}');
    console.log('   ========================================');
    console.log('');
});
