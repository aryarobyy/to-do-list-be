import { NextFunction, Request, Response } from "express";
import { v4 } from "uuid";
import { USER_COLLECTION } from "../core/constants";
import { admin, adminFirestore } from "../firebase/admin.sdk";
import { authRes, errorRes, successRes } from "../utils/response";

export const googleSignIn = async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<void>  => {
    const { idToken } = req.body;

    if (!idToken) {
        errorRes(res, 400, "idToken is required");
        return;
    }

    try {
        // Verify the Google ID token using Firebase Admin SDK (server-safe)
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check if user already exists in Firestore
        const existingUserSnap = await adminFirestore
            .collection(USER_COLLECTION)
            .doc(uid)
            .get();

        let userData: Record<string, any>;

        if (existingUserSnap.exists) {
            // Update last active for existing user
            await adminFirestore
                .collection(USER_COLLECTION)
                .doc(uid)
                .update({
                    lastActive: new Date().toISOString(),
                });

            userData = { id: uid, ...existingUserSnap.data(), lastActive: new Date().toISOString() };
        } else {
            // Create new user
            const id = uid;
            userData = {
                id,
                name: decodedToken.name || "",
                email: decodedToken.email || "",
                image: decodedToken.picture || "",
                role: "USER",
                lastActive: new Date().toISOString(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await adminFirestore
                .collection(USER_COLLECTION)
                .doc(id)
                .set(userData);

            // Create default categories
            const userRef = adminFirestore.collection(USER_COLLECTION).doc(id);
            const titles = ["Tomorrow", "Favourite"];
            const categoryCreationPromises = titles.map(async (titleItem) => {
                const categoryDocRef = userRef.collection("category").doc(titleItem);
                return categoryDocRef.set({
                    noteId: [],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
            await Promise.all(categoryCreationPromises);
        }

        const customToken = await admin.auth().createCustomToken(uid);

        authRes(res, 200, { data: userData }, "User signed in successfully", customToken);
    } catch (error: any) {
        console.error('Google Sign-In failed:', error.message);
        errorRes(res, 500, "Google Sign-In failed", error.message);
    }
};

export const googleSignOut = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId } = req.body;

    if (!userId) {
        errorRes(res, 400, "userId is required");
        return;
    }

    try {
        await admin.auth().revokeRefreshTokens(userId);
        successRes(res, 200, {}, "Logout successful");
    } catch (error: any) {
        console.error('Logout failed:', error.message);
        errorRes(res, 500, "Logout failed", error.message);
    }
};
