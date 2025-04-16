import { Request, Response, NextFunction } from 'express';
import { getFirestore, setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, UserCredential, signInWithEmailAndPassword } from 'firebase/auth';
import bcrypt from 'bcryptjs';
import { errorRes, successRes } from '../utils/response';

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
  const { email, name, password, img_url, last_active } = req.body;

  if (!email || !password) {
    errorRes(res, 400, "Email and password are required");
    return;
  }

  if (!isEmailValid(email)) {
    errorRes(res, 400, "Invalid email format");
    return;
  }  
  const querySnapshot = await getDoc(doc(firestore, USER_COLLECTION, email))

  if(querySnapshot.exists()) {
    res.json("Email Already Exists")
    return;
  }

  try {
    const usercredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email, 
      password
    );

    const id = usercredential.user.uid;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userData = {
      id,
      name: name || "",
      email,
      image: img_url || "",
      last_active: last_active || new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(firestore, USER_COLLECTION, id), userData);

    const storedSnap = await getDoc(doc(firestore, USER_COLLECTION, id));
    if (!storedSnap.exists()) {
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
    const auth = getAuth();
    const usercredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    
    const id = usercredential.user.uid
    const userDoc = await getDoc(doc(firestore, USER_COLLECTION, id))

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

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction): Promise<void> =>{
    try{
      const { id } = req.params
      const userData = await getDoc(doc(firestore, USER_COLLECTION, id))
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
      const userData = await getDoc(doc(firestore, USER_COLLECTION, email))
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
      const userData = await getDoc(doc(firestore, USER_COLLECTION, username))
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