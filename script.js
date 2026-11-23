/* ==========================================================================
   SchedSnap v5 — Upgraded Navigation, Scan/Review, Readability, & Motion
   Preserves 100% Client-Side OCR (Tesseract.js), Conflict Detection,
   localStorage Persistence, Export (PNG/PDF/Print), & Design Board Bridge
   ========================================================================== */

const DAYS_ALL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
};
const JS_DAY_TO_KEY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PIXELS_PER_HOUR = 64;

const SUBJECT_PALETTE = [
  "#4338ca", "#6d28d9", "#1d4ed8", "#0e7490",
  "#047857", "#b45309", "#c2410c", "#be123c"
];

// Application State
let currentRotation = 0;
let enhanceEnabled = true;
let cropState = { top: 0, bottom: 0, left: 0, right: 0 };
let uploadedImageEl = null;
let lastScannedDataUrl = "";
let uploadedFileMeta = { name: "", size: 0 };

let draftSchedule = null;
let scheduleData = null;
let activeView = "grid"; // "grid" | "cards"
let activeDayFilter = "ALL";
let mobileDayKey = JS_DAY_TO_KEY[new Date().getDay()] || "Mon";
let searchQuery = "";
let showFreeTime = true;
let showWeekends = true;
let hasAnimatedStats = false;
let currentStep = "upload"; // "upload" | "review" | "dashboard" | "board"
let confirmCallback = null;

// DOM References — Topbar & Stepper
const brandLogo = document.getElementById("brandLogo");
const stepScanBtn = document.getElementById("stepScanBtn");
const stepReviewBtn = document.getElementById("stepReviewBtn");
const stepTimetableBtn = document.getElementById("stepTimetableBtn");
const stepExportBtn = document.getElementById("stepExportBtn");
const navDesignBtn = document.getElementById("navDesignBtn");
const navExportPrimaryBtn = document.getElementById("navExportPrimaryBtn");

const mobScanBtn = document.getElementById("mobScanBtn");
const mobTimetableBtn = document.getElementById("mobTimetableBtn");
const mobDesignBtn = document.getElementById("mobDesignBtn");
const mobExportBtn = document.getElementById("mobExportBtn");

const uploadView = document.getElementById("uploadView");
const reviewView = document.getElementById("reviewView");
const dashboardView = document.getElementById("dashboardView");
const designBoardView = document.getElementById("designBoardView");

// Step 1: Scan DOM
const savedTopCard = document.getElementById("savedTopCard");
const savedCardTitle = document.getElementById("savedCardTitle");
const savedCardMeta = document.getElementById("savedCardMeta");
const openSavedBtn = document.getElementById("openSavedBtn");

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const cameraInput = document.getElementById("cameraInput");
const replaceFileInput = document.getElementById("replaceFileInput");
const errorReplaceInput = document.getElementById("errorReplaceInput");
const sampleBtn = document.getElementById("sampleBtn");
const manualStartBtn = document.getElementById("manualStartBtn");

const previewPanel = document.getElementById("previewPanel");
const previewImg = document.getElementById("previewImg");
const previewFileName = document.getElementById("previewFileName");
const previewFileMeta = document.getElementById("previewFileMeta");
const rotateLeftBtn = document.getElementById("rotateLeftBtn");
const rotateRightBtn = document.getElementById("rotateRightBtn");
const toggleCropBtn = document.getElementById("toggleCropBtn");
const toggleEnhanceBtn = document.getElementById("toggleEnhanceBtn");
const removeImgBtn = document.getElementById("removeImgBtn");
const cropControlsBar = document.getElementById("cropControlsBar");
const cropTop = document.getElementById("cropTop");
const cropBottom = document.getElementById("cropBottom");
const cropLeft = document.getElementById("cropLeft");
const cropRight = document.getElementById("cropRight");
const resetCropBtn = document.getElementById("resetCropBtn");
const scanLaserOverlay = document.getElementById("scanLaserOverlay");
const stagedProgressPanel = document.getElementById("stagedProgressPanel");
const stageStepsList = document.getElementById("stageStepsList");
const previewFooter = document.getElementById("previewFooter");
const scanBtn = document.getElementById("scanBtn");
const scanErrorPanel = document.getElementById("scanErrorPanel");
const scanErrorMessage = document.getElementById("scanErrorMessage");
const retryScanBtn = document.getElementById("retryScanBtn");
const errorManualBtn = document.getElementById("errorManualBtn");

// Step 2: Review DOM
const reviewBackBtn = document.getElementById("reviewBackBtn");
const reviewBackBtnMobile = document.getElementById("reviewBackBtnMobile");
const confirmScheduleBtnTop = document.getElementById("confirmScheduleBtnTop");
const confirmScheduleBtn = document.getElementById("confirmScheduleBtn");
const reviewSummaryStats = document.getElementById("reviewSummaryStats");
const reviewAddRowBtn = document.getElementById("reviewAddRowBtn");
const reviewMobileTabs = document.getElementById("reviewMobileTabs");
const reviewImagePane = document.getElementById("reviewImagePane");
const reviewResultsPane = document.getElementById("reviewResultsPane");
const reviewSourceImg = document.getElementById("reviewSourceImg");
const reviewImgEmpty = document.getElementById("reviewImgEmpty");
const reviewHighlightBand = document.getElementById("reviewHighlightBand");
const revInstitution = document.getElementById("revInstitution");
const revTitle = document.getElementById("revTitle");
const revMeta = document.getElementById("revMeta");
const reviewRowsContainer = document.getElementById("reviewRowsContainer");

// Step 3: Timetable DOM
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

const viewGridBtn = document.getElementById("viewGridBtn");
const viewCardsBtn = document.getElementById("viewCardsBtn");
const searchInput = document.getElementById("searchInput");
const themeSelect = document.getElementById("themeSelect");
const viewOptionsBtn = document.getElementById("viewOptionsBtn");
const viewOptionsPopover = document.getElementById("viewOptionsPopover");
const toggleFreeTime = document.getElementById("toggleFreeTime");
const toggleWeekends = document.getElementById("toggleWeekends");
const bulkEditBtn = document.getElementById("bulkEditBtn");
const openDesignFromPopBtn = document.getElementById("openDesignFromPopBtn");
const addClassBtn = document.getElementById("addClassBtn");
const fabAddClass = document.getElementById("fabAddClass");
const openExportBtn = document.getElementById("openExportBtn");
const dayFilterPills = document.getElementById("dayFilterPills");
const jumpTodayChip = document.getElementById("jumpTodayChip");

const captureArea = document.getElementById("captureArea");
const headerInstitution = document.getElementById("headerInstitution");
const headerTitle = document.getElementById("headerTitle");
const headerMeta = document.getElementById("headerMeta");
const mobileDayRailHeader = document.getElementById("mobileDayRailHeader");
const mobPrevDayBtn = document.getElementById("mobPrevDayBtn");
const mobNextDayBtn = document.getElementById("mobNextDayBtn");
const mobActiveDayLabel = document.getElementById("mobActiveDayLabel");
const gridView = document.getElementById("gridView");
const cardsView = document.getElementById("cardsView");

