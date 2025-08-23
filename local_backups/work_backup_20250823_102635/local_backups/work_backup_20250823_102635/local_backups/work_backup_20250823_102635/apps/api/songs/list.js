// Serverless function for listing user's songs
import jwt from 'jsonwebtoken';
import { supabase } from '../database.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify JWT token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get user's songs
        const { data: songs, error } = await supabase
            .from('songs')
            .select('id, title, artist, created_at, updated_at')
            .eq('user_id', decoded.userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('List songs error:', error);
            return res.status(500).json({ error: 'Failed to load songs' });
        }

        res.status(200).json({ songs });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('List songs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
