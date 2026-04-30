"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminFirestore = exports.admin = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const firebase_admin_1 = require("firebase-admin");
dotenv.config();
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log('Memuat service account dari environment variable...');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}
else {
    console.log('Memuat service account dari file lokal: serviceAccountKey.json...');
    const serviceAccountPath = path_1.default.join(__dirname, './serviceAccountKey.json');
    try {
        serviceAccount = require(serviceAccountPath);
    }
    catch (error) {
        console.error('Error: Tidak dapat menemukan file serviceAccountKey.json. Pastikan file tersebut ada di folder yang sama untuk pengembangan lokal.');
        process.exit(1);
    }
}
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.DATABASE_URL,
    });
}
const adminFirestore = admin.firestore();
exports.adminFirestore = adminFirestore;
//# sourceMappingURL=admin.sdk.js.map