// Modals & Overlays
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
const exportPngBtn = document.getElementById("exportPngBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportPrintBtn = document.getElementById("exportPrintBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmOkBtn = document.getElementById("confirmOkBtn");

const successOverlay = document.getElementById("successOverlay");
const successOverlayText = document.getElementById("successOverlayText");
const toastContainer = document.getElementById("toastContainer");

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
function init() {
  buildClassModalSwatches();

  const savedTheme = localStorage.getItem("schedsnap_theme");
  if (savedTheme) {
    themeSelect.value = savedTheme;
    captureArea.setAttribute("data-theme", savedTheme);
  }

  const saved = localStorage.getItem("schedsnap_data");
  if (saved) {
    try {
      scheduleData = normalizeSchedule(JSON.parse(saved));
      updateSavedHomeCard();
    } catch {
      localStorage.removeItem("schedsnap_data");
    }
  }

  navigateTo("upload");
  updateLiveStatus();
  setInterval(updateLiveStatus, 30000);
  setupMobileSwipeOnGrid();
}

function updateSavedHomeCard() {
  if (!scheduleData || !scheduleData.classes.length) {
    savedTopCard.classList.add("hidden");
    return;
  }
  savedTopCard.classList.remove("hidden");
  savedCardTitle.textContent = scheduleData.title || "Your Saved Timetable";
  const count = scheduleData.classes.length;
  savedCardMeta.textContent = `${scheduleData.institution || "Saved Schedule"} · ${count} course${count !== 1 ? "s" : ""}`;
}

/* ==========================================================================
   PHASE 1: NAVIGATION & CLICKABLE PROGRESS STEPPER
   ========================================================================== */
function updateStepperUI() {
  const hasReview = Boolean(draftSchedule || scheduleData);
  const hasTimetable = Boolean(scheduleData && scheduleData.classes.length);

  const steps = [
    { el: stepScanBtn, key: "upload", unlocked: true, completed: currentStep !== "upload" },
    { el: stepReviewBtn, key: "review", unlocked: hasReview, completed: hasTimetable && currentStep === "dashboard" },
    { el: stepTimetableBtn, key: "dashboard", unlocked: hasTimetable, completed: false },
    { el: stepExportBtn, key: "export", unlocked: hasTimetable, completed: false }
  ];

  steps.forEach((s) => {
    s.el.classList.toggle("active", currentStep === s.key);
    s.el.classList.toggle("completed", s.completed && currentStep !== s.key);
    s.el.classList.toggle("locked", !s.unlocked);
    s.el.setAttribute("aria-disabled", String(!s.unlocked));
  });

  navExportPrimaryBtn.classList.toggle("hidden", !hasTimetable || currentStep === "upload");

  document.querySelectorAll(".mob-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mob === currentStep);
  });
}

function navigateTo(target) {
  viewOptionsPopover.classList.add("hidden");
  viewOptionsBtn.setAttribute("aria-expanded", "false");

  if (target === "export") {
    if (!scheduleData || !scheduleData.classes.length) {
      showToast("Generate a timetable first before exporting.", "info");
      return;
    }
    openExportModal();
    return;
  }

  uploadView.classList.add("hidden");
  reviewView.classList.add("hidden");
  dashboardView.classList.add("hidden");
  designBoardView.classList.add("hidden");

  if (target === "upload") {
    currentStep = "upload";
    uploadView.classList.remove("hidden");
    updateSavedHomeCard();
  } else if (target === "review") {
    if (!draftSchedule && !scheduleData) {
      showToast("Upload a form or build manually first.", "info");
      return navigateTo("upload");
    }
    currentStep = "review";
    openReviewStep(draftSchedule || scheduleData);
  } else if (target === "dashboard") {
    if (!scheduleData || !scheduleData.classes.length) {
      showToast("Upload a schedule or try the sample schedule first.", "info");
      return navigateTo("upload");
    }
    currentStep = "dashboard";
    dashboardView.classList.remove("hidden");
    renderDashboard();
  } else if (target === "board") {
    currentStep = "board";
    designBoardView.classList.remove("hidden");
    if (window.DesignBoard && typeof window.DesignBoard.onOpen === "function") {
      window.DesignBoard.onOpen();
    }
  }

  updateStepperUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Stepper & Nav Listeners
brandLogo.addEventListener("click", () => navigateTo("upload"));
stepScanBtn.addEventListener("click", () => navigateTo("upload"));
stepReviewBtn.addEventListener("click", () => {
  if (!stepReviewBtn.classList.contains("locked")) navigateTo("review");
});
stepTimetableBtn.addEventListener("click", () => {
  if (!stepTimetableBtn.classList.contains("locked")) navigateTo("dashboard");
});
stepExportBtn.addEventListener("click", () => {
  if (!stepExportBtn.classList.contains("locked")) navigateTo("export");
});
navDesignBtn.addEventListener("click", () => navigateTo("board"));
navExportPrimaryBtn.addEventListener("click", () => navigateTo("export"));
openSavedBtn.addEventListener("click", () => navigateTo("dashboard"));

mobScanBtn.addEventListener("click", () => navigateTo("upload"));
mobTimetableBtn.addEventListener("click", () => navigateTo("dashboard"));
mobDesignBtn.addEventListener("click", () => navigateTo("board"));
mobExportBtn.addEventListener("click", () => navigateTo("export"));

/* ==========================================================================
   TOASTS, CONFIRM DIALOG, & SUCCESS CHECKMARK MICRO-ANIMATION
   ========================================================================== */
function showToast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.22s";
    setTimeout(() => el.remove(), 220);
  }, 2800);
}

