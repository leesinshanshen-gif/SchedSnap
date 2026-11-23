/* ==========================================================================
   SchedSnap v3 — Personalized Visual Schedule Builder & Mobile Studio
   100% Client-Side OCR (Tesseract.js) + Full Live Customization Studio
   ========================================================================== */

const DAYS_ALL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
};
const JS_DAY_TO_KEY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Preset Color Palettes
const COLOR_PALETTES = {
  pastel: {
    label: "Pastel",
    colors: ["#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#fb923c", "#f87171", "#2dd4bf"]
  },
  minimalist: {
    label: "Minimalist",
    colors: ["#1e293b", "#334155", "#475569", "#0f766e", "#3730a3", "#4b5563", "#52525b", "#0369a1"]
  },
  dark: {
    label: "Dark",
    colors: ["#6366f1", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#f43f5e"]
  },
  vibrant: {
    label: "Vibrant",
    colors: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]
  },
  aesthetic: {
    label: "Aesthetic",
    colors: ["#818cf8", "#c084fc", "#f472b6", "#fb7185", "#38bdf8", "#4ade80", "#facc15", "#a3e635"]
  }
};

// Default Design Configuration
const DEFAULT_DESIGN = {
  templateId: "modern-academic",
  bgColor: "#ffffff",
  surfaceColor: "#f8fafc",
  textColor: "#0f172a",
  borderColor: "#e2e8f0",
  accentColor: "#4f46e5",
  useGradient: false,
  gradStart: "#eef2ff",
  gradEnd: "#fdf2f8",
  gradAngle: 135,
  headerBg: "#ffffff",
  headerText: "#0f172a",
  fontFamily: "'Inter', sans-serif",
  fontWeight: "600",
  textAlign: "left",
  codeSize: 13,
  titleSize: 11,
  roomSize: 11,
  timeSize: 11,
  layout: "grid",
  timeFormat: "12",
  hourHeight: 64,
  blockGap: 4,
  borderRadius: 10,
  borderWidth: 1,
  showWeekends: true,
  showFreeTime: true,
  logoDataUrl: ""
};

// 8 Ready-Made Design Templates
const DESIGN_TEMPLATES = [
  {
    id: "soft-pastel",
    name: "Soft Pastel Aesthetic",
    desc: "Warm blush & lavender",
    palette: COLOR_PALETTES.pastel.colors,
    settings: {
      bgColor: "#fffaf7", surfaceColor: "#fff1f2", textColor: "#3f2e3e",
      borderColor: "#f3d5dc", accentColor: "#db2777",
      useGradient: true, gradStart: "#fff1f2", gradEnd: "#f5f3ff", gradAngle: 135,
      headerBg: "#ffffff", headerText: "#3f2e3e",
      fontFamily: "'Nunito', sans-serif", borderRadius: 14, borderWidth: 1
    }
  },
  {
    id: "clean-minimalist",
    name: "Clean Minimalist",
    desc: "Crisp monochrome lines",
    palette: COLOR_PALETTES.minimalist.colors,
    settings: {
      bgColor: "#ffffff", surfaceColor: "#fafafa", textColor: "#18181b",
      borderColor: "#e4e4e7", accentColor: "#18181b",
      useGradient: false, headerBg: "#ffffff", headerText: "#18181b",
      fontFamily: "'Inter', sans-serif", borderRadius: 6, borderWidth: 1
    }
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    desc: "Sleek midnight studio",
    palette: COLOR_PALETTES.dark.colors,
    settings: {
      bgColor: "#0f172a", surfaceColor: "#1e293b", textColor: "#f8fafc",
      borderColor: "#334155", accentColor: "#818cf8",
      useGradient: false, headerBg: "#1e293b", headerText: "#f8fafc",
      fontFamily: "'Space Grotesk', sans-serif", borderRadius: 10, borderWidth: 1
    }
  },
  {
    id: "modern-academic",
    name: "Modern Academic",
    desc: "Polished indigo SaaS",
    palette: ["#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#e11d48", "#0d9488"],
    settings: {
      bgColor: "#ffffff", surfaceColor: "#f8fafc", textColor: "#0f172a",
      borderColor: "#e2e8f0", accentColor: "#4f46e5",
      useGradient: false, headerBg: "#ffffff", headerText: "#0f172a",
      fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: 10, borderWidth: 1
    }
  },
  {
    id: "colorful-student",
    name: "Colorful Student",
    desc: "Bright energetic blocks",
    palette: COLOR_PALETTES.vibrant.colors,
    settings: {
      bgColor: "#fefce8", surfaceColor: "#ffffff", textColor: "#1e293b",
      borderColor: "#fde047", accentColor: "#ea580c",
      useGradient: true, gradStart: "#fef9c3", gradEnd: "#e0f2fe", gradAngle: 120,
      headerBg: "#ffffff", headerText: "#1e293b",
      fontFamily: "'Poppins', sans-serif", borderRadius: 14, borderWidth: 1
    }
  },
  {
    id: "pink-purple",
    name: "Pink & Purple Aesthetic",
    desc: "Dreamy violet gradient",
    palette: ["#ec4899", "#a855f7", "#d946ef", "#8b5cf6", "#f43f5e", "#6366f1", "#c026d3", "#db2777"],
    settings: {
      bgColor: "#fdf4ff", surfaceColor: "#faf5ff", textColor: "#3b0764",
      borderColor: "#e9d5ff", accentColor: "#a855f7",
      useGradient: true, gradStart: "#fce7f3", gradEnd: "#ede9fe", gradAngle: 135,
      headerBg: "#ffffff", headerText: "#3b0764",
      fontFamily: "'Poppins', sans-serif", borderRadius: 16, borderWidth: 1
    }
  },
  {
    id: "blue-professional",
    name: "Blue Professional",
    desc: "Executive navy & sky",
    palette: ["#1d4ed8", "#0284c7", "#0369a1", "#2563eb", "#0f766e", "#3730a3", "#1e40af", "#0891b2"],
    settings: {
      bgColor: "#f0f9ff", surfaceColor: "#ffffff", textColor: "#0c4a6e",
      borderColor: "#bae6fd", accentColor: "#0284c7",
      useGradient: false, headerBg: "#0c4a6e", headerText: "#ffffff",
      fontFamily: "'Inter', sans-serif", borderRadius: 8, borderWidth: 1
    }
  },
  {
    id: "green-nature",
    name: "Green Nature Theme",
    desc: "Calm sage & forest",
    palette: ["#059669", "#16a34a", "#0d9488", "#65a30d", "#15803d", "#047857", "#0f766e", "#4d7c0f"],
    settings: {
      bgColor: "#f0fdf4", surfaceColor: "#ffffff", textColor: "#14532d",
      borderColor: "#bbf7d0", accentColor: "#15803d",
      useGradient: true, gradStart: "#ecfdf5", gradEnd: "#f0fdf4", gradAngle: 150,
      headerBg: "#14532d", headerText: "#ffffff",
      fontFamily: "'Playfair Display', serif", borderRadius: 12, borderWidth: 1
    }
  }
];

// Application State
let currentRotation = 0;
let uploadedImageEl = null;
let uploadedFileMeta = { name: "", size: 0 };
let draftSchedule = null;
let scheduleData = null;
let design = { ...DEFAULT_DESIGN };
let savedDesigns = [];

// Undo / Redo History (tracks design + subject colors)
let historyStack = [];
let historyIndex = -1;

// View & Filter State
let currentPage = "upload"; // "upload" | "review" | "dashboard"
let isCustomizeOpen = false;
let activeDayFilter = "ALL";
let selectedSingleDay = JS_DAY_TO_KEY[new Date().getDay()] || "Mon";
let searchQuery = "";
let confirmCallback = null;

