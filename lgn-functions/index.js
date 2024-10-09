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

        if (!existingUser.empty) {
            return res.status(400).send({ message: 'User already exists' });
        }

        await usersRef.add({ username, password, status: 'pending' });
        return res.status(200).send({ message: 'User registration successful! Awaiting admin approval.' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Approve user function
exports.approveUser = onRequest(async (req, res) => {
    const { userId } = req.body;

    try {
        const usersRef = admin.firestore().collection('users').doc(userId);
        await usersRef.update({ status: 'approved' });
        return res.status(200).send({ message: 'User approved successfully!' });
    } catch (error) {
        console.error('Error approving user:', error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});
