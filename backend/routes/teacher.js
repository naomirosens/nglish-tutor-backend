// ============================================
// 👩‍🏫 Teacher Routes
// ============================================

import express from 'express';
import pool from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// כל הנתיבים דורשים אימות ותפקיד מורה
router.use(authenticateToken);
router.use(requireRole('teacher'));

// ============================================
// קבלת רשימת התלמידות של המורה
// ============================================

router.get('/students', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.email, u.full_name, u.phone, u.created_at,
              COUNT(c.id) as total_calls,
              MAX(c.start_time) as last_call_date
       FROM teacher_students ts
       JOIN users u ON ts.student_id = u.id
       LEFT JOIN calls c ON c.student_id = u.id
       WHERE ts.teacher_id = $1
       GROUP BY u.id, u.email, u.full_name, u.phone, u.created_at
       ORDER BY u.full_name`,
            [req.user.id]
        );

        res.json({
            success: true,
            students: result.rows
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
});

// ============================================
// הוספת תלמידה למורה
// ============================================

router.post('/students', async (req, res) => {
    const { studentEmail } = req.body;

    try {
        // מציאת התלמידה לפי אימייל
        const studentResult = await pool.query(
            'SELECT id, role FROM users WHERE email = $1',
            [studentEmail]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = studentResult.rows[0];

        if (student.role !== 'student') {
            return res.status(400).json({
                success: false,
                message: 'User is not a student'
            });
        }

        // קישור התלמידה למורה
        await pool.query(
            `INSERT INTO teacher_students (teacher_id, student_id) 
       VALUES ($1, $2)
       ON CONFLICT (teacher_id, student_id) DO NOTHING`,
            [req.user.id, student.id]
        );

        res.json({
            success: true,
            message: 'Student added successfully'
        });

    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding student'
        });
    }
});

// ============================================
// קבלת שיחות של תלמידה ספציפית
// ============================================

router.get('/students/:studentId/calls', async (req, res) => {
    const { studentId } = req.params;

    try {
        // בדיקה שהתלמידה שייכת למורה
        const linkCheck = await pool.query(
            'SELECT id FROM teacher_students WHERE teacher_id = $1 AND student_id = $2',
            [req.user.id, studentId]
        );

        if (linkCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // קבלת שיחות
        const result = await pool.query(
            `SELECT c.*, ca.grammar_score, ca.vocabulary_score, ca.fluency_score
       FROM calls c
       LEFT JOIN call_analysis ca ON ca.call_id = c.id
       WHERE c.student_id = $1
       ORDER BY c.start_time DESC
       LIMIT 50`,
            [studentId]
        );

        res.json({
            success: true,
            calls: result.rows
        });

    } catch (error) {
        console.error('Error fetching calls:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching calls'
        });
    }
});

// ============================================
// קבלת דוח התקדמות של תלמידה
// ============================================

router.get('/students/:studentId/progress', async (req, res) => {
    const { studentId } = req.params;

    try {
        // בדיקה שהתלמידה שייכת למורה
        const linkCheck = await pool.query(
            'SELECT id FROM teacher_students WHERE teacher_id = $1 AND student_id = $2',
            [req.user.id, studentId]
        );

        if (linkCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // סטטיסטיקות כלליות
        const statsResult = await pool.query(
            `SELECT 
         COUNT(*) as total_calls,
         SUM(duration_seconds) as total_minutes,
         AVG(ca.grammar_score) as avg_grammar,
         AVG(ca.vocabulary_score) as avg_vocabulary,
         AVG(ca.fluency_score) as avg_fluency
       FROM calls c
       LEFT JOIN call_analysis ca ON ca.call_id = c.id
       WHERE c.student_id = $1 AND c.status = 'completed'`,
            [studentId]
        );

        // שיחות לפי נושא
        const topicsResult = await pool.query(
            `SELECT topic, COUNT(*) as count
       FROM calls
       WHERE student_id = $1 AND status = 'completed'
       GROUP BY topic`,
            [studentId]
        );

        // התקדמות לאורך זמן (30 ימים אחרונים)
        const progressResult = await pool.query(
            `SELECT 
         DATE(start_time) as date,
         AVG(ca.grammar_score) as grammar,
         AVG(ca.vocabulary_score) as vocabulary,
         AVG(ca.fluency_score) as fluency
       FROM calls c
       LEFT JOIN call_analysis ca ON ca.call_id = c.id
       WHERE c.student_id = $1 
         AND c.status = 'completed'
         AND c.start_time >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(start_time)
       ORDER BY date`,
            [studentId]
        );

        res.json({
            success: true,
            stats: statsResult.rows[0],
            topicBreakdown: topicsResult.rows,
            progressOverTime: progressResult.rows
        });

    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress'
        });
    }
});

export default router;