// DOM References
const brandLogo = document.getElementById("brandLogo");
const navUploadBtn = document.getElementById("navUploadBtn");
const navEditBtn = document.getElementById("navEditBtn");
const navCustomizeBtn = document.getElementById("navCustomizeBtn");
const navPreviewBtn = document.getElementById("navPreviewBtn");
const navBoardBtn = document.getElementById("navBoardBtn");
const navExportBtn = document.getElementById("navExportBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

const mobHomeBtn = document.getElementById("mobHomeBtn");
const mobScheduleBtn = document.getElementById("mobScheduleBtn");
const mobCustomizeBtn = document.getElementById("mobCustomizeBtn");
const mobBoardBtn = document.getElementById("mobBoardBtn");
const mobExportBtn = document.getElementById("mobExportBtn");

const uploadView = document.getElementById("uploadView");
const reviewView = document.getElementById("reviewView");
const workspaceView = document.getElementById("workspaceView");
const designBoardView = document.getElementById("designBoardView");
const dashboardWidgets = document.getElementById("dashboardWidgets");
const studioLayout = document.getElementById("studioLayout");
const customizePanel = document.getElementById("customizePanel");
const closeCustomizeBtn = document.getElementById("closeCustomizeBtn");
const mobilePreviewToggleBtn = document.getElementById("mobilePreviewToggleBtn");
const toggleCustomizeBtn = document.getElementById("toggleCustomizeBtn");
const openDesignBoardBtn = document.getElementById("openDesignBoardBtn");

// Upload DOM
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const cameraInput = document.getElementById("cameraInput");
const replaceFileInput = document.getElementById("replaceFileInput");
const sampleBtn = document.getElementById("sampleBtn");
const manualStartBtn = document.getElementById("manualStartBtn");
const previewPanel = document.getElementById("previewPanel");
const previewImg = document.getElementById("previewImg");
const previewFileName = document.getElementById("previewFileName");
const previewFileMeta = document.getElementById("previewFileMeta");
const rotateLeftBtn = document.getElementById("rotateLeftBtn");
const rotateRightBtn = document.getElementById("rotateRightBtn");
const removeImgBtn = document.getElementById("removeImgBtn");
const scanBtn = document.getElementById("scanBtn");
const loadingPanel = document.getElementById("loadingPanel");
const loadingTitle = document.getElementById("loadingTitle");
const loadingSubtitle = document.getElementById("loadingSubtitle");
const scanErrorPanel = document.getElementById("scanErrorPanel");
const scanErrorMessage = document.getElementById("scanErrorMessage");
const retryScanBtn = document.getElementById("retryScanBtn");
const savedBanner = document.getElementById("savedBanner");
const openSavedBtn = document.getElementById("openSavedBtn");
const openSavedCustomizeBtn = document.getElementById("openSavedCustomizeBtn");
const homeTemplatesGrid = document.getElementById("homeTemplatesGrid");

// Review DOM
const reviewBackBtn = document.getElementById("reviewBackBtn");
const confirmScheduleBtn = document.getElementById("confirmScheduleBtn");
const confirmToCustomizeBtn = document.getElementById("confirmToCustomizeBtn");
const reviewSummaryBanner = document.getElementById("reviewSummaryBanner");
const reviewSummaryTitle = document.getElementById("reviewSummaryTitle");
const reviewSummaryText = document.getElementById("reviewSummaryText");
const revInstitution = document.getElementById("revInstitution");
const revTitle = document.getElementById("revTitle");
const revStudent = document.getElementById("revStudent");
const revSection = document.getElementById("revSection");
const revSemester = document.getElementById("revSemester");
const reviewCount = document.getElementById("reviewCount");
const reviewAddRowBtn = document.getElementById("reviewAddRowBtn");
const reviewRowsContainer = document.getElementById("reviewRowsContainer");

// Dashboard Status & Stats DOM
const currentStatusBadge = document.getElementById("currentStatusBadge");
const currentStatusLabel = document.getElementById("currentStatusLabel");
const liveClock = document.getElementById("liveClock");
const currentClassBody = document.getElementById("currentClassBody");
const upcomingCountdown = document.getElementById("upcomingCountdown");
const upcomingClassBody = document.getElementById("upcomingClassBody");
const statSubjects = document.getElementById("statSubjects");
const statSessions = document.getElementById("statSessions");
const statHours = document.getElementById("statHours");
const statBusiest = document.getElementById("statBusiest");
const statBusiestSub = document.getElementById("statBusiestSub");
const statFreeDays = document.getElementById("statFreeDays");
const statFreeDaysSub = document.getElementById("statFreeDaysSub");
const conflictBanner = document.getElementById("conflictBanner");
const conflictTitle = document.getElementById("conflictTitle");
const conflictList = document.getElementById("conflictList");

// Customize Panel DOM
const templateCardsStrip = document.getElementById("templateCardsStrip");
const paletteButtons = document.getElementById("paletteButtons");
const custBgColor = document.getElementById("custBgColor");
const custSurfaceColor = document.getElementById("custSurfaceColor");
const custTextColor = document.getElementById("custTextColor");
const custBorderColor = document.getElementById("custBorderColor");
const custAccentColor = document.getElementById("custAccentColor");
const custUseGradient = document.getElementById("custUseGradient");
const gradientControls = document.getElementById("gradientControls");
const custGradStart = document.getElementById("custGradStart");
const custGradEnd = document.getElementById("custGradEnd");
const custGradAngle = document.getElementById("custGradAngle");
const valGradAngle = document.getElementById("valGradAngle");
const autoAssignColorsBtn = document.getElementById("autoAssignColorsBtn");
const subjectColorsList = document.getElementById("subjectColorsList");

const custFontFamily = document.getElementById("custFontFamily");
const custFontWeight = document.getElementById("custFontWeight");
const custAlignGroup = document.getElementById("custAlignGroup");
const custCodeSize = document.getElementById("custCodeSize");
const custTitleSize = document.getElementById("custTitleSize");
const custRoomSize = document.getElementById("custRoomSize");
const custTimeSize = document.getElementById("custTimeSize");
const valCodeSize = document.getElementById("valCodeSize");
const valTitleSize = document.getElementById("valTitleSize");
const valRoomSize = document.getElementById("valRoomSize");
const valTimeSize = document.getElementById("valTimeSize");

const custLayoutGroup = document.getElementById("custLayoutGroup");
const custTimeFmtGroup = document.getElementById("custTimeFmtGroup");
const custHourHeight = document.getElementById("custHourHeight");
const custBlockGap = document.getElementById("custBlockGap");
const custBorderRadius = document.getElementById("custBorderRadius");
const custBorderWidth = document.getElementById("custBorderWidth");
const valHourHeight = document.getElementById("valHourHeight");
const valBlockGap = document.getElementById("valBlockGap");
const valBorderRadius = document.getElementById("valBorderRadius");
const valBorderWidth = document.getElementById("valBorderWidth");
const custShowWeekends = document.getElementById("custShowWeekends");
const custShowFreeTime = document.getElementById("custShowFreeTime");

const custInstName = document.getElementById("custInstName");
const custSchedTitle = document.getElementById("custSchedTitle");
const custStudentName = document.getElementById("custStudentName");
const custCourseSection = document.getElementById("custCourseSection");
const custSemester = document.getElementById("custSemester");
const custHeaderBg = document.getElementById("custHeaderBg");
const custHeaderText = document.getElementById("custHeaderText");
const logoUploadInput = document.getElementById("logoUploadInput");
const removeLogoBtn = document.getElementById("removeLogoBtn");

const saveDesignNameInput = document.getElementById("saveDesignNameInput");
const saveDesignBtn = document.getElementById("saveDesignBtn");
const savedDesignsList = document.getElementById("savedDesignsList");
const resetDesignBtn = document.getElementById("resetDesignBtn");

// Toolbar & Preview Canvas DOM
const searchInput = document.getElementById("searchInput");
const addClassBtn = document.getElementById("addClassBtn");
const dayFilterPills = document.getElementById("dayFilterPills");
const quickToggleWeekendsBtn = document.getElementById("quickToggleWeekendsBtn");
const printPreviewBtn = document.getElementById("printPreviewBtn");

const captureArea = document.getElementById("captureArea");
const headerLogoImg = document.getElementById("headerLogoImg");
const headerInstitution = document.getElementById("headerInstitution");
const headerTitle = document.getElementById("headerTitle");
const headerStudent = document.getElementById("headerStudent");
const headerSubMeta = document.getElementById("headerSubMeta");
const singleDayBar = document.getElementById("singleDayBar");
const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");
const singleDayTabs = document.getElementById("singleDayTabs");
const gridView = document.getElementById("gridView");
const cardsView = document.getElementById("cardsView");
const singleDayView = document.getElementById("singleDayView");

// Modals DOM
const classModal = document.getElementById("classModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalX = document.getElementById("closeModalX");
const classForm = document.getElementById("classForm");
const editIndex = document.getElementById("editIndex");
const cCode = document.getElementById("cCode");
const cTitle = document.getElementById("cTitle");
const cRoom = document.getElementById("cRoom");
const cStart = document.getElementById("cStart");
const cEnd = document.getElementById("cEnd");
const cColor = document.getElementById("cColor");
const cColorCustom = document.getElementById("cColorCustom");
const colorSwatches = document.getElementById("colorSwatches");
const modalValidationMsg = document.getElementById("modalValidationMsg");
const modalOverlapWarn = document.getElementById("modalOverlapWarn");
const deleteClassBtn = document.getElementById("deleteClassBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const exportModal = document.getElementById("exportModal");
const closeExportX = document.getElementById("closeExportX");
const exportQuality = document.getElementById("exportQuality");
const exportPngBtn = document.getElementById("exportPngBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportPrintBtn = document.getElementById("exportPrintBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const toastContainer = document.getElementById("toastContainer");

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
function init() {
  // Load saved design
  try {
    const rawDesign = localStorage.getItem("schedsnap_design");
    if (rawDesign) design = { ...DEFAULT_DESIGN, ...JSON.parse(rawDesign) };
  } catch { design = { ...DEFAULT_DESIGN }; }

  // Load saved design presets
  try {
    const rawSaved = localStorage.getItem("schedsnap_saved_designs");
    if (rawSaved) savedDesigns = JSON.parse(rawSaved);
  } catch { savedDesigns = []; }

  // Default to Single-Day view on small phones if user hasn't picked a layout yet
  if (window.innerWidth < 640 && !localStorage.getItem("schedsnap_design")) {
    design.layout = "day";
  }

  buildTemplateCards();
  buildPaletteButtons();
  buildClassModalSwatches();
  renderSavedDesignsList();

  // Load saved schedule
  const saved = localStorage.getItem("schedsnap_data");
  if (saved) {
    try {
      scheduleData = normalizeSchedule(JSON.parse(saved));
      savedBanner.classList.remove("hidden");
      syncCustomizeControls();
      pushHistory();
      openWorkspace(false);
    } catch {
      localStorage.removeItem("schedsnap_data");
      navigateTo("upload");
    }
  } else {
    syncCustomizeControls();
    navigateTo("upload");
  }

  updateLiveStatus();
  setInterval(updateLiveStatus, 30000);
}

/* ==========================================================================
   NAVIGATION & MOBILE BOTTOM NAV
   ========================================================================== */
function navigateTo(target) {
  uploadView.classList.add("hidden");
  reviewView.classList.add("hidden");
  workspaceView.classList.add("hidden");
  if (designBoardView) designBoardView.classList.add("hidden");

  if (target === "upload") {
    currentPage = "upload";
    isCustomizeOpen = false;
    uploadView.classList.remove("hidden");
    savedBanner.classList.toggle("hidden", !scheduleData);
  } else if (target === "review") {
    if (!scheduleData && !draftSchedule) {
      loadSampleSchedule(false);
    }
    currentPage = "review";
    isCustomizeOpen = false;
    openReviewStep(draftSchedule || scheduleData);
  } else if (target === "customize") {
    if (!scheduleData) loadSampleSchedule(false);
    openWorkspace(true);
  } else if (target === "board") {
    currentPage = "board";
    isCustomizeOpen = false;
    if (designBoardView) designBoardView.classList.remove("hidden");
    if (window.DesignBoard && typeof window.DesignBoard.onOpen === "function") {
      window.DesignBoard.onOpen();
    }
  } else if (target === "dashboard") {
    if (!scheduleData) {
      showToast("Upload a schedule or try the sample schedule first.", "info");
      navigateTo("upload");
      return;
    }
    openWorkspace(false);
  }

  updateNavActiveState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openWorkspace(openCust) {
  currentPage = "dashboard";
  isCustomizeOpen = Boolean(openCust);
  uploadView.classList.add("hidden");
  reviewView.classList.add("hidden");
  if (designBoardView) designBoardView.classList.add("hidden");
  workspaceView.classList.remove("hidden");

  customizePanel.classList.toggle("hidden", !isCustomizeOpen);
  studioLayout.classList.toggle("customize-open", isCustomizeOpen);
  dashboardWidgets.classList.toggle("hidden", isCustomizeOpen && window.innerWidth >= 960);

  syncCustomizeControls();
  applyDesignToCanvas();
  renderDashboard();
  updateNavActiveState();
}

function updateNavActiveState() {
  const activeKey = isCustomizeOpen && currentPage === "dashboard" ? "customize" : currentPage;
  document.querySelectorAll(".nav-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.nav === activeKey);
  });
  document.querySelectorAll(".mob-nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.mobNav === activeKey);
  });
}

// Desktop & Mobile nav listeners
brandLogo.addEventListener("click", () => navigateTo("upload"));
navUploadBtn.addEventListener("click", () => navigateTo("upload"));
navEditBtn.addEventListener("click", () => navigateTo("review"));
navCustomizeBtn.addEventListener("click", () => navigateTo("customize"));
navPreviewBtn.addEventListener("click", () => navigateTo("dashboard"));
navExportBtn.addEventListener("click", () => openExportModal());

mobHomeBtn.addEventListener("click", () => navigateTo("upload"));
mobScheduleBtn.addEventListener("click", () => navigateTo("dashboard"));
mobCustomizeBtn.addEventListener("click", () => navigateTo("customize"));
mobExportBtn.addEventListener("click", () => openExportModal());

toggleCustomizeBtn.addEventListener("click", () => openWorkspace(!isCustomizeOpen));
closeCustomizeBtn.addEventListener("click", () => openWorkspace(false));
mobilePreviewToggleBtn.addEventListener("click", () => openWorkspace(false));
openSavedBtn.addEventListener("click", () => openWorkspace(false));
openSavedCustomizeBtn.addEventListener("click", () => openWorkspace(true));

/* ==========================================================================
   UNDO / REDO HISTORY
   ========================================================================== */
function getSnapshot() {
  return JSON.stringify({
    design,
    classColors: scheduleData ? scheduleData.classes.map((c) => c.color) : []
  });
}

function pushHistory() {
  const snap = getSnapshot();
  if (historyIndex >= 0 && historyStack[historyIndex] === snap) return;
  historyStack = historyStack.slice(0, historyIndex + 1);
  historyStack.push(snap);
  if (historyStack.length > 40) historyStack.shift();
  historyIndex = historyStack.length - 1;
  updateHistoryButtons();
}

function applyHistorySnapshot(snapStr) {
  const parsed = JSON.parse(snapStr);
  design = { ...DEFAULT_DESIGN, ...parsed.design };
  if (scheduleData && Array.isArray(parsed.classColors)) {
    scheduleData.classes.forEach((c, i) => {
      if (parsed.classColors[i]) c.color = parsed.classColors[i];
    });
    saveSchedule();
  }
  saveDesign();
  syncCustomizeControls();
  applyDesignToCanvas();
  renderDashboard();
  updateHistoryButtons();
}

function updateHistoryButtons() {
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= historyStack.length - 1;
}

undoBtn.addEventListener("click", () => {
  if (historyIndex > 0) {
    historyIndex--;
    applyHistorySnapshot(historyStack[historyIndex]);
    showToast("Undid design change.", "info");
  }
});

redoBtn.addEventListener("click", () => {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    applyHistorySnapshot(historyStack[historyIndex]);
    showToast("Redid design change.", "info");
  }
});

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
    if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      undoBtn.click();
    }
  } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
    if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      redoBtn.click();
    }
  } else if (e.key === "Escape") {
    classModal.classList.add("hidden");
    exportModal.classList.add("hidden");
    confirmModal.classList.add("hidden");
  }
});

