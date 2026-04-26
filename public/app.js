import { initFirebase } from "../src/firebase.js";
import { createNode, getNodes } from "../src/nodes.service.js";
import { renderTree } from "../src/tree.render.js";
import { bindDetailPanel } from "../src/ui.detail.js";

let allNodes = [];
let selectedNodeId = null;

function parseTags(input) {
  return String(input || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function getNodeTypeFromUser(defaultType = "question") {
  const raw = window.prompt("타입 입력: question / answer / law / link", defaultType) || "";
  const type = raw.trim().toLowerCase();
  return ["question", "answer", "law", "link"].includes(type) ? type : defaultType;
}

async function refreshTree() {
  allNodes = await getNodes();

  const keyword = String(document.getElementById("tagSearchInput").value || "")
    .trim()
    .toLowerCase();
  const viewNodes = !keyword
    ? allNodes
    : allNodes.filter((n) => (n.tags || []).some((t) => String(t).toLowerCase().includes(keyword)));

  renderTree({
    container: document.getElementById("treeContainer"),
    nodes: viewNodes,
    onSelect(node) {
      selectedNodeId = node.id;
      bindDetailPanel({
        node,
        allNodes,
        onChanged: refreshTree,
      });
    },
    async onAddChild(parent) {
      const title = window.prompt("하위 노드 제목", "새 하위 질문");
      if (!title) return;

      const type = getNodeTypeFromUser("question");
      const content = window.prompt("내용(선택)", "") || "";
      const tagsInput = window.prompt("태그(콤마 구분, 선택)", "") || "";

      await createNode({
        title: title.trim(),
        content,
        type,
        parentId: parent.id,
        tags: parseTags(tagsInput),
      });

      await refreshTree();
    },
  });

  if (selectedNodeId) {
    const selectedNode = allNodes.find((n) => n.id === selectedNodeId);
    if (selectedNode) {
      bindDetailPanel({
        node: selectedNode,
        allNodes,
        onChanged: refreshTree,
      });
    }
  }
}

async function bootstrap() {
  initFirebase();

  document.getElementById("addRootBtn").addEventListener("click", async () => {
    const title = window.prompt("루트 노드 제목", "새 질문");
    if (!title) return;

    const type = getNodeTypeFromUser("question");
    const content = window.prompt("내용(선택)", "") || "";
    const tagsInput = window.prompt("태그(콤마 구분, 선택)", "") || "";

    await createNode({
      title: title.trim(),
      content,
      type,
      parentId: null,
      tags: parseTags(tagsInput),
    });

    await refreshTree();
  });

  document.getElementById("tagSearchInput").addEventListener("input", async () => {
    await refreshTree();
  });

  await refreshTree();
}

bootstrap();
