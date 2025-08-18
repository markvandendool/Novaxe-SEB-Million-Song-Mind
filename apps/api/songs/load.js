// Serverless function for loading songs
import jwt from 'jsonwebtoken';
import { supabase } from '../database.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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

        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Song ID required' });
        }

        // Load song
        const { data: song, error } = await supabase
            .from('songs')
            .select('*')
            .eq('id', id)
            .eq('user_id', decoded.userId) // Ensure user owns the song
            .single();

        if (error || !song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        // Return song data in the format expected by Novaxe
        res.status(200).json({
            infos: song.data.infos,
            parts: song.data.parts,
            chordsInScore: song.data.chordsInScore || {},
            params: song.data.params || {}
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Load song error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
