let users = [
    { username: 'Mystic', rank: 'Admin' },
    { username: 'Warrior', rank: 'Member' },
    { username: 'Commander', rank: 'R4' },
];

export default function handler(req, res) {
    if (req.method === 'GET') {
        // Return all users (you can filter for Pending ones if needed)
        return res.status(200).json(users);
    } else if (req.method === 'POST') {
        // Register a new user (coming from registration API)
        const { username, rank = 'Pending' } = req.body;

        // Check if the user already exists
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Add the new user with 'Pending' rank
        users.push({ username, rank });
        return res.status(201).json({ message: 'User registered, pending admin approval' });
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
