// Firebase initialization — shared across all modules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase, ref, set, push, onValue, get, update, remove,
  serverTimestamp, onDisconnect, query, orderByChild, limitToLast,
  equalTo, startAt, endAt, off, child, runTransaction, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getStorage, ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHr0eemIkfHNFDUkSaFDklp_c1OgmSnl8",
  authDomain: "mybro-9ba5f.firebaseapp.com",
  databaseURL: "https://mybro-9ba5f-default-rtdb.firebaseio.com/",
  projectId: "mybro-9ba5f",
  storageBucket: "mybro-9ba5f.appspot.com"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Re-export helpers
export {
  ref, set, push, onValue, get, update, remove, serverTimestamp,
  onDisconnect, query, orderByChild, limitToLast, equalTo, startAt,
  endAt, off, child, runTransaction, increment,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification,
  sRef, uploadBytesResumable, getDownloadURL, deleteObject
};

// Path helpers (single source of truth for DB structure)
export const PATH = {
  users: (uid) => uid ? `users/${uid}` : 'users',
  usernames: (u) => u ? `usernames/${u}` : 'usernames',
  chats: (id) => id ? `chats/${id}` : 'chats',
  chatMembers: (id, uid) => uid ? `chatMembers/${id}/${uid}` : (id ? `chatMembers/${id}` : 'chatMembers'),
  messages: (id) => `messages/${id}`,
  typing: (id) => `typing/${id}`,
  presence: (uid) => `presence/${uid}`,
  privateChatIndex: (a, b) => {
    const [x, y] = [a, b].sort();
    return `privateChatIndex/${x}_${y}`;
  },
  userChats: (uid) => `userChats/${uid}`,
  unread: (uid, chatId) => `unreadCounts/${uid}/${chatId}`,
  notifications: (uid) => `notifications/${uid}`,
  friends: (uid) => `friends/${uid}`,
  friendRequests: (uid) => `friendRequests/${uid}`,
  sentRequests: (uid) => `sentRequests/${uid}`,
  blocked: (uid) => `blockedUsers/${uid}`,
  reports: () => 'reports',
  settings: (uid) => `settings/${uid}`,
};
