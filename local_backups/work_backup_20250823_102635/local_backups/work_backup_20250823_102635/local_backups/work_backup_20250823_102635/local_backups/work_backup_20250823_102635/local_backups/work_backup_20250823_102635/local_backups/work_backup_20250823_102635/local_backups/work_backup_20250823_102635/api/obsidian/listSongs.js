export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Mock song data for Novaxe Obsidian
    const mockSongs = [
        {
            id: 1,
            title: 'C Major Scale Study',
            composer: 'Demo User',
            key: 'C major',
            timeSignature: '4/4',
            tempo: 120,
            difficulty: 'Beginner',
            genre: 'Classical',
            dateCreated: '2025-08-20',
            duration: '02:30'
        },
        {
            id: 2,
            title: 'Jazz Chord Progression',
            composer: 'Demo User',
            key: 'Bb major',
            timeSignature: '4/4',
            tempo: 140,
            difficulty: 'Intermediate',
            genre: 'Jazz',
            dateCreated: '2025-08-20',
            duration: '03:45'
        },
        {
            id: 3,
            title: 'German Sixth Resolution',
            composer: 'Theory Master',
            key: 'G minor',
            timeSignature: '3/4',
            tempo: 90,
            difficulty: 'Advanced',
            genre: 'Classical',
            dateCreated: '2025-08-20',
            duration: '01:45'
        }
    ];

    return res.status(200).json({
        success: true,
        songs: mockSongs,
        totalCount: mockSongs.length
    });
}
