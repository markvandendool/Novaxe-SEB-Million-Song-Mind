// Serverless function for user signin
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../database.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user_email, user_pass } = req.body;

        // Validate input
        if (!user_email || !user_pass) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password_hash, nick')
            .eq('email', user_email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const passwordValid = await bcrypt.compare(user_pass, user.password_hash);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, nick: user.nick },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, nick: user.nick }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
