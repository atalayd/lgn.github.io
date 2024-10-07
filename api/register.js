export default function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // In a real-world app, you'd store users in a database
        // Here we simulate saving the user
        return res.status(201).json({ message: 'User registration successful! Awaiting admin approval.' });
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
