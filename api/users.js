// Separate lists for approved and pending users
let approvedUsers = [
    { username: 'Mystic', rank: 'Admin' },
    { username: 'Warrior', rank: 'Member' },
    { username: 'Commander', rank: 'R4' },
];

let pendingUsers = [];

export default function handler(req, res) {
    if (req.method === 'GET') {
        // Admin Panel fetches both approved and pending users
        const allUsers = {
            approved: approvedUsers,
            pending: pendingUsers,
        };
        return res.status(200).json(allUsers);
    } else if (req.method === 'POST') {
        // Register a new user, storing them in pendingUsers list
        const { username } = req.body;

        // Check if the user already exists in either list
        const existingApprovedUser = approvedUsers.find(user => user.username === username);
        const existingPendingUser = pendingUsers.find(user => user.username === username);

        if (existingApprovedUser || existingPendingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Add the new user to pendingUsers with default rank 'Pending'
        pendingUsers.push({ username, rank: 'Pending' });
        return res.status(201).json({ message: 'User registered, pending admin approval' });
    } else if (req.method === 'PUT') {
        // Admin is approving or rejecting a pending user
        const { username, action } = req.body;

        const userIndex = pendingUsers.findIndex(user => user.username === username);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found in pending list' });
        }

        if (action === 'approve') {
            // Move user to approvedUsers list
            const user = pendingUsers.splice(userIndex, 1)[0]; // Remove from pendingUsers
            approvedUsers.push({ ...user, rank: 'Member' }); // Add to approvedUsers with rank 'Member'
            return res.status(200).json({ message: `User ${username} approved` });
        } else if (action === 'reject') {
            // Remove user from pendingUsers list
            pendingUsers.splice(userIndex, 1);
            return res.status(200).json({ message: `User ${username} rejected` });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
