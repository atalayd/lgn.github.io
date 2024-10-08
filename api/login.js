import { firestore } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();

export default onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    // Fetch the user from Firestore
    const usersRef = firestore().collection('users');
    const userSnapshot = await usersRef.where('username', '==', username).where('password', '==', password).get();

    if (userSnapshot.empty) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Retrieve the user data
    const user = userSnapshot.docs[0].data();
    return res.status(200).json({ message: 'Login successful!', rank: user.rank });
});
