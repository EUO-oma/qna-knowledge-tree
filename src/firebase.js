import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let app = null;
export let db = null;

export function initFirebase() {
  if (app && db) return { app, db };

  const firebaseConfig = {
    apiKey: "AIzaSyBYIcD8yp4xby_8H1ljr0-t_UGQVjplnWo",
    authDomain: "qna-knowledge-tree-euo-bd7c6.firebaseapp.com",
    projectId: "qna-knowledge-tree-euo",
    storageBucket: "qna-knowledge-tree-euo.firebasestorage.app",
    messagingSenderId: "141218247289",
    appId: "1:141218247289:web:4c0240fe4be5cf69e95aa8"
  };

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  return { app, db };
}