function showSuccessCheck(label = "Saved!") {
  successOverlayText.textContent = label;
  successOverlay.classList.remove("hidden");
  setTimeout(() => successOverlay.classList.add("hidden"), 1150);
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
   PHASE 2: SCAN EXPERIENCE (ROTATE + CROP + ENHANCE + STAGED PROGRESS)
   ========================================================================== */
function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please upload a JPG, PNG, or WebP image.", "error");
    return;
  }
  uploadedFileMeta = { name: file.name || "schedule.jpg", size: file.size || 0 };
  const reader = new FileReader();
  reader.onload = (e) => {
    currentRotation = 0;
    cropState = { top: 0, bottom: 0, left: 0, right: 0 };
    [cropTop, cropBottom, cropLeft, cropRight].forEach((s) => (s.value = 0));
    const img = new Image();
    img.onload = () => {
      uploadedImageEl = img;
      renderPreviewImage();
      dropZone.classList.add("hidden");
      scanErrorPanel.classList.add("hidden");
      stagedProgressPanel.classList.add("hidden");
      scanLaserOverlay.classList.add("hidden");
      previewFooter.classList.remove("hidden");
      previewPanel.classList.remove("hidden");
      previewFileName.textContent = uploadedFileMeta.name;
      const kb = Math.round(uploadedFileMeta.size / 1024);
      previewFileMeta.textContent = `${img.width} × ${img.height}px${kb > 0 ? " · " + kb + " KB" : ""}`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function buildProcessedCanvas(applyEnhance) {
  const rotCanvas = document.createElement("canvas");
  const rctx = rotCanvas.getContext("2d");
  const rad = (currentRotation * Math.PI) / 180;
  const isRotated = Math.abs(currentRotation) % 180 !== 0;

  const scale = Math.min(1, 1600 / Math.max(uploadedImageEl.width, uploadedImageEl.height));
  const w = Math.round(uploadedImageEl.width * scale);
  const h = Math.round(uploadedImageEl.height * scale);

  rotCanvas.width = isRotated ? h : w;
  rotCanvas.height = isRotated ? w : h;
  rctx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
  rctx.rotate(rad);
  rctx.drawImage(uploadedImageEl, -w / 2, -h / 2, w, h);

  // Apply crop margins (%)
  const sx = Math.round(rotCanvas.width * (cropState.left / 100));
  const sy = Math.round(rotCanvas.height * (cropState.top / 100));
  const sw = Math.max(50, Math.round(rotCanvas.width * (1 - (cropState.left + cropState.right) / 100)));
  const sh = Math.max(50, Math.round(rotCanvas.height * (1 - (cropState.top + cropState.bottom) / 100)));

  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext("2d");
  ctx.drawImage(rotCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

  // Auto-contrast & mild sharpen when Enhance is on
  if (applyEnhance) {
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const d = imgData.data;
    const contrast = 1.28;
    const intercept = 128 * (1 - contrast);
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const boosted = Math.max(0, Math.min(255, gray * contrast + intercept));
      d[i] = d[i + 1] = d[i + 2] = boosted;
    }
    ctx.putImageData(imgData, 0, 0);
  }
  return out;
}

function renderPreviewImage() {
  if (!uploadedImageEl) return;
  const c = buildProcessedCanvas(enhanceEnabled);
  previewImg.src = c.toDataURL("image/jpeg", 0.88);
}

function setScanStage(activeIdx) {
  stageStepsList.querySelectorAll(".stage-step").forEach((el) => {
    const idx = Number(el.dataset.stage);
    el.classList.toggle("done", idx < activeIdx);
    el.classList.toggle("active", idx === activeIdx);
  });
}

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
cameraInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
replaceFileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
errorReplaceInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => { e.preventDefault(); dropZone.classList.remove("dragover"); handleFile(e.dataTransfer.files[0]); });

rotateLeftBtn.addEventListener("click", () => { currentRotation = (currentRotation - 90 + 360) % 360; renderPreviewImage(); });
rotateRightBtn.addEventListener("click", () => { currentRotation = (currentRotation + 90) % 360; renderPreviewImage(); });

toggleCropBtn.addEventListener("click", () => {
  const isOpen = !cropControlsBar.classList.toggle("hidden");
  toggleCropBtn.classList.toggle("active-pill", isOpen);
  toggleCropBtn.setAttribute("aria-pressed", String(isOpen));
});

[
  [cropTop, "top"], [cropBottom, "bottom"], [cropLeft, "left"], [cropRight, "right"]
].forEach(([el, key]) => {
  el.addEventListener("input", (e) => {
    cropState[key] = Number(e.target.value);
    renderPreviewImage();
  });
});

resetCropBtn.addEventListener("click", () => {
  cropState = { top: 0, bottom: 0, left: 0, right: 0 };
  [cropTop, cropBottom, cropLeft, cropRight].forEach((s) => (s.value = 0));
  renderPreviewImage();
});

toggleEnhanceBtn.addEventListener("click", () => {
  enhanceEnabled = !enhanceEnabled;
  toggleEnhanceBtn.classList.toggle("active-pill", enhanceEnabled);
  toggleEnhanceBtn.setAttribute("aria-pressed", String(enhanceEnabled));
  toggleEnhanceBtn.querySelector("span").textContent = enhanceEnabled ? "Enhance: On" : "Enhance: Off";
  renderPreviewImage();
});

removeImgBtn.addEventListener("click", () => {
  uploadedImageEl = null;
  fileInput.value = "";
  cameraInput.value = "";
  previewPanel.classList.add("hidden");
  scanErrorPanel.classList.add("hidden");
  dropZone.classList.remove("hidden");
});

retryScanBtn.addEventListener("click", () => {
  scanErrorPanel.classList.add("hidden");
  if (uploadedImageEl) {
    previewPanel.classList.remove("hidden");
    previewFooter.classList.remove("hidden");
  }
});

/* ==========================================================================
   OCR PARSING (TESSERACT.JS — CLIENT-SIDE)
   ========================================================================== */
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
  let metaParts = [];

  for (const line of lines.slice(0, 12)) {
    if (/university|institute|college|academy|school/i.test(line) && institution === "My University") {
      institution = line.replace(/[^a-zA-Z0-9 .,'&-]/g, "").trim();
    }
    const secMatch = line.match(/\b(?:section|sec\.?)[:\s-]*([A-Z0-9-]{2,12})/i);
    if (secMatch) metaParts.push(`Section ${secMatch[1]}`);
    const termMatch = line.match(/\b((?:1st|2nd|3rd|first|second|summer)\s+sem(?:ester)?|sy\s*\d{4}\s*[-–]\s*\d{4})/i);
    if (termMatch) metaParts.push(termMatch[1]);
  }

  const timeRangeRegex = /(\d{1,2})[:.](\d{2})\s*(AM|PM)?\s*[-–—to]+\s*(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i;
  const courseCodeRegex = /\b([A-Z]{2,5}[\s-]?\d{2,4}[A-Z]{0,3})\b/;
  const dayTokenRegex = /\b(MoWeFr|MoWe|TuTh|MWF|TTh|MTWThF|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*[,/&]\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|Mo|Tu|We|Th|Fr|Sa|Su))*\b/i;

  const extracted = [];
  let lastCode = "";
  let lastTitle = "";

  lines.forEach((line, lineIdx) => {
    const timeMatch = line.match(timeRangeRegex);
    if (!timeMatch) return;
    const startAp = timeMatch[3] || (timeMatch[6] && parseInt(timeMatch[1], 10) <= parseInt(timeMatch[4], 10) ? timeMatch[6] : null);
    const endAp = timeMatch[6] || timeMatch[3] || null;
    let start = to24Hour(timeMatch[1], timeMatch[2], startAp);
    let end = to24Hour(timeMatch[4], timeMatch[5], endAp);
    let uncertain = false;

    if (!start || !end) { start = "08:00"; end = "09:00"; uncertain = true; }
    else if (toMinutes(end) <= toMinutes(start)) {
      const [eh, em] = end.split(":").map(Number);
      if (eh < 12) end = `${String(eh + 12).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
      if (toMinutes(end) <= toMinutes(start)) uncertain = true;
    }

    const beforeTime = line.slice(0, timeMatch.index).trim();
    const afterTime = line.slice(timeMatch.index + timeMatch[0].length).trim();
    const dayMatch = beforeTime.match(dayTokenRegex) || afterTime.match(dayTokenRegex);
    let days = dayMatch ? parseDaysToken(dayMatch[0]) : [];
    if (!days.length) { days = ["Mon"]; uncertain = true; }

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
      courseTitle = lastTitle ? `${lastTitle} (Lab)` : "";
      uncertain = true;
    } else {
      code = `SUBJ ${extracted.length + 1}`;
      uncertain = true;
    }

    let room = afterTime.replace(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.*$/i, "").replace(dayTokenRegex, "").replace(/^[-–|:.\s]+|[-–|:.\s]+$/g, "").trim();
    if (room.length > 24) room = room.slice(0, 24).trim();
    if (!room) uncertain = true;

    // Approximate vertical position on the source image (0..85%)
    const yPct = Math.min(84, Math.max(8, Math.round((lineIdx / Math.max(1, lines.length)) * 80) + 6));
    extracted.push({ code, title: courseTitle, days, start, end, room, uncertain, yPct });
  });

  return {
    institution,
    title: "Class Schedule",
    meta: metaParts.length ? [...new Set(metaParts)].join(" · ") : "Scanned Schedule",
    classes: extracted
  };
}

scanBtn.addEventListener("click", async () => {
  if (!uploadedImageEl) return;
  if (typeof window.Tesseract === "undefined") {
    scanErrorMessage.textContent = "OCR engine could not load. Please check your connection and try again.";
    scanErrorPanel.classList.remove("hidden");
    return;
  }

  scanErrorPanel.classList.add("hidden");
  previewFooter.classList.add("hidden");
  scanLaserOverlay.classList.remove("hidden");
  stagedProgressPanel.classList.remove("hidden");
  setScanStage(0);

  try {
    const cleanCanvas = buildProcessedCanvas(enhanceEnabled);
    lastScannedDataUrl = buildProcessedCanvas(false).toDataURL("image/jpeg", 0.85);

    const result = await window.Tesseract.recognize(cleanCanvas, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const p = m.progress || 0;
          if (p < 0.35) setScanStage(0);
          else if (p < 0.7) setScanStage(1);
          else setScanStage(2);
        }
      }
    });

    setScanStage(3);
    await new Promise((r) => setTimeout(r, 260));
    const parsed = parseOcrScheduleText(result?.data?.text || "");

    scanLaserOverlay.classList.add("hidden");
    stagedProgressPanel.classList.add("hidden");
    previewFooter.classList.remove("hidden");

    if (!parsed.classes.length) {
      scanErrorMessage.textContent = "We didn't spot any class time ranges in this photo.";
      scanErrorPanel.classList.remove("hidden");
      return;
    }

    draftSchedule = normalizeSchedule(parsed);
    navigateTo("review");
  } catch (err) {
    scanLaserOverlay.classList.add("hidden");
    stagedProgressPanel.classList.add("hidden");
    previewFooter.classList.remove("hidden");
    scanErrorMessage.textContent = err.message || "Unable to read the image. Try a clearer photo.";
    scanErrorPanel.classList.remove("hidden");
  }
});

// Sample & Manual Start
function loadSampleSchedule() {
  lastScannedDataUrl = "";
  scheduleData = normalizeSchedule({
    institution: "Sample University",
    title: "BS Computer Science — 1st Semester",
    meta: "Section A · SY 2026–2027",
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
  navigateTo("dashboard");
  showToast("Sample schedule loaded.", "success");
}

sampleBtn.addEventListener("click", loadSampleSchedule);
const startManual = () => {
  lastScannedDataUrl = "";
  draftSchedule = normalizeSchedule({
    institution: "My University",
    title: "Class Schedule",
    meta: "Section · Semester",
    classes: [{ code: "", title: "", days: ["Mon"], start: "09:00", end: "10:30", room: "", uncertain: false }]
  });
  navigateTo("review");
};
manualStartBtn.addEventListener("click", startManual);
errorManualBtn.addEventListener("click", startManual);

/* ==========================================================================
   DATA NORMALIZATION & UTILITIES
   ========================================================================== */
function normalizeSchedule(data) {
  const colorMap = {};
  let idx = 0;
  const classes = (data.classes || []).map((cls) => {
    const code = (cls.code || "").trim();
    let color = cls.color;
    if (!color) {
      const key = code.toUpperCase() || `ITEM_${idx}`;
      if (!colorMap[key]) { colorMap[key] = SUBJECT_PALETTE[idx % SUBJECT_PALETTE.length]; idx++; }
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
      yPct: typeof cls.yPct === "number" ? cls.yPct : null
    };
  });
  return {
    institution: (data.institution || "Institution Name").trim(),
    title: (data.title || "Class Schedule").trim(),
    meta: (data.meta || "").trim(),
    classes
  };
}

function isValidHHMM(str) { return typeof str === "string" && /^\d{2}:\d{2}$/.test(str); }
function toMinutes(hhmm) { if (!isValidHHMM(hhmm)) return 0; const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function format12h(hhmm) {
  if (!isValidHHMM(hhmm)) return "--:--";
  let [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
function formatDuration(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
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
   STEP 2: REVIEW SCREEN (SPLIT VIEW + FIELD CONFIDENCE + ONE-TAP CONFIRM)
   ========================================================================== */
function openReviewStep(data) {
  draftSchedule = JSON.parse(JSON.stringify(data));
  revInstitution.value = draftSchedule.institution || "";
  revTitle.value = draftSchedule.title || "";
  revMeta.value = draftSchedule.meta || "";

  if (lastScannedDataUrl) {
    reviewSourceImg.src = lastScannedDataUrl;
    reviewSourceImg.classList.remove("hidden");
    reviewImgEmpty.classList.add("hidden");
  } else {
    reviewSourceImg.classList.add("hidden");
    reviewImgEmpty.classList.remove("hidden");
  }
  reviewHighlightBand.classList.add("hidden");

  reviewView.classList.remove("hidden");
  renderReviewRows();
}

// Mobile Review Tabs: Image | Results
reviewMobileTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".rev-mob-tab");
  if (!btn) return;
  const tab = btn.dataset.revtab;
  reviewMobileTabs.querySelectorAll(".rev-mob-tab").forEach((b) => b.classList.toggle("active", b === btn));
  reviewImagePane.classList.toggle("mob-visible", tab === "image");
  reviewResultsPane.classList.toggle("mob-hidden", tab === "image");
});

function renderReviewRows() {
  reviewRowsContainer.innerHTML = "";
  const classes = draftSchedule.classes;
  const { conflicts } = detectConflicts(classes);
  let needReviewCount = 0;

  classes.forEach((cls, idx) => {
    const codeOk = Boolean(cls.code);
    const roomOk = Boolean(cls.room);
    const timeOk = toMinutes(cls.end) > toMinutes(cls.start);
    const daysOk = cls.days.length > 0;
    const isUncertain = cls.uncertain || !codeOk || !roomOk || !timeOk || !daysOk;
    if (isUncertain) needReviewCount++;

    const card = document.createElement("div");
    card.className = `review-row-card ${isUncertain ? "uncertain" : ""}`;
    const dayPillsHtml = DAYS_ALL.map((d) => `
      <label class="day-pill">
        <input type="checkbox" data-idx="${idx}" data-day="${d}" ${cls.days.includes(d) ? "checked" : ""} />
        <span>${d}</span>
      </label>
    `).join("");

    card.innerHTML = `
      <div class="review-row-top">
        <span class="conf-badge ${isUncertain ? "check" : "ok"}">${isUncertain ? "Check entry" : "OK"}</span>
        <div class="review-row-actions">
          ${isUncertain ? `<button type="button" class="btn btn-secondary btn-sm rev-ok-btn" data-idx="${idx}">Looks good</button>` : ""}
          <button type="button" class="btn btn-ghost btn-sm text-danger rev-del-btn" data-idx="${idx}">Remove</button>
        </div>
      </div>
      <div class="review-fields-grid">
        <div class="form-field" style="margin:0;">
          <label>Code <span class="conf-badge ${codeOk ? "ok" : "check"}">${codeOk ? "OK" : "Check"}</span></label>
          <input type="text" class="rev-input" data-idx="${idx}" data-field="code" value="${escapeHtml(cls.code)}" placeholder="CS 101" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>Course Title</label>
          <input type="text" class="rev-input" data-idx="${idx}" data-field="title" value="${escapeHtml(cls.title)}" placeholder="Course name" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>Room <span class="conf-badge ${roomOk ? "ok" : "check"}">${roomOk ? "OK" : "Check"}</span></label>
          <input type="text" class="rev-input" data-idx="${idx}" data-field="room" value="${escapeHtml(cls.room)}" placeholder="Room" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>Start <span class="conf-badge ${timeOk ? "ok" : "check"}">${timeOk ? "OK" : "Check"}</span></label>
          <input type="time" class="rev-input" data-idx="${idx}" data-field="start" value="${escapeHtml(cls.start)}" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>End</label>
          <input type="time" class="rev-input" data-idx="${idx}" data-field="end" value="${escapeHtml(cls.end)}" />
        </div>
      </div>
      <div class="day-pill-selector">${dayPillsHtml}</div>
    `;

    // Clicking a row highlights where it came from on the source image
    card.addEventListener("click", () => {
      reviewRowsContainer.querySelectorAll(".review-row-card").forEach((c) => c.classList.remove("selected-row"));
      card.classList.add("selected-row");
      if (lastScannedDataUrl) {
        const y = cls.yPct !== null ? cls.yPct : Math.min(82, 12 + idx * 10);
        reviewHighlightBand.style.top = `${y}%`;
        reviewHighlightBand.classList.remove("hidden");
      }
    });

    reviewRowsContainer.appendChild(card);
  });

  reviewSummaryStats.textContent = `Found ${classes.length} course${classes.length !== 1 ? "s" : ""} · ${conflicts.length} conflict${conflicts.length !== 1 ? "s" : ""} · ${needReviewCount} need review`;

  // Bind inline edits, one-tap "Looks good", day chips, & remove
  reviewRowsContainer.querySelectorAll(".rev-input").forEach((inp) => {
    inp.addEventListener("change", (e) => {
      const i = Number(e.target.dataset.idx);
      draftSchedule.classes[i][e.target.dataset.field] = e.target.value.trim();
      draftSchedule.classes[i].uncertain = false;
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
  reviewRowsContainer.querySelectorAll(".rev-ok-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const i = Number(e.target.dataset.idx);
      draftSchedule.classes[i].uncertain = false;
      renderReviewRows();
      showToast("Marked as confirmed.", "success");
    });
  });
  reviewRowsContainer.querySelectorAll(".rev-del-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      draftSchedule.classes.splice(Number(e.target.dataset.idx), 1);
      renderReviewRows();
    });
  });
}

reviewAddRowBtn.addEventListener("click", () => {
  draftSchedule.classes.push({ code: "", title: "", room: "", start: "09:00", end: "10:30", days: ["Mon"], uncertain: false });
  renderReviewRows();
});

reviewBackBtn.addEventListener("click", () => navigateTo("upload"));
reviewBackBtnMobile.addEventListener("click", () => navigateTo("upload"));

function confirmAndGenerateTimetable() {
  draftSchedule.institution = revInstitution.value.trim() || "Institution Name";
  draftSchedule.title = revTitle.value.trim() || "Class Schedule";
  draftSchedule.meta = revMeta.value.trim();

  if (!draftSchedule.classes.length) return showToast("Add at least one class first.", "error");
  for (let i = 0; i < draftSchedule.classes.length; i++) {
    const c = draftSchedule.classes[i];
    if (!c.code) return showToast(`Row ${i + 1}: Please enter a course code.`, "error");
    if (!c.days.length) return showToast(`Row ${i + 1} (${c.code}): Select at least one day.`, "error");
    if (toMinutes(c.end) <= toMinutes(c.start)) return showToast(`Row ${i + 1} (${c.code}): End time must be after start time.`, "error");
    c.uncertain = false;
  }

  scheduleData = normalizeSchedule(draftSchedule);
  saveSchedule();
  hasAnimatedStats = false;
  navigateTo("dashboard");
  showSuccessCheck("Timetable ready!");
}

confirmScheduleBtnTop.addEventListener("click", confirmAndGenerateTimetable);
confirmScheduleBtn.addEventListener("click", confirmAndGenerateTimetable);

/* ==========================================================================
   CONFLICT DETECTION, FREE TIME, LIVE STATUS, & ANIMATED STATS
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
    const s = toMinutes(sorted[i].start), e = toMinutes(sorted[i].end);
    if (s - maxEnd >= 30) gaps.push({ startMin: maxEnd, endMin: s, duration: s - maxEnd });
    if (e > maxEnd) maxEnd = e;
  }
  return gaps;
}

function updateLiveStatus() {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  liveClock.textContent = `${DAY_NAMES_FULL[todayKey]} · ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  if (!scheduleData || !scheduleData.classes.length) return;
  const classes = scheduleData.classes;
  const todayClasses = classes.filter((c) => c.days.includes(todayKey)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const ongoing = todayClasses.find((c) => nowMin >= toMinutes(c.start) && nowMin < toMinutes(c.end));

  if (ongoing) {
    currentStatusBadge.classList.add("live-now");
    currentStatusLabel.textContent = "Ongoing Now";
    currentClassBody.innerHTML = `<strong>${escapeHtml(ongoing.code)}${ongoing.title ? " — " + escapeHtml(ongoing.title) : ""}</strong><span>${format12h(ongoing.start)} – ${format12h(ongoing.end)}${ongoing.room ? " · " + escapeHtml(ongoing.room) : ""} (${formatDuration(toMinutes(ongoing.end) - nowMin)} left)</span>`;
  } else {
    currentStatusBadge.classList.remove("live-now");
    currentStatusLabel.textContent = "No class right now";
    currentClassBody.innerHTML = `<strong>You're free right now</strong><span>${todayClasses.length ? `${todayClasses.length} class${todayClasses.length > 1 ? "es" : ""} on your schedule today.` : "Enjoy your free day — or tap + Add class to plan study time."}</span>`;
  }

  let nextClass = null, dayOffset = 0;
  for (let offset = 0; offset < 7; offset++) {
    const dKey = JS_DAY_TO_KEY[(now.getDay() + offset) % 7];
    const cands = classes.filter((c) => c.days.includes(dKey)).filter((c) => offset > 0 || toMinutes(c.start) > nowMin).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    if (cands.length) { nextClass = { ...cands[0], dayKey: dKey }; dayOffset = offset; break; }
  }

  if (nextClass) {
    upcomingCountdown.textContent = dayOffset === 0 ? `In ${formatDuration(toMinutes(nextClass.start) - nowMin)}`
      : dayOffset === 1 ? `Tomorrow · ${format12h(nextClass.start)}`
      : `${DAY_NAMES_FULL[nextClass.dayKey]} · ${format12h(nextClass.start)}`;
    upcomingClassBody.innerHTML = `<strong>${escapeHtml(nextClass.code)}${nextClass.title ? " — " + escapeHtml(nextClass.title) : ""}</strong><span>${format12h(nextClass.start)} – ${format12h(nextClass.end)}${nextClass.room ? " · " + escapeHtml(nextClass.room) : ""}</span>`;
  } else {
    upcomingCountdown.textContent = "—";
    upcomingClassBody.innerHTML = `<strong>No upcoming classes</strong><span>Add classes to see your next session here.</span>`;
  }
}

function animateCount(el, target, suffix = "") {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || hasAnimatedStats) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  const duration = 360;
  const start = performance.now();
  const isFloat = String(target).includes(".");
  const endNum = parseFloat(target) || 0;

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const val = endNum * (1 - Math.pow(1 - progress, 3));
    el.textContent = `${isFloat ? val.toFixed(1).replace(/\.0$/, "") : Math.round(val)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
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

  const hoursVal = (totalMin / 60).toFixed(1).replace(/\.0$/, "");
  animateCount(statSubjects, unique.size);
  animateCount(statSessions, sessions);
  animateCount(statHours, hoursVal, "h");
  statBusiest.textContent = busiest;
  statBusiestSub.textContent = maxM > 0 ? formatDuration(maxM) : "No classes";
  animateCount(statFreeDays, freeDays.length);
  statFreeDaysSub.textContent = freeDays.length ? freeDays.join(", ") : "Every day";
  hasAnimatedStats = true;
}

/* ==========================================================================
   PHASE 3: READABLE TIMETABLE (DESKTOP GRID, MOBILE SWIPE RAIL, TIMELINE CARDS)
   ========================================================================== */
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
  return showWeekends ? [...DAYS_ALL] : ["Mon", "Tue", "Wed", "Thu", "Fri"];
}

function renderDashboard() {
  if (!scheduleData) return;
  headerInstitution.textContent = scheduleData.institution || "Institution Name";
  headerTitle.textContent = scheduleData.title || "Class Schedule";
  headerMeta.textContent = scheduleData.meta || "";

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

  if (activeView === "grid") {
    gridView.classList.remove("hidden");
    cardsView.classList.add("hidden");
    const isMobileRail = window.innerWidth < 768 && activeDayFilter === "ALL";
    mobileDayRailHeader.classList.toggle("hidden", !isMobileRail);
    if (isMobileRail) {
      if (!visibleDays.includes(mobileDayKey)) mobileDayKey = visibleDays[0] || "Mon";
      mobActiveDayLabel.textContent = DAY_NAMES_FULL[mobileDayKey];
      renderWeeklyGrid(filtered, [mobileDayKey], conflictingIndices, false);
    } else {
      renderWeeklyGrid(filtered, visibleDays, conflictingIndices, true);
    }
  } else {
    mobileDayRailHeader.classList.add("hidden");
    gridView.classList.add("hidden");
    cardsView.classList.remove("hidden");
    renderTimelineDayCards(filtered, visibleDays, conflictingIndices);
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

function renderWeeklyGrid(classes, days, conflictingIndices, isDesktopWeek) {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  let minHour = 7, maxHour = 18;
  classes.forEach((c) => {
    minHour = Math.min(minHour, Math.floor(toMinutes(c.start) / 60));
    maxHour = Math.max(maxHour, Math.ceil(toMinutes(c.end) / 60));
  });
  if (maxHour <= minHour) maxHour = minHour + 8;

  const totalHeight = (maxHour - minHour) * PIXELS_PER_HOUR;
  gridView.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = `timetable-grid ${isDesktopWeek && days.length > 1 ? "desktop-week" : ""}`;
  grid.style.gridTemplateColumns = `72px repeat(${days.length}, minmax(105px, 1fr))`;

  grid.innerHTML += `<div class="grid-header-cell">Time</div>`;
  days.forEach((d) => {
    grid.innerHTML += `<div class="grid-header-cell ${d === todayKey ? "is-today" : ""}"><span>${d}</span>${d === todayKey ? `<span class="today-dot">Today</span>` : ""}</div>`;
  });

  const timeCol = document.createElement("div");
  timeCol.className = "time-column";
  for (let h = minHour; h < maxHour; h++) {
    const slot = document.createElement("div");
    slot.className = "time-slot-label";
    slot.textContent = format12h(`${String(h).padStart(2, "0")}:00`);
    timeCol.appendChild(slot);
  }
  grid.appendChild(timeCol);

  let blockAnimIdx = 0;
  days.forEach((day) => {
    const col = document.createElement("div");
    col.className = `day-column ${day === todayKey ? "is-today" : ""}`;
    col.style.height = `${totalHeight}px`;

    if (day === todayKey && nowMin >= minHour * 60 && nowMin <= maxHour * 60) {
      const line = document.createElement("div");
      line.className = "now-line";
      line.style.top = `${((nowMin - minHour * 60) / 60) * PIXELS_PER_HOUR}px`;
      col.appendChild(line);
    }

    const dayClasses = classes.filter((c) => c.days.includes(day));
    if (showFreeTime && dayClasses.length >= 2) {
      getFreePeriodsForDay(dayClasses).forEach((g) => {
        const top = ((g.startMin - minHour * 60) / 60) * PIXELS_PER_HOUR + 2;
        const height = (g.duration / 60) * PIXELS_PER_HOUR - 4;
        if (height >= 24) {
          const fb = document.createElement("div");
          fb.className = "free-block";
          fb.style.top = `${top}px`;
          fb.style.height = `${height}px`;
          fb.textContent = `Free · ${formatDuration(g.duration)}`;
          col.appendChild(fb);
        }
      });
    }

    layoutDayBlocks(dayClasses).forEach((cls) => {
      const top = ((cls.s - minHour * 60) / 60) * PIXELS_PER_HOUR + 2;
      const height = Math.max(32, ((cls.e - cls.s) / 60) * PIXELS_PER_HOUR - 4);
      const isConflict = conflictingIndices.has(cls.idx) && cls.totalCols > 1;
      const isOngoing = day === todayKey && nowMin >= cls.s && nowMin < cls.e;

      const block = document.createElement("div");
      block.className = `class-block ${isConflict ? "is-conflict" : ""} ${isOngoing ? "is-ongoing" : ""}`;
      block.style.top = `${top}px`;
      block.style.height = `${height}px`;
      block.style.background = cls.color || "#4338ca";
      block.style.animationDelay = `${Math.min(blockAnimIdx * 28, 280)}ms`;
      blockAnimIdx++;

      const wPct = 100 / cls.totalCols;
      block.style.left = `calc(${cls.col * wPct}% + 3px)`;
      block.style.width = `calc(${wPct}% - 6px)`;

      // Clear hierarchy: Course code bold -> Room secondary -> Title smaller
      block.innerHTML = `
        <div class="class-code-row">
          <span class="class-code">${escapeHtml(cls.code)}</span>
          ${isConflict ? `<span class="conflict-pill" title="Time conflict">!</span>` : ""}
        </div>
        ${cls.room && height >= 42 ? `<div class="class-room">${escapeHtml(cls.room)}</div>` : ""}
        ${cls.title && height >= 58 ? `<div class="class-title">${escapeHtml(cls.title)}</div>` : ""}
      `;
      block.title = `${cls.code}${cls.title ? " — " + cls.title : ""}\n${format12h(cls.start)} – ${format12h(cls.end)}${cls.room ? "\nRoom: " + cls.room : ""}\nTap to edit`;
      block.addEventListener("click", () => openClassModal(cls.idx));
      col.appendChild(block);
    });

    grid.appendChild(col);
  });
  gridView.appendChild(grid);
}

// Clean Timeline Day Cards (Time on Left, Class Card on Right, "Free · 1h 30m" Gaps)
function renderTimelineDayCards(classes, days, conflictingIndices) {
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
  cardsView.innerHTML = "";

  days.forEach((day) => {
    const dayClasses = classes.filter((c) => c.days.includes(day)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    const card = document.createElement("div");
    card.className = `day-card ${day === todayKey ? "is-today" : ""}`;
    card.innerHTML = `
      <div class="day-card-header">
        <h3>${DAY_NAMES_FULL[day]} ${day === todayKey ? `<span class="today-dot">Today</span>` : ""}</h3>
        <span class="day-card-count">${dayClasses.length ? `${dayClasses.length} class${dayClasses.length > 1 ? "es" : ""}` : "Free"}</span>
      </div>
    `;

    if (!dayClasses.length) {
      card.innerHTML += `<div class="empty-day-box">No classes scheduled — Free day</div>`;
    } else {
      dayClasses.forEach((cls, i) => {
        if (showFreeTime && i > 0) {
          const gap = toMinutes(cls.start) - toMinutes(dayClasses[i - 1].end);
          if (gap >= 30) {
            const g = document.createElement("div");
            g.className = "timeline-free-gap";
            g.textContent = `Free · ${formatDuration(gap)}`;
            card.appendChild(g);
          }
        }
        const isConflict = conflictingIndices.has(cls.idx);
        const row = document.createElement("div");
        row.className = "timeline-row";
        row.innerHTML = `
          <div class="timeline-time">
            <div>${format12h(cls.start)}</div>
            <div style="opacity:0.65;font-weight:500;">${format12h(cls.end)}</div>
          </div>
          <div class="timeline-card ${isConflict ? "is-conflict" : ""}" style="border-left-color:${cls.color || "#4338ca"};">
            <div class="timeline-card-code">
              <span>${escapeHtml(cls.code)}</span>
              ${isConflict ? `<span class="conflict-pill">!</span>` : ""}
            </div>
            ${cls.room ? `<div class="timeline-card-room">${escapeHtml(cls.room)}</div>` : ""}
            ${cls.title ? `<div class="timeline-card-title">${escapeHtml(cls.title)}</div>` : ""}
          </div>
        `;
        row.querySelector(".timeline-card").addEventListener("click", () => openClassModal(cls.idx));
        card.appendChild(row);
      });
    }
    cardsView.appendChild(card);
  });
}

// Mobile Swipe Left/Right on Vertical Time Rail
function setupMobileSwipeOnGrid() {
  let touchStartX = 0;
  gridView.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  gridView.addEventListener("touchend", (e) => {
    if (window.innerWidth >= 768 || activeView !== "grid" || activeDayFilter !== "ALL") return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 50) return;
    const days = getVisibleDays();
    const idx = days.indexOf(mobileDayKey);
    mobileDayKey = dx < 0 ? days[(idx + 1) % days.length] : days[(idx - 1 + days.length) % days.length];
    renderDashboard();
  }, { passive: true });
}

mobPrevDayBtn.addEventListener("click", () => {
  const days = getVisibleDays();
  mobileDayKey = days[(days.indexOf(mobileDayKey) - 1 + days.length) % days.length];
  renderDashboard();
});
mobNextDayBtn.addEventListener("click", () => {
  const days = getVisibleDays();
  mobileDayKey = days[(days.indexOf(mobileDayKey) + 1) % days.length];
  renderDashboard();
});
window.addEventListener("resize", () => { if (currentStep === "dashboard") renderDashboard(); });

// Editable header persistence
[headerInstitution, headerTitle, headerMeta].forEach((el) => {
  el.addEventListener("blur", () => {
    if (!scheduleData) return;
    scheduleData.institution = headerInstitution.textContent.trim();
    scheduleData.title = headerTitle.textContent.trim();
    scheduleData.meta = headerMeta.textContent.trim();
    saveSchedule();
  });
});

/* ==========================================================================
   TOOLBAR CONTROLS (SEGMENTED VIEW, TODAY JUMP, VIEW OPTIONS POPOVER)
   ========================================================================== */
viewGridBtn.addEventListener("click", () => {
  activeView = "grid";
  viewGridBtn.classList.add("active");
  viewCardsBtn.classList.remove("active");
  renderDashboard();
});
viewCardsBtn.addEventListener("click", () => {
  activeView = "cards";
  viewCardsBtn.classList.add("active");
  viewGridBtn.classList.remove("active");
  renderDashboard();
});

searchInput.addEventListener("input", (e) => { searchQuery = e.target.value; renderDashboard(); });

themeSelect.addEventListener("change", (e) => {
  captureArea.setAttribute("data-theme", e.target.value);
  localStorage.setItem("schedsnap_theme", e.target.value);
});

viewOptionsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = !viewOptionsPopover.classList.toggle("hidden");
  viewOptionsBtn.setAttribute("aria-expanded", String(isOpen));
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".popover-anchor")) {
    viewOptionsPopover.classList.add("hidden");
    viewOptionsBtn.setAttribute("aria-expanded", "false");
  }
});

toggleFreeTime.addEventListener("change", (e) => { showFreeTime = e.target.checked; renderDashboard(); });
toggleWeekends.addEventListener("change", (e) => { showWeekends = e.target.checked; renderDashboard(); });
bulkEditBtn.addEventListener("click", () => {
  draftSchedule = JSON.parse(JSON.stringify(scheduleData));
  navigateTo("review");
});
openDesignFromPopBtn.addEventListener("click", () => navigateTo("board"));

// Day Chips + "Today" Quick-Jump
dayFilterPills.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-day]");
  if (!btn) return;
  activeDayFilter = btn.dataset.day;
  dayFilterPills.querySelectorAll("[data-day]").forEach((b) => b.classList.toggle("active", b === btn));
  renderDashboard();
});

jumpTodayChip.addEventListener("click", () => {
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
  mobileDayKey = todayKey;
  activeDayFilter = todayKey;
  dayFilterPills.querySelectorAll("[data-day]").forEach((b) => b.classList.toggle("active", b.dataset.day === todayKey));
  renderDashboard();
  showToast(`Jumped to Today (${DAY_NAMES_FULL[todayKey]}).`, "info");
});

/* ==========================================================================
   ADD / EDIT / DELETE CLASS MODAL
   ========================================================================== */
function buildClassModalSwatches() {
  colorSwatches.innerHTML = "";
  SUBJECT_PALETTE.forEach((hex) => {
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
    selectClassColor(cls.color || SUBJECT_PALETTE[0]);
    deleteClassBtn.classList.remove("hidden");
  } else {
    modalTitle.textContent = "Add New Class";
    classForm.reset();
    cStart.value = "09:00";
    cEnd.value = "10:30";
    selectClassColor(SUBJECT_PALETTE[(scheduleData?.classes.length || 0) % SUBJECT_PALETTE.length]);
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
    if (shared.length && s < toMinutes(c.end) && toMinutes(c.start) < e) hits.push(`${c.code} (${shared.join(", ")})`);
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
fabAddClass.addEventListener("click", () => openClassModal(-1));
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
    start: cStart.value, end: cEnd.value, days, color: cColor.value || SUBJECT_PALETTE[0], uncertain: false
  };
  const idx = Number(editIndex.value);
  if (idx >= 0) scheduleData.classes[idx] = entry;
  else scheduleData.classes.push(entry);

  saveSchedule();
  classModal.classList.add("hidden");
  renderDashboard();
  showSuccessCheck(idx >= 0 ? "Class updated!" : "Class added!");
});

deleteClassBtn.addEventListener("click", () => {
  const idx = Number(editIndex.value);
  if (idx < 0) return;
  const code = scheduleData.classes[idx].code;
  openConfirm("Delete Class", `Remove "${code}" from your timetable?`, () => {
    scheduleData.classes.splice(idx, 1);
    saveSchedule();
    classModal.classList.add("hidden");
    renderDashboard();
    showToast(`Deleted ${code}.`, "info");
  });
});

/* ==========================================================================
   EXPORT (PNG, PDF, PRINT) + SUCCESS CHECKMARK
   ========================================================================== */
function openExportModal() {
  const radio = exportModal.querySelector(`input[name="exportLayout"][value="${activeView}"]`);
  if (radio) radio.checked = true;
  exportModal.classList.remove("hidden");
}
openExportBtn.addEventListener("click", openExportModal);
closeExportX.addEventListener("click", () => exportModal.classList.add("hidden"));

async function captureTimetableCanvas(layout) {
  const prevView = activeView;
  const prevFilter = activeDayFilter;
  activeView = layout;
  activeDayFilter = "ALL";
  renderDashboard();

  const prevOverflow = gridView.style.overflowX;
  const prevWidth = captureArea.style.width;
  if (layout === "grid") {
    mobileDayRailHeader.classList.add("hidden");
    renderWeeklyGrid(getFilteredClasses(), getVisibleDays(), detectConflicts(scheduleData.classes).conflictingIndices, true);
    gridView.style.overflowX = "visible";
    captureArea.style.width = `${Math.max(captureArea.scrollWidth, 1080)}px`;
  }

  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 140));

  const bgColor = getComputedStyle(captureArea).backgroundColor || "#ffffff";
  const canvas = await html2canvas(captureArea, { scale: 2, useCORS: true, backgroundColor: bgColor });

  gridView.style.overflowX = prevOverflow;
  captureArea.style.width = prevWidth;
  activeView = prevView;
  activeDayFilter = prevFilter;
  renderDashboard();
  return canvas;
}

exportPngBtn.addEventListener("click", async () => {
  const layout = exportModal.querySelector('input[name="exportLayout"]:checked')?.value || "grid";
  exportPngBtn.disabled = true;
  try {
    const canvas = await captureTimetableCanvas(layout);
    const link = document.createElement("a");
    link.download = `SchedSnap-${layout}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    link.remove();
    exportModal.classList.add("hidden");
    showSuccessCheck("PNG Exported!");
  } catch {
    showToast("Failed to export PNG. Please try again.", "error");
  } finally {
    exportPngBtn.disabled = false;
  }
});

exportPdfBtn.addEventListener("click", async () => {
  const layout = exportModal.querySelector('input[name="exportLayout"]:checked')?.value || "grid";
  exportPdfBtn.disabled = true;
  try {
    const canvas = await captureTimetableCanvas(layout);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: canvas.width >= canvas.height ? "landscape" : "portrait", unit: "pt", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 24;
    const ratio = Math.min((pw - m * 2) / canvas.width, (ph - m * 2) / canvas.height);
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", (pw - canvas.width * ratio) / 2, (ph - canvas.height * ratio) / 2, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`SchedSnap-${layout}.pdf`);
    exportModal.classList.add("hidden");
    showSuccessCheck("PDF Exported!");
  } catch {
    showToast("Failed to export PDF. Please try again.", "error");
  } finally {
    exportPdfBtn.disabled = false;
  }
});

exportPrintBtn.addEventListener("click", () => {
  const layout = exportModal.querySelector('input[name="exportLayout"]:checked')?.value || "grid";
  exportModal.classList.add("hidden");
  activeView = layout;
  renderDashboard();
  setTimeout(() => window.print(), 160);
});

[classModal, exportModal, confirmModal].forEach((m) => {
  m.addEventListener("click", (e) => { if (e.target === m) m.classList.add("hidden"); });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    classModal.classList.add("hidden");
    exportModal.classList.add("hidden");
    confirmModal.classList.add("hidden");
    viewOptionsPopover.classList.add("hidden");
  }
});

// Shared read-only bridge for Phase 5: Design Board
window.SchedSnapAPI = {
  getSchedule: () => scheduleData,
  navigateTo,
  showToast,
  formatTime: format12h
};

init();