/* ==========================================================================
   TOASTS & CONFIRM DIALOG
   ========================================================================== */
function showToast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.25s";
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

function openConfirm(title, message, onConfirm) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmCallback = onConfirm;
  confirmModal.classList.remove("hidden");
}
confirmCancelBtn.addEventListener("click", () => { confirmModal.classList.add("hidden"); confirmCallback = null; });
confirmOkBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
  if (typeof confirmCallback === "function") confirmCallback();
  confirmCallback = null;
});

/* ==========================================================================
   TEMPLATES, PALETTES, & CUSTOMIZE STUDIO CONTROLS
   ========================================================================== */
function createTemplateCardEl(tpl, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `template-card ${design.templateId === tpl.id ? "active" : ""}`;
  btn.dataset.tplId = tpl.id;
  const bgStyle = tpl.settings.useGradient
    ? `background: linear-gradient(${tpl.settings.gradAngle || 135}deg, ${tpl.settings.gradStart}, ${tpl.settings.gradEnd})`
    : `background: ${tpl.settings.bgColor}`;

  btn.innerHTML = `
    <div class="tpl-preview-box" style="${bgStyle}">
      <div class="tpl-preview-bar" style="background:${tpl.settings.accentColor}"></div>
      <div class="tpl-preview-blocks">
        <span style="background:${tpl.palette[0]}"></span>
        <span style="background:${tpl.palette[1]}"></span>
        <span style="background:${tpl.palette[2]}"></span>
      </div>
    </div>
    <span class="tpl-name">${escapeHtml(tpl.name)}</span>
    <span class="tpl-desc">${escapeHtml(tpl.desc)}</span>
  `;
  btn.addEventListener("click", () => onClick(tpl));
  return btn;
}

function buildTemplateCards() {
  templateCardsStrip.innerHTML = "";
  homeTemplatesGrid.innerHTML = "";

  DESIGN_TEMPLATES.forEach((tpl) => {
    templateCardsStrip.appendChild(createTemplateCardEl(tpl, (t) => applyTemplate(t, true)));
    homeTemplatesGrid.appendChild(createTemplateCardEl(tpl, (t) => {
      if (!scheduleData) loadSampleSchedule(false);
      applyTemplate(t, true);
      openWorkspace(true);
    }));
  });
}

function applyTemplate(tpl, recordHistory = true) {
  design = { ...design, ...tpl.settings, templateId: tpl.id };
  if (scheduleData) {
    assignPaletteToSubjects(tpl.palette);
  }
  saveDesign();
  syncCustomizeControls();
  applyDesignToCanvas();
  renderDashboard();
  if (recordHistory) pushHistory();
  showToast(`Applied "${tpl.name}" template.`, "success");
}

function assignPaletteToSubjects(paletteColors) {
  if (!scheduleData) return;
  const codeMap = {};
  let idx = 0;
  scheduleData.classes.forEach((cls) => {
    const key = (cls.code || `ITEM_${idx}`).toUpperCase();
    if (!codeMap[key]) {
      codeMap[key] = paletteColors[idx % paletteColors.length];
      idx++;
    }
    cls.color = codeMap[key];
  });
  saveSchedule();
}

function buildPaletteButtons() {
  paletteButtons.innerHTML = "";
  Object.entries(COLOR_PALETTES).forEach(([key, pal]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "palette-chip";
    btn.innerHTML = `
      <span class="palette-dots">
        <i style="background:${pal.colors[0]}"></i>
        <i style="background:${pal.colors[1]}"></i>
        <i style="background:${pal.colors[2]}"></i>
      </span>
      <span>${pal.label}</span>
    `;
    btn.addEventListener("click", () => {
      assignPaletteToSubjects(pal.colors);
      renderSubjectColorsList();
      renderDashboard();
      pushHistory();
      showToast(`Applied ${pal.label} color palette.`, "success");
    });
    paletteButtons.appendChild(btn);
  });
}

function renderSubjectColorsList() {
  subjectColorsList.innerHTML = "";
  if (!scheduleData || !scheduleData.classes.length) {
    subjectColorsList.innerHTML = `<p class="muted" style="font-size:0.78rem;">Add classes to customize subject colors.</p>`;
    return;
  }

  const seen = new Map();
  scheduleData.classes.forEach((cls) => {
    const key = (cls.code || "Untitled").trim();
    if (!seen.has(key.toUpperCase())) {
      seen.set(key.toUpperCase(), { label: key, color: cls.color || "#4f46e5" });
    }
  });

  seen.forEach((info, keyUpper) => {
    const row = document.createElement("div");
    row.className = "subj-color-row";
    row.innerHTML = `
      <span><strong>${escapeHtml(info.label)}</strong></span>
      <input type="color" value="${info.color}" aria-label="Color for ${escapeHtml(info.label)}" />
    `;
    const input = row.querySelector("input");
    input.addEventListener("input", (e) => {
      const hex = e.target.value;
      scheduleData.classes.forEach((c) => {
        if ((c.code || "Untitled").trim().toUpperCase() === keyUpper) c.color = hex;
      });
      saveSchedule();
      renderDashboard();
    });
    input.addEventListener("change", () => pushHistory());
    subjectColorsList.appendChild(row);
  });
}

autoAssignColorsBtn.addEventListener("click", () => {
  const uniquePalette = [
    "#4f46e5", "#ec4899", "#0ea5e9", "#10b981", "#f59e0b",
    "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#d946ef"
  ];
  assignPaletteToSubjects(uniquePalette);
  renderSubjectColorsList();
  renderDashboard();
  pushHistory();
  showToast("Assigned unique colors to every subject.", "success");
});

function syncCustomizeControls() {
  custBgColor.value = design.bgColor;
  custSurfaceColor.value = design.surfaceColor;
  custTextColor.value = design.textColor;
  custBorderColor.value = design.borderColor;
  custAccentColor.value = design.accentColor;
  custUseGradient.checked = design.useGradient;
  gradientControls.classList.toggle("hidden", !design.useGradient);
  custGradStart.value = design.gradStart;
  custGradEnd.value = design.gradEnd;
  custGradAngle.value = design.gradAngle;
  valGradAngle.textContent = `${design.gradAngle}°`;

  custFontFamily.value = design.fontFamily;
  custFontWeight.value = String(design.fontWeight);
  custCodeSize.value = design.codeSize; valCodeSize.textContent = `${design.codeSize}px`;
  custTitleSize.value = design.titleSize; valTitleSize.textContent = `${design.titleSize}px`;
  custRoomSize.value = design.roomSize; valRoomSize.textContent = `${design.roomSize}px`;
  custTimeSize.value = design.timeSize; valTimeSize.textContent = `${design.timeSize}px`;

  custHourHeight.value = design.hourHeight; valHourHeight.textContent = `${design.hourHeight}px`;
  custBlockGap.value = design.blockGap; valBlockGap.textContent = `${design.blockGap}px`;
  custBorderRadius.value = design.borderRadius; valBorderRadius.textContent = `${design.borderRadius}px`;
  custBorderWidth.value = design.borderWidth; valBorderWidth.textContent = `${design.borderWidth}px`;
  custShowWeekends.checked = design.showWeekends;
  custShowFreeTime.checked = design.showFreeTime;
  quickToggleWeekendsBtn.textContent = design.showWeekends ? "Hide Weekends" : "Show Weekends";

  custHeaderBg.value = design.headerBg;
  custHeaderText.value = design.headerText;
  removeLogoBtn.classList.toggle("hidden", !design.logoDataUrl);

  if (scheduleData) {
    custInstName.value = scheduleData.institution || "";
    custSchedTitle.value = scheduleData.title || "";
    custStudentName.value = scheduleData.studentName || "";
    custCourseSection.value = scheduleData.courseSection || "";
    custSemester.value = scheduleData.semester || "";
  }

  // Active states on segmented controls & template cards
  custAlignGroup.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("active", b.dataset.align === design.textAlign));
  custLayoutGroup.querySelectorAll(".layout-opt-btn").forEach((b) => b.classList.toggle("active", b.dataset.layout === design.layout));
  custTimeFmtGroup.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("active", b.dataset.fmt === design.timeFormat));
  document.querySelectorAll("[data-quick-layout]").forEach((b) => b.classList.toggle("active", b.dataset.quickLayout === design.layout));
  document.querySelectorAll(".template-card").forEach((c) => c.classList.toggle("active", c.dataset.tplId === design.templateId));

  renderSubjectColorsList();
}

function applyDesignToCanvas() {
  const s = captureArea.style;
  s.setProperty("--tt-bg", design.bgColor);
  s.setProperty(
    "--tt-bg-image",
    design.useGradient ? `linear-gradient(${design.gradAngle}deg, ${design.gradStart}, ${design.gradEnd})` : "none"
  );
  s.setProperty("--tt-surface", design.surfaceColor);
  s.setProperty("--tt-text", design.textColor);
  s.setProperty("--tt-muted", design.textColor + "99");
  s.setProperty("--tt-border", design.borderColor);
  s.setProperty("--tt-accent", design.accentColor);
  s.setProperty("--tt-header-bg", design.headerBg);
  s.setProperty("--tt-header-text", design.headerText);
  s.setProperty("--tt-font", design.fontFamily);
  s.setProperty("--tt-weight", design.fontWeight);
  s.setProperty("--tt-align", design.textAlign);
  s.setProperty("--tt-code-size", `${design.codeSize}px`);
  s.setProperty("--tt-title-size", `${design.titleSize}px`);
  s.setProperty("--tt-room-size", `${design.roomSize}px`);
  s.setProperty("--tt-time-size", `${design.timeSize}px`);
  s.setProperty("--tt-radius", `${design.borderRadius}px`);
  s.setProperty("--tt-border-w", `${design.borderWidth}px`);
  s.setProperty("--tt-gap", `${design.blockGap}px`);

  const effectiveHourH = design.layout === "compact" ? Math.max(40, Math.round(design.hourHeight * 0.72)) : design.hourHeight;
  s.setProperty("--tt-hour-h", `${effectiveHourH}px`);

  if (design.logoDataUrl) {
    headerLogoImg.src = design.logoDataUrl;
    headerLogoImg.classList.remove("hidden");
  } else {
    headerLogoImg.classList.add("hidden");
  }
}

function updateDesignProp(prop, value, shouldRender = false, record = false) {
  design[prop] = value;
  saveDesign();
  applyDesignToCanvas();
  if (shouldRender) renderDashboard();
  if (record) pushHistory();
}

