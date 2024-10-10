const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require('express'); // Import express
const cors = require('cors'); // Import the cors middleware

const app = express();
app.use(cors({ origin: true })); // Use cors middleware before defining routes

admin.initializeApp();

app.post('/loginUser', async (req, res) => {
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

exports.loginUser = functions.https.onRequest(app);