export default function handler(req, res) {
    // Simulating user data
    const users = [
        { username: 'Mystic', rank: 'Admin' },
        { username: 'Warrior', rank: 'Member' },
        { username: 'Commander', rank: 'R4' },
    ];

    if (req.method === 'GET') {
        return res.status(200).json(users);
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
