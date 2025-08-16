import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { authRes, errorRes, successRes } from "../utils/response";
import { NextFunction, Request, Response } from "express";
import { admin, adminFirestore } from "../firebase/admin.sdk";
import { v4 } from "uuid";
import { USER_COLLECTION } from "../core/constants";

const auth = getAuth();
const provider = new GoogleAuthProvider();

provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
auth.languageCode = 'it';

export const googleSignIn = async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<void>  => {
    try {
        const id = v4()
        const result = await signInWithPopup(auth, provider);

        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;

        const data = {
            id,
            name: user.displayName,
            email: user.email,
            lastActive: new Date().toISOString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await adminFirestore
            .collection(USER_COLLECTION)
            .doc(id)
            .set(data)

        const storedSnap = await adminFirestore
                .collection(USER_COLLECTION)
                .doc(id)
                .get();
            
        if (!storedSnap.exists) {
            console.warn(`User document ${id} not found after setDoc.`);
        } else {
            console.log("Data successfully stored in Firestore:", storedSnap.data());
        }
    
        authRes(res, 200, { data }, "User created successfully", token as string);
    } catch (error: any) {
        const errorMessage = error.message;
        const email = error.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.error('Login gagal:', email, credential);
        errorRes(res, 500, "Login Gagal", errorMessage);
    }
};



export const googleSignOut = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try {
    await firebaseSignOut(auth);
    successRes(res, 200, "Logout sukses")
  } catch (error: any) {
    console.error('Logout gagal:', error.message);
    errorRes(res, 500, "Logout Gagal", error.message)
  }
};
