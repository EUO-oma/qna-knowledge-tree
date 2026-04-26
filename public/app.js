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
let selectedType = "all";
const collapsedIds = new Set();
let toastTimer = null;

function isMobile() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function setMobileView(mode) {
  const layout = document.querySelector(".layout");
  const treeTab = document.getElementById("mobileTreeTab");
  const detailTab = document.getElementById("mobileDetailTab");
  if (!layout || !treeTab || !detailTab) return;

  layout.classList.remove("show-tree", "show-detail");
  layout.classList.add(mode === "detail" ? "show-detail" : "show-tree");

  treeTab.classList.toggle("active", mode === "tree");
  detailTab.classList.toggle("active", mode === "detail");
}

function parseTags(input) {
  return String(input || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function showToast(message, type = "ok", ms = 2400) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.className = `toast ${type}`;
  el.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, ms);
}

function syncTypeChipUi() {
  document.querySelectorAll(".type-chip").forEach((v) => {
    v.classList.toggle("active", (v.dataset.type || "all") === selectedType);
  });
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
  if (isMobile()) setMobileView("tree");
}

async function refreshTree() {
  allNodes = await getNodes();

  const keyword = String(document.getElementById("tagSearchInput").value || "")
    .trim()
    .toLowerCase();
  let viewNodes = !keyword
    ? allNodes
    : allNodes.filter((n) =>
        [n.title, n.content, ...(n.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );

  if (selectedType !== "all") {
    viewNodes = viewNodes.filter((n) => n.type === selectedType);
  }

  document.getElementById("resultCount").textContent = `결과 ${viewNodes.length}개`;

  renderTree({
    container: document.getElementById("treeContainer"),
    nodes: viewNodes,
    canEdit: isOwner,
    selectedNodeId,
    collapsedIds,
    onToggleCollapse(nodeId) {
      if (collapsedIds.has(nodeId)) collapsedIds.delete(nodeId);
      else collapsedIds.add(nodeId);
      refreshTree();
    },
    keyword,
    onSelect(node) {
      selectedNodeId = node.id;
      bindDetailPanel({
        node,
        allNodes,
        canEdit: isOwner,
        onChanged: refreshTree,
      });
      if (isMobile()) setMobileView("detail");
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

    try {
      const parentId = composerParentId;
      const createdRef = await createNode({
        title,
        type,
        content,
        tags,
        parentId,
      });

      if (parentId) collapsedIds.delete(parentId);
      selectedNodeId = createdRef?.id || null;

      if (selectedType !== "all" && selectedType !== type) {
        selectedType = "all";
        syncTypeChipUi();
      }

      setComposerVisible(false);
      clearComposer();
      await refreshTree();
      if (isMobile()) setMobileView("detail");
      showToast(parentId ? "하위 노드가 추가됐어." : "루트 노드가 추가됐어.", "ok");
    } catch (e) {
      showToast(`노드 저장 실패: ${e?.message || e}`, "error", 3600);
    }
  });
}

async function bootstrap() {
  initFirebase();

  bindAuthUi();
  bindComposerUi();

  document.getElementById("mobileTreeTab").addEventListener("click", () => setMobileView("tree"));
  document.getElementById("mobileDetailTab").addEventListener("click", () => setMobileView("detail"));
  if (isMobile()) setMobileView("tree");

  document.getElementById("tagSearchInput").addEventListener("input", async () => {
    await refreshTree();
  });

  document.querySelectorAll(".type-chip").forEach((btn) => {
    btn.addEventListener("click", async () => {
      selectedType = btn.dataset.type || "all";
      syncTypeChipUi();
      await refreshTree();
    });
  });

  document.getElementById("collapseAllBtn").addEventListener("click", async () => {
    allNodes.forEach((n) => {
      const hasChild = allNodes.some((c) => (c.parentId ?? null) === n.id);
      if (hasChild) collapsedIds.add(n.id);
    });
    await refreshTree();
  });

  document.getElementById("expandAllBtn").addEventListener("click", async () => {
    collapsedIds.clear();
    await refreshTree();
  });

  syncTypeChipUi();
  await refreshTree();
}

bootstrap();
