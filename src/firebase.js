import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let db = null;

export function initFirebase() {
  const firebaseConfig = {
    // TODO: firebase config 입력
    // apiKey: "...",
    // authDomain: "...",
    // projectId: "...",
    // storageBucket: "...",
    // messagingSenderId: "...",
    // appId: "..."
  };

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}
