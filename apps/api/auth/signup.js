// Serverless function for user signup
import bcrypt from 'bcryptjs';
import { supabase } from '../database.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user_email, user_pass, user_nick } = req.body;

        // Validate input
        if (!user_email || !user_pass || !user_nick) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${user_email},nick.eq.${user_nick}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(user_pass, 12);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    email: user_email,
                    password_hash: passwordHash,
                    nick: user_nick
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser.id, email: newUser.email, nick: newUser.nick }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
