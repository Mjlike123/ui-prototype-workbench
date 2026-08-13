const state = {
  session: null,
  activeNodeId: null,
  activeIssueId: null,
  lastAuditedNodeId: null,
  scale: 0.72,
};

const elements = {
  status: document.querySelector("#status"),
  sourceForm: document.querySelector("#sourceForm"),
  figmaJson: document.querySelector("#figmaJson"),
  uiJson: document.querySelector("#uiJson"),
  bundleId: document.querySelector("#bundleId"),
  collectorMode: document.querySelector("#collectorMode"),
  connectButton: document.querySelector("#connectButton"),
  compareButton: document.querySelector("#compareButton"),
  exportButton: document.querySelector("#exportButton"),
  exportResult: document.querySelector("#exportResult"),
  pageTitle: document.querySelector("#pageTitle"),
  tree: document.querySelector("#tree"),
  phoneCanvas: document.querySelector("#phoneCanvas"),
  issues: document.querySelector("#issues"),
  issueSummary: document.querySelector("#issueSummary"),
};

elements.sourceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadSession();
});

elements.connectButton.addEventListener("click", async () => {
  elements.connectButton.disabled = true;
  elements.status.textContent = "正在连接手机并采集当前页面...";
  elements.exportResult.textContent = "";

  try {
    const params = new URLSearchParams({
      figmaJson: elements.figmaJson.value,
      mode: elements.collectorMode.value,
      out: "out",
    });
    if (elements.bundleId.value.trim()) {
      params.set("bundleId", elements.bundleId.value.trim());
    }

    const response = await fetch(`/api/connect-phone?${params}`);
    const payload = await response.json();
    if (!response.ok) {
      elements.status.textContent = payload.error ?? "连接手机失败";
      return;
    }

    elements.uiJson.value = payload.capturedPath;
    state.session = payload;
    state.session.issues = [];
    state.activeIssueId = null;
    state.activeNodeId = null;
    state.lastAuditedNodeId = null;
    render();
  } catch (error) {
    elements.status.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    elements.connectButton.disabled = false;
  }
});

elements.compareButton.addEventListener("click", async () => {
  if (!state.activeNodeId) {
    elements.status.textContent = "请先在左侧层级或中间画布选择一个 UI 容器";
    return;
  }

  elements.compareButton.disabled = true;
  elements.status.textContent = "正在比较选中模块...";
  elements.exportResult.textContent = "";
  try {
    const response = await fetch(`/api/audit-scope?${currentParams({ actualNodeId: state.activeNodeId })}`);
    const payload = await response.json();
    if (!response.ok) {
      elements.status.textContent = payload.error ?? "比较失败";
      return;
    }
    state.session = payload;
    state.lastAuditedNodeId = state.activeNodeId;
    state.activeIssueId = payload.issues[0]?.id ?? null;
    render();
  } catch (error) {
    elements.status.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    elements.compareButton.disabled = false;
  }
});

elements.exportButton.addEventListener("click", async () => {
  const params = currentParams(
    state.session?.issues?.length && state.lastAuditedNodeId
      ? { actualNodeId: state.lastAuditedNodeId }
      : {},
  );
  elements.exportResult.textContent = "正在导出...";
  const response = await fetch(`/api/export?${params}`);
  const payload = await response.json();
  if (!response.ok) {
    elements.exportResult.textContent = payload.error ?? "导出失败";
    return;
  }

  elements.exportResult.innerHTML = `<a href="${payload.csvDownloadUrl}">下载 CSV</a>`;
});

loadSession();

async function loadSession() {
  elements.status.textContent = "正在加载 Lookin/Figma 数据...";
  elements.exportResult.textContent = "";
  const response = await fetch(`/api/session?${currentParams()}`);
  const payload = await response.json();

  if (!response.ok) {
    elements.status.textContent = payload.error ?? "加载失败";
    return;
  }

  state.session = payload;
  state.activeNodeId = null;
  state.activeIssueId = null;
  state.lastAuditedNodeId = null;
  render();
}

function currentParams(extra = {}) {
  return new URLSearchParams({
    figmaJson: elements.figmaJson.value,
    uiJson: elements.uiJson.value,
    out: "out",
    ...extra,
  }).toString();
}

function render() {
  const session = state.session;
  if (!session) {
    return;
  }

  elements.status.textContent = `${session.source.mode} · ${session.source.uiJson}`;
  elements.pageTitle.textContent = `${session.actual.pageName} · ${session.actual.device.width}x${session.actual.device.height}`;
  renderTree(session.actual.root);
  renderCanvas(session);
  renderIssues(session.issues, session.scope);
}

