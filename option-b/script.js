function pad2(n) {
  return String(n).padStart(2, "0");
}

function renderHome() {
  document.getElementById("homeStudio").textContent = STUDIO.name;
  document.getElementById("homeRole").textContent = STUDIO.role;
  document.getElementById("homeAbout").textContent = STUDIO.about;

  const grid = document.getElementById("projGrid");
  grid.innerHTML = "";
  PROJECTS.forEach((p, i) => {
    const a = document.createElement("a");
    a.className = "projCard";
    a.href = p.id + ".html";
    a.innerHTML = `
      <div class="box"><img src="${p.images[0].src}" alt="${p.name}"></div>
      <div class="info">
        <span class="nm">${pad2(i + 1)} — ${p.name}</span>
        <span class="sub">${p.type}<br>${p.year}</span>
      </div>
    `;
    grid.appendChild(a);
  });

  document.getElementById("homeYear").textContent = new Date().getFullYear();
}

function renderProject(projectId) {
  const idx = PROJECTS.findIndex((p) => p.id === projectId);
  const project = PROJECTS[idx];
  if (!project) return;

  document.getElementById("projNo").textContent = "NO. " + pad2(idx + 1);
  document.getElementById("projTitle").textContent = project.name;
  document.getElementById("projTypeMeta").textContent = project.type;
  document.getElementById("projYearMeta").textContent = project.year;
  document.getElementById("projLocMeta").textContent = project.location;
  document.getElementById("projIntro").textContent = project.description;

  const table = document.getElementById("frameTable");
  table.innerHTML = "";
  project.images.forEach((img, i) => {
    const row = document.createElement("div");
    row.className = "frameRow";
    row.innerHTML = `
      <div class="cut">
        <span class="num">${pad2(i + 1)}</span>
        <span>CUT</span>
      </div>
      <div class="frame">
        <div class="box"><img src="${img.src}" alt="${img.caption}"></div>
      </div>
      <div class="content">
        <p class="cap">${img.caption}</p>
        <p>${i === 0 ? project.summary : ""}</p>
      </div>
    `;
    table.appendChild(row);
  });

  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  document.getElementById("prevLink").href = prev.id + ".html";
  document.getElementById("prevLink").textContent = "← " + prev.name;
  document.getElementById("nextLink").href = next.id + ".html";
  document.getElementById("nextLink").textContent = next.name + " →";
}
