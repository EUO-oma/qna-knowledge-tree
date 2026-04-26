import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

const COL = "nodes";

export async function createNode({ title, content, type, parentId, tags }) {
  return addDoc(collection(db, COL), {
    title,
    content,
    type,
    parentId: parentId ?? null,
    tags: tags ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getNodes() {
  const q = query(collection(db, COL), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function getChildren(nodes, parentId) {
  return nodes.filter((n) => (n.parentId ?? null) === (parentId ?? null));
}

export async function updateNode(nodeId, patch) {
  await updateDoc(doc(db, COL, nodeId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNode(nodeId) {
  await deleteDoc(doc(db, COL, nodeId));
}
