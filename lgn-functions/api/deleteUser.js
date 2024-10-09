import { firestore } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();

export default onRequest(async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username } = req.body;

    // Find the user in Firestore
    const usersRef = firestore().collection('users');
    const userSnapshot = await usersRef.where('username', '==', username).get();

    if (userSnapshot.empty) {
        return res.status(404).json({ message: `User ${username} not found` });
    }

    // Delete the user document
    const userId = userSnapshot.docs[0].id;
    await usersRef.doc(userId).delete();

    return res.status(200).json({ message: `User ${username} removed.` });
});
