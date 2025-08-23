export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, confirmPassword, name } = req.body;

    // Mock user creation - validate input
    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            error: 'Email, password, and name are required'
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            error: 'Passwords do not match'
        });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long'
        });
    }

    // Mock successful user creation
    return res.status(201).json({
        success: true,
        user: {
            id: Date.now(), // Mock ID
            email: email,
            name: name,
            memberSince: new Date().toISOString().split('T')[0],
            subscription: 'free'
        },
        token: 'mock_jwt_token_' + Date.now(),
        message: 'Account created successfully! Welcome to Million Song Mind!'
    });
}
