import { deleteNodeWithDescendants, updateNode } from "./nodes.service.js";

export function bindDetailPanel({ node, allNodes, onChanged }) {
  const panel = document.getElementById("detailPanel");
  const tagsText = (node.tags || []).join(", ");

  panel.innerHTML = `
    <div style="display:grid; gap:8px;">
      <label>제목 <input id="detailTitle" value="${escapeHtml(node.title || "")}" /></label>
      <label>타입
        <select id="detailType">
          ${["question", "answer", "law", "link"].map((t) => `<option value="${t}" ${node.type === t ? "selected" : ""}>${t}</option>`).join("")}
        </select>
      </label>
      <label>내용 <textarea id="detailContent" rows="6">${escapeHtml(node.content || "")}</textarea></label>
      <label>태그(콤마) <input id="detailTags" value="${escapeHtml(tagsText)}" /></label>
      <div style="display:flex; gap:6px;">
        <button id="saveNodeBtn">저장</button>
        <button id="deleteNodeBtn">삭제(하위 포함)</button>
      </div>
    </div>
  `;

  document.getElementById("saveNodeBtn").onclick = async () => {
    const title = document.getElementById("detailTitle").value.trim();
    if (!title) return alert("제목은 필수야.");

    const type = document.getElementById("detailType").value;
    const content = document.getElementById("detailContent").value;
    const tags = document
      .getElementById("detailTags")
      .value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    await updateNode(node.id, { title, type, content, tags });
    alert("저장 완료");
    await onChanged();
  };

  document.getElementById("deleteNodeBtn").onclick = async () => {
    if (!confirm("이 노드와 하위 노드를 모두 삭제할까요?")) return;
    await deleteNodeWithDescendants(node.id, allNodes);
    alert("삭제 완료");
    await onChanged();
    panel.innerHTML = "노드를 선택하세요.";
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}
