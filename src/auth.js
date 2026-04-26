import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase.js";

const OWNER_EMAIL = "icandoit13579@gmail.com";

const provider = new GoogleAuthProvider();

export function getAuthClient() {
  return getAuth(app);
}

export function watchAuth(callback) {
  const auth = getAuthClient();
  return onAuthStateChanged(auth, (user) => {
    const email = user?.email?.toLowerCase() || "";
    callback({
      user,
      isOwner: email === OWNER_EMAIL,
    });
  });
}

export async function loginWithGoogle() {
  const auth = getAuthClient();
  await signInWithPopup(auth, provider);
}

export async function logout() {
  const auth = getAuthClient();
  await signOut(auth);
}
