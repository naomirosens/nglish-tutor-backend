# 🚀 מדריך התקנה והרצה - English AI Tutor

## 📋 דרישות מקדימות

- Node.js 18+ ([הורדה](https://nodejs.org/))
- PostgreSQL 15+ ([הורדה](https://www.postgresql.org/download/))
- Angular CLI (`npm install -g @angular/cli`)
- חשבון Twilio ([הרשמה](https://www.twilio.com/try-twilio))
- חשבון ElevenLabs ([הרשמה](https://elevenlabs.io/))

---

## 🗄️ שלב 1: הגדרת Database

### התקנת PostgreSQL (Mac)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### יצירת Database
```bash
# התחברות ל-PostgreSQL
psql postgres

# יצירת database
CREATE DATABASE english_tutor;

# יציאה
\q

# הרצת הסכמה
cd backend
psql english_tutor < database.sql
```

---

## 🔧 שלב 2: הגדרת Backend

### התקנת חבילות
```bash
cd backend
npm install
```

### הגדרת משתנים
```bash
# העתקת קובץ דוגמה
cp .env.example .env

# ערכי את .env עם הפרטים שלך:
nano .env
```

הוסיפי את הפרטים הבאים ל-`.env`:
```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# ElevenLabs
ELEVENLABS_API_KEY=sk_xxxxxxxxxx

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_tutor
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Server
PORT=3000
```

### הרצת Backend
```bash
npm start
```

השרת אמור לרוץ על: `http://localhost:3000`

---

## 🎨 שלב 3: הגדרת Frontend (Angular)

### יצירת פרויקט Angular
```bash
cd ..
ng new frontend --routing --style=scss --skip-git
cd frontend
```

בזמן היצירה:
- Would you like to add Angular routing? → **Yes**
- Which stylesheet format? → **SCSS**

### התקנת Angular Material
```bash
ng add @angular/material
```

בחרי:
- Theme: **Indigo/Pink** (או כל ערכה שאת אוהבת)
- Typography: **Yes**
- Animations: **Yes**

### התקנת חבילות נוספות
```bash
npm install jwt-decode
```

### העתקת הקבצים
העתיקי את כל הקבצים מתיקיית `frontend-code/` לתוך `frontend/src/app/`:

```bash
# מתיקיית הפרויקט הראשית
cp -r frontend-code/services frontend/src/app/
cp -r frontend-code/guards frontend/src/app/
cp -r frontend-code/interceptors frontend/src/app/
cp -r frontend-code/components frontend/src/app/
cp frontend-code/app.module.ts frontend/src/app/
cp frontend-code/app-routing.module.ts frontend/src/app/
cp frontend-code/app.component.* frontend/src/app/
cp -r frontend-code/environments frontend/src/
cp frontend-code/styles.scss frontend/src/
```

### עדכון environment
ערכי את `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### הרצת Frontend
```bash
npm start
# או
ng serve
```

האפליקציה תהיה זמינה ב: `http://localhost:4200`

---

## 🌐 שלב 4: חשיפת השרת לאינטרנט (ngrok)

Twilio צריך לגשת לשרת שלך מהאינטרנט.

### התקנת ngrok
```bash
# Mac
brew install ngrok

# או הורידי מ: https://ngrok.com/download
```

### הרצת ngrok
```bash
# בחלון terminal נפרד
ngrok http 3000
```

תקבלי כתובת כמו: `https://abcd-1234.ngrok.io`

### עדכון Twilio Webhook

1. היכנסי ל-[Twilio Console](https://console.twilio.com)
2. לכי ל: **Phone Numbers → Manage → Active numbers**
3. לחצי על המספר שלך
4. תחת **Voice Configuration**:
   - A CALL COMES IN: `https://YOUR-NGROK-URL.ngrok.io/incoming-call` (POST)
   - CALL STATUS CHANGES: `https://YOUR-NGROK-URL.ngrok.io/call-status` (POST)
5. שמרי!

---

## ✅ שלב 5: בדיקה

### יצירת משתמש ראשון
1. פתחי דפדפן: `http://localhost:4200`
2. לחצי על "הירשם כאן"
3. מלאי פרטים:
   - שם מלא
   - אימייל
   - סיסמה (לפחות 6 תווים)
   - טלפון (בפורמט: +972501234567)
   - תפקיד: תלמידה או מורה
4. לחצי "הירשם"

### בדיקת שיחה (תלמידה)
1. התחברי כתלמידה
2. התקשרי למספר Twilio שלך
3. אמורה לשמוע: "Hi! I'm so excited to practice English with you today!"
4. דברי באנגלית על תחביבים
5. השיחה תישמר אוטומטית ב-database

### בדיקת דשבורד (מורה)
1. התחברי כמורה
2. הוסיפי תלמידה (לפי אימייל)
3. צפי בשיחות ובהתקדמות

---

## 📊 מבנה הפרויקט המלא

```
english-ai-tutor/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── database.sql
│   ├── package.json
│   ├── .env
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       ├── student.js
│       └── teacher.js
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   ├── student.service.ts
    │   │   │   └── teacher.service.ts
    │   │   ├── guards/
    │   │   │   ├── auth.guard.ts
    │   │   │   └── role.guard.ts
    │   │   ├── interceptors/
    │   │   │   └── auth.interceptor.ts
    │   │   ├── components/
    │   │   │   ├── login/
    │   │   │   ├── register/
    │   │   │   ├── student-dashboard/
    │   │   │   └── teacher-dashboard/
    │   │   ├── app.module.ts
    │   │   └── app-routing.module.ts
    │   ├── environments/
    │   └── styles.scss
    └── angular.json
```

---

## 🐛 פתרון בעיות נפוצות

### Backend לא מתחבר ל-Database
```bash
# בדקי שהשירות רץ
brew services list | grep postgresql

# אם לא רץ, הפעילי
brew services start postgresql@15

# בדקי חיבור
psql -U postgres -d english_tutor -c "SELECT 1;"
```

### Frontend לא מוצא modules
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Twilio לא מתחבר
- ודאי ש-ngrok רץ
- ודאי שה-webhook URL נכון ב-Twilio Console
- בדקי logs בטרמינל של Backend

### ElevenLabs API Error
- ודאי שיש קרדיט בחשבון
- בדקי שה-API Key נכון (בלי רווחים)

---

## 💰 עלויות חודשיות משוערות

### פיתוח (חינם!)
- Twilio: $15 קרדיט חינמי
- ElevenLabs: 10,000 תווים חינם
- ngrok: חינמי
- PostgreSQL: חינמי (מקומי)

### פרודקשן (50 שיחות/חודש)
- Twilio: ~$2-5
- ElevenLabs: ~$5-10
- Hosting (Railway/Render): ~$5
- **סה"כ: ~$12-20/חודש**

---

## 🎯 מה הלאה?

השלבים הבאים לפיתוח:
1. ✅ תמלול שיחות אוטומטי
2. ✅ ניתוח AI של דקדוק ושגיאות
3. ✅ בחירת נושא שיחה דינמית
4. ✅ אינטגרציה עם Stripe לתשלומים
5. ✅ מערכת התראות (SMS/Email)
6. ✅ דוחות מתקדמים למורה

---

## 📞 תמיכה

אם יש בעיות או שאלות, בדקי:
1. Logs של Backend (בטרמינל)
2. Console של הדפדפן (F12)
3. Twilio Debugger Console

בהצלחה! 🚀