function saveDesign() {
  localStorage.setItem("schedsnap_design", JSON.stringify(design));
}

// Bind live color, typography, & layout controls
const liveColorMap = [
  [custBgColor, "bgColor"], [custSurfaceColor, "surfaceColor"],
  [custTextColor, "textColor"], [custBorderColor, "borderColor"],
  [custAccentColor, "accentColor"], [custGradStart, "gradStart"],
  [custGradEnd, "gradEnd"], [custHeaderBg, "headerBg"], [custHeaderText, "headerText"]
];
liveColorMap.forEach(([el, key]) => {
  el.addEventListener("input", (e) => updateDesignProp(key, e.target.value, false, false));
  el.addEventListener("change", () => pushHistory());
});

custUseGradient.addEventListener("change", (e) => {
  gradientControls.classList.toggle("hidden", !e.target.checked);
  updateDesignProp("useGradient", e.target.checked, false, true);
});
custGradAngle.addEventListener("input", (e) => {
  valGradAngle.textContent = `${e.target.value}°`;
  updateDesignProp("gradAngle", Number(e.target.value), false, false);
});
custGradAngle.addEventListener("change", () => pushHistory());

custFontFamily.addEventListener("change", (e) => updateDesignProp("fontFamily", e.target.value, false, true));
custFontWeight.addEventListener("change", (e) => updateDesignProp("fontWeight", e.target.value, false, true));

custAlignGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  updateDesignProp("textAlign", btn.dataset.align, false, true);
  syncCustomizeControls();
});

[
  [custCodeSize, valCodeSize, "codeSize", false],
  [custTitleSize, valTitleSize, "titleSize", false],
  [custRoomSize, valRoomSize, "roomSize", false],
  [custTimeSize, valTimeSize, "timeSize", false],
  [custHourHeight, valHourHeight, "hourHeight", true],
  [custBlockGap, valBlockGap, "blockGap", true],
  [custBorderRadius, valBorderRadius, "borderRadius", false],
  [custBorderWidth, valBorderWidth, "borderWidth", false]
].forEach(([el, labelEl, key, rerender]) => {
  el.addEventListener("input", (e) => {
    labelEl.textContent = `${e.target.value}px`;
    updateDesignProp(key, Number(e.target.value), rerender, false);
  });
  el.addEventListener("change", () => pushHistory());
});

function setLayoutMode(mode) {
  design.layout = mode;
  saveDesign();
  syncCustomizeControls();
  applyDesignToCanvas();
  renderDashboard();
  pushHistory();
}

custLayoutGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".layout-opt-btn");
  if (btn) setLayoutMode(btn.dataset.layout);
});
document.querySelectorAll("[data-quick-layout]").forEach((btn) => {
  btn.addEventListener("click", () => setLayoutMode(btn.dataset.quickLayout));
});

custTimeFmtGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  updateDesignProp("timeFormat", btn.dataset.fmt, true, true);
  syncCustomizeControls();
});

custShowWeekends.addEventListener("change", (e) => {
  updateDesignProp("showWeekends", e.target.checked, true, true);
  quickToggleWeekendsBtn.textContent = e.target.checked ? "Hide Weekends" : "Show Weekends";
});
quickToggleWeekendsBtn.addEventListener("click", () => {
  custShowWeekends.checked = !design.showWeekends;
  updateDesignProp("showWeekends", !design.showWeekends, true, true);
  quickToggleWeekendsBtn.textContent = design.showWeekends ? "Hide Weekends" : "Show Weekends";
});

custShowFreeTime.addEventListener("change", (e) => {
  updateDesignProp("showFreeTime", e.target.checked, true, true);
});

// Header Metadata Inputs (Live sync)
[
  [custInstName, "institution"],
  [custSchedTitle, "title"],
  [custStudentName, "studentName"],
  [custCourseSection, "courseSection"],
  [custSemester, "semester"]
].forEach(([el, field]) => {
  el.addEventListener("input", (e) => {
    if (!scheduleData) return;
    scheduleData[field] = e.target.value;
    saveSchedule();
    renderHeaderContent();
  });
});

// School Logo Upload (resized for localStorage efficiency)
logoUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const maxDim = 180;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      design.logoDataUrl = c.toDataURL("image/png");
      saveDesign();
      syncCustomizeControls();
      applyDesignToCanvas();
      pushHistory();
      showToast("School logo uploaded.", "success");
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  logoUploadInput.value = "";
});

removeLogoBtn.addEventListener("click", () => {
  design.logoDataUrl = "";
  saveDesign();
  syncCustomizeControls();
  applyDesignToCanvas();
  pushHistory();
  showToast("School logo removed.", "info");
});

// Saved Designs: Save, Load, Duplicate, Delete, Reset
function renderSavedDesignsList() {
  savedDesignsList.innerHTML = "";
  if (!savedDesigns.length) {
    savedDesignsList.innerHTML = `<p class="muted" style="font-size:0.78rem;">No saved custom designs yet.</p>`;
    return;
  }
  savedDesigns.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "saved-design-item";
    row.innerHTML = `
      <span><strong>${escapeHtml(item.name)}</strong></span>
      <div class="saved-design-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-act="load" data-i="${idx}">Load</button>
        <button type="button" class="btn btn-ghost btn-sm" data-act="dup" data-i="${idx}" title="Duplicate design">Copy</button>
        <button type="button" class="btn btn-ghost btn-sm text-danger" data-act="del" data-i="${idx}" title="Delete saved design">✕</button>
      </div>
    `;
    savedDesignsList.appendChild(row);
  });

  savedDesignsList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = Number(e.target.dataset.i);
      const act = e.target.dataset.act;
      if (act === "load") {
        design = { ...DEFAULT_DESIGN, ...savedDesigns[i].design };
        saveDesign();
        syncCustomizeControls();
        applyDesignToCanvas();
        renderDashboard();
        pushHistory();
        showToast(`Loaded "${savedDesigns[i].name}".`, "success");
      } else if (act === "dup") {
        const copy = JSON.parse(JSON.stringify(savedDesigns[i]));
        copy.name = `${copy.name} (Copy)`;
        savedDesigns.push(copy);
        localStorage.setItem("schedsnap_saved_designs", JSON.stringify(savedDesigns));
        renderSavedDesignsList();
        showToast("Duplicated saved design.", "success");
      } else if (act === "del") {
        savedDesigns.splice(i, 1);
        localStorage.setItem("schedsnap_saved_designs", JSON.stringify(savedDesigns));
        renderSavedDesignsList();
        showToast("Removed saved design.", "info");
      }
    });
  });
}

saveDesignBtn.addEventListener("click", () => {
  const name = saveDesignNameInput.value.trim() || `Custom Design ${savedDesigns.length + 1}`;
  savedDesigns.push({ name, design: { ...design } });
  localStorage.setItem("schedsnap_saved_designs", JSON.stringify(savedDesigns));
  saveDesignNameInput.value = "";
  renderSavedDesignsList();
  showToast(`Saved "${name}".`, "success");
});

resetDesignBtn.addEventListener("click", () => {
  openConfirm("Reset Design", "Reset all colors, fonts, spacing, and layout back to default?", () => {
    design = { ...DEFAULT_DESIGN };
    saveDesign();
    syncCustomizeControls();
    applyDesignToCanvas();
    renderDashboard();
    pushHistory();
    showToast("Design reset to default.", "info");
  });
});

/* ==========================================================================
   UPLOAD, PREVIEW, ROTATION, & CLIENT-SIDE OCR (TESSERACT.JS)
   ========================================================================== */
function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please choose a valid JPG, PNG, or WebP image.", "error");
    return;
  }
  uploadedFileMeta = { name: file.name || "Schedule.jpg", size: file.size || 0 };
  const reader = new FileReader();
  reader.onload = (e) => {
    currentRotation = 0;
    const img = new Image();
    img.onload = () => {
      uploadedImageEl = img;
      renderUploadPreview();
      dropZone.classList.add("hidden");
      loadingPanel.classList.add("hidden");
      scanErrorPanel.classList.add("hidden");
      previewPanel.classList.remove("hidden");
      previewFileName.textContent = uploadedFileMeta.name;
      const kb = Math.round(uploadedFileMeta.size / 1024);
      previewFileMeta.textContent = `${img.width} × ${img.height}px${kb > 0 ? " • " + kb + " KB" : ""}`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderUploadPreview() {
  if (!uploadedImageEl) return;
  previewImg.src = getRotatedBase64().dataUrl;
}

function getRotatedBase64() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const rad = (currentRotation * Math.PI) / 180;
  const isRotated = Math.abs(currentRotation) % 180 !== 0;
  const maxDim = window.innerWidth < 768 ? 1400 : 1800;
  const scale = Math.min(1, maxDim / Math.max(uploadedImageEl.width, uploadedImageEl.height));
  const w = Math.round(uploadedImageEl.width * scale);
  const h = Math.round(uploadedImageEl.height * scale);

  canvas.width = isRotated ? h : w;
  canvas.height = isRotated ? w : h;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(uploadedImageEl, -w / 2, -h / 2, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
  return { dataUrl, base64: dataUrl.split(",")[1] };
}

function resetUploadUI() {
  uploadedImageEl = null;
  currentRotation = 0;
  fileInput.value = "";
  cameraInput.value = "";
  replaceFileInput.value = "";
  previewPanel.classList.add("hidden");
  loadingPanel.classList.add("hidden");
  scanErrorPanel.classList.add("hidden");
  dropZone.classList.remove("hidden");
}

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
cameraInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
replaceFileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => { e.preventDefault(); dropZone.classList.remove("dragover"); handleFile(e.dataTransfer.files[0]); });
rotateLeftBtn.addEventListener("click", () => { currentRotation = (currentRotation - 90 + 360) % 360; renderUploadPreview(); });
rotateRightBtn.addEventListener("click", () => { currentRotation = (currentRotation + 90) % 360; renderUploadPreview(); });
removeImgBtn.addEventListener("click", resetUploadUI);
retryScanBtn.addEventListener("click", () => {
  scanErrorPanel.classList.add("hidden");
  if (uploadedImageEl) previewPanel.classList.remove("hidden");
  else dropZone.classList.remove("hidden");
});

function getPreprocessedOcrCanvas() {
  const { dataUrl } = getRotatedBase64();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const contrast = 1.25;
      const intercept = 128 * (1 - contrast);
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const boosted = Math.max(0, Math.min(255, gray * contrast + intercept));
        d[i] = d[i + 1] = d[i + 2] = boosted;
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas);
    };
    img.src = dataUrl;
  });
}

