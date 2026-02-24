// ============================================
// 👩‍🎓 Student Routes
// ============================================

import express from 'express';
import pool from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// כל הנתיבים דורשים אימות ותפקיד תלמידה
router.use(authenticateToken);
router.use(requireRole('student'));

// ============================================
// קבלת פרופיל התלמידה
// ============================================

router.get('/profile', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.email, u.full_name, u.phone, u.created_at,
              COUNT(c.id) as total_calls,
              SUM(c.duration_seconds) as total_seconds
       FROM users u
       LEFT JOIN calls c ON c.student_id = u.id AND c.status = 'completed'
       WHERE u.id = $1
       GROUP BY u.id`,
            [req.user.id]
        );

        res.json({
            success: true,
            profile: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// ============================================
// קבלת היסטוריית שיחות
// ============================================

router.get('/calls', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, ca.grammar_score, ca.vocabulary_score, ca.fluency_score
       FROM calls c
       LEFT JOIN call_analysis ca ON ca.call_id = c.id
       WHERE c.student_id = $1
       ORDER BY c.start_time DESC
       LIMIT 50`,
            [req.user.id]
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
// קבלת פרטי שיחה ספציפית
// ============================================

router.get('/calls/:callId', async (req, res) => {
    const { callId } = req.params;

    try {
        const result = await pool.query(
            `SELECT c.*, ca.*
       FROM calls c
       LEFT JOIN call_analysis ca ON ca.call_id = c.id
       WHERE c.id = $1 AND c.student_id = $2`,
            [callId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        res.json({
            success: true,
            call: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching call:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching call'
        });
    }
});

// ============================================
// קבלת סטטיסטיקות אישיות
// ============================================

router.get('/stats', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
         COUNT(*) as total_calls,
         SUM(duration_seconds) as total_seconds,
         AVG(ca.grammar_score) as avg_grammar,
         AVG(ca.vocabulary_score) as avg_vocabulary,
         AVG(ca.fluency_score) as avg_fluency,
         MAX(c.start_time) as last_call_date
       FROM calls c
       LEFT JOIN call_analysis ca ON ca.call_id = c.id
       WHERE c.student_id = $1 AND c.status = 'completed'`,
            [req.user.id]
        );

        res.json({
            success: true,
            stats: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

export default router;
