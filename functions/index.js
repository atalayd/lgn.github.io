const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// Register user function
exports.registerUser = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
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

            await usersRef.add({ username, password, status: 'pending', role: 'member' });
            return res.status(200).send({ message: 'User registration successful! Awaiting admin approval.' });
        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    });
});

// Approve user function
exports.approveUser = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
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
});

// Login user function
exports.loginUser = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { username, password } = req.body;

        try {
            const usersRef = admin.firestore().collection('users');
            const querySnapshot = await usersRef.where('username', '==', username).where('password', '==', password).get();

            if (querySnapshot.empty) {
                return res.status(401).send({ message: 'Login failed. Invalid credentials.' });
            }

            const user = querySnapshot.docs[0].data();

            if (user.status === 'approved') {
                return res.status(200).send({ message: 'Login successful', role: user.role });
            } else {
                return res.status(403).send({ message: 'Account not approved yet.' });
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    });
});

// Update user role function
exports.updateUserRole = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { userId, newRole } = req.body;

        try {
            const usersRef = admin.firestore().collection('users').doc(userId);
            await usersRef.update({ role: newRole });
            return res.status(200).send({ message: 'User role updated successfully!' });
        } catch (error) {
            console.error('Error updating user role:', error);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    });
});
