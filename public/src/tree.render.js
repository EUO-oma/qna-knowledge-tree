import { getChildren } from "./nodes.service.js";

export function renderTree({ container, nodes, onSelect, onAddChild }) {
  container.innerHTML = "";

  const roots = getChildren(nodes, null);
  const rootList = document.createElement("ul");
  rootList.className = "tree-level";

  roots.forEach((node) => {
    rootList.appendChild(renderNode(node, 0));
  });

  if (!roots.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "아직 노드가 없습니다.";
    container.appendChild(empty);
    return;
  }

  container.appendChild(rootList);

  function renderNode(node, depth) {
    const li = document.createElement("li");

    const row = document.createElement("div");
    row.className = "tree-item";
    row.style.marginLeft = `${depth * 14}px`;

    const titleBtn = document.createElement("button");
    titleBtn.className = "node-btn";
    titleBtn.textContent = node.title;
    titleBtn.onclick = () => onSelect(node);

    const typeBadge = document.createElement("span");
    typeBadge.className = "node-type";
    typeBadge.textContent = node.type;

    const actions = document.createElement("div");
    actions.className = "node-actions";

    const addBtn = document.createElement("button");
    addBtn.textContent = "+";
    addBtn.title = "하위 노드 추가";
    addBtn.onclick = () => onAddChild(node);

    actions.appendChild(addBtn);
    row.appendChild(titleBtn);
    row.appendChild(typeBadge);
    row.appendChild(actions);
    li.appendChild(row);

    const children = getChildren(nodes, node.id);
    if (children.length) {
      const ul = document.createElement("ul");
      ul.className = "tree-level";
      children.forEach((child) => ul.appendChild(renderNode(child, depth + 1)));
      li.appendChild(ul);
    }

    return li;
  }
}
