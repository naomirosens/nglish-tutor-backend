# 🎨 הקמת Angular Frontend

## שלב 1: יצירת פרויקט Angular

```bash
# התקנת Angular CLI (אם עוד לא מותקן)
npm install -g @angular/cli

# יצירת פרויקט חדש
ng new frontend --routing --style=scss

# כניסה לתיקייה
cd frontend
```

## שלב 2: התקנת חבילות נוספות

```bash
# Angular Material (UI components)
ng add @angular/material

# HTTP Client (כבר מותקן)
# Forms (כבר מותקן)

# Chart.js לגרפים
npm install chart.js ng2-charts

# JWT Decode
npm install jwt-decode
```

## שלב 3: יצירת מבנה הפרויקט

```bash
# Services
ng generate service core/services/auth
ng generate service core/services/api
ng generate service core/services/student
ng generate service core/services/teacher

# Guards
ng generate guard core/guards/auth
ng generate guard core/guards/role

# Interceptors
ng generate interceptor core/interceptors/auth

# Components - Auth
ng generate component features/auth/login
ng generate component features/auth/register

# Components - Student
ng generate component features/student/dashboard
ng generate component features/student/call-history
ng generate component features/student/profile

# Components - Teacher
ng generate component features/teacher/dashboard
ng generate component features/teacher/student-list
ng generate component features/teacher/student-detail
ng generate component features/teacher/progress-report

# Shared Components
ng generate component shared/navbar
ng generate component shared/loading
```

## שלב 4: הרצת הפרויקט

```bash
npm start
# או
ng serve
```

הפרויקט יהיה זמין ב: http://localhost:4200

---

## 📁 מבנה התיקיות שייווצר

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── models/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   └── teacher/
│   │   ├── shared/
│   │   │   └── components/
│   │   └── app.component.ts
│   ├── environments/
│   └── styles.scss
└── angular.json
```

---

## הערות חשובות

1. בחרי בתצורת Angular Material את הערכה שאת אוהבת
2. הפרויקט יהיה responsive ומותאם למובייל
3. כל הקוד יהיה מוכן לשימוש מיידי

האם תרצי שאתחיל ליצור את הקבצים של Angular?
