import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export const RESTAURANT_ID = "eufraat";

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;
let _functions: Functions | null = null;
let _emulatorsConnected = false;

export function initFirebase(config: FirebaseConfig): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(config);
  return _app;
}

function ensureApp(): FirebaseApp {
  if (!_app) throw new Error("initFirebase() not called yet");
  return _app;
}

export function db(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  maybeConnectEmulators();
  return _db;
}

export function auth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  maybeConnectEmulators();
  return _auth;
}

export function storage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(ensureApp());
  maybeConnectEmulators();
  return _storage;
}

export function functions(): Functions {
  if (!_functions) _functions = getFunctions(ensureApp(), "europe-west1");
  maybeConnectEmulators();
  return _functions;
}

function maybeConnectEmulators() {
  if (_emulatorsConnected) return;
  if (typeof window === "undefined") return;
  const useEmulator =
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "1" ||
    window.location.hostname === "localhost";
  if (!useEmulator) {
    _emulatorsConnected = true;
    return;
  }
  if (_db) connectFirestoreEmulator(_db, "127.0.0.1", 8080);
  if (_auth) connectAuthEmulator(_auth, "http://127.0.0.1:9099", { disableWarnings: true });
  if (_storage) connectStorageEmulator(_storage, "127.0.0.1", 9199);
  if (_functions) connectFunctionsEmulator(_functions, "127.0.0.1", 5001);
  _emulatorsConnected = true;
}
