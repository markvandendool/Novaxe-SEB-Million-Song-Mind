// Serverless function for saving songs
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

        const { infos, parts, chordsInScore, params } = req.body;

        // Validate song data
        if (!infos || !parts) {
            return res.status(400).json({ error: 'Invalid song data' });
        }

        // Prepare song data
        const songData = {
            user_id: decoded.userId,
            title: infos.title || 'Untitled',
            artist: infos.artist || 'Unknown',
            data: {
                infos,
                parts,
                chordsInScore: chordsInScore || {},
                params: params || {}
            }
        };

        // Check if this is an update (song has ID) or new song
        if (infos.id && infos.id !== -1) {
            // Update existing song
            const { data: updatedSong, error } = await supabase
                .from('songs')
                .update({
                    title: songData.title,
                    artist: songData.artist,
                    data: songData.data,
                    updated_at: new Date().toISOString()
                })
                .eq('id', infos.id)
                .eq('user_id', decoded.userId) // Ensure user owns the song
                .select()
                .single();

            if (error) {
                console.error('Update error:', error);
                return res.status(500).json({ error: 'Failed to update song' });
            }

            res.status(200).json({
                message: 'Song updated successfully',
                songId: updatedSong.id
            });

        } else {
            // Create new song
            const { data: newSong, error } = await supabase
                .from('songs')
                .insert([songData])
                .select()
                .single();

            if (error) {
                console.error('Create error:', error);
                return res.status(500).json({ error: 'Failed to save song' });
            }

            res.status(201).json({
                message: 'Song saved successfully',
                songId: newSong.id
            });
        }

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Save song error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
