# 🎓 English AI Tutor - מערכת שיחות AI לאנגלית

מערכת לתרגול אנגלית דרך שיחות טלפון עם AI חכם.

---

## 📋 מה צריך לפני שמתחילים?

### 1️⃣ התקנת Node.js
אם עוד לא התקנת, הורידי מ: https://nodejs.org/
(גרסה 18 או יותר חדשה)

### 2️⃣ חשבונות שצריך לפתוח (חינם בהתחלה!)

#### 🔵 Twilio (לטלפוניה)
1. היכנסי ל: https://www.twilio.com/try-twilio
2. הירשמי (מקבלים $15 קרדיט חינם!)
3. אמתי מספר טלפון
4. קבלי:
   - Account SID
   - Auth Token
   - קני מספר טלפון (Buy a Number)

#### 🟣 ElevenLabs (לשיחות AI)
1. היכנסי ל: https://elevenlabs.io/
2. הירשמי (יש תוכנית חינמית!)
3. לכי ל-API Settings
4. העתיקי את ה-API Key

---

## 🚀 התקנה - צעד אחר צעד

### שלב 1: הורדת הקוד
```bash
# פתחי terminal והריצי:
cd Desktop
mkdir english-tutor-project
cd english-tutor-project

# העתיקי את כל הקבצים שיצרתי לתיקייה הזו
```

### שלב 2: התקנת חבילות
```bash
npm install
```

### שלב 3: הגדרת משתנים
1. שני את השם של `.env.example` ל-`.env`
2. מלאי את הפרטים:

```
TWILIO_ACCOUNT_SID=AC...  (מ-Twilio Console)
TWILIO_AUTH_TOKEN=...     (מ-Twilio Console)
TWILIO_PHONE_NUMBER=+1... (המספר שקנית)

ELEVENLABS_API_KEY=...    (מ-ElevenLabs)

PORT=3000
```

### שלב 4: הרצת השרת (לבדיקה מקומית)
```bash
npm start
```

אמורה לראות:
```
🎓 ========================================
   English AI Tutor - Server Started!
   ========================================
   🌐 Server: http://localhost:3000
```

פתחי דפדפן ולכי ל: http://localhost:3000

---

## 🌍 חשיפת השרת לאינטרנט (בשביל Twilio)

Twilio צריך לגשת לשרת שלך מהאינטרנט. יש 2 אופציות:

### אופציה 1: ngrok (מהיר לפיתוח!) ✨

1. הורידי ngrok: https://ngrok.com/download
2. הירשמי וקבלי auth token
3. התקיני:
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

4. הריצי (בחלון terminal נפרד!):
```bash
ngrok http 3000
```

5. תקבלי כתובת כמו:
```
https://abcd-1234.ngrok.io
```

6. העתיקי את הכתובת הזו והוסיפי אותה ל-`.env`:
```
SERVER_URL=https://abcd-1234.ngrok.io
```

### אופציה 2: הוסטינג אמיתי (לפרודקשן)
- Railway.app (קל ומומלץ!)
- Render.com
- Heroku

---

## ⚙️ חיבור Twilio לשרת

1. היכנסי ל-Twilio Console: https://console.twilio.com
2. לכי ל: **Phone Numbers → Manage → Active numbers**
3. לחצי על המספר שקנית
4. גללי ל-**Voice Configuration**
5. תחת "A CALL COMES IN":
   - בחרי **Webhook**
   - הכניסי: `https://YOUR-NGROK-URL.ngrok.io/incoming-call`
   - בחרי **HTTP POST**
6. תחת "CALL STATUS CHANGES":
   - הכניסי: `https://YOUR-NGROK-URL.ngrok.io/call-status`
   - בחרי **HTTP POST**
7. **שמרי!**

---

## 📞 בדיקה ראשונה!

1. ודאי שהשרת רץ (`npm start`)
2. ודאי ש-ngrok רץ
3. התקשרי למספר Twilio שלך מהטלפון
4. אמורה לשמוע: "Hi! I'm so excited to practice English with you today!"

---

## 🎯 נושאי השיחה (4 מוכנים!)

המערכת מגיעה עם 4 נושאים:

1. **Hobbies & Interests** - תחביבים ותחומי עניין
2. **Daily Routine** - שגרת יום
3. **Food & Cooking** - אוכל ובישול
4. **Travel & Places** - טיולים ומקומות

כרגע השיחות מתחילות עם "Hobbies" אוטומטית.

---

## 🔍 APIs זמינים

### קבלת רשימת שיחות
```
GET http://localhost:3000/api/calls
```

תגובה:
```json
{
  "success": true,
  "calls": [
    {
      "callSid": "CA123...",
      "from": "+972...",
      "topic": "hobbies",
      "startTime": "2024-02-16T10:30:00.000Z",
      "status": "completed",
      "durationSeconds": 180
    }
  ]
}
```

### קבלת נושאי שיחה
```
GET http://localhost:3000/api/topics
```

---

## 📊 מבנה הפרויקט

```
english-ai-tutor/
│
├── server.js           # השרת הראשי (כל הקוד פה!)
├── package.json        # הגדרות הפרויקט
├── .env               # המשתנים הסודיים שלך (אל תשתפי!)
├── .env.example       # תבנית למשתנים
└── README.md          # המדריך הזה
```

---

## 🐛 פתרון בעיות נפוצות

### השיחה לא מתחילה
- ✅ בדקי ש-ngrok רץ
- ✅ בדקי שה-webhook URL נכון ב-Twilio
- ✅ בדקי שה-ELEVENLABS_API_KEY תקין
- ✅ בדקי logs בטרמינל

### ElevenLabs לא עובד
- ✅ ודאי שיש לך קרדיט בחשבון
- ✅ ה-API Key מועתק נכון (בלי רווחים!)

### Twilio לא מתחבר
- ✅ ה-Account SID ו-Auth Token נכונים
- ✅ המספר הוזן עם + (לדוגמה: +12345678900)

---

## 💰 עלויות משוערות

### לפיתוח (חינם!)
- Twilio: $15 קרדיט חינמי (מספיק ל-30+ שיחות!)
- ElevenLabs: 10,000 תווים חינם בחודש
- ngrok: חינמי לחלוטין

### לפרודקשן (50 שיחות/חודש)
- Twilio: ~$2-5
- ElevenLabs: ~$5-10
- הוסטינג: $5
- **סה"כ: ~$12-20/חודש**

---

## 🎯 מה הלאה?

השלבים הבאים שנוסיף:
1. ✅ מערכת הרשמה ותשלומים
2. ✅ דשבורד למורה לראות התקדמות
3. ✅ בחירת נושא שיחה
4. ✅ מבדק רמה לתלמידה
5. ✅ מעבר למסד נתונים (PostgreSQL)

---

## 📞 צריכה עזרה?

אל תהססי לשאול! אני פה לעזור בכל שלב.

**בהצלחה! 🚀**
# english-tutor-backend
