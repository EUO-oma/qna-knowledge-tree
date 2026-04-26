import { initFirebase } from "../src/firebase.js";
import { createNode, getNodes } from "../src/nodes.service.js";
import { renderTree } from "../src/tree.render.js";
import { bindDetailPanel } from "../src/ui.detail.js";

async function refreshTree() {
  const nodes = await getNodes();
  const container = document.getElementById("treeContainer");

  renderTree({
    container,
    nodes,
    onSelect(node) {
      bindDetailPanel(node);
    },
    async onAddChild(parent) {
      const title = window.prompt("하위 노드 제목", "새 하위 질문");
      if (!title) return;
      await createNode({
        title,
        content: "",
        type: "question",
        parentId: parent.id,
        tags: []
      });
      await refreshTree();
    }
  });
}

async function bootstrap() {
  initFirebase();

  document.getElementById("addRootBtn").addEventListener("click", async () => {
    const title = window.prompt("루트 질문 제목", "새 질문");
    if (!title) return;
    await createNode({
      title,
      content: "",
      type: "question",
      parentId: null,
      tags: []
    });
    await refreshTree();
  });

  document.getElementById("tagSearchInput").addEventListener("input", async (e) => {
    const keyword = String(e.target.value || "").trim().toLowerCase();
    const all = await getNodes();
    const filtered = !keyword
      ? all
      : all.filter((n) => (n.tags || []).some((t) => String(t).toLowerCase().includes(keyword)));

    renderTree({
      container: document.getElementById("treeContainer"),
      nodes: filtered,
      onSelect: bindDetailPanel,
      async onAddChild(parent) {
        const title = window.prompt("하위 노드 제목", "새 하위 질문");
        if (!title) return;
        await createNode({ title, content: "", type: "question", parentId: parent.id, tags: [] });
        await refreshTree();
      }
    });
  });

  await refreshTree();
}

bootstrap();
