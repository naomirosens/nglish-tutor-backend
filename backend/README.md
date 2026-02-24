# 🎓 English AI Tutor - Backend

Backend API למערכת שיחות AI לתרגול אנגלית.

## 📋 התקנה

### 1. התקנת PostgreSQL

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
הורידי מ: https://www.postgresql.org/download/windows/

### 2. יצירת Database

```bash
# התחברות ל-PostgreSQL
psql postgres

# יצירת database
CREATE DATABASE english_tutor;

# יציאה
\q

# הרצת הסכמה
psql english_tutor < database.sql
```

### 3. התקנת חבילות

```bash
cd backend
npm install
```

### 4. הגדרת משתנים

העתיקי את `.env.example` ל-`.env` ומלאי את הפרטים:

```bash
cp .env.example .env
```

ערכי את `.env` עם הפרטים שלך.

### 5. הרצת השרת

```bash
npm start
```

## 🔌 API Endpoints

### Authentication

**הרשמה**
```
POST /api/auth/register
Body: {
  "email": "student@example.com",
  "password": "password123",
  "fullName": "שם מלא",
  "role": "student",
  "phone": "+972501234567"
}
```

**התחברות**
```
POST /api/auth/login
Body: {
  "email": "student@example.com",
  "password": "password123"
}
```

### Student Routes (דורש אימות)

**פרופיל**
```
GET /api/student/profile
Headers: { "Authorization": "Bearer <token>" }
```

**היסטוריית שיחות**
```
GET /api/student/calls
Headers: { "Authorization": "Bearer <token>" }
```

**סטטיסטיקות**
```
GET /api/student/stats
Headers: { "Authorization": "Bearer <token>" }
```

### Teacher Routes (דורש אימות)

**רשימת תלמידות**
```
GET /api/teacher/students
Headers: { "Authorization": "Bearer <token>" }
```

**הוספת תלמידה**
```
POST /api/teacher/students
Headers: { "Authorization": "Bearer <token>" }
Body: { "studentEmail": "student@example.com" }
```

**שיחות של תלמידה**
```
GET /api/teacher/students/:studentId/calls
Headers: { "Authorization": "Bearer <token>" }
```

**דוח התקדמות**
```
GET /api/teacher/students/:studentId/progress
Headers: { "Authorization": "Bearer <token>" }
```

## 🔧 מבנה הפרויקט

```
backend/
├── server.js              # שרת ראשי
├── db.js                  # חיבור ל-database
├── database.sql           # סכמת database
├── middleware/
│   └── auth.js           # אימות JWT
├── routes/
│   ├── auth.js           # נתיבי הרשמה והתחברות
│   ├── student.js        # נתיבי תלמידה
│   └── teacher.js        # נתיבי מורה
├── package.json
└── .env
```

## 🚀 הבא בתור

- [ ] אינטגרציה עם Stripe לתשלומים
- [ ] תמלול שיחות אוטומטי
- [ ] ניתוח AI של שיחות
- [ ] בחירת נושא שיחה דינמית
