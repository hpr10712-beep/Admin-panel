import {
  auth, db, PATH,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail,
  ref, set, get, update, serverTimestamp,
  storage, sRef, uploadBytesResumable, getDownloadURL
} from './firebase.js';
import { Toast, escapeHtml } from './ui.js';

const page = document.currentScript.dataset.page || (location.pathname.includes('register') ? 'register' : 'login');

// Password visibility toggles
document.querySelectorAll('[data-eye]').forEach(btn => {
  btn.onclick = () => {
    const input = document.getElementById(btn.dataset.eye);
    input.type = input.type === 'password' ? 'text' : 'password';
  };
});

const errBox = document.getElementById('auth-error');
function showError(msg) {
  errBox.textContent = msg;
  errBox.classList.remove('hidden');
}
function clearError() { errBox.classList.add('hidden'); }

// ==== LOGIN ====
if (page === 'login') {
  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) return showError('Email & password wajib diisi.');

    const txt = btn.querySelector('.btn-text');
    txt.textContent = 'Memproses...';
    btn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.success('Login berhasil!');
      location.href = 'app.html';
    } catch (err) {
      console.error(err);
      const map = {
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/user-not-found': 'Akun tidak ditemukan.',
        'auth/wrong-password': 'Password salah.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
        'auth/invalid-email': 'Format email tidak valid.',
      };
      showError(map[err.code] || 'Gagal login. Coba lagi.');
    } finally {
      txt.textContent = 'Masuk';
      btn.disabled = false;
    }
  });

  document.getElementById('forgot').onclick = async () => {
    const email = form.email.value.trim();
    if (!email) return showError('Masukkan email dulu untuk reset password.');
    try {
      await sendPasswordResetEmail(auth, email);
      Toast.success('Email reset password telah dikirim.');
    } catch (err) {
      showError('Gagal mengirim email reset. Cek emailmu.');
    }
  };
}

// ==== REGISTER ====
if (page === 'register') {
  const form = document.getElementById('register-form');
  const btn = document.getElementById('register-btn');
  const avatarInput = document.getElementById('avatar-input');
  const avatarPreview = document.getElementById('avatar-preview');
  let avatarFile = null;

  avatarInput.onchange = () => {
    const f = avatarInput.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return Toast.error('File harus berupa gambar.');
    if (f.size > 5 * 1024 * 1024) return Toast.error('Maksimal 5MB.');
    avatarFile = f;
    const reader = new FileReader();
    reader.onload = (e) => { avatarPreview.innerHTML = `<img src="${e.target.result}" alt="">`; };
    reader.readAsDataURL(f);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const displayName = form.displayName.value.trim();
    const username = form.username.value.trim().toLowerCase();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!displayName) return showError('Nama lengkap wajib diisi.');
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return showError('Username tidak valid (huruf, angka, _ min 3).');
    if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Format email tidak valid.');
    if (password.length < 8) return showError('Password minimal 8 karakter.');
    if (password !== confirm) return showError('Konfirmasi password tidak cocok.');

    const txt = btn.querySelector('.btn-text');
    txt.textContent = 'Membuat akun...';
    btn.disabled = true;

    try {
      // Check username uniqueness
      const un = await get(ref(db, PATH.usernames(username)));
      if (un.exists()) throw new Error('Username sudah dipakai.');

      // Create Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Optional avatar upload
      let photoURL = '';
      if (avatarFile) {
        try {
          const path = `avatars/${uid}/${Date.now()}_${avatarFile.name}`;
          const ref_ = sRef(storage, path);
          await uploadBytesResumable(ref_, avatarFile);
          photoURL = await getDownloadURL(ref_);
        } catch (upErr) {
          console.warn('Avatar upload failed (non-fatal):', upErr);
        }
      }

      // Create profile & username index
      await set(ref(db, PATH.users(uid)), {
        uid, username, displayName, email,
        photoURL, bio: '', status: 'Available',
        online: true, lastSeen: Date.now(),
        createdAt: serverTimestamp(),
      });
      await set(ref(db, PATH.usernames(username)), uid);
      await set(ref(db, PATH.settings(uid)), {
        theme: 'dark', enterToSend: true, fontSize: 'md',
        privacyLastSeen: 'everyone', privacyPhoto: 'everyone',
        privacyBio: 'everyone', notifMessages: true, notifGroups: true,
      });

      Toast.success('Registrasi berhasil!');
      location.href = 'app.html';
    } catch (err) {
      console.error(err);
      const map = {
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/weak-password': 'Password terlalu lemah.',
        'auth/invalid-email': 'Format email tidak valid.',
      };
      showError(err.message.includes('Username') ? err.message : (map[err.code] || 'Registrasi gagal. Coba lagi.'));
    } finally {
      txt.textContent = 'Daftar Sekarang';
      btn.disabled = false;
    }
  });
}
