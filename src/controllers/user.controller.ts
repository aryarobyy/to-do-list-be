import { Request, Response, NextFunction } from 'express';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { authRes, errorRes, successRes } from '../utils/response';
import { admin, adminFirestore } from '../firebase/admin.sdk';
import { postFav, updateFav } from './favNote.controller';

const firestore = getFirestore();
const auth = getAuth();

const USER_COLLECTION = "users";

enum ROLE {
  ADMIN,
  USER
}

const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, name, password, img_url, last_active, username } = req.body;

  if (!email || !password) {
    errorRes(res, 400, "Email and password are required");
    return;
  }

  if (!isEmailValid(email)) {
    errorRes(res, 400, "Invalid email format");
    return;
  }  
  
  const emailCheck = await admin
    .firestore()
    .collection(USER_COLLECTION)
    .where("email", "==", email)
    .get();

  if (!emailCheck.empty) {
    res.status(400).json({ message: "Email Already Exists" });
    return;
  }

  try {
    const userRec = await admin.auth().createUser({
      email,
      password,
      displayName: name || "",
      // photoURL: img_url || "",
    });

    const id = userRec.uid;

    const data = {
      id,
      name: name || "",
      username: username,
      email,
      image: img_url || "",
      role: ROLE.USER,  
      lastActive: last_active || new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const userRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(id);

    await userRef.set(data);

    const storedSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(id)
        .get();

    const titles = [
      "Tomorrow",
      "Favourite"
    ];

    const favouriteCreationPromises = titles.map(async (titleItem) => {
      const favouriteDocRef = userRef.collection("favourite").doc(titleItem);
      return favouriteDocRef.set({
        noteId: [],    
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await Promise.all(favouriteCreationPromises);
    
    if (!storedSnap.exists) {
      console.warn(`User document ${id} not found after setDoc.`);
    } else {
      console.log("Data successfully stored in Firestore:", storedSnap.data());
    }

    const token = await admin.auth().createCustomToken(id);

    authRes(res, 200, { data }, "User created successfully", token);
  } catch (e: any) {
    console.error("Error in register User:", e);
    errorRes(res, 500, "Error creating user", e.message);
  }
};

export const loginUser = async  (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    errorRes(res, 400, "Email and password are required");
    return;
  }

  if (!isEmailValid(email)) {
    errorRes(res, 400, "Invalid email format");
    return;
  }  

  try{
    const userRec = await signInWithEmailAndPassword(auth, email, password);
    const token = await userRec.user.getIdToken();

    const userDoc = await getDoc(doc(firestore, USER_COLLECTION, userRec.user.uid))

    if (!userDoc.exists()) {
      errorRes(res, 404, "User data not found in Firestore");
      return;
    }
    
    const data = userDoc.data();
    authRes(res, 200, { data },"Login successful", token);
  } catch (e: any) {
    console.error("Error in login User:", e);
    errorRes(res, 500, "Error Login user", e.message);
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> =>{
  const { id } = req.params;
  const updatedData  = req.body;
  try{
    const userRec = adminFirestore
      .collection(USER_COLLECTION)
      .doc(id)

    const snapshot = await userRec.get();
    
    if (!snapshot.exists) {
      errorRes(res, 404, "User not found");
      return;
    }
      
    await userRec.update(updatedData);
    const updatedUser = await userRec.get();

    successRes(
      res,
      200,
      { data: updatedUser.data() },
      "User update successful"
    );
  } catch (e: any) {
    console.error("Error in :", e);
    errorRes(res, 500, "Error ", e.message);
  }
}

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const { id } = req.params
      const userSnap = await adminFirestore.collection(USER_COLLECTION).doc(id).get();

      if (!userSnap.exists) {
        errorRes(res, 404, "User not found");
        return;
      }
  
      const data = userSnap.data();
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Wrong userId:", e);
      errorRes(res, 500, "Error userId", e.message);
  }
}

export const getUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const { email } = req.params
      const userSnap = await adminFirestore.collection(USER_COLLECTION).where("email", "==", email).get();
      if (userSnap.empty) {
        errorRes(res, 404, "User not found");
        return;
      }
      const data = userSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Wrong email:", e);
      errorRes(res, 500, "Error email", e.message);
  }
}

export const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const { username } = req.params
      const userSnap = await adminFirestore.collection(USER_COLLECTION).where("username", "==", username).get();
      if (userSnap.empty) {
        errorRes(res, 404, "User not found");
        return;
      }
      const data = userSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Wrong username:", e);
      errorRes(res, 500, "Error username", e.message);
  }
}

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const data = auth.currentUser
      successRes(res, 200, { data }, "Getting user successful");
    } catch (e: any) {
      console.error("Error getting current user:", e);
      errorRes(res, 500, "Error getting current user", e.message);
  }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> =>{
  const { id } = req.body;
  try {
    const userRef = admin.firestore()
      .collection(USER_COLLECTION)
      .doc(id);

    await userRef.update({
      // isOnline: false,
      lastActive: admin
        .firestore
        .FieldValue
        .serverTimestamp(),
    });

    await admin.auth()
      .revokeRefreshTokens(id);

    successRes(res, 200, { userRef }, "Verify successful");
  } catch (e: any) {
    console.error('Logout error:', e);
    errorRes(res, 500, "Logout failed", e.message);
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    errorRes(res, 400, "No token provided");
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      errorRes(res, 401, "Token has expired. Please refresh your token.");
      return;
    }

    (req as any).user = decodedToken;

    next();
  } catch (e: any) {
    console.error("Token verification failed:", e);

    switch (e.code) {
      case "auth/id-token-expired":
        errorRes(res, 401, "Token has expired. Please refresh the token.", e.message);
        break;
      case "auth/id-token-revoked":
        errorRes(res, 401, "Token has been revoked. Please sign in again.", e.message);
        break;
      case "auth/invalid-id-token":
        errorRes(res, 401, "Invalid token format.", e.message);
        break;
      default:
        errorRes(res, 401, "Token verification failed.", e.message);
    }
  }
};
