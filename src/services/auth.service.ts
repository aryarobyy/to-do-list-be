import { admin, adminFirestore } from '../firebase/admin.sdk';
import { AUTH_COLLECTION, USER_COLLECTION } from '../core/constants';
import { RegisterPayload } from '../models/auth.model';
import { generateJwt, generateRefreshToken, decodeExpiredJwtToken, verifyRefreshToken, verifyJwtToken } from '../utils/jwt';

export class AuthService {
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
      role: "USER",
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

  static async generateAndSaveTokens(userId: string) {
    const { token: accessToken, expiresAt: accessExpiresAt } = generateJwt(userId);
    const { token: refreshToken, expiresAt: refreshExpiresAt } = generateRefreshToken(userId);

    const authData = {
      userId,
      refreshToken,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(refreshExpiresAt)
    };
    
    await adminFirestore.collection(AUTH_COLLECTION).doc(userId).set(authData);

    const session = {
      accessTokenExpiresAt: accessExpiresAt.toISOString(),
      refreshTokenExpiresAt: refreshExpiresAt.toISOString()
    };

    return { accessToken, session };
  }

  static async refreshAccessToken(expiredToken: string) {
    const decoded = decodeExpiredJwtToken(expiredToken);
    
    if (!decoded || !decoded.userId) {
      throw new Error("Invalid access token");
    }
    
    const userId = decoded.userId;
    const authDoc = await adminFirestore.collection(AUTH_COLLECTION).doc(userId).get();
    
    if (!authDoc.exists) {
      throw new Error("Session expired, please login again");
    }

    const authData = authDoc.data();
    
    try {
      verifyRefreshToken(authData?.refreshToken);
    } catch (err) {
      await adminFirestore.collection(AUTH_COLLECTION).doc(userId).delete();
      throw new Error("Session expired, please login again");
    }

    const { token: newAccessToken, expiresAt: accessExpiresAt } = generateJwt(userId);

    const session = {
      accessTokenExpiresAt: accessExpiresAt.toISOString(),
      refreshTokenExpiresAt: authData?.expiresAt.toDate().toISOString()
    };

    return { newAccessToken, session };
  }

  static async verifyUserToken(token: string) {
    const decodedToken: any = verifyJwtToken(token);
    const userId = decodedToken.userId;

    const userSnap = await adminFirestore.collection(USER_COLLECTION).doc(userId).get();
    
    if (!userSnap.exists) {
      throw new Error("User not found");
    }

    const authSnap = await adminFirestore.collection(AUTH_COLLECTION).doc(userId).get();
    
    const user = userSnap.data();
    const session: any = {
      accessTokenExpiresAt: new Date(decodedToken.exp * 1000).toISOString()
    };

    if (authSnap.exists) {
      session.refreshTokenExpiresAt = authSnap.data()?.expiresAt?.toDate().toISOString();
    }

    return { user, session };
  }

  static async logout(id: string) {
    const userRef = adminFirestore
      .collection(USER_COLLECTION)
      .doc(id);
    const authRef = adminFirestore
      .collection(AUTH_COLLECTION)
      .doc(id);

    const userSnap = await userRef.get();
    const authSnap = await authRef.get();

    if (!authSnap.exists) {
      throw new Error('No active session found. User is already logged out');
    }

    await authRef.delete();

    if (userSnap.exists) {
      await userRef.update({
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    let firebaseTokensRevoked = false;
    try {
      await admin.auth().revokeRefreshTokens(id);
      firebaseTokensRevoked = true;
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') {
        throw e;
      }
    }

    return {
      id,
      userUpdated: userSnap.exists,
      sessionDeleted: true,
      firebaseTokensRevoked,
    };
  }
}
