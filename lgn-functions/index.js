const { onRequest } = require("firebase-functions/v1/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Register user function
exports.registerUser = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { username, password } = req.body;

    try {
        const usersRef = admin.firestore().collection('users');
        const existingUser = await usersRef.where('username', '==', username).get();

        // Check if the username already exists
        if (!existingUser.empty) {
            return res.status(400).send({ message: 'User already exists' });
        }

        // Add new user with 'pending' status and default role 'member'
        await usersRef.add({
            username,
            password,
            status: 'pending',  // Waiting for approval
            role: 'member'      // Default role is 'member' after registration
        });
        return res.status(200).send({ message: 'User registration successful! Awaiting admin approval.' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Approve user and assign role function
exports.approveUser = onRequest(async (req, res) => {
    const { userId, role } = req.body; // Accept userId and role in the request

    try {
        const usersRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await usersRef.get();

        if (!userDoc.exists) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Update user's status to 'approved' and assign a role if provided (defaults to 'member')
        const newRole = role || 'member'; // Default to 'member' if no role is passed
        await usersRef.update({
            status: 'approved',
            role: newRole
        });

        return res.status(200).send({ message: `User approved with role: ${newRole}` });
    } catch (error) {
        console.error('Error approving user:', error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Promote/Demote User Role
exports.updateUserRole = onRequest(async (req, res) => {
    const { userId, newRole } = req.body;  // Expect userId and new role in the request body

    try {
        const usersRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await usersRef.get();

        if (!userDoc.exists) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Update user's role to the new role
        await usersRef.update({
            role: newRole
        });

        return res.status(200).send({ message: `User role updated to: ${newRole}` });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});
