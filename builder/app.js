(function () {
  const state = {
    studio: JSON.parse(JSON.stringify(STUDIO)),
    projects: JSON.parse(JSON.stringify(PROJECTS)),
    currentId: null,
  };

  const editor = document.getElementById("editor");
  const projectList = document.getElementById("projectList");
  const previewFrame = document.getElementById("previewFrame");
  const publishStatus = document.getElementById("publishStatus");
  const fileInput = document.getElementById("fileInput");
  const folderInput = document.getElementById("folderInput");
  const modeDesktop = document.getElementById("modeDesktop");
  const modeMobile = document.getElementById("modeMobile");
  const pendingSection = document.getElementById("pendingSection");
  const pendingList = document.getElementById("pendingList");

  previewFrame.classList.add("mode-desktop");
  function setPreviewMode(mode) {
    previewFrame.classList.toggle("mode-mobile", mode === "mobile");
    previewFrame.classList.toggle("mode-desktop", mode === "desktop");
    modeDesktop.classList.toggle("active", mode === "desktop");
    modeMobile.classList.toggle("active", mode === "mobile");
  }
  modeDesktop.addEventListener("click", () => setPreviewMode("desktop"));
  modeMobile.addEventListener("click", () => setPreviewMode("mobile"));

  function pad2(n) {
    return String(n + 1).padStart(2, "0");
  }

  function slugify(name) {
    return (
      (name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "project"
    );
  }

  function escapeAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function getCurrentProject() {
    return state.projects.find((p) => p.id === state.currentId) || null;
  }

  function groupImagesByCols(images) {
    const groups = [];
    images.forEach((img) => {
      const cols = img.cols || 1;
      const last = groups[groups.length - 1];
      if (last && last.cols === cols && last.items.length < cols) {
        last.items.push(img);
      } else {
        groups.push({ cols, items: [img] });
      }
    });
    return groups;
  }

  function visibleImages(images) {
    return images.filter((img) => !img.hidden);
  }

  // ---------- LEFT : project list ----------

  function renderProjectList() {
    projectList.innerHTML = "";
    state.projects.forEach((p) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "b-proj-row" + (p.id === state.currentId ? " active" : "");
      row.innerHTML = `<span class="nm">${escapeHtml(p.name || p.id)}</span><span class="del" title="삭제">×</span>`;
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("del")) return;
        selectProject(p.id);
      });
      row.querySelector(".del").addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm(`"${p.name || p.id}" 프로젝트를 목록에서 삭제할까요? (이미지 파일은 남아있습니다)`)) return;
        state.projects = state.projects.filter((x) => x.id !== p.id);
        if (state.currentId === p.id) state.currentId = null;
        renderProjectList();
        renderEditor();
        renderPreview();
      });
      projectList.appendChild(row);
    });
  }

  function selectProject(id) {
    state.currentId = id;
    renderProjectList();
    renderEditor();
    renderPreview();
  }

  document.getElementById("btnNewProject").addEventListener("click", () => {
    const name = prompt("새 프로젝트 이름을 입력하세요 (예: AP TOWER)");
    if (!name || !name.trim()) return;
    let id = slugify(name);
    let n = 2;
    while (state.projects.some((p) => p.id === id)) {
      id = slugify(name) + "-" + n;
      n++;
    }
    const project = {
      id,
      name: name.trim(),
      type: "",
      year: String(new Date().getFullYear()),
      location: "",
      summary: "",
      description: "",
      facts: {
        client: "",
        site: "",
        types: "",
        topics: "",
        design: "",
        period: "",
        periodCont: "",
        workScope: "",
        area: "",
      },
      images: [],
    };
    state.projects.push(project);
    selectProject(id);
  });

  // ---------- local folder auto-detect ----------

  async function scanSource() {
    try {
      const res = await fetch("/api/scan-source");
      const data = await res.json();
      const known = new Set(state.projects.map((p) => p.id));
      const pending = (data.folders || []).filter((f) => !known.has(f.id));
      renderPendingFolders(pending);
    } catch (err) {
      // 로컬 폴더 스캔 실패는 조용히 무시 (서버가 잠깐 바쁠 수 있음)
    }
  }

  function renderPendingFolders(pending) {
    pendingSection.hidden = pending.length === 0;
    pendingList.innerHTML = "";
    pending.forEach((f) => {
      const row = document.createElement("div");
      row.className = "b-pending-row";
      const countLabel = [
        f.imageCount ? `사진 ${f.imageCount}` : "",
        f.videoCount ? `영상 ${f.videoCount}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      row.innerHTML = `
        <span class="nm">${escapeHtml(f.name)}</span>
        <span class="count">${countLabel}</span>
        <button type="button" class="btn-import">가져오기</button>
      `;
      row.querySelector(".btn-import").addEventListener("click", async (e) => {
        e.target.disabled = true;
        e.target.textContent = "가져오는 중...";
        try {
          const res = await fetch("/api/import-folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: f.folder }),
          });
          const data = await res.json();
          if (data.project) {
            state.projects.push(data.project);
            selectProject(data.project.id);
            scanSource();
          } else {
            alert("가져오기 실패: " + (data.error || "알 수 없는 오류"));
            e.target.disabled = false;
            e.target.textContent = "가져오기";
          }
        } catch (err) {
          alert("가져오기 실패: " + err.message);
          e.target.disabled = false;
          e.target.textContent = "가져오기";
        }
      });
      pendingList.appendChild(row);
    });
  }

  scanSource();
  setInterval(scanSource, 5000);

  // ---------- CENTER : editor ----------

  function renderEditor() {
    const project = getCurrentProject();
    if (!project) {
      editor.innerHTML = '<p class="b-empty">왼쪽에서 프로젝트를 선택하거나, "+ 새 프로젝트"로 시작하세요.</p>';
      return;
    }

    const factFields = [
      ["client", "Client"],
      ["site", "Site"],
      ["types", "Types"],
      ["topics", "Topics"],
      ["design", "Design"],
      ["workScope", "Work Scope"],
      ["period", "Period"],
      ["periodCont", "Period (이어서)"],
      ["area", "Area"],
    ];
    const factsHtml = factFields
      .map(
        ([key, label]) => `
      <div class="b-field">
        <label>${label}</label>
        <input type="text" class="f-fact" data-key="${key}" value="${escapeAttr(project.facts[key])}" />
      </div>`
      )
      .join("");

    editor.innerHTML = `
      <div class="b-generate-row">
        <p style="color:var(--sub);font-size:10px;margin:0;">ID: ${escapeHtml(project.id)}</p>
        <button type="button" class="b-btn b-btn-generate" id="btnGenerate">✦ Generate</button>
        <button type="button" class="b-btn b-btn-publish-project" id="btnPublishProject">Publish</button>
        <span class="b-generate-status" id="generateStatus"></span>
      </div>

      <div class="b-field">
        <label>프로젝트명</label>
        <input type="text" id="f-name" value="${escapeAttr(project.name)}" />
      </div>

      <div class="b-row2">
        <div class="b-field">
          <label>공간 타입</label>
          <input type="text" id="f-type" value="${escapeAttr(project.type)}" />
        </div>
        <div class="b-field">
          <label>연도</label>
          <input type="text" id="f-year" value="${escapeAttr(project.year)}" />
        </div>
        <div class="b-field">
          <label>지역</label>
          <input type="text" id="f-location" value="${escapeAttr(project.location)}" />
        </div>
      </div>

      <div class="b-field">
        <label>한 줄 소개 (summary)</label>
        <textarea id="f-summary" rows="2">${escapeHtml(project.summary)}</textarea>
      </div>

      <div class="b-field">
        <label>상세 설명 (description)</label>
        <textarea id="f-description" rows="4">${escapeHtml(project.description)}</textarea>
      </div>

      <div class="b-section-title">PROJECT INFO</div>
      <div class="b-facts-grid">${factsHtml}</div>

      <div class="b-section-title">PHOTOS</div>
      <div class="b-photo-dropzone" id="photoDropzone">
        <div class="b-photo-actions">
          <button type="button" class="b-btn" id="btnAddPhotos">+ 사진 추가</button>
          <button type="button" class="b-btn" id="btnAddFolder">+ 폴더에서 가져오기</button>
          <span class="b-drop-hint">또는 파일을 이 영역에 끌어다 놓으세요</span>
        </div>
        <div class="b-photos" id="photoList"></div>
      </div>
    `;

    const bind = (id, key) => {
      document.getElementById(id).addEventListener("input", (e) => {
        project[key] = e.target.value;
        if (key === "name") renderProjectList();
        renderPreview();
      });
    };
    bind("f-name", "name");
    bind("f-type", "type");
    bind("f-year", "year");
    bind("f-location", "location");
    bind("f-summary", "summary");
    bind("f-description", "description");

    editor.querySelectorAll(".f-fact").forEach((input) => {
      input.addEventListener("input", (e) => {
        project.facts[e.target.dataset.key] = e.target.value;
        renderPreview();
      });
    });

    document.getElementById("btnAddPhotos").addEventListener("click", () => fileInput.click());
    document.getElementById("btnAddFolder").addEventListener("click", () => folderInput.click());
    document.getElementById("btnGenerate").addEventListener("click", () => startGenerate(project));
    document.getElementById("btnPublishProject").addEventListener("click", () => {
      publishSite("Update " + (project.name || project.id), document.getElementById("generateStatus"));
    });

    const dropzone = document.getElementById("photoDropzone");
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });
    dropzone.addEventListener("dragleave", (e) => {
      if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove("drag-over");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
      addFiles(e.dataTransfer.files);
    });

    renderPhotoList();
  }

  // ---------- Generate (Claude Code 세션이 처리) ----------

  let generatePollTimer = null;

  function setGenerateStatus(text) {
    const el = document.getElementById("generateStatus");
    if (el) el.textContent = text;
  }

  async function startGenerate(project) {
    if (generatePollTimer) {
      clearInterval(generatePollTimer);
      generatePollTimer = null;
    }
    try {
      await fetch("/api/generate-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          hints: {
            name: project.name,
            type: project.type,
            year: project.year,
            location: project.location,
          },
        }),
      });
    } catch (err) {
      setGenerateStatus("요청 실패: " + err.message);
      return;
    }
    setGenerateStatus("요청됨 — 이 창을 열어둔 Claude Code 세션이 처리합니다...");
    generatePollTimer = setInterval(() => pollGenerate(project.id), 3000);
    pollGenerate(project.id);
  }

  async function pollGenerate(projectId) {
    let data;
    try {
      const res = await fetch("/api/generate-status?projectId=" + encodeURIComponent(projectId));
      data = await res.json();
    } catch (err) {
      return;
    }
    if (data.status === "pending") {
      setGenerateStatus("처리 대기/진행 중...");
      return;
    }
    if (data.status === "error") {
      setGenerateStatus("실패: " + (data.error || "알 수 없는 오류"));
      clearInterval(generatePollTimer);
      generatePollTimer = null;
      return;
    }
    if (data.status === "done") {
      clearInterval(generatePollTimer);
      generatePollTimer = null;
      const project = state.projects.find((p) => p.id === projectId);
      const r = data.result || {};
      if (project && r) {
        if (r.name) project.name = r.name;
        if (r.type) project.type = r.type;
        if (r.summary) project.summary = r.summary;
        if (r.description) project.description = r.description;
        if (Array.isArray(r.captions)) {
          r.captions.forEach((cap, i) => {
            if (project.images[i] && cap) project.images[i].caption = cap;
          });
        }
      }
      if (state.currentId === projectId) {
        renderEditor();
        renderPreview();
      }
      renderProjectList();
      setGenerateStatus("완료!");
    }
  }

  function renderPhotoList() {
    const project = getCurrentProject();
    const list = document.getElementById("photoList");
    if (!list || !project) return;
    list.innerHTML = "";

    project.images.forEach((img, i) => {
      const card = document.createElement("div");
      card.className = "b-photo-card" + (img.hidden ? " photo-hidden" : "");
      card.dataset.index = i;
      const cols = img.cols || 1;
      const isVideo = img.type === "video" || /\.(mp4|mov|m4v|webm)$/i.test(img.src);
      const thumbHtml = isVideo
        ? `<video src="${img.src}" muted></video>`
        : `<img src="${img.src}" alt="" />`;
      const previewText = img.caption ? escapeHtml(img.caption) : "+ 캡션 추가 (사진 클릭 시 뜨는 설명)";
      const bodyPlaceholder = i === 0 ? "비워두면 '한 줄 소개'가 대신 표시됨" : "사진 아래 항상 보이는 설명";
      card.innerHTML = `
        <span class="drag-handle" draggable="true" title="드래그해서 순서 변경">⠿</span>
        ${thumbHtml}
        <div class="photo-fields">
          <div class="field-line">
            <label>본문</label>
            <input type="text" class="body-input" placeholder="${bodyPlaceholder}" value="${escapeAttr(img.body || "")}" />
          </div>
          <div class="field-line cap-box ${img.captionHidden ? "caption-off" : ""}">
            <label>히든박스</label>
            <button type="button" class="cap-eye-toggle ${img.captionHidden ? "is-hidden" : ""}" title="캡션 팝업 표시/숨김">${img.captionHidden ? "—" : "00"}</button>
            <span class="cap-box-preview">${previewText}</span>
            <input type="text" class="cap-box-input" value="${escapeAttr(img.caption)}" hidden />
          </div>
        </div>
        <button type="button" class="eye-toggle ${img.hidden ? "is-hidden" : ""}" title="사진 자체를 사이트에 표시/숨김">${img.hidden ? "—" : "00"}</button>
        <div class="b-cols">
          <button type="button" data-cols="1" class="${cols === 1 ? "active" : ""}">1</button>
          <button type="button" data-cols="2" class="${cols === 2 ? "active" : ""}">2</button>
          <button type="button" data-cols="3" class="${cols === 3 ? "active" : ""}">3</button>
        </div>
        <button type="button" class="b-photo-del" title="삭제">×</button>
      `;

      card.querySelector(".body-input").addEventListener("input", (e) => {
        img.body = e.target.value;
        renderPreview();
      });

      const capBox = card.querySelector(".cap-box");
      const capPreview = card.querySelector(".cap-box-preview");
      const capInput = card.querySelector(".cap-box-input");
      capPreview.addEventListener("click", () => {
        capPreview.hidden = true;
        capInput.hidden = false;
        capInput.focus();
        capInput.select();
      });
      const commitCaption = () => {
        img.caption = capInput.value;
        capPreview.textContent = img.caption ? img.caption : "+ 캡션 추가 (사진 클릭 시 뜨는 설명)";
        capInput.hidden = true;
        capPreview.hidden = false;
        renderPreview();
      };
      capInput.addEventListener("blur", commitCaption);
      capInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") capInput.blur();
      });

      card.querySelector(".cap-eye-toggle").addEventListener("click", (e) => {
        img.captionHidden = !img.captionHidden;
        capBox.classList.toggle("caption-off", !!img.captionHidden);
        e.target.classList.toggle("is-hidden", !!img.captionHidden);
        e.target.textContent = img.captionHidden ? "—" : "00";
        renderPreview();
      });

      card.querySelector(".eye-toggle").addEventListener("click", (e) => {
        img.hidden = !img.hidden;
        card.classList.toggle("photo-hidden", !!img.hidden);
        e.target.classList.toggle("is-hidden", !!img.hidden);
        e.target.textContent = img.hidden ? "—" : "00";
        renderPreview();
      });

      card.querySelectorAll(".b-cols button").forEach((btn) => {
        btn.addEventListener("click", () => {
          img.cols = Number(btn.dataset.cols);
          card.querySelectorAll(".b-cols button").forEach((b) => b.classList.toggle("active", b === btn));
          renderPreview();
        });
      });

      card.querySelector(".b-photo-del").addEventListener("click", () => {
        project.images.splice(i, 1);
        renderPhotoList();
        renderPreview();
      });

      const handle = card.querySelector(".drag-handle");
      handle.addEventListener("dragstart", (e) => {
        card.classList.add("dragging");
        e.dataTransfer.setData("text/plain", String(i));
        e.dataTransfer.effectAllowed = "move";
      });
      handle.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        card.classList.add("drag-over");
      });
      card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("drag-over");
        const from = Number(e.dataTransfer.getData("text/plain"));
        const to = Number(card.dataset.index);
        if (from === to || Number.isNaN(from)) return;
        const [moved] = project.images.splice(from, 1);
        project.images.splice(to, 0, moved);
        renderPhotoList();
        renderPreview();
      });

      list.appendChild(card);
    });
  }

  // ---------- photo upload ----------

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function addFiles(fileList) {
    const project = getCurrentProject();
    if (!project) {
      alert("먼저 프로젝트를 선택하거나 새로 만들어주세요.");
      return;
    }
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (!files.length) return;

    publishStatus.textContent = `이미지 ${files.length}개 업로드 중...`;
    for (const file of files) {
      try {
        const dataUrl = await readAsDataURL(file);
        const res = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: project.id, filename: file.name, dataUrl }),
        });
        const data = await res.json();
        if (data.path) {
          const entry = { src: data.path, caption: "", cols: 1 };
          if (data.type === "video") entry.type = "video";
          project.images.push(entry);
        }
      } catch (err) {
        console.error(err);
      }
    }
    publishStatus.textContent = "";
    renderPhotoList();
    renderPreview();
  }

  fileInput.addEventListener("change", (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  });
  folderInput.addEventListener("change", (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  });

  // ---------- RIGHT : live preview ----------

  function renderPreview() {
    const project = getCurrentProject();
    if (!project) {
      previewFrame.innerHTML = '<p class="b-empty">미리볼 프로젝트가 없습니다.</p>';
      return;
    }

    const f = project.facts || {};
    const factLines = [
      ["Client", f.client],
      ["Site", f.site],
      ["Types", f.types],
      ["Topics", f.topics],
      ["Design", f.design],
      ["Period", [f.period, f.periodCont].filter(Boolean).join(" ")],
      ["Work Scope", f.workScope],
      ["Area", f.area],
    ].filter(([, v]) => v);
    const factsHtml = factLines.map(([k, v]) => `<p>${escapeHtml(k)} : ${escapeHtml(v)}</p>`).join("");

    let globalIndex = 0;
    const groups = groupImagesByCols(visibleImages(project.images));
    const rowsHtml = groups
      .map((group) => {
        const itemsHtml = group.items
          .map((img) => {
            const isFirst = globalIndex === 0;
            const capText = isFirst ? project.summary : img.body || img.caption;
            const isVideo = img.type === "video" || /\.(mp4|mov|m4v|webm)$/i.test(img.src);
            const mediaHtml = isVideo
              ? `<video src="${img.src}" controls muted></video>`
              : `<img src="${img.src}" alt="">`;
            const html = `
            <div class="pv-item">
              <div class="img-wrap">${mediaHtml}</div>
              <div class="pv-cap"><span class="idx">${pad2(globalIndex)}</span><p>${escapeHtml(capText || "")}</p></div>
            </div>`;
            globalIndex++;
            return html;
          })
          .join("");
        return `<div class="pv-row" style="grid-template-columns:repeat(${group.cols},1fr);">${itemsHtml}</div>`;
      })
      .join("");

    previewFrame.innerHTML = `
      <div class="pv-meta"><span class="pv-name" contenteditable="true" data-field="name">${escapeHtml(project.name || "UNTITLED")}</span></div>
      <div class="pv-subtitle" contenteditable="true" data-field="summary" data-placeholder="부제 (한 줄 소개)">${escapeHtml(project.summary)}</div>
      <div class="pv-body" contenteditable="true" data-field="description" data-placeholder="본문 (상세 설명)">${escapeHtml(project.description)}</div>
      ${factsHtml ? `<div class="pv-facts">${factsHtml}</div>` : ""}
      <div class="pv-feed">${rowsHtml || '<p class="b-empty">사진을 추가해주세요.</p>'}</div>
    `;

    bindPreviewEditable(previewFrame.querySelector(".pv-name"), project, "name", "f-name");
    bindPreviewEditable(previewFrame.querySelector(".pv-subtitle"), project, "summary", "f-summary");
    bindPreviewEditable(previewFrame.querySelector(".pv-body"), project, "description", "f-description");
  }

  function bindPreviewEditable(el, project, field, formId) {
    if (!el) return;
    el.addEventListener("input", () => {
      project[field] = el.textContent;
      const formEl = document.getElementById(formId);
      if (formEl) formEl.value = el.textContent;
      if (field === "name") renderProjectList();
    });
    el.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    });
  }

  // ---------- publish (data.js 저장 + git commit/push) ----------

  async function publishSite(commitMessage, statusEl) {
    const setStatus = (text) => {
      if (statusEl) statusEl.textContent = text;
      publishStatus.textContent = text;
    };
    setStatus("저장 중...");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studio: state.studio, projects: state.projects, commitMessage }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("실패: " + (data.error || "알 수 없는 오류"));
        return;
      }
      const g = data.git || {};
      let text = "저장 완료 (" + new Date().toLocaleTimeString() + ")";
      if (g.pushed) text += " · GitHub에 push됨";
      else if (g.note) text += " · " + g.note;
      else if (g.pushError) text += " · push 실패: " + g.pushError;
      setStatus(text);
    } catch (err) {
      setStatus("실패: " + err.message);
    }
  }

  // 드롭존 밖에 파일을 놓쳐도 브라우저가 그 파일을 열어버리지 않도록 방지
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => e.preventDefault());

  renderProjectList();
  renderEditor();
  renderPreview();
})();
