import { initFirebase } from "./src/firebase.js";
import { loginWithGoogle, logout, watchAuth } from "./src/auth.js";
import { createNode, getNodes } from "./src/nodes.service.js";
import { renderTree } from "./src/tree.render.js";
import { bindDetailPanel } from "./src/ui.detail.js";

let allNodes = [];
let selectedNodeId = null;
let currentUser = null;
let isOwner = false;
let composerParentId = null;

function parseTags(input) {
  return String(input || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function setComposerVisible(visible) {
  document.getElementById("composer").hidden = !visible;
}

function clearComposer() {
  document.getElementById("nodeTitleInput").value = "";
  document.getElementById("nodeTypeSelect").value = "question";
  document.getElementById("nodeContentInput").value = "";
  document.getElementById("nodeTagsInput").value = "";
  composerParentId = null;
  document.getElementById("composerTarget").textContent = "대상: 루트";
}

function openComposer(parentNode = null) {
  composerParentId = parentNode?.id || null;
  document.getElementById("composerTarget").textContent = parentNode
    ? `대상: ${parentNode.title}`
    : "대상: 루트";
  setComposerVisible(true);
  document.getElementById("nodeTitleInput").focus();
}

async function refreshTree() {
  allNodes = await getNodes();

  const keyword = String(document.getElementById("tagSearchInput").value || "")
    .trim()
    .toLowerCase();
  const viewNodes = !keyword
    ? allNodes
    : allNodes.filter((n) =>
        [n.title, n.content, ...(n.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );

  renderTree({
    container: document.getElementById("treeContainer"),
    nodes: viewNodes,
    canEdit: isOwner,
    onSelect(node) {
      selectedNodeId = node.id;
      bindDetailPanel({
        node,
        allNodes,
        canEdit: isOwner,
        onChanged: refreshTree,
      });
    },
    async onAddChild(parent) {
      if (!isOwner) return;
      openComposer(parent);
    },
  });

  if (selectedNodeId) {
    const selectedNode = allNodes.find((n) => n.id === selectedNodeId);
    if (selectedNode) {
      bindDetailPanel({
        node: selectedNode,
        allNodes,
        canEdit: isOwner,
        onChanged: refreshTree,
      });
    }
  }
}

function bindAuthUi() {
  const authBtn = document.getElementById("authBtn");
  const authState = document.getElementById("authState");
  const addRootBtn = document.getElementById("addRootBtn");

  watchAuth(async ({ user, isOwner: owner }) => {
    currentUser = user;
    isOwner = owner;

    authState.textContent = user
      ? `${user.email}${owner ? " (owner)" : ""}`
      : "비로그인";
    authBtn.textContent = user ? "로그아웃" : "Google 로그인";
    addRootBtn.disabled = !owner;
    setComposerVisible(false);
    clearComposer();

    if (!owner) {
      document.getElementById("detailPanel").innerHTML =
        "노드를 선택하세요. (수정/삭제는 owner 로그인 필요)";
    }

    await refreshTree();
  });

  authBtn.addEventListener("click", async () => {
    try {
      if (currentUser) await logout();
      else await loginWithGoogle();
    } catch (e) {
      alert(`인증 실패: ${e?.message || e}`);
    }
  });
}

function bindComposerUi() {
  document.getElementById("addRootBtn").addEventListener("click", () => {
    if (!isOwner) return alert("owner 로그인 후 작성 가능해.");
    openComposer(null);
  });

  document.getElementById("composerCancelBtn").addEventListener("click", () => {
    setComposerVisible(false);
    clearComposer();
  });

  document.getElementById("composerSaveBtn").addEventListener("click", async () => {
    if (!isOwner) return alert("owner 로그인 후 작성 가능해.");

    const title = document.getElementById("nodeTitleInput").value.trim();
    if (!title) return alert("제목은 필수야.");

    const type = document.getElementById("nodeTypeSelect").value;
    const content = document.getElementById("nodeContentInput").value;
    const tags = parseTags(document.getElementById("nodeTagsInput").value);

    await createNode({
      title,
      type,
      content,
      tags,
      parentId: composerParentId,
    });

    setComposerVisible(false);
    clearComposer();
    await refreshTree();
  });
}

async function bootstrap() {
  initFirebase();

  bindAuthUi();
  bindComposerUi();

  document.getElementById("tagSearchInput").addEventListener("input", async () => {
    await refreshTree();
  });

  await refreshTree();
}

bootstrap();
