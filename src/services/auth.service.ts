import { admin, adminFirestore } from '../firebase/admin.sdk';
import { AUTH_COLLECTION, USER_COLLECTION } from '../core/constants';
import { generateJwt, generateRefreshToken, decodeExpiredJwtToken, verifyRefreshToken, verifyJwtToken } from '../utils/jwt';

export class AuthService {
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
}