function parseDaysToken(token) {
  if (!token) return [];
  const t = token.trim();
  const found = new Set();
  [
    [/\b(?:mon|mo)\b/gi, "Mon"], [/\b(?:tue|tues|tu)\b/gi, "Tue"],
    [/\b(?:wed|we)\b/gi, "Wed"], [/\b(?:thu|thur|thurs|th)\b/gi, "Thu"],
    [/\b(?:fri|fr)\b/gi, "Fri"], [/\b(?:sat|sa)\b/gi, "Sat"], [/\b(?:sun|su)\b/gi, "Sun"]
  ].forEach(([re, day]) => { if (re.test(t)) found.add(day); });

  if (found.size === 0) {
    const compact = t.replace(/[^a-zA-Z]/g, "");
    if (/^(?:Mo|Tu|We|Th|Fr|Sa|Su)+$/i.test(compact)) {
      const map = { mo: "Mon", tu: "Tue", we: "Wed", th: "Thu", fr: "Fri", sa: "Sat", su: "Sun" };
      (compact.match(/Mo|Tu|We|Th|Fr|Sa|Su/gi) || []).forEach((p) => found.add(map[p.toLowerCase()]));
    } else if (/^[MTWRFSU]+$/i.test(compact) && compact.length <= 6) {
      let s = compact.toUpperCase();
      if (s.includes("TH")) { found.add("Thu"); s = s.replace(/TH/g, ""); }
      if (s.includes("SU")) { found.add("Sun"); s = s.replace(/SU/g, ""); }
      if (s.includes("SA")) { found.add("Sat"); s = s.replace(/SA/g, ""); }
      for (const ch of s) {
        if (ch === "M") found.add("Mon");
        else if (ch === "T") found.add("Tue");
        else if (ch === "W") found.add("Wed");
        else if (ch === "R") found.add("Thu");
        else if (ch === "F") found.add("Fri");
        else if (ch === "S") found.add("Sat");
      }
    }
  }
  return DAYS_ALL.filter((d) => found.has(d));
}

