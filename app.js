const majorContent = {
  engineering: {
    eyebrow: "工程与技术",
    title: "把国家需求，转化为工程问题",
    body: "面向高端装备、绿色能源、智能制造与重大基础设施，把“真问题”带进课堂、实验室和工程现场；既追求技术突破，也守住安全、伦理与可持续的底线。",
    tags: ["关键核心技术", "产学研协同", "工程伦理", "成果转化"]
  },
  science: {
    eyebrow: "基础学科",
    title: "在无人区里，坐得住冷板凳",
    body: "从好奇心出发，以长期主义夯实数理化与交叉科学基础；既关注原创问题，也主动思考基础发现如何支撑未来产业与国家战略能力。",
    tags: ["原创问题", "基础研究", "交叉创新", "长期主义"]
  },
  humanities: {
    eyebrow: "人文与社会科学",
    title: "让技术进步，始终指向人的发展",
    body: "研究中国式现代化中的真实社会问题，讲好中国故事，回应技术变革带来的治理、伦理与文化议题，为公共决策和社会共识提供有温度的知识。",
    tags: ["中国叙事", "科技伦理", "社会治理", "文化传承"]
  },
  management: {
    eyebrow: "管理与经管",
    title: "让创新链，真正连接产业链",
    body: "围绕科技成果转化、组织创新与高质量发展，提升把复杂系统看清、把多方资源组织起来的能力，让科研价值更有效地抵达经济社会一线。",
    tags: ["创新管理", "成果转化", "产业升级", "公共价值"]
  }
};

const progressBar = document.querySelector(".progress-bar");
const dots = [...document.querySelectorAll(".section-dots a")];
const sections = [...document.querySelectorAll("main > section[id]")];

sections.forEach((section) => {
  const page = section.dataset.page;
  if (!page) return;
  const marker = document.createElement("span");
  marker.className = "page-number";
  marker.textContent = page;
  marker.setAttribute("aria-label", `第 ${page.replace("/", " 共 ")} 页`);
  section.prepend(marker);
});

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? window.scrollY / max : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, percent * 100))}%`;

  let activeId = sections[0]?.id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.46) activeId = section.id;
  }
  dots.forEach((dot) => {
    const active = dot.getAttribute("href") === `#${activeId}`;
    dot.classList.toggle("active", active);
    if (active) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
} else {
  document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".coordinate").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
  });
});

const majorTabs = [...document.querySelectorAll(".major-tab")];
const majorPanel = document.querySelector(".major-panel");
let selectedMajor = "engineering";

function renderMajor(key) {
  selectedMajor = key;
  const content = majorContent[key];
  majorPanel.innerHTML = `
    <small>${content.eyebrow}</small>
    <h3>${content.title}</h3>
    <p>${content.body}</p>
    <div class="action-tags">${content.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
  `;
  majorTabs.forEach((tab) => {
    const active = tab.dataset.major === key;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active) majorPanel.setAttribute("aria-labelledby", tab.id);
  });
}

majorTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => renderMajor(tab.dataset.major));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
    const next = (index + direction + majorTabs.length) % majorTabs.length;
    majorTabs[next].focus();
    renderMajor(majorTabs[next].dataset.major);
  });
});

renderMajor(selectedMajor);

const actionChecks = [...document.querySelectorAll(".check-item input")];
const actionRing = document.querySelector(".action-ring");
const actionPercent = document.querySelector("#action-percent");
const storageKey = "tju130-action-checklist-v1";

function readSavedActions() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function updateActions(shouldSave = true) {
  const checked = actionChecks.filter((item) => item.checked);
  const percent = Math.round((checked.length / actionChecks.length) * 100);
  actionPercent.textContent = `${percent}%`;
  actionRing.style.setProperty("--progress", `${percent * 3.6}deg`);
  if (shouldSave) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked.map((item) => item.value)));
    } catch { /* local state is optional */ }
  }
}

const savedActions = readSavedActions();
actionChecks.forEach((item) => {
  item.checked = savedActions.includes(item.value);
  item.addEventListener("change", () => updateActions(true));
});
updateActions(false);

const declarationDialog = document.querySelector("#declaration-dialog");
const declarationText = document.querySelector("#declaration-text");
const openDeclaration = document.querySelector("#make-declaration");
const closeDeclaration = document.querySelector("#close-declaration");
const copyDeclaration = document.querySelector("#copy-declaration");

function buildDeclaration() {
  const chosen = majorContent[selectedMajor];
  const completed = actionChecks.filter((item) => item.checked).map((item) => item.value);
  const actionLine = completed.length
    ? `我已为自己选定 ${completed.length} 项行动：${completed.join("、")}。`
    : "我将从认真研读回信原文、发现一个真实问题开始。";
  return `我的青年行动宣言\n\n立足${chosen.eyebrow}，我愿把个人成长放进强国建设的坐标系，以“${chosen.tags[0]}”为切口，在学习、科研与实践中求真务实、向新而行。${actionLine}`;
}

function closeDeclarationDialog() {
  if (typeof declarationDialog.close === "function") declarationDialog.close();
  else declarationDialog.removeAttribute("open");
}

openDeclaration.addEventListener("click", () => {
  declarationText.textContent = buildDeclaration();
  if (typeof declarationDialog.showModal === "function") declarationDialog.showModal();
  else {
    declarationDialog.setAttribute("open", "");
    declarationDialog.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

closeDeclaration.addEventListener("click", closeDeclarationDialog);

declarationDialog.addEventListener("click", (event) => {
  if (event.target === declarationDialog) closeDeclarationDialog();
});

copyDeclaration.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(declarationText.textContent);
    copyDeclaration.textContent = "已复制";
    setTimeout(() => { copyDeclaration.textContent = "复制宣言"; }, 1500);
  } catch {
    copyDeclaration.textContent = "请长按文字复制";
  }
});

