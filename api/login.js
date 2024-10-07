export default function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // In a real-world application, you'd fetch users from a database
        const users = [
            { username: 'Mystic', password: 'Atalay55', rank: 'Admin' }
        ];

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            return res.status(200).json({ message: 'Login successful!', rank: user.rank });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
