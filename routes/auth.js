// ============================================
// 🔐 Authentication Routes
// ============================================

import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// הרשמה (Register)
// ============================================

router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('fullName').trim().notEmpty(),
        body('role').isIn(['student', 'teacher']),
        body('phone').optional().isMobilePhone('any')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password, fullName, role, phone } = req.body;

        try {
            // בדיקה אם המשתמש כבר קיים
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // הצפנת סיסמה
            const passwordHash = await bcrypt.hash(password, 10);

            // יצירת משתמש חדש
            const result = await pool.query(
                `INSERT INTO users (email, password_hash, full_name, role, phone) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, full_name, role, phone, created_at`,
                [email, passwordHash, fullName, role, phone]
            );

            const user = result.rows[0];
            const token = generateToken(user);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    phone: user.phone
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }
);

// ============================================
// התחברות (Login)
// ============================================

router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        try {
            // חיפוש משתמש
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const user = result.rows[0];

            // בדיקת סיסמה
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const token = generateToken(user);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    phone: user.phone
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }
);

export default router;