function to24Hour(hourStr, minStr, ampm) {
  let h = parseInt(hourStr, 10);
  const m = parseInt(minStr || "0", 10);
  if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return null;
  if (ampm) {
    const ap = ampm.toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseOcrScheduleText(rawText) {
  const lines = rawText.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 2);
  let institution = "My University";
  let courseSection = "";
  let semester = "";

  for (const line of lines.slice(0, 12)) {
    if (/university|institute|college|academy|school/i.test(line) && institution === "My University") {
      institution = line.replace(/[^a-zA-Z0-9 .,'&-]/g, "").trim();
    }
    const secMatch = line.match(/\b(?:section|sec\.?)[:\s-]*([A-Z0-9-]{2,12})/i);
    if (secMatch) courseSection = `Section ${secMatch[1]}`;
    const termMatch = line.match(/\b((?:1st|2nd|3rd|first|second|summer)\s+sem(?:ester)?|sy\s*\d{4}\s*[-–]\s*\d{4})/i);
    if (termMatch) semester = termMatch[1];
  }

  const timeRangeRegex = /(\d{1,2})[:.](\d{2})\s*(AM|PM)?\s*[-–—to]+\s*(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i;
  const courseCodeRegex = /\b([A-Z]{2,5}[\s-]?\d{2,4}[A-Z]{0,3})\b/;
  const dayTokenRegex = /\b(MoWeFr|MoWe|TuTh|MWF|TTh|MTWThF|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*[,/&]\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|Mo|Tu|We|Th|Fr|Sa|Su))*\b/i;

  const extracted = [];
  let lastCode = "";
  let lastTitle = "";

  for (const line of lines) {
    const timeMatch = line.match(timeRangeRegex);
    if (!timeMatch) continue;
    const startAp = timeMatch[3] || (timeMatch[6] && parseInt(timeMatch[1], 10) <= parseInt(timeMatch[4], 10) ? timeMatch[6] : null);
    const endAp = timeMatch[6] || timeMatch[3] || null;
    let start = to24Hour(timeMatch[1], timeMatch[2], startAp);
    let end = to24Hour(timeMatch[4], timeMatch[5], endAp);
    const notes = [];
    let uncertain = false;

    if (!start || !end) { start = "08:00"; end = "09:00"; uncertain = true; notes.push("Verify time"); }
    else if (toMinutes(end) <= toMinutes(start)) {
      const [eh, em] = end.split(":").map(Number);
      if (eh < 12) end = `${String(eh + 12).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
      if (toMinutes(end) <= toMinutes(start)) { uncertain = true; notes.push("Check end time"); }
    }

    const beforeTime = line.slice(0, timeMatch.index).trim();
    const afterTime = line.slice(timeMatch.index + timeMatch[0].length).trim();
    const dayMatch = beforeTime.match(dayTokenRegex) || afterTime.match(dayTokenRegex);
    let days = dayMatch ? parseDaysToken(dayMatch[0]) : [];
    if (!days.length) { days = ["Mon"]; uncertain = true; notes.push("Verify days"); }

    const codeMatch = beforeTime.match(courseCodeRegex);
    let code = codeMatch ? codeMatch[1].trim() : "";
    let courseTitle = "";
    if (code) {
      lastCode = code;
      let rest = beforeTime.replace(codeMatch[0], "").trim();
      if (dayMatch) rest = rest.replace(dayMatch[0], "").trim();
      courseTitle = rest.replace(/\b\d+\.\d{2}\b/g, "").replace(/^[-–|:.\s]+|[-–|:.\s]+$/g, "");
      if (courseTitle) lastTitle = courseTitle;
    } else if (lastCode) {
      code = lastCode;
      courseTitle = lastTitle ? `${lastTitle} (Lab/Session 2)` : "";
      uncertain = true;
      notes.push("Verify course code");
    } else {
      code = `SUBJ ${extracted.length + 1}`;
      uncertain = true;
      notes.push("Missing code");
    }

    let room = afterTime.replace(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.*$/i, "").replace(dayTokenRegex, "").replace(/^[-–|:.\s]+|[-–|:.\s]+$/g, "").trim();
    if (room.length > 24) room = room.slice(0, 24).trim();
    if (!room) { uncertain = true; notes.push("Missing room"); }

    extracted.push({ code, title: courseTitle, days, start, end, room, uncertain, note: notes.join(" • ") });
  }

  return { institution, title: "Class Schedule", studentName: "", courseSection, semester, classes: extracted };
}

scanBtn.addEventListener("click", async () => {
  if (!uploadedImageEl) return;
  if (typeof window.Tesseract === "undefined") {
    scanErrorMessage.textContent = "OCR engine failed to load. Please refresh and try again.";
    scanErrorPanel.classList.remove("hidden");
    return;
  }

  previewPanel.classList.add("hidden");
  scanErrorPanel.classList.add("hidden");
  loadingPanel.classList.remove("hidden");
  loadingTitle.textContent = "Preparing OCR engine…";

  try {
    const canvas = await getPreprocessedOcrCanvas();
    const result = await window.Tesseract.recognize(canvas, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          loadingTitle.textContent = `Reading schedule… ${Math.round((m.progress || 0) * 100)}%`;
        }
      }
    });
    const parsed = parseOcrScheduleText(result?.data?.text || "");
    loadingPanel.classList.add("hidden");
    previewPanel.classList.remove("hidden");

    if (!parsed.classes.length) {
      parsed.classes.push({ code: "", title: "", days: ["Mon"], start: "08:00", end: "09:30", room: "", uncertain: true, note: "No rows auto-detected — enter manually or try a clearer photo" });
      showToast("Couldn't auto-detect times. Edit rows below or try a sharper photo.", "warning");
    } else {
      showToast(`Detected ${parsed.classes.length} classes. Review before generating.`, "success");
    }
    openReviewStep(normalizeSchedule(parsed));
  } catch (err) {
    loadingPanel.classList.add("hidden");
    scanErrorMessage.textContent = err.message || "Unable to scan image. Try again.";
    scanErrorPanel.classList.remove("hidden");
  }
});

// Sample Schedule & Manual Start
function loadSampleSchedule(showMsg = true) {
  scheduleData = normalizeSchedule({
    institution: "Sample University",
    title: "Class Schedule",
    studentName: "Alex Rivera",
    courseSection: "BS Computer Science • Section A",
    semester: "1st Semester • SY 2026–2027",
    classes: [
      { code: "CS 101", title: "Introduction to Computing", days: ["Mon", "Wed", "Fri"], start: "09:00", end: "10:00", room: "Room 204" },
      { code: "MATH 102", title: "Calculus & Analytic Geometry", days: ["Tue", "Thu"], start: "09:30", end: "11:00", room: "Room 108" },
      { code: "ENG 101", title: "Academic & Technical Writing", days: ["Mon", "Wed"], start: "11:30", end: "13:00", room: "Hall B" },
      { code: "CS 101L", title: "Computing Laboratory", days: ["Wed"], start: "14:00", end: "17:00", room: "Comp Lab 2" },
      { code: "PHYS 101", title: "General Physics", days: ["Tue", "Thu"], start: "13:30", end: "15:00", room: "Sci Bldg 301" },
      { code: "PE 101", title: "Physical Fitness & Wellness", days: ["Fri"], start: "13:00", end: "15:00", room: "Main Gym" }
    ]
  });
  saveSchedule();
  pushHistory();
  if (showMsg) showToast("Sample schedule loaded.", "success");
}

sampleBtn.addEventListener("click", () => {
  loadSampleSchedule(true);
  openWorkspace(false);
});

manualStartBtn.addEventListener("click", () => {
  openReviewStep(normalizeSchedule({
    institution: "My University",
    title: "Class Schedule",
    studentName: "",
    courseSection: "",
    semester: "",
    classes: [{ code: "", title: "", days: ["Mon"], start: "09:00", end: "10:30", room: "" }]
  }));
});

/* ==========================================================================
   NORMALIZATION & TIME UTILITIES
   ========================================================================== */
function normalizeSchedule(data) {
  const pal = COLOR_PALETTES.aesthetic.colors;
  const colorMap = {};
  let idx = 0;

  const classes = (data.classes || []).map((cls) => {
    const code = (cls.code || "").trim();
    let color = cls.color;
    if (!color) {
      const key = code.toUpperCase() || `ITEM_${idx}`;
      if (!colorMap[key]) { colorMap[key] = pal[idx % pal.length]; idx++; }
      color = colorMap[key];
    }
    return {
      code,
      title: (cls.title || "").trim(),
      days: (Array.isArray(cls.days) ? cls.days : []).filter((d) => DAYS_ALL.includes(d)),
      start: isValidHHMM(cls.start) ? cls.start : "08:00",
      end: isValidHHMM(cls.end) ? cls.end : "09:00",
      room: (cls.room || "").trim(),
      color,
      uncertain: Boolean(cls.uncertain),
      note: (cls.note || "").trim()
    };
  });

  // Backwards compatibility with older `meta` field
  let studentName = (data.studentName || "").trim();
  let courseSection = (data.courseSection || "").trim();
  let semester = (data.semester || "").trim();
  if (!studentName && !courseSection && data.meta) {
    courseSection = String(data.meta).trim();
  }

  return {
    institution: (data.institution || "Institution Name").trim(),
    title: (data.title || "Class Schedule").trim(),
    studentName,
    courseSection,
    semester,
    classes
  };
}

function isValidHHMM(str) { return typeof str === "string" && /^\d{2}:\d{2}$/.test(str); }
function toMinutes(hhmm) { if (!isValidHHMM(hhmm)) return 0; const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function formatTime(hhmm) {
  if (!isValidHHMM(hhmm)) return "--:--";
  if (design.timeFormat === "24") return hhmm;
  let [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}
function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function saveSchedule() {
  if (scheduleData) localStorage.setItem("schedsnap_data", JSON.stringify(scheduleData));
}

/* ==========================================================================
   SECTION 2: EDIT CLASSES / REVIEW INTERFACE
   ========================================================================== */
function getRowIssues(cls) {
  const issues = [];
  if (cls.uncertain) issues.push(cls.note || "Verify OCR text");
  if (!cls.code) issues.push("Missing code");
  if (!cls.days.length) issues.push("Select day");
  if (toMinutes(cls.end) <= toMinutes(cls.start)) issues.push("Invalid time range");
  if (!cls.room) issues.push("Missing room");
  return issues;
}

function openReviewStep(data) {
  draftSchedule = JSON.parse(JSON.stringify(data));
  revInstitution.value = draftSchedule.institution || "";
  revTitle.value = draftSchedule.title || "";
  revStudent.value = draftSchedule.studentName || "";
  revSection.value = draftSchedule.courseSection || "";
  revSemester.value = draftSchedule.semester || "";
  renderReviewRows();
  uploadView.classList.add("hidden");
  workspaceView.classList.add("hidden");
  if (designBoardView) designBoardView.classList.add("hidden");
  reviewView.classList.remove("hidden");
  currentPage = "review";
  updateNavActiveState();
}

function renderReviewRows() {
  reviewRowsContainer.innerHTML = "";
  reviewCount.textContent = draftSchedule.classes.length;
  let flagged = 0;

  draftSchedule.classes.forEach((cls, idx) => {
    const issues = getRowIssues(cls);
    const hasIssues = issues.length > 0;
    if (hasIssues) flagged++;

    const card = document.createElement("div");
    card.className = `review-row-card ${hasIssues ? "uncertain" : ""}`;
    const dayPillsHtml = DAYS_ALL.map((d) => `
      <label class="day-pill">
        <input type="checkbox" data-idx="${idx}" data-day="${d}" ${cls.days.includes(d) ? "checked" : ""} />
        <span>${d}</span>
      </label>
    `).join("");

    card.innerHTML = `
      <div class="review-row-top">
        <span class="review-badge ${hasIssues ? "warn" : "ok"}">${hasIssues ? "Review: " + escapeHtml(issues.join(" • ")) : "Ready"}</span>
        <button type="button" class="btn btn-ghost btn-sm text-danger rev-del-btn" data-idx="${idx}">Remove</button>
      </div>
      <div class="review-fields-grid">
        <div class="form-field" style="margin:0;"><label>Course Code</label><input type="text" class="rev-input" data-idx="${idx}" data-field="code" value="${escapeHtml(cls.code)}" placeholder="CS 101" /></div>
        <div class="form-field" style="margin:0;"><label>Course Title</label><input type="text" class="rev-input" data-idx="${idx}" data-field="title" value="${escapeHtml(cls.title)}" placeholder="Title" /></div>
        <div class="form-field" style="margin:0;"><label>Room</label><input type="text" class="rev-input" data-idx="${idx}" data-field="room" value="${escapeHtml(cls.room)}" placeholder="Room" /></div>
        <div class="form-field" style="margin:0;"><label>Start</label><input type="time" class="rev-input" data-idx="${idx}" data-field="start" value="${escapeHtml(cls.start)}" /></div>
        <div class="form-field" style="margin:0;"><label>End</label><input type="time" class="rev-input" data-idx="${idx}" data-field="end" value="${escapeHtml(cls.end)}" /></div>
      </div>
      <div class="day-pill-selector">${dayPillsHtml}</div>
    `;
    reviewRowsContainer.appendChild(card);
  });

  reviewSummaryBanner.classList.toggle("hidden", flagged === 0);
  if (flagged > 0) reviewSummaryTitle.textContent = `${flagged} ${flagged === 1 ? "entry needs" : "entries need"} your attention`;

  reviewRowsContainer.querySelectorAll(".rev-input").forEach((inp) => {
    inp.addEventListener("change", (e) => {
      const i = Number(e.target.dataset.idx);
      draftSchedule.classes[i][e.target.dataset.field] = e.target.value.trim();
      draftSchedule.classes[i].uncertain = false;
      draftSchedule.classes[i].note = "";
      renderReviewRows();
    });
  });
  reviewRowsContainer.querySelectorAll(".day-pill input").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const i = Number(e.target.dataset.idx);
      const set = new Set(draftSchedule.classes[i].days);
      if (e.target.checked) set.add(e.target.dataset.day);
      else set.delete(e.target.dataset.day);
      draftSchedule.classes[i].days = DAYS_ALL.filter((d) => set.has(d));
      renderReviewRows();
    });
  });
  reviewRowsContainer.querySelectorAll(".rev-del-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      draftSchedule.classes.splice(Number(e.target.dataset.idx), 1);
      renderReviewRows();
    });
  });
}

reviewAddRowBtn.addEventListener("click", () => {
  draftSchedule.classes.push({ code: "", title: "", room: "", start: "09:00", end: "10:30", days: ["Mon"], uncertain: false, note: "" });
  renderReviewRows();
});
reviewBackBtn.addEventListener("click", () => navigateTo("upload"));

function commitReview(openCustomizeAfter) {
  draftSchedule.institution = revInstitution.value.trim() || "Institution Name";
  draftSchedule.title = revTitle.value.trim() || "Class Schedule";
  draftSchedule.studentName = revStudent.value.trim();
  draftSchedule.courseSection = revSection.value.trim();
  draftSchedule.semester = revSemester.value.trim();

  if (!draftSchedule.classes.length) {
    showToast("Add at least one class first.", "error");
    return;
  }
  for (let i = 0; i < draftSchedule.classes.length; i++) {
    const c = draftSchedule.classes[i];
    if (!c.code) return showToast(`Row ${i + 1}: Enter a course code.`, "error");
    if (!c.days.length) return showToast(`Row ${i + 1} (${c.code}): Select a day.`, "error");
    if (toMinutes(c.end) <= toMinutes(c.start)) return showToast(`Row ${i + 1} (${c.code}): End time must be after start time.`, "error");
    c.uncertain = false;
    c.note = "";
  }
  scheduleData = normalizeSchedule(draftSchedule);
  saveSchedule();
  pushHistory();
  openWorkspace(openCustomizeAfter);
  showToast("Schedule saved!", "success");
}

confirmScheduleBtn.addEventListener("click", () => commitReview(false));
confirmToCustomizeBtn.addEventListener("click", () => commitReview(true));

/* ==========================================================================
   CONFLICTS, FREE TIME, LIVE STATUS, STATS
   ========================================================================== */
function detectConflicts(classes) {
  const conflicts = [];
  const conflictingIndices = new Set();
  DAYS_ALL.forEach((day) => {
    const items = classes.map((c, idx) => ({ ...c, idx, s: toMinutes(c.start), e: toMinutes(c.end) }))
      .filter((c) => c.days.includes(day)).sort((a, b) => a.s - b.s);
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[j].s < items[i].e) {
          conflictingIndices.add(items[i].idx);
          conflictingIndices.add(items[j].idx);
          conflicts.push({ day, a: items[i], b: items[j] });
        }
      }
    }
  });
  return { conflicts, conflictingIndices };
}

function getFreePeriodsForDay(dayClasses) {
  if (dayClasses.length < 2) return [];
  const sorted = [...dayClasses].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const gaps = [];
  let maxEnd = toMinutes(sorted[0].end);
  for (let i = 1; i < sorted.length; i++) {
    const s = toMinutes(sorted[i].start);
    const e = toMinutes(sorted[i].end);
    if (s - maxEnd >= 30) gaps.push({ startMin: maxEnd, endMin: s, duration: s - maxEnd });
    if (e > maxEnd) maxEnd = e;
  }
  return gaps;
}

function updateLiveStatus() {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  liveClock.textContent = `${DAY_NAMES_FULL[todayKey]} • ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  if (!scheduleData || !scheduleData.classes.length) return;
  const classes = scheduleData.classes;
  const todayClasses = classes.filter((c) => c.days.includes(todayKey)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const ongoing = todayClasses.find((c) => nowMin >= toMinutes(c.start) && nowMin < toMinutes(c.end));

  if (ongoing) {
    currentStatusBadge.classList.add("live-now");
    currentStatusLabel.textContent = "Ongoing Now";
    currentClassBody.innerHTML = `<strong>${escapeHtml(ongoing.code)}${ongoing.title ? " — " + escapeHtml(ongoing.title) : ""}</strong><span>${formatTime(ongoing.start)} – ${formatTime(ongoing.end)}${ongoing.room ? " • " + escapeHtml(ongoing.room) : ""} (${formatDuration(toMinutes(ongoing.end) - nowMin)} left)</span>`;
  } else {
    currentStatusBadge.classList.remove("live-now");
    currentStatusLabel.textContent = "Free Right Now";
    currentClassBody.innerHTML = `<strong>No ongoing class</strong><span>${todayClasses.length ? `${todayClasses.length} class${todayClasses.length > 1 ? "es" : ""} scheduled today.` : "You have a free day today."}</span>`;
  }

  let nextClass = null;
  let dayOffset = 0;
  for (let offset = 0; offset < 7; offset++) {
    const dKey = JS_DAY_TO_KEY[(now.getDay() + offset) % 7];
    const cands = classes.filter((c) => c.days.includes(dKey)).filter((c) => offset > 0 || toMinutes(c.start) > nowMin).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    if (cands.length) { nextClass = { ...cands[0], dayKey: dKey }; dayOffset = offset; break; }
  }

  if (nextClass) {
    upcomingCountdown.textContent = dayOffset === 0 ? `In ${formatDuration(toMinutes(nextClass.start) - nowMin)}`
      : dayOffset === 1 ? `Tomorrow • ${formatTime(nextClass.start)}`
      : `${DAY_NAMES_FULL[nextClass.dayKey]} • ${formatTime(nextClass.start)}`;
    upcomingClassBody.innerHTML = `<strong>${escapeHtml(nextClass.code)}${nextClass.title ? " — " + escapeHtml(nextClass.title) : ""}</strong><span>${formatTime(nextClass.start)} – ${formatTime(nextClass.end)}${nextClass.room ? " • " + escapeHtml(nextClass.room) : ""}</span>`;
  }
}

function renderStats(classes) {
  const unique = new Set(classes.map((c) => c.code.toUpperCase()).filter(Boolean));
  let sessions = 0, totalMin = 0;
  const dayMin = {};
  DAYS_ALL.forEach((d) => (dayMin[d] = 0));
  classes.forEach((c) => {
    const dur = Math.max(0, toMinutes(c.end) - toMinutes(c.start));
    c.days.forEach((d) => { sessions++; totalMin += dur; dayMin[d] += dur; });
  });
  let busiest = "—", maxM = 0, freeDays = [];
  DAYS_ALL.forEach((d) => {
    if (dayMin[d] > maxM) { maxM = dayMin[d]; busiest = DAY_NAMES_FULL[d]; }
    if (dayMin[d] === 0) freeDays.push(d);
  });
  statSubjects.textContent = unique.size;
  statSessions.textContent = sessions;
  statHours.textContent = `${(totalMin / 60).toFixed(1).replace(/\.0$/, "")}h`;
  statBusiest.textContent = busiest;
  statBusiestSub.textContent = maxM > 0 ? formatDuration(maxM) : "No classes";
  statFreeDays.textContent = freeDays.length;
  statFreeDaysSub.textContent = freeDays.length ? freeDays.join(", ") : "Every day";
}

/* ==========================================================================
   TIMETABLE RENDERING (GRID, COMPACT, CARDS, MINIMAL, MOBILE DAY VIEW)
   ========================================================================== */
function renderHeaderContent() {
  if (!scheduleData) return;
  headerInstitution.textContent = scheduleData.institution || "Institution Name";
  headerTitle.textContent = scheduleData.title || "Class Schedule";
  headerStudent.textContent = scheduleData.studentName || "";
  const subParts = [scheduleData.courseSection, scheduleData.semester].filter(Boolean);
  headerSubMeta.textContent = subParts.join(" • ");
}

function getFilteredClasses() {
  if (!scheduleData) return [];
  const q = searchQuery.trim().toLowerCase();
  return scheduleData.classes.map((c, idx) => ({ ...c, idx })).filter((c) => {
    if (activeDayFilter !== "ALL" && !c.days.includes(activeDayFilter)) return false;
    if (!q) return true;
    return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.room.toLowerCase().includes(q);
  });
}

function getVisibleDays() {
  if (activeDayFilter !== "ALL") return [activeDayFilter];
  return design.showWeekends ? [...DAYS_ALL] : ["Mon", "Tue", "Wed", "Thu", "Fri"];
}

function renderDashboard() {
  if (!scheduleData) return;
  renderHeaderContent();
  applyDesignToCanvas();

  const allClasses = scheduleData.classes || [];
  renderStats(allClasses);
  updateLiveStatus();

  const { conflicts, conflictingIndices } = detectConflicts(allClasses);
  if (conflicts.length > 0) {
    conflictBanner.classList.remove("hidden");
    conflictTitle.textContent = `${conflicts.length} Schedule Conflict${conflicts.length > 1 ? "s" : ""} Detected`;
    conflictList.innerHTML = conflicts.map((cf) => `<li><strong>${DAY_NAMES_FULL[cf.day]}:</strong> ${escapeHtml(cf.a.code)} overlaps with ${escapeHtml(cf.b.code)}</li>`).join("");
  } else {
    conflictBanner.classList.add("hidden");
  }

  const filtered = getFilteredClasses();
  const visibleDays = getVisibleDays();

  gridView.classList.add("hidden");
  cardsView.classList.add("hidden");
  singleDayView.classList.add("hidden");
  singleDayBar.classList.add("hidden");

  if (design.layout === "grid" || design.layout === "compact") {
    gridView.classList.remove("hidden");
    renderWeeklyGrid(filtered, visibleDays, conflictingIndices);
  } else if (design.layout === "cards" || design.layout === "minimal") {
    cardsView.classList.remove("hidden");
    renderDayCards(filtered, visibleDays, conflictingIndices, design.layout === "minimal");
  } else if (design.layout === "day") {
    singleDayBar.classList.remove("hidden");
    singleDayView.classList.remove("hidden");
    renderSingleDayView(filtered, visibleDays, conflictingIndices);
  }
}

function layoutDayBlocks(dayClasses) {
  const items = dayClasses.map((c) => ({ ...c, s: toMinutes(c.start), e: toMinutes(c.end), col: 0, totalCols: 1 }))
    .sort((a, b) => a.s - b.s || b.e - a.e);
  const clusters = [];
  let cur = [], end = -1;
  items.forEach((it) => {
    if (!cur.length || it.s < end) { cur.push(it); end = Math.max(end, it.e); }
    else { clusters.push(cur); cur = [it]; end = it.e; }
  });
  if (cur.length) clusters.push(cur);
  clusters.forEach((cl) => {
    const colEnds = [];
    cl.forEach((it) => {
      let placed = false;
      for (let i = 0; i < colEnds.length; i++) {
        if (it.s >= colEnds[i]) { it.col = i; colEnds[i] = it.e; placed = true; break; }
      }
      if (!placed) { it.col = colEnds.length; colEnds.push(it.e); }
    });
    cl.forEach((it) => (it.totalCols = colEnds.length));
  });
  return items;
}

function renderWeeklyGrid(classes, days, conflictingIndices) {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const pxPerHour = design.layout === "compact" ? Math.max(40, Math.round(design.hourHeight * 0.72)) : design.hourHeight;

  let minHour = 7, maxHour = 18;
  classes.forEach((c) => {
    minHour = Math.min(minHour, Math.floor(toMinutes(c.start) / 60));
    maxHour = Math.max(maxHour, Math.ceil(toMinutes(c.end) / 60));
  });
  if (maxHour <= minHour) maxHour = minHour + 8;

  const totalHeight = (maxHour - minHour) * pxPerHour;
  gridView.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "timetable-grid";
  grid.style.gridTemplateColumns = `68px repeat(${days.length}, minmax(105px, 1fr))`;

  grid.innerHTML += `<div class="grid-header-cell">Time</div>`;
  days.forEach((d) => {
    grid.innerHTML += `<div class="grid-header-cell ${d === todayKey ? "is-today" : ""}"><span>${d}</span>${d === todayKey ? `<span class="today-dot">Today</span>` : ""}</div>`;
  });

  const timeCol = document.createElement("div");
  timeCol.className = "time-column";
  for (let h = minHour; h < maxHour; h++) {
    const slot = document.createElement("div");
    slot.className = "time-slot-label";
    slot.textContent = formatTime(`${String(h).padStart(2, "0")}:00`);
    timeCol.appendChild(slot);
  }
  grid.appendChild(timeCol);

  days.forEach((day) => {
    const col = document.createElement("div");
    col.className = "day-column";
    col.style.height = `${totalHeight}px`;

    // Drag-and-drop target to rearrange class to another day
    col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drag-target"); });
    col.addEventListener("dragleave", () => col.classList.remove("drag-target"));
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("drag-target");
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { idx, fromDay } = JSON.parse(raw);
      if (fromDay === day || !scheduleData.classes[idx]) return;
      const daysSet = new Set(scheduleData.classes[idx].days);
      daysSet.delete(fromDay);
      daysSet.add(day);
      scheduleData.classes[idx].days = DAYS_ALL.filter((d) => daysSet.has(d));
      saveSchedule();
      renderDashboard();
      showToast(`Moved ${scheduleData.classes[idx].code} from ${fromDay} to ${day}.`, "success");
    });

    if (day === todayKey && nowMin >= minHour * 60 && nowMin <= maxHour * 60) {
      const line = document.createElement("div");
      line.className = "now-line";
      line.style.top = `${((nowMin - minHour * 60) / 60) * pxPerHour}px`;
      col.appendChild(line);
    }

    const dayClasses = classes.filter((c) => c.days.includes(day));
    if (design.showFreeTime && dayClasses.length >= 2) {
      getFreePeriodsForDay(dayClasses).forEach((g) => {
        const top = ((g.startMin - minHour * 60) / 60) * pxPerHour + 2;
        const height = (g.duration / 60) * pxPerHour - 4;
        if (height >= 24) {
          const fb = document.createElement("div");
          fb.className = "free-block";
          fb.style.top = `${top}px`;
          fb.style.height = `${height}px`;
          fb.textContent = `Free • ${formatDuration(g.duration)}`;
          col.appendChild(fb);
        }
      });
    }

    layoutDayBlocks(dayClasses).forEach((cls) => {
      const gap = design.blockGap;
      const top = ((cls.s - minHour * 60) / 60) * pxPerHour + gap / 2;
      const height = Math.max(28, ((cls.e - cls.s) / 60) * pxPerHour - gap);
      const isConflict = conflictingIndices.has(cls.idx) && cls.totalCols > 1;
      const isOngoing = day === todayKey && nowMin >= cls.s && nowMin < cls.e;

      const block = document.createElement("div");
      block.className = `class-block ${isConflict ? "is-conflict" : ""} ${isOngoing ? "is-ongoing" : ""}`;
      block.draggable = true;
      block.style.top = `${top}px`;
      block.style.height = `${height}px`;
      block.style.background = cls.color || "#4f46e5";

      const wPct = 100 / cls.totalCols;
      block.style.left = `calc(${cls.col * wPct}% + ${gap / 2}px)`;
      block.style.width = `calc(${wPct}% - ${gap}px)`;

      block.innerHTML = `
        <div class="class-code">${escapeHtml(cls.code)}</div>
        ${cls.title && design.layout !== "compact" ? `<div class="class-title">${escapeHtml(cls.title)}</div>` : ""}
        <div class="class-meta">${formatTime(cls.start)}–${formatTime(cls.end)}${cls.room ? " • " + escapeHtml(cls.room) : ""}</div>
      `;
      block.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ idx: cls.idx, fromDay: day }));
      });
      block.addEventListener("click", () => openClassModal(cls.idx));
      col.appendChild(block);
    });

    grid.appendChild(col);
  });
  gridView.appendChild(grid);
}