function renderTree(root) {
  elements.tree.innerHTML = "";
  const fragment = document.createDocumentFragment();
  visitTree(root, 0, fragment);
  elements.tree.appendChild(fragment);
}

function visitTree(node, depth, parent) {
  const item = document.createElement("div");
  item.className = `tree-node ${state.activeNodeId === node.id ? "active" : ""}`;
  item.style.paddingLeft = `${8 + depth * 14}px`;
  item.innerHTML = `
    <span>${escapeHtml(node.name || node.type)}</span>
    <span class="tree-node-meta">${escapeHtml(node.type)} · ${formatRect(node.frame)}</span>
  `;
  item.addEventListener("click", () => {
    state.activeNodeId = node.id;
    state.activeIssueId = null;
    render();
  });
  parent.appendChild(item);

  for (const child of node.children || []) {
    visitTree(child, depth + 1, parent);
  }
}

function renderCanvas(session) {
  const { width, height } = session.actual.device;
  elements.phoneCanvas.innerHTML = "";
  elements.phoneCanvas.style.width = `${width * state.scale}px`;
  elements.phoneCanvas.style.height = `${height * state.scale}px`;

  for (const node of flatten(session.actual.root)) {
    if (node.id === "root" || node.type === "UIWindow") {
      continue;
    }
    const rect = document.createElement("div");
    rect.className = `ui-rect ${state.activeNodeId === node.id ? "active" : ""}`;
    applyFrame(rect, node.frame);
    rect.title = `${node.name || node.type}\n${formatRect(node.frame)}`;
    rect.addEventListener("click", () => {
      state.activeNodeId = node.id;
      state.activeIssueId = null;
      render();
    });
    elements.phoneCanvas.appendChild(rect);
  }

  for (const issue of session.issues) {
    const frame = issue.actualNode?.frame || issue.designNode?.frame;
    if (!frame) {
      continue;
    }
    const rect = document.createElement("div");
    rect.className = "issue-rect";
    if (issue.id === state.activeIssueId) {
      rect.style.boxShadow = "0 0 0 4px rgba(217,45,32,0.2)";
    }
    applyFrame(rect, frame);
    rect.innerHTML = `<span class="issue-badge">${issue.id.replace("UI-", "")}</span>`;
    rect.title = `${issue.id}\n${issue.suggestion}`;
    rect.addEventListener("click", () => {
      state.activeIssueId = issue.id;
      state.activeNodeId = issue.actualNode?.id ?? null;
      render();
    });
    elements.phoneCanvas.appendChild(rect);
  }
}

function renderIssues(issues, scope) {
  if (!issues.length) {
    elements.issueSummary.textContent = state.activeNodeId
      ? "已选中模块，点击“比较选中模块”开始检查"
      : "先点击左侧层级或中间画布选择一个 UI 容器";
    elements.issues.innerHTML = "";
    return;
  }

  const scopeName = scope?.actualNode?.name || scope?.actualNode?.type || "选中模块";
  elements.issueSummary.textContent = `${scopeName} · ${issues.length} 个问题 · 点击问题可在画布定位`;
  elements.issues.innerHTML = "";

  for (const issue of issues) {
    const card = document.createElement("div");
    card.className = `issue-card ${state.activeIssueId === issue.id ? "active" : ""}`;
    card.innerHTML = `
      <div class="issue-card-header">
        <span>${escapeHtml(issue.id)} · ${escapeHtml(issue.type)}</span>
        <span class="severity-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span>
      </div>
      <strong>${escapeHtml(issue.description)}</strong>
      <p>${escapeHtml(issue.suggestion)}</p>
      <p>设计：${escapeHtml(issue.designValue)} · 实际：${escapeHtml(issue.actualValue)}</p>
    `;
    card.addEventListener("click", () => {
      state.activeIssueId = issue.id;
      state.activeNodeId = issue.actualNode?.id ?? null;
      render();
    });
    elements.issues.appendChild(card);
  }
}

function applyFrame(element, frame) {
  element.style.left = `${frame.x * state.scale}px`;
  element.style.top = `${frame.y * state.scale}px`;
  element.style.width = `${frame.width * state.scale}px`;
  element.style.height = `${frame.height * state.scale}px`;
}

function flatten(root) {
  const nodes = [];
  const visit = (node) => {
    nodes.push(node);
    for (const child of node.children || []) {
      visit(child);
    }
  };
  visit(root);
  return nodes;
}

function formatRect(frame) {
  return `${round(frame.x)},${round(frame.y)} ${round(frame.width)}x${round(frame.height)}`;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
