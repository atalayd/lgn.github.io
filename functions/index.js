const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.registerUser = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const { username, password } = req.body;

    // Check if the user already exists
    const usersRef = admin.firestore().collection("users");
    const existingUser = await usersRef.where("username", "==", username).get();

    if (!existingUser.empty) {
        return res.status(400).send({ message: "User already exists" });
    }

    // Add the user to Firestore (pending approval)
    await usersRef.add({ username, password, status: "pending" });

    return res.status(200).send({
        message: "User registration successful! Awaiting admin approval.",
    });
});
exports.approveUser = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const { username, action } = req.body; // 'action' should be 'approve' or 'reject'

    const usersRef = admin.firestore().collection("users");
    const snapshot = await usersRef.where("username", "==", username).get();

    if (snapshot.empty) {
        return res.status(404).send({ message: "User not found" });
    }

    const userDoc = snapshot.docs[0];

    if (action === 'approve') {
        await userDoc.ref.update({ status: 'approved' });
        return res.status(200).send({ message: `User ${username} approved` });
    } else if (action === 'reject') {
        await userDoc.ref.delete(); // Delete the user document on rejection
        return res.status(200).send({ message: `User ${username} rejected and removed` });
    } else {
        return res.status(400).send({ message: "Invalid action" });
    }
});
