(function () {
  document.getElementById("studioName").textContent = STUDIO.name;
  document.getElementById("studioRole").textContent = STUDIO.role;
  document.getElementById("studioAddress").textContent = STUDIO.address;
  document.getElementById("studioPhone").textContent = STUDIO.phone;
  document.getElementById("studioEmail").textContent = STUDIO.email;
  document.getElementById("studioSite").textContent = STUDIO.site;
  document.getElementById("studioSns").textContent = STUDIO.sns;

  const workList = document.getElementById("workList");
  const metaName = document.getElementById("metaName");
  const viewerFacts = document.getElementById("viewerFacts");
  const viewerFeed = document.getElementById("viewerFeed");

  let currentProjectIdx = 0;

  function pad2(n) {
    return String(n + 1).padStart(2, "0");
  }

  function renderList() {
    workList.innerHTML = "";

    const groups = [];
    PROJECTS.forEach((p, i) => {
      let g = groups[groups.length - 1];
      if (!g || g.year !== p.year) {
        g = { year: p.year, items: [] };
        groups.push(g);
      }
      g.items.push({ project: p, index: i });
    });

    groups.forEach((g) => {
      const groupEl = document.createElement("div");
      groupEl.className = "work-group";

      const yearEl = document.createElement("div");
      yearEl.className = "work-year";
      yearEl.textContent = g.year;

      const namesEl = document.createElement("div");
      namesEl.className = "work-names";

      g.items.forEach(({ project, index }) => {
        const row = document.createElement("button");
        row.className = "work-row";
        row.type = "button";
        row.dataset.index = index;
        row.innerHTML = `<span class="chk"></span><span class="nm">${project.name}</span>`;
        row.addEventListener("click", () => selectProject(index));
        namesEl.appendChild(row);
      });

      groupEl.appendChild(yearEl);
      groupEl.appendChild(namesEl);
      workList.appendChild(groupEl);
    });

    updateActiveRow();
  }

  function updateActiveRow() {
    workList.querySelectorAll(".work-row").forEach((row) => {
      row.classList.toggle("active", Number(row.dataset.index) === currentProjectIdx);
    });
  }

  function selectProject(i) {
    currentProjectIdx = i;
    updateActiveRow();
    renderDetail();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderFacts(project) {
    if (!viewerFacts) return;
    const f = project.facts;
    if (!f) {
      viewerFacts.innerHTML = "";
      return;
    }
    viewerFacts.innerHTML = `
      <p>Client : ${f.client}</p>
      <p>Site : ${f.site}</p>
      <p>Types : ${f.types}</p>
      <p>Topics : ${f.topics}</p>
      <p>Design : ${f.design}</p>
      <p>Period : ${f.period} ${f.periodCont}</p>
      <p>Work Scope : ${f.workScope}</p>
      <p>Area : ${f.area}</p>
    `;
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

  function renderFeed(project) {
    viewerFeed.innerHTML = "";
    let i = 0;
    groupImagesByCols(project.images).forEach((group) => {
      const row = document.createElement("div");
      row.className = "feed-row";
      row.style.gridTemplateColumns = `repeat(${group.cols}, 1fr)`;
      group.items.forEach((img) => {
        const item = document.createElement("figure");
        item.className = "feed-item";
        const isSummary = i === 0;
        const capText = isSummary ? project.summary : img.caption;
        const isVideo = img.type === "video" || /\.(mp4|mov|m4v|webm)$/i.test(img.src);
        const dataAttrs = `data-caption="${capText}" data-project-id="${project.id}" data-image-index="${i}" data-is-summary="${isSummary ? "1" : ""}"`;
        const mediaHtml = isVideo
          ? `<video class="feed-img" src="${img.src}" ${dataAttrs} controls muted playsinline></video>`
          : `<img class="feed-img" src="${img.src}" alt="${capText}" ${dataAttrs} loading="lazy" />`;
        item.innerHTML = `
          <div class="feed-image-wrap">
            ${mediaHtml}
          </div>
          <figcaption class="viewer-caption">
            <span class="cap-index">${pad2(i)}</span>
            <p class="cap-text">${capText}</p>
          </figcaption>
        `;
        row.appendChild(item);
        i++;
      });
      viewerFeed.appendChild(row);
    });
  }

  function renderDetail() {
    const project = PROJECTS[currentProjectIdx];
    metaName.textContent = project.name;
    renderFacts(project);
    renderFeed(project);
  }

  renderList();
  renderDetail();

  // custom cursor: black circle, turns white when hovering a photo
  const cursorDot = document.getElementById("cursorDot");
  if (cursorDot) {
    document.addEventListener("mousemove", (e) => {
      cursorDot.style.left = e.clientX + "px";
      cursorDot.style.top = e.clientY + "px";
      cursorDot.classList.add("visible");
    });
    document.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget && !e.toElement) cursorDot.classList.remove("visible");
    });

    const PHOTO_SEL = ".feed-img";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(PHOTO_SEL)) cursorDot.classList.add("on-photo");
    });
    document.addEventListener("mouseout", (e) => {
      const leavingPhoto = e.target.closest(PHOTO_SEL);
      const enteringPhoto = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(PHOTO_SEL);
      if (leavingPhoto && !enteringPhoto) cursorDot.classList.remove("on-photo");
    });
  }

  // caption tooltip that follows the cursor while hovering a photo;
  // click opens it and lets you edit + save the caption directly
  const cursorTip = document.getElementById("cursorTip");
  const cursorTipText = document.getElementById("cursorTipText");
  if (cursorTip && cursorTipText) {
    let activeTarget = null;

    const isInTip = (el) => el && cursorTip.contains(el);

    document.addEventListener("mousemove", (e) => {
      if (cursorTip.classList.contains("expanded")) return;
      cursorTip.style.left = e.clientX + "px";
      cursorTip.style.top = e.clientY + "px";
    });

    document.addEventListener("mouseover", (e) => {
      if (cursorTip.classList.contains("expanded")) return;
      const photo = e.target.closest(".feed-img");
      if (photo) {
        cursorTipText.textContent = photo.dataset.caption || "";
        cursorTip.classList.add("visible");
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (cursorTip.classList.contains("expanded")) return;
      const leavingPhoto = e.target.closest(".feed-img");
      const enteringPhoto =
        e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".feed-img");
      if (leavingPhoto && !enteringPhoto) {
        cursorTip.classList.remove("visible");
      }
    });

    document.addEventListener("click", (e) => {
      const photo = e.target.closest(".feed-img");
      if (photo) {
        activeTarget = photo;
        cursorTip.style.left = e.clientX + "px";
        cursorTip.style.top = e.clientY + "px";
        cursorTip.classList.add("visible", "expanded");
        cursorTipText.textContent = photo.dataset.caption || "";
        requestAnimationFrame(() => {
          cursorTipText.focus();
          const range = document.createRange();
          range.selectNodeContents(cursorTipText);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
        return;
      }
      if (cursorTip.classList.contains("expanded") && !isInTip(e.target)) {
        cursorTipText.blur();
      }
    });

    cursorTipText.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cursorTipText.blur();
    });

    cursorTipText.addEventListener("blur", () => {
      cursorTip.classList.remove("expanded", "visible");
      if (!activeTarget) return;
      const newCaption = cursorTipText.textContent.trim();
      const projectId = activeTarget.dataset.projectId;
      const imageIndex = Number(activeTarget.dataset.imageIndex);
      const isSummary = !!activeTarget.dataset.isSummary;
      activeTarget.dataset.caption = newCaption;
      activeTarget.setAttribute("alt", newCaption);
      const captionEl = activeTarget.closest(".feed-item")?.querySelector(".cap-text");
      if (captionEl) captionEl.textContent = newCaption;
      if (isSummary) PROJECTS.find((p) => p.id === projectId).summary = newCaption;
      fetch("/api/update-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, imageIndex, isSummary, caption: newCaption }),
      }).catch(() => {});
      activeTarget = null;
    });
  }

  // circular scroll-position indicator (replaces default scrollbar thumb)
  const scrollDot = document.getElementById("scrollDot");
  if (scrollDot) {
    const trackTop = 24;
    const trackBottom = 24;
    const updateScrollDot = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      const trackHeight = window.innerHeight - trackTop - trackBottom;
      scrollDot.style.top = trackTop + ratio * trackHeight + "px";
      scrollDot.style.display = scrollable > 0 ? "block" : "none";
    };
    window.addEventListener("scroll", updateScrollDot, { passive: true });
    window.addEventListener("resize", updateScrollDot);
    updateScrollDot();
  }
})();
