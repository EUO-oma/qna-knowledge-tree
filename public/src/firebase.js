import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let db = null;

export function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyAjO06gbmZrl6c4oHlG4FBfVDLZktcILyY",
    authDomain: "euo-oma-blog.firebaseapp.com",
    projectId: "euo-oma-blog",
    storageBucket: "euo-oma-blog.firebasestorage.app",
    messagingSenderId: "571362546310",
    appId: "1:571362546310:web:33aa43eb0d11a9ee243707"
  };

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}
