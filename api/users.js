import { firestore } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();

export default onRequest(async (req, res) => {
    const usersRef = firestore().collection('users');

    if (req.method === 'GET') {
        // Fetch both approved and pending users from Firestore
        const approvedUsersSnapshot = await usersRef.where('status', '==', 'approved').get();
        const pendingUsersSnapshot = await usersRef.where('status', '==', 'pending').get();

        const approvedUsers = approvedUsersSnapshot.docs.map(doc => doc.data());
        const pendingUsers = pendingUsersSnapshot.docs.map(doc => doc.data());

        return res.status(200).json({ approved: approvedUsers, pending: pendingUsers });

    } else if (req.method === 'PUT') {
        // Approve or reject a user
        const { username, action } = req.body;
        const userSnapshot = await usersRef.where('username', '==', username).get();

        if (userSnapshot.empty) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = userSnapshot.docs[0].id;

        if (action === 'approve') {
            await usersRef.doc(userId).update({ status: 'approved', rank: 'Member' });
            return res.status(200).json({ message: `User ${username} approved` });
        } else if (action === 'reject') {
            await usersRef.doc(userId).delete();
            return res.status(200).json({ message: `User ${username} rejected` });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
});
