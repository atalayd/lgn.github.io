// register.js
import { firestore } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();

export default onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { username, password } = req.body;

    // Check if the user already exists
    const usersRef = firestore().collection('users');
    const existingUser = await usersRef.where('username', '==', username).get();

    if (!existingUser.empty) {
        return res.status(400).send({ message: 'User already exists' });
    }

    // Add the user to Firestore (pending approval)
    await usersRef.add({ username, password, status: 'pending' });

    return res.status(200).send({ message: 'User registration successful! Awaiting admin approval.' });
});
