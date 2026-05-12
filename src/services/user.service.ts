import { adminFirestore } from '../firebase/admin.sdk';
import { USER_COLLECTION } from '../core/constants';
import { sanitizeLimit, sanitizeOffset, stripTimestamps } from '../utils/query';

enum ROLE {
  ADMIN = "ADMIN",
  USER = "USER",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export class UserService {
  static async updateUser(payload: any) {
    const { id, role, createdAt, email, ...updatedData } = payload;

    if (!id) {
      throw new Error('User id is required');
    }

    if (Object.keys(updatedData).length === 0) {
      throw new Error('No data to update');
    }

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

  static async getCurrentUser(userId: string) {
    const userSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(userId)
      .get();

    if (!userSnap.exists) {
      throw new Error('User not found');
    }

    return {
      id: userSnap.id,
      ...userSnap.data(),
    };
  }

  static async getUsers(limit?: number, offset?: number) {
    const queryLimit = sanitizeLimit(limit);
    const queryOffset = sanitizeOffset(offset);
    const snapshot = await adminFirestore
      .collection(USER_COLLECTION)
      .offset(queryOffset)
      .limit(queryLimit)
      .get();
    return snapshot.docs.map((doc) => stripTimestamps({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async changeRole(userId: string, newRole: string) {
    if (!userId || !newRole) {
      throw new Error('userId and newRole are required');
    }

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

}