function renderDayCards(classes, days, conflictingIndices, isMinimal) {
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
  cardsView.innerHTML = "";
  days.forEach((day) => {
    const dayClasses = classes.filter((c) => c.days.includes(day)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    const card = document.createElement("div");
    card.className = `day-card ${isMinimal ? "minimal-mode" : ""}`;
    card.innerHTML = `
      <div class="day-card-header">
        <h3>${DAY_NAMES_FULL[day]} ${day === todayKey ? `<span class="today-dot">Today</span>` : ""}</h3>
        <span class="day-card-count">${dayClasses.length ? `${dayClasses.length} class${dayClasses.length > 1 ? "es" : ""}` : "Free"}</span>
      </div>
    `;
    if (!dayClasses.length) {
      card.innerHTML += `<div class="empty-day-box">No classes scheduled</div>`;
    } else {
      dayClasses.forEach((cls, i) => {
        if (design.showFreeTime && i > 0) {
          const gapMin = toMinutes(cls.start) - toMinutes(dayClasses[i - 1].end);
          if (gapMin >= 30) {
            const g = document.createElement("div");
            g.className = "card-free-gap";
            g.textContent = `Free • ${formatDuration(gapMin)}`;
            card.appendChild(g);
          }
        }
        const item = document.createElement("div");
        item.className = `card-class-item ${conflictingIndices.has(cls.idx) ? "is-conflict" : ""}`;
        item.style.borderLeftColor = cls.color || "#4f46e5";
        item.innerHTML = `
          <div class="card-item-code">${escapeHtml(cls.code)}</div>
          ${cls.title ? `<div class="card-item-title">${escapeHtml(cls.title)}</div>` : ""}
          <div class="card-item-meta">${formatTime(cls.start)} – ${formatTime(cls.end)}${cls.room ? " • " + escapeHtml(cls.room) : ""}</div>
        `;
        item.addEventListener("click", () => openClassModal(cls.idx));
        card.appendChild(item);
      });
    }
    cardsView.appendChild(card);
  });
}

function renderSingleDayView(classes, visibleDays, conflictingIndices) {
  if (!visibleDays.includes(selectedSingleDay)) selectedSingleDay = visibleDays[0] || "Mon";
  singleDayTabs.innerHTML = "";
  visibleDays.forEach((d) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `sday-tab ${d === selectedSingleDay ? "active" : ""}`;
    btn.textContent = d;
    btn.addEventListener("click", () => { selectedSingleDay = d; renderDashboard(); });
    singleDayTabs.appendChild(btn);
  });

  const dayClasses = classes.filter((c) => c.days.includes(selectedSingleDay)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  singleDayView.innerHTML = "";

  if (!dayClasses.length) {
    singleDayView.innerHTML = `<div class="empty-day-box">No classes on ${DAY_NAMES_FULL[selectedSingleDay]} — Free Day!</div>`;
    return;
  }

  dayClasses.forEach((cls, i) => {
    if (design.showFreeTime && i > 0) {
      const gapMin = toMinutes(cls.start) - toMinutes(dayClasses[i - 1].end);
      if (gapMin >= 30) {
        const g = document.createElement("div");
        g.className = "card-free-gap";
        g.textContent = `Free break • ${formatDuration(gapMin)}`;
        singleDayView.appendChild(g);
      }
    }

    const card = document.createElement("div");
    card.className = "expandable-class-card";
    card.style.borderLeftColor = cls.color || "#4f46e5";
    card.innerHTML = `
      <div class="exp-card-top">
        <div>
          <div class="card-item-code">${escapeHtml(cls.code)}</div>
          ${cls.title ? `<div class="card-item-title">${escapeHtml(cls.title)}</div>` : ""}
          <div class="card-item-meta">${formatTime(cls.start)} – ${formatTime(cls.end)}${cls.room ? " • " + escapeHtml(cls.room) : ""}</div>
        </div>
        <span class="muted" style="font-size:0.85rem;">▾</span>
      </div>
      <div class="exp-card-details hidden">
        <span>Days: ${cls.days.join(", ")} • Duration: ${formatDuration(toMinutes(cls.end) - toMinutes(cls.start))}</span>
        <button type="button" class="btn btn-secondary btn-sm exp-edit-btn">Edit Class</button>
      </div>
    `;
    const topEl = card.querySelector(".exp-card-top");
    const detailsEl = card.querySelector(".exp-card-details");
    topEl.addEventListener("click", () => detailsEl.classList.toggle("hidden"));
    card.querySelector(".exp-edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openClassModal(cls.idx);
    });
    singleDayView.appendChild(card);
  });
}

