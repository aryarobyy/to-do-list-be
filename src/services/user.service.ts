import { admin, adminFirestore } from '../firebase/admin.sdk';
import { USER_COLLECTION } from '../core/constants';
import { RegisterPayload } from '../models/auth.model';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

enum ROLE {
  ADMIN = "ADMIN",
  USER = "USER",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export class UserService {
  static async registerUser(payload: RegisterPayload) {
    const { email, name, password, img_url, last_active, username } = payload;
    
    const emailCheck = await adminFirestore
      .collection(USER_COLLECTION)
      .where("email", "==", email)
      .get();

    if (!emailCheck.empty) {
      throw new Error("Email Already Exists");
    }

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
      username: username || "",
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
    
    const token = await admin.auth().createCustomToken(id);

    return { data, token };
  }

  static async updateUser(id: string, updatedData: any) {
    const userRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(id);

    const snapshot = await userRef.get();
    
    if (!snapshot.exists) {
      throw new Error("User not found");
    }
      
    await userRef.update(updatedData);
    const updatedUser = await userRef.get();

    return updatedUser.data();
  }

  static async getUserById(id: string) {
    const userSnap = await adminFirestore.collection(USER_COLLECTION).doc(id).get();

    if (!userSnap.exists) {
      throw new Error("User not found");
    }

    return userSnap.data();
  }

  static async getUserByEmail(email: string) {
    const userSnap = await adminFirestore.collection(USER_COLLECTION).where("email", "==", email).get();
    if (userSnap.empty) {
      throw new Error("User not found");
    }
    return userSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async getUserByUsername(username: string) {
    const userSnap = await adminFirestore.collection(USER_COLLECTION).where("username", "==", username).get();
    if (userSnap.empty) {
      throw new Error("User not found");
    }
    return userSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async getCurrentUser() {
    return auth.currentUser;
  }

  static async getUsers() {
    const snapshot = await adminFirestore.collection(USER_COLLECTION).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async changeRole(userId: string, newRole: string) {
    const validRoles = [ROLE.USER, ROLE.ADMIN];
    if (!validRoles.includes(newRole as ROLE)) {
      throw new Error(`Invalid role. Valid roles: ${validRoles.join(", ")}`);
    }

    if (newRole === ROLE.SUPER_ADMIN) {
      throw new Error("Cannot assign SUPER_ADMIN role");
    }

    const userSnap = await adminFirestore.collection(USER_COLLECTION).doc(userId).get();
    if (!userSnap.exists) {
      throw new Error("User not found");
    }

    await adminFirestore.collection(USER_COLLECTION).doc(userId).update({ role: newRole });

    return { userId, newRole };
  }

  static async logout(id: string) {
    const userRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(id);

    await userRef.update({
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    });

    await admin.auth().revokeRefreshTokens(id);
    
    return { id };
  }
}
