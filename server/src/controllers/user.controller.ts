import { Request, Response, NextFunction } from 'express';
import { getFirestore, setDoc, doc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import bcrypt from 'bcryptjs';
import { errorRes, successRes } from '../utils/response';
import { admin, adminFirestore } from '../firebase/admin.sdk';

const firestore = getFirestore();
const auth = getAuth();

const USER_COLLECTION = "users";
const SALT_ROUNDS = 10;

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
  const querySnapshot = await admin.firestore().collection(USER_COLLECTION).doc(email).get();

  if (querySnapshot.exists) {
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
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userData = {
      id,
      name: name || "",
      username: username,
      email,
      image: img_url || "",
      last_active: last_active || new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminFirestore
      .collection(USER_COLLECTION)
      .doc(id)
      .set(userData);

    const storedSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(id)
        .get();
    
    if (!storedSnap.exists) {
      console.warn(`User document ${id} not found after setDoc.`);
    } else {
      console.log("Data successfully stored in Firestore:", storedSnap.data());
    }

    successRes(res, 201, { userData }, `User created successfully ${hashedPassword}`);
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

    const userVerify = await admin.auth().verifyIdToken(token);
    
    const userDoc = await getDoc(doc(firestore, USER_COLLECTION, userVerify.uid))

    if (!userDoc.exists()) {
      errorRes(res, 404, "User data not found in Firestore");
      return;
    }
    
    const userData = userDoc.data();
    successRes(res, 200, { userData }, "Login successful");
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
      { userData: updatedUser.data() },
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
  
      const userData = userSnap.data();
      successRes(res, 200, { userData }, "Getting user successful");
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
      const userData = userSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      successRes(res, 200, { userData }, "Getting user successful");
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
      const userData = userSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      successRes(res, 200, { userData }, "Getting user successful");
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
      const userData = auth.currentUser
      successRes(res, 200, { userData }, "Getting user successful");
    } catch (e: any) {
      console.error("Error getting current user:", e);
      errorRes(res, 500, "Error getting current user", e.message);
  }
}