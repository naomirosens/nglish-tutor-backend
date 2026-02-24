# ⚡ התחלה מהירה - English AI Tutor

## 🎯 מה בנינו?

מערכת טלפונית לשיחות AI באנגלית עם:
- ✅ אימות משתמשים (תלמידות + מורות)
- ✅ שיחות טלפון עם AI חכם (ElevenLabs)
- ✅ 4 נושאי שיחה מוגדרים
- ✅ מניעת סטייה לנושאים לא רצויים
- ✅ דשבורד למורה עם דוחות התקדמות
- ✅ דשבורד לתלמידה עם היסטוריה
- ✅ שמירת שיחות ב-PostgreSQL

---

## 🚀 הרצה מהירה (3 דקות)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# ערכי את .env עם הפרטים שלך
npm start
```

### 2. Database
```bash
psql postgres -c "CREATE DATABASE english_tutor;"
psql english_tutor < backend/database.sql
```

### 3. Frontend
```bash
ng new frontend --routing --style=scss
cd frontend
ng add @angular/material
npm install jwt-decode

# העתיקי קבצים מ-frontend-code/ ל-src/app/
npm start
```

### 4. ngrok (לחיבור Twilio)
```bash
ngrok http 3000
# העתיקי את ה-URL ל-Twilio Console
```

---

## 📱 זרימת עבודה

### תלמידה:
1. נרשמת באתר
2. מתקשרת למספר Twilio
3. מדברת באנגלית עם AI
4. רואה היסטוריה ודוחות בדשבורד

### מורה:
1. נרשמת באתר
2. מוסיפה תלמידות (לפי אימייל)
3. רואה שיחות של כל תלמידה
4. מקבלת דוחות התקדמות מפורטים

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - הרשמה
- `POST /api/auth/login` - התחברות

### Student (דורש token)
- `GET /api/student/profile` - פרופיל
- `GET /api/student/calls` - היסטוריית שיחות
- `GET /api/student/stats` - סטטיסטיקות

### Teacher (דורש token)
- `GET /api/teacher/students` - רשימת תלמידות
- `POST /api/teacher/students` - הוספת תלמידה
- `GET /api/teacher/students/:id/calls` - שיחות תלמידה
- `GET /api/teacher/students/:id/progress` - דוח התקדמות

### Twilio Webhooks
- `POST /incoming-call` - שיחה נכנסת
- `POST /call-status` - עדכון סטטוס

---

## 🎯 נושאי שיחה

1. **Hobbies & Interests** - תחביבים
2. **Daily Routine** - שגרת יום
3. **Food & Cooking** - אוכל ובישול
4. **Travel & Places** - טיולים

כל נושא כולל:
- הוראות ברורות ל-AI
- מניעת סטייה לנושאים אחרים
- תיקון דקדוק עדין
- שאלות המשך טבעיות

---

## 🛡️ אבטחה

- JWT tokens עם תוקף 7 ימים
- סיסמאות מוצפנות (bcrypt)
- Role-based access control
- HTTP Interceptor אוטומטי
- Guards על כל הנתיבים

---

## 📊 Database Schema

```sql
users              # משתמשים (תלמידות + מורות)
teacher_students   # קישור בין מורה לתלמידה
calls              # שיחות
call_analysis      # ניתוח שיחות (לעתיד)
subscriptions      # מנויים (לעתיד)
```

---

## 💡 טיפים

1. **פיתוח מקומי**: השתמשי ב-ngrok
2. **פרודקשן**: העלי ל-Railway או Render
3. **בדיקות**: התחילי עם חשבון Twilio Trial
4. **עלויות**: ~$15-20/חודש ל-50 שיחות

---

## 🔮 תכונות עתידיות

- [ ] תמלול שיחות אוטומטי
- [ ] ניתוח AI של שגיאות
- [ ] בחירת נושא לפני שיחה
- [ ] תשלומים (Stripe)
- [ ] התראות SMS/Email
- [ ] גרפים מתקדמים

---

## 📞 עזרה מהירה

**Backend לא עובד?**
```bash
# בדקי logs
tail -f backend/logs.txt

# בדקי database
psql english_tutor -c "SELECT * FROM users;"
```

**Frontend לא עובד?**
```bash
# נקי cache
rm -rf node_modules package-lock.json
npm install
```

**Twilio לא מתחבר?**
- ודאי ש-ngrok רץ
- בדקי webhook URL ב-Twilio Console
- בדקי logs בטרמינל

---

בהצלחה! 🎉