prevDayBtn.addEventListener("click", () => {
  const days = getVisibleDays();
  const i = days.indexOf(selectedSingleDay);
  selectedSingleDay = days[(i - 1 + days.length) % days.length];
  renderDashboard();
});
nextDayBtn.addEventListener("click", () => {
  const days = getVisibleDays();
  const i = days.indexOf(selectedSingleDay);
  selectedSingleDay = days[(i + 1) % days.length];
  renderDashboard();
});

// Inline header contenteditable sync
headerInstitution.addEventListener("blur", () => {
  if (!scheduleData) return;
  scheduleData.institution = headerInstitution.textContent.trim();
  custInstName.value = scheduleData.institution;
  saveSchedule();
});
headerTitle.addEventListener("blur", () => {
  if (!scheduleData) return;
  scheduleData.title = headerTitle.textContent.trim();
  custSchedTitle.value = scheduleData.title;
  saveSchedule();
});

// Search & Day Filter
searchInput.addEventListener("input", (e) => { searchQuery = e.target.value; renderDashboard(); });
dayFilterPills.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill-btn");
  if (!btn) return;
  activeDayFilter = btn.dataset.day;
  dayFilterPills.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderDashboard();
});

/* ==========================================================================
   ADD / EDIT / DELETE CLASS MODAL
   ========================================================================== */
function buildClassModalSwatches() {
  colorSwatches.innerHTML = "";
  ["#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#ea580c", "#e11d48", "#db2777", "#1e293b"].forEach((hex) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "color-swatch";
    b.style.background = hex;
    b.dataset.color = hex;
    b.addEventListener("click", () => selectClassColor(hex));
    colorSwatches.appendChild(b);
  });
}

function selectClassColor(hex) {
  cColor.value = hex;
  cColorCustom.value = hex;
  colorSwatches.querySelectorAll(".color-swatch").forEach((b) => b.classList.toggle("selected", b.dataset.color.toLowerCase() === hex.toLowerCase()));
}
cColorCustom.addEventListener("input", (e) => selectClassColor(e.target.value));

function openClassModal(index = -1) {
  editIndex.value = index;
  modalValidationMsg.classList.add("hidden");
  modalOverlapWarn.classList.add("hidden");
  const boxes = document.querySelectorAll("#dayCheckboxes input");

  if (index >= 0 && scheduleData.classes[index]) {
    const cls = scheduleData.classes[index];
    modalTitle.textContent = "Edit Class";
    cCode.value = cls.code;
    cTitle.value = cls.title || "";
    cRoom.value = cls.room || "";
    cStart.value = cls.start;
    cEnd.value = cls.end;
    boxes.forEach((b) => (b.checked = cls.days.includes(b.value)));
    selectClassColor(cls.color || "#4f46e5");
    deleteClassBtn.classList.remove("hidden");
  } else {
    modalTitle.textContent = "Add New Class";
    classForm.reset();
    cStart.value = "09:00";
    cEnd.value = "10:30";
    selectClassColor(COLOR_PALETTES.aesthetic.colors[(scheduleData?.classes.length || 0) % 8]);
    deleteClassBtn.classList.add("hidden");
  }
  classModal.classList.remove("hidden");
  checkModalLiveOverlap();
}

function checkModalLiveOverlap() {
  if (!scheduleData) return;
  const idx = Number(editIndex.value);
  const s = toMinutes(cStart.value), e = toMinutes(cEnd.value);
  const days = [...document.querySelectorAll("#dayCheckboxes input:checked")].map((b) => b.value);
  if (!days.length || e <= s) return modalOverlapWarn.classList.add("hidden");
  const hits = [];
  scheduleData.classes.forEach((c, i) => {
    if (i === idx) return;
    const shared = c.days.filter((d) => days.includes(d));
    if (shared.length && s < toMinutes(c.end) && toMinutes(c.start) < e) {
      hits.push(`${c.code} (${shared.join(", ")})`);
    }
  });
  if (hits.length) {
    modalOverlapWarn.textContent = `Overlaps with: ${hits.join("; ")}`;
    modalOverlapWarn.classList.remove("hidden");
  } else {
    modalOverlapWarn.classList.add("hidden");
  }
}
[cStart, cEnd].forEach((el) => el.addEventListener("change", checkModalLiveOverlap));
document.querySelectorAll("#dayCheckboxes input").forEach((cb) => cb.addEventListener("change", checkModalLiveOverlap));

addClassBtn.addEventListener("click", () => openClassModal(-1));
closeModalBtn.addEventListener("click", () => classModal.classList.add("hidden"));
closeModalX.addEventListener("click", () => classModal.classList.add("hidden"));

classForm.addEventListener("submit", (e) => {
  e.preventDefault();
  modalValidationMsg.classList.add("hidden");
  const code = cCode.value.trim();
  const days = [...document.querySelectorAll("#dayCheckboxes input:checked")].map((b) => b.value);
  if (!code) { modalValidationMsg.textContent = "Enter a course code."; return modalValidationMsg.classList.remove("hidden"); }
  if (!days.length) { modalValidationMsg.textContent = "Select at least one day."; return modalValidationMsg.classList.remove("hidden"); }
  if (toMinutes(cEnd.value) <= toMinutes(cStart.value)) { modalValidationMsg.textContent = "End time must be after start time."; return modalValidationMsg.classList.remove("hidden"); }

  const entry = {
    code, title: cTitle.value.trim(), room: cRoom.value.trim(),
    start: cStart.value, end: cEnd.value, days, color: cColor.value || "#4f46e5",
    uncertain: false, note: ""
  };
  const idx = Number(editIndex.value);
  if (idx >= 0) scheduleData.classes[idx] = entry;
  else scheduleData.classes.push(entry);

  saveSchedule();
  classModal.classList.add("hidden");
  renderSubjectColorsList();
  renderDashboard();
  pushHistory();
  showToast(idx >= 0 ? `Updated ${code}.` : `Added ${code}.`, "success");
});

deleteClassBtn.addEventListener("click", () => {
  const idx = Number(editIndex.value);
  if (idx < 0) return;
  const code = scheduleData.classes[idx].code;
  openConfirm("Delete Class", `Remove "${code}" from your timetable?`, () => {
    scheduleData.classes.splice(idx, 1);
    saveSchedule();
    classModal.classList.add("hidden");
    renderSubjectColorsList();
    renderDashboard();
    pushHistory();
    showToast(`Deleted ${code}.`, "info");
  });
});

/* ==========================================================================
   EXPORT (HIGH-RES PNG, PDF, & PRINT PRESERVING ALL CUSTOM STYLES)
   ========================================================================== */
function openExportModal() {
  if (!scheduleData) {
    showToast("Create or upload a schedule before exporting.", "info");
    return;
  }
  const matchLayout = ["grid", "cards", "compact", "minimal"].includes(design.layout) ? design.layout : "grid";
  const radio = exportModal.querySelector(`input[name="exportLayout"][value="${matchLayout}"]`);
  if (radio) radio.checked = true;
  exportModal.classList.remove("hidden");
}
closeExportX.addEventListener("click", () => exportModal.classList.add("hidden"));
printPreviewBtn.addEventListener("click", () => window.print());

async function captureStyledCanvas(layout) {
  const prevLayout = design.layout;
  const prevCustOpen = isCustomizeOpen;
  if (prevCustOpen && window.innerWidth < 960) customizePanel.classList.add("hidden");

  design.layout = layout;
  renderDashboard();

  const prevOverflow = gridView.style.overflowX;
  const prevWidth = captureArea.style.width;
  if (layout === "grid" || layout === "compact") {
    gridView.style.overflowX = "visible";
    captureArea.style.width = `${Math.max(captureArea.scrollWidth, 1100)}px`;
  }

  await new Promise((r) => setTimeout(r, 150));

  const scale = Number(exportQuality.value) || 2;
  const canvas = await html2canvas(captureArea, {
    scale,
    useCORS: true,
    backgroundColor: design.useGradient ? null : design.bgColor
  });

  gridView.style.overflowX = prevOverflow;
  captureArea.style.width = prevWidth;
  design.layout = prevLayout;
  renderDashboard();
  if (prevCustOpen && window.innerWidth < 960) customizePanel.classList.remove("hidden");
  return canvas;
}

function getChosenExportLayout() {
  return exportModal.querySelector('input[name="exportLayout"]:checked')?.value || "grid";
}

exportPngBtn.addEventListener("click", async () => {
  const layout = getChosenExportLayout();
  exportPngBtn.disabled = true;
  try {
    const canvas = await captureStyledCanvas(layout);
    const link = document.createElement("a");
    link.download = `SchedSnap-${layout}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    link.remove();
    exportModal.classList.add("hidden");
    showToast("High-res PNG downloaded!", "success");
  } catch {
    showToast("PNG export failed. Try Standard resolution on mobile.", "error");
  } finally {
    exportPngBtn.disabled = false;
  }
});

exportPdfBtn.addEventListener("click", async () => {
  const layout = getChosenExportLayout();
  exportPdfBtn.disabled = true;
  try {
    const canvas = await captureStyledCanvas(layout);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
      unit: "pt",
      format: "a4"
    });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const m = 24;
    const ratio = Math.min((pw - m * 2) / canvas.width, (ph - m * 2) / canvas.height);
    const rw = canvas.width * ratio;
    const rh = canvas.height * ratio;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", (pw - rw) / 2, (ph - rh) / 2, rw, rh);
    pdf.save(`SchedSnap-${layout}.pdf`);
    exportModal.classList.add("hidden");
    showToast("PDF timetable downloaded!", "success");
  } catch {
    showToast("PDF export failed. Please try again.", "error");
  } finally {
    exportPdfBtn.disabled = false;
  }
});

exportPrintBtn.addEventListener("click", () => {
  const layout = getChosenExportLayout();
  exportModal.classList.add("hidden");
  design.layout = layout;
  renderDashboard();
  setTimeout(() => window.print(), 180);
});

[classModal, exportModal, confirmModal].forEach((m) => {
  m.addEventListener("click", (e) => { if (e.target === m) m.classList.add("hidden"); });
});


if (navBoardBtn) navBoardBtn.addEventListener("click", () => navigateTo("board"));
if (mobBoardBtn) mobBoardBtn.addEventListener("click", () => navigateTo("board"));
if (openDesignBoardBtn) openDesignBoardBtn.addEventListener("click", () => navigateTo("board"));

// Shared read-only bridge for Design Board (avoids duplicating schedule data)
window.SchedSnapAPI = {
  getSchedule: () => scheduleData,
  navigateTo,
  showToast,
  formatTime
};

init();
