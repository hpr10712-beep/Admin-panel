import { auth, db, PATH, ref, onValue, set, onDisconnect, serverTimestamp } from './firebase.js';

let ref$ = null;
let onDisconnectRef$ = null;

export function initPresence(user) {
  const uid = user.uid;
  const statusRef = ref(db, `${PATH.presence(uid)}/state`);
  const lastRef = ref(db, `${PATH.presence(uid)}/lastSeen`);
  const connectedRef = ref(db, '.info/connected');

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // When we disconnect, set offline
      onDisconnect(statusRef).set('offline');
      onDisconnect(lastRef).set(serverTimestamp());
      // Set online
      set(statusRef, 'online');
      set(lastRef, serverTimestamp());
      // Also mirror to users/{uid}
      const uOnline = ref(db, `${PATH.users(uid)}/online`);
      const uLast = ref(db, `${PATH.users(uid)}/lastSeen`);
      onDisconnect(uOnline).set(false);
      onDisconnect(uLast).set(serverTimestamp());
      set(uOnline, true);
      set(uLast, serverTimestamp());
    }
  });
}

export function watchPresence(uid, cb) {
  const r = ref(db, PATH.presence(uid));
  const unsub = onValue(r, (snap) => {
    const v = snap.val() || {};
    cb({ online: v.state === 'online', lastSeen: v.lastSeen || 0 });
  });
  return () => unsub();
}
