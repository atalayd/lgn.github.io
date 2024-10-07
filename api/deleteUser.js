export default function handler(req, res) {
    if (req.method === 'DELETE') {
        const { username } = req.body;

        // Simulate deleting a user
        return res.status(200).json({ message: `User ${username} removed.` });
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
