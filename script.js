/* ==========================================================================
   SchedSnap — Complete Frontend Logic
   Preserves Vercel /api/scan OCR integration + adds Review, Conflicts,
   Free Time, Live Indicators, Stats, Search/Filter, & PNG/PDF/Print Export
   ========================================================================== */

const DAYS_ALL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
};
const JS_DAY_TO_KEY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PIXELS_PER_HOUR = 64;

const SUBJECT_PALETTE = [
  "#4f46e5", // Indigo
  "#7c3aed", // Violet
  "#2563eb", // Blue
  "#0891b2", // Cyan
  "#059669", // Emerald
  "#d97706", // Amber
  "#ea580c", // Orange
  "#e11d48", // Rose
  "#db2777", // Pink
  "#0d9488"  // Teal
];

// Application State
let currentRotation = 0;
let uploadedImageEl = null;
let uploadedFileMeta = { name: "", size: 0 };
let draftSchedule = null;   // Used in Review step before confirming
let scheduleData = null;    // Confirmed active schedule
let activeView = "grid";    // "grid" | "cards"
let activeDayFilter = "ALL";
let searchQuery = "";
let showFreeTime = true;
let showWeekends = true;
let confirmCallback = null;

// DOM References
const brandLogo = document.getElementById("brandLogo");
const navUploadBtn = document.getElementById("navUploadBtn");
const navDashboardBtn = document.getElementById("navDashboardBtn");
const navExportBtn = document.getElementById("navExportBtn");

const uploadView = document.getElementById("uploadView");
const reviewView = document.getElementById("reviewView");
const dashboardView = document.getElementById("dashboardView");

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

// Review DOM
const reviewBackBtn = document.getElementById("reviewBackBtn");
const confirmScheduleBtn = document.getElementById("confirmScheduleBtn");
const reviewSummaryBanner = document.getElementById("reviewSummaryBanner");
const reviewSummaryTitle = document.getElementById("reviewSummaryTitle");
const reviewSummaryText = document.getElementById("reviewSummaryText");
const revInstitution = document.getElementById("revInstitution");
const revTitle = document.getElementById("revTitle");
const revMeta = document.getElementById("revMeta");
const reviewCount = document.getElementById("reviewCount");
const reviewAddRowBtn = document.getElementById("reviewAddRowBtn");
const reviewRowsContainer = document.getElementById("reviewRowsContainer");

// Dashboard DOM
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

const searchInput = document.getElementById("searchInput");
const viewGridBtn = document.getElementById("viewGridBtn");
const viewCardsBtn = document.getElementById("viewCardsBtn");
const themeSelect = document.getElementById("themeSelect");
const addClassBtn = document.getElementById("addClassBtn");
const openExportBtn = document.getElementById("openExportBtn");
const dayFilterPills = document.getElementById("dayFilterPills");
const toggleFreeTime = document.getElementById("toggleFreeTime");
const toggleWeekends = document.getElementById("toggleWeekends");
const editReviewBtn = document.getElementById("editReviewBtn");

const captureArea = document.getElementById("captureArea");
const headerInstitution = document.getElementById("headerInstitution");
const headerTitle = document.getElementById("headerTitle");
const headerMeta = document.getElementById("headerMeta");
const gridView = document.getElementById("gridView");
const cardsView = document.getElementById("cardsView");

// Class Modal DOM
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
const colorSwatches = document.getElementById("colorSwatches");
const modalValidationMsg = document.getElementById("modalValidationMsg");
const modalOverlapWarn = document.getElementById("modalOverlapWarn");
const deleteClassBtn = document.getElementById("deleteClassBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// Export Modal DOM
const exportModal = document.getElementById("exportModal");
const closeExportX = document.getElementById("closeExportX");
const exportPngBtn = document.getElementById("exportPngBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportPrintBtn = document.getElementById("exportPrintBtn");

// Confirm Modal DOM
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
  buildColorSwatches();

  const savedTheme = localStorage.getItem("schedsnap_theme");
  if (savedTheme) {
    themeSelect.value = savedTheme;
    captureArea.setAttribute("data-theme", savedTheme);
  }

  const saved = localStorage.getItem("schedsnap_data");
  if (saved) {
    try {
      scheduleData = normalizeSchedule(JSON.parse(saved));
      savedBanner.classList.remove("hidden");
      showView("dashboard");
      renderDashboard();
    } catch {
      localStorage.removeItem("schedsnap_data");
      showView("upload");
    }
  } else {
    showView("upload");
  }

  // Update live clock & current/upcoming class every 30s
  updateLiveStatus();
  setInterval(updateLiveStatus, 30000);
}

function showView(name) {
  uploadView.classList.add("hidden");
  reviewView.classList.add("hidden");
  dashboardView.classList.add("hidden");

  if (name === "upload") {
    uploadView.classList.remove("hidden");
    savedBanner.classList.toggle("hidden", !scheduleData);
  } else if (name === "review") {
    reviewView.classList.remove("hidden");
  } else if (name === "dashboard") {
    dashboardView.classList.remove("hidden");
  }

  const hasSched = Boolean(scheduleData);
  navDashboardBtn.classList.toggle("hidden", !hasSched || name === "dashboard");
  navExportBtn.classList.toggle("hidden", !hasSched || name !== "dashboard");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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
  }, 3000);
}

function openConfirm(title, message, onConfirm) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmCallback = onConfirm;
  confirmModal.classList.remove("hidden");
}

confirmCancelBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
  confirmCallback = null;
});

confirmOkBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
  if (typeof confirmCallback === "function") confirmCallback();
  confirmCallback = null;
});

/* ==========================================================================
   NAVIGATION EVENTS
   ========================================================================== */
brandLogo.addEventListener("click", () => showView("upload"));
navUploadBtn.addEventListener("click", () => showView("upload"));
navDashboardBtn.addEventListener("click", () => {
  if (scheduleData) {
    showView("dashboard");
    renderDashboard();
  }
});
openSavedBtn.addEventListener("click", () => {
  if (scheduleData) {
    showView("dashboard");
    renderDashboard();
  }
});
navExportBtn.addEventListener("click", () => openExportModal());
openExportBtn.addEventListener("click", () => openExportModal());

/* ==========================================================================
   UPLOAD, PREVIEW, & ROTATION
   ========================================================================== */
function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please upload a valid JPG, PNG, or WebP image.", "error");
    return;
  }

  uploadedFileMeta = {
    name: file.name || "Captured Schedule.jpg",
    size: file.size || 0
  };

  const reader = new FileReader();
  reader.onload = (e) => {
    currentRotation = 0;
    const img = new Image();
    img.onload = () => {
      uploadedImageEl = img;
      renderPreview();
      dropZone.classList.add("hidden");
      loadingPanel.classList.add("hidden");
      scanErrorPanel.classList.add("hidden");
      previewPanel.classList.remove("hidden");
      previewFileName.textContent = uploadedFileMeta.name;
      const kb = Math.round(uploadedFileMeta.size / 1024);
      previewFileMeta.textContent = `${img.width} × ${img.height}px • ${kb > 0 ? kb + " KB" : "Ready"}`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderPreview() {
  if (!uploadedImageEl) return;
  previewImg.src = getRotatedBase64().dataUrl;
}

function getRotatedBase64() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const rad = (currentRotation * Math.PI) / 180;
  const isRotated = Math.abs(currentRotation) % 180 !== 0;

  const scale = Math.min(1, 1800 / Math.max(uploadedImageEl.width, uploadedImageEl.height));
  const w = Math.round(uploadedImageEl.width * scale);
  const h = Math.round(uploadedImageEl.height * scale);

  canvas.width = isRotated ? h : w;
  canvas.height = isRotated ? w : h;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(uploadedImageEl, -w / 2, -h / 2, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
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

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

rotateLeftBtn.addEventListener("click", () => {
  currentRotation = (currentRotation - 90 + 360) % 360;
  renderPreview();
});
rotateRightBtn.addEventListener("click", () => {
  currentRotation = (currentRotation + 90) % 360;
  renderPreview();
});
removeImgBtn.addEventListener("click", resetUploadUI);
retryScanBtn.addEventListener("click", () => {
  scanErrorPanel.classList.add("hidden");
  if (uploadedImageEl) previewPanel.classList.remove("hidden");
  else dropZone.classList.remove("hidden");
});

/* ==========================================================================
   100% CLIENT-SIDE OCR (TESSERACT.JS — NO API KEY REQUIRED)
   ========================================================================== */
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

      // Grayscale + mild contrast boost for sharper printed-table OCR
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

  // Full / 2-3 letter patterns
  const patterns = [
    [/\b(?:mon|mo)\b/gi, "Mon"],
    [/\b(?:tue|tues|tu)\b/gi, "Tue"],
    [/\b(?:wed|we)\b/gi, "Wed"],
    [/\b(?:thu|thur|thurs|th)\b/gi, "Thu"],
    [/\b(?:fri|fr)\b/gi, "Fri"],
    [/\b(?:sat|sa)\b/gi, "Sat"],
    [/\b(?:sun|su)\b/gi, "Sun"]
  ];
  patterns.forEach(([re, day]) => {
    if (re.test(t)) found.add(day);
  });

  // Combined notations like MoWeFr, TuTh, MoWe, MWF, TTh, MW
  if (found.size === 0) {
    const compact = t.replace(/[^a-zA-Z]/g, "");
    if (/^(?:Mo|Tu|We|Th|Fr|Sa|Su)+$/i.test(compact)) {
      const pairs = compact.match(/Mo|Tu|We|Th|Fr|Sa|Su/gi) || [];
      const map = { mo: "Mon", tu: "Tue", we: "Wed", th: "Thu", fr: "Fri", sa: "Sat", su: "Sun" };
      pairs.forEach((p) => found.add(map[p.toLowerCase()]));
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
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 2);

  let institution = "My University";
  let title = "Class Schedule";
  let metaParts = [];

  // Try to detect header metadata
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const timeMatch = line.match(timeRangeRegex);
    if (!timeMatch) continue;

    // Infer AM/PM if only the second time has it
    const startAp = timeMatch[3] || (timeMatch[6] && parseInt(timeMatch[1], 10) <= parseInt(timeMatch[4], 10) ? timeMatch[6] : null);
    const endAp = timeMatch[6] || timeMatch[3] || null;

    let start = to24Hour(timeMatch[1], timeMatch[2], startAp);
    let end = to24Hour(timeMatch[4], timeMatch[5], endAp);

    const notes = [];
    let uncertain = false;

    if (!start || !end) {
      start = "08:00";
      end = "09:00";
      uncertain = true;
      notes.push("Verify class time");
    } else if (toMinutes(end) <= toMinutes(start)) {
      // Handle cases like 11:30 - 1:00 where PM was dropped
      const [eh, em] = end.split(":").map(Number);
      if (eh < 12) end = `${String(eh + 12).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
      if (toMinutes(end) <= toMinutes(start)) {
        uncertain = true;
        notes.push("End time needs correction");
      }
    }

    // Split text before and after time range
    const beforeTime = line.slice(0, timeMatch.index).trim();
    const afterTime = line.slice(timeMatch.index + timeMatch[0].length).trim();

    // Days
    const dayMatch = beforeTime.match(dayTokenRegex) || afterTime.match(dayTokenRegex);
    let days = dayMatch ? parseDaysToken(dayMatch[0]) : [];
    if (days.length === 0) {
      days = ["Mon"];
      uncertain = true;
      notes.push("Verify meeting days");
    }

    // Course code
    const codeMatch = beforeTime.match(courseCodeRegex);
    let code = codeMatch ? codeMatch[1].trim() : "";
    let courseTitle = "";

    if (code) {
      lastCode = code;
      let rest = beforeTime.replace(codeMatch[0], "").trim();
      if (dayMatch) rest = rest.replace(dayMatch[0], "").trim();
      rest = rest.replace(/\b\d+\.\d{2}\b/g, "").replace(/\b[A-Z]{2}\d{2}[A-Z]\d\b/g, "").trim();
      courseTitle = rest.replace(/^[-–|:.\s]+|[-–|:.\s]+$/g, "");
      if (courseTitle) lastTitle = courseTitle;
    } else if (lastCode) {
      // Continuation row (e.g., lab schedule on next line)
      code = lastCode;
      courseTitle = lastTitle ? `${lastTitle} (Session 2)` : "";
      uncertain = true;
      notes.push("Inherited course from previous line — verify");
    } else {
      code = `SUBJ ${extracted.length + 1}`;
      uncertain = true;
      notes.push("Course code not detected");
    }

    // Room (usually right after time)
    let room = afterTime
      .replace(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.*$/i, "")
      .replace(dayTokenRegex, "")
      .replace(/^[-–|:.\s]+|[-–|:.\s]+$/g, "")
      .trim();

    if (room.length > 24) room = room.slice(0, 24).trim();
    if (!room) {
      uncertain = true;
      notes.push("Missing room");
    }

    extracted.push({
      code,
      title: courseTitle,
      days,
      start,
      end,
      room,
      uncertain,
      note: notes.join(" • ")
    });
  }

  return {
    institution,
    title,
    meta: metaParts.length ? [...new Set(metaParts)].join(" • ") : "Scanned Schedule",
    classes: extracted
  };
}

scanBtn.addEventListener("click", async () => {
  if (!uploadedImageEl) return;

  if (typeof window.Tesseract === "undefined") {
    scanErrorMessage.textContent = "OCR engine failed to load. Please check your internet connection and refresh.";
    scanErrorPanel.classList.remove("hidden");
    return;
  }

  previewPanel.classList.add("hidden");
  scanErrorPanel.classList.add("hidden");
  loadingPanel.classList.remove("hidden");
  loadingTitle.textContent = "Preparing OCR engine…";
  loadingSubtitle.textContent = "Running 100% in your browser — no API key needed.";

  try {
    const canvas = await getPreprocessedOcrCanvas();

    const result = await window.Tesseract.recognize(canvas, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pct = Math.round((m.progress || 0) * 100);
          loadingTitle.textContent = `Reading schedule text… ${pct}%`;
          loadingSubtitle.textContent = "Extracting course codes, days, times, and rooms.";
        } else if (m.status) {
          loadingTitle.textContent = "Loading OCR engine…";
          loadingSubtitle.textContent = m.status.charAt(0).toUpperCase() + m.status.slice(1) + "…";
        }
      }
    });

    const rawText = result?.data?.text || "";
    const parsed = parseOcrScheduleText(rawText);

    loadingPanel.classList.add("hidden");
    previewPanel.classList.remove("hidden");

    if (!parsed.classes.length) {
      // Open review screen with 1 starter row so user is never stuck
      draftSchedule = normalizeSchedule({
        institution: parsed.institution,
        title: parsed.title,
        meta: parsed.meta,
        classes: [
          {
            code: "",
            title: "",
            days: ["Mon"],
            start: "08:00",
            end: "09:30",
            room: "",
            uncertain: true,
            note: "No time ranges auto-detected — enter your classes below or try a sharper upright photo."
          }
        ]
      });
      openReviewStep(draftSchedule);
      showToast("Couldn't auto-detect time rows. You can enter them manually or try a clearer photo.", "warning");
      return;
    }

    draftSchedule = normalizeSchedule(parsed);
    openReviewStep(draftSchedule);
    showToast(`Detected ${draftSchedule.classes.length} class entries. Please review highlighted items.`, "success");
  } catch (err) {
    loadingPanel.classList.add("hidden");
    scanErrorMessage.textContent = err.message || "Unable to scan the image. Please try a clearer, upright photo.";
    scanErrorPanel.classList.remove("hidden");
  }
});

// Sample Schedule & Manual Start
sampleBtn.addEventListener("click", () => {
  scheduleData = normalizeSchedule({
    institution: "Sample University",
    title: "BS Computer Science — Semester 1",
    meta: "Section A • Academic Year 2026–2027",
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
  showView("dashboard");
  renderDashboard();
  showToast("Sample schedule loaded.", "success");
});

manualStartBtn.addEventListener("click", () => {
  draftSchedule = normalizeSchedule({
    institution: "My University",
    title: "Class Schedule",
    meta: "Student Name • Section • Term",
    classes: [
      { code: "", title: "", days: ["Mon"], start: "09:00", end: "10:30", room: "", uncertain: false, note: "" }
    ]
  });
  openReviewStep(draftSchedule);
});

/* ==========================================================================
   DATA NORMALIZATION & COLOR ASSIGNMENT
   ========================================================================== */
function normalizeSchedule(data) {
  const colorMap = {};
  let colorIdx = 0;

  const classes = (data.classes || []).map((cls) => {
    const code = (cls.code || "").trim();
    let color = cls.color;
    if (!color) {
      const key = code.toUpperCase() || `ITEM_${colorIdx}`;
      if (!colorMap[key]) {
        colorMap[key] = SUBJECT_PALETTE[colorIdx % SUBJECT_PALETTE.length];
        colorIdx++;
      }
      color = colorMap[key];
    }
    const validDays = (Array.isArray(cls.days) ? cls.days : [])
      .filter((d) => DAYS_ALL.includes(d));

    return {
      code,
      title: (cls.title || "").trim(),
      days: validDays,
      start: isValidHHMM(cls.start) ? cls.start : "08:00",
      end: isValidHHMM(cls.end) ? cls.end : "09:00",
      room: (cls.room || "").trim(),
      color,
      uncertain: Boolean(cls.uncertain),
      note: (cls.note || "").trim()
    };
  });

  return {
    institution: (data.institution || "Institution Name").trim(),
    title: (data.title || "Class Schedule").trim(),
    meta: (data.meta || "").trim(),
    classes
  };
}

function isValidHHMM(str) {
  return typeof str === "string" && /^\d{2}:\d{2}$/.test(str);
}

function toMinutes(hhmm) {
  if (!isValidHHMM(hhmm)) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function format12h(hhmm) {
  if (!isValidHHMM(hhmm)) return "--:--";
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
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function saveSchedule() {
  if (!scheduleData) return;
  localStorage.setItem("schedsnap_data", JSON.stringify(scheduleData));
}

/* ==========================================================================
   STEP 2: EDITABLE OCR REVIEW INTERFACE
   ========================================================================== */
function getRowIssues(cls) {
  const issues = [];
  if (cls.uncertain) issues.push(cls.note || "Low OCR confidence — please verify");
  if (!cls.code) issues.push("Missing course code");
  if (!cls.days || cls.days.length === 0) issues.push("Select at least 1 day");
  if (toMinutes(cls.end) <= toMinutes(cls.start)) issues.push("End time must be after start time");
  if (!cls.room) issues.push("Missing room");
  return issues;
}

function openReviewStep(data) {
  draftSchedule = JSON.parse(JSON.stringify(data));
  revInstitution.value = draftSchedule.institution || "";
  revTitle.value = draftSchedule.title || "";
  revMeta.value = draftSchedule.meta || "";
  renderReviewRows();
  showView("review");
}

function renderReviewRows() {
  reviewRowsContainer.innerHTML = "";
  reviewCount.textContent = draftSchedule.classes.length;

  let flaggedCount = 0;

  draftSchedule.classes.forEach((cls, idx) => {
    const issues = getRowIssues(cls);
    const hasIssues = issues.length > 0;
    if (hasIssues) flaggedCount++;

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
        <span class="review-badge ${hasIssues ? "warn" : "ok"}">
          ${hasIssues ? `Needs review: ${escapeHtml(issues.join(" • "))}` : "Verified"}
        </span>
        <button type="button" class="btn btn-ghost btn-sm text-danger rev-del-btn" data-idx="${idx}">Remove</button>
      </div>
      <div class="review-fields-grid">
        <div class="form-field" style="margin:0;">
          <label>Course Code</label>
          <input type="text" class="rev-input" data-idx="${idx}" data-field="code" value="${escapeHtml(cls.code)}" placeholder="e.g. CS 101" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>Course Title</label>
          <input type="text" class="rev-input" data-idx="${idx}" data-field="title" value="${escapeHtml(cls.title)}" placeholder="Course name" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>Room</label>
          <input type="text" class="rev-input" data-idx="${idx}" data-field="room" value="${escapeHtml(cls.room)}" placeholder="e.g. Q-5312" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>Start</label>
          <input type="time" class="rev-input" data-idx="${idx}" data-field="start" value="${escapeHtml(cls.start)}" />
        </div>
        <div class="form-field" style="margin:0;">
          <label>End</label>
          <input type="time" class="rev-input" data-idx="${idx}" data-field="end" value="${escapeHtml(cls.end)}" />
        </div>
      </div>
      <div class="day-pill-selector">${dayPillsHtml}</div>
    `;

    reviewRowsContainer.appendChild(card);
  });

  if (flaggedCount > 0) {
    reviewSummaryBanner.classList.remove("hidden");
    reviewSummaryTitle.textContent = `${flaggedCount} ${flaggedCount === 1 ? "entry needs" : "entries need"} your review`;
    reviewSummaryText.textContent = "Check the highlighted amber rows for missing rooms, uncertain OCR text, or time ranges before generating.";
  } else {
    reviewSummaryBanner.classList.add("hidden");
  }

  // Bind inputs
  reviewRowsContainer.querySelectorAll(".rev-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const i = Number(e.target.dataset.idx);
      const field = e.target.dataset.field;
      draftSchedule.classes[i][field] = e.target.value.trim();
      draftSchedule.classes[i].uncertain = false;
      draftSchedule.classes[i].note = "";
      renderReviewRows();
    });
  });

  reviewRowsContainer.querySelectorAll(".day-pill input").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const i = Number(e.target.dataset.idx);
      const day = e.target.dataset.day;
      const days = new Set(draftSchedule.classes[i].days);
      if (e.target.checked) days.add(day);
      else days.delete(day);
      draftSchedule.classes[i].days = DAYS_ALL.filter((d) => days.has(d));
      renderReviewRows();
    });
  });

  reviewRowsContainer.querySelectorAll(".rev-del-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = Number(e.target.dataset.idx);
      draftSchedule.classes.splice(i, 1);
      renderReviewRows();
    });
  });
}

reviewAddRowBtn.addEventListener("click", () => {
  draftSchedule.classes.push({
    code: "",
    title: "",
    room: "",
    start: "09:00",
    end: "10:30",
    days: ["Mon"],
    color: SUBJECT_PALETTE[draftSchedule.classes.length % SUBJECT_PALETTE.length],
    uncertain: false,
    note: ""
  });
  renderReviewRows();
});

reviewBackBtn.addEventListener("click", () => showView("upload"));

confirmScheduleBtn.addEventListener("click", () => {
  draftSchedule.institution = revInstitution.value.trim() || "Institution Name";
  draftSchedule.title = revTitle.value.trim() || "Class Schedule";
  draftSchedule.meta = revMeta.value.trim();

  if (draftSchedule.classes.length === 0) {
    showToast("Add at least one class before generating the timetable.", "error");
    return;
  }

  for (let i = 0; i < draftSchedule.classes.length; i++) {
    const c = draftSchedule.classes[i];
    if (!c.code) {
      showToast(`Row ${i + 1}: Please enter a course code.`, "error");
      return;
    }
    if (!c.days.length) {
      showToast(`Row ${i + 1} (${c.code}): Select at least one day.`, "error");
      return;
    }
    if (toMinutes(c.end) <= toMinutes(c.start)) {
      showToast(`Row ${i + 1} (${c.code}): End time must be after start time.`, "error");
      return;
    }
    c.uncertain = false;
    c.note = "";
  }

  scheduleData = normalizeSchedule(draftSchedule);
  saveSchedule();
  showView("dashboard");
  renderDashboard();
  showToast("Timetable generated successfully!", "success");
});

editReviewBtn.addEventListener("click", () => {
  if (scheduleData) openReviewStep(scheduleData);
});

/* ==========================================================================
   CONFLICT DETECTION, FREE TIME, LIVE STATUS, & STATS
   ========================================================================== */
function detectConflicts(classes) {
  const conflicts = [];
  const conflictingIndices = new Set();

  DAYS_ALL.forEach((day) => {
    const dayItems = classes
      .map((c, idx) => ({ ...c, idx, s: toMinutes(c.start), e: toMinutes(c.end) }))
      .filter((c) => c.days.includes(day))
      .sort((a, b) => a.s - b.s);

    for (let i = 0; i < dayItems.length; i++) {
      for (let j = i + 1; j < dayItems.length; j++) {
        if (dayItems[j].s < dayItems[i].e) {
          conflictingIndices.add(dayItems[i].idx);
          conflictingIndices.add(dayItems[j].idx);
          conflicts.push({
            day,
            a: dayItems[i],
            b: dayItems[j]
          });
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
    const start = toMinutes(sorted[i].start);
    const end = toMinutes(sorted[i].end);
    if (start - maxEnd >= 30) {
      gaps.push({ startMin: maxEnd, endMin: start, duration: start - maxEnd });
    }
    if (end > maxEnd) maxEnd = end;
  }
  return gaps;
}

function updateLiveStatus() {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  liveClock.textContent = `${DAY_NAMES_FULL[todayKey]} • ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  if (!scheduleData || !scheduleData.classes.length) {
    currentStatusBadge.classList.remove("live-now");
    currentStatusLabel.textContent = "Current Status";
    currentClassBody.innerHTML = `<strong>No classes scheduled</strong><span>Upload or add classes to track live status.</span>`;
    upcomingCountdown.textContent = "—";
    upcomingClassBody.innerHTML = `<strong>No upcoming classes</strong><span>Your next class will appear here.</span>`;
    return;
  }

  const classes = scheduleData.classes;
  const todayClasses = classes
    .filter((c) => c.days.includes(todayKey))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  // Ongoing class
  const ongoing = todayClasses.find((c) => nowMin >= toMinutes(c.start) && nowMin < toMinutes(c.end));
  if (ongoing) {
    const minsLeft = toMinutes(ongoing.end) - nowMin;
    currentStatusBadge.classList.add("live-now");
    currentStatusLabel.textContent = "Ongoing Now";
    currentClassBody.innerHTML = `
      <strong>${escapeHtml(ongoing.code)}${ongoing.title ? " — " + escapeHtml(ongoing.title) : ""}</strong>
      <span>${format12h(ongoing.start)} – ${format12h(ongoing.end)}${ongoing.room ? " • " + escapeHtml(ongoing.room) : ""} (${formatDuration(minsLeft)} left)</span>
    `;
  } else {
    currentStatusBadge.classList.remove("live-now");
    currentStatusLabel.textContent = "Free Right Now";
    currentClassBody.innerHTML = `
      <strong>No ongoing class</strong>
      <span>${todayClasses.length ? `${todayClasses.length} class${todayClasses.length > 1 ? "es" : ""} scheduled today.` : "You have a free day today."}</span>
    `;
  }

  // Upcoming class (today later, or next day in next 7 days)
  let nextClass = null;
  let dayOffset = 0;

  for (let offset = 0; offset < 7; offset++) {
    const dKey = JS_DAY_TO_KEY[(now.getDay() + offset) % 7];
    const candidates = classes
      .filter((c) => c.days.includes(dKey))
      .filter((c) => offset > 0 || toMinutes(c.start) > nowMin)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    if (candidates.length > 0) {
      nextClass = { ...candidates[0], dayKey: dKey };
      dayOffset = offset;
      break;
    }
  }

  if (nextClass) {
    let whenText = "";
    if (dayOffset === 0) {
      const diff = toMinutes(nextClass.start) - nowMin;
      whenText = `In ${formatDuration(diff)}`;
    } else if (dayOffset === 1) {
      whenText = `Tomorrow • ${format12h(nextClass.start)}`;
    } else {
      whenText = `${DAY_NAMES_FULL[nextClass.dayKey]} • ${format12h(nextClass.start)}`;
    }
    upcomingCountdown.textContent = whenText;
    upcomingClassBody.innerHTML = `
      <strong>${escapeHtml(nextClass.code)}${nextClass.title ? " — " + escapeHtml(nextClass.title) : ""}</strong>
      <span>${format12h(nextClass.start)} – ${format12h(nextClass.end)}${nextClass.room ? " • " + escapeHtml(nextClass.room) : ""}</span>
    `;
  } else {
    upcomingCountdown.textContent = "—";
    upcomingClassBody.innerHTML = `<strong>No upcoming classes</strong><span>Schedule is empty.</span>`;
  }
}

function renderStats(classes) {
  const uniqueCodes = new Set(classes.map((c) => c.code.toUpperCase()).filter(Boolean));
  let totalSessions = 0;
  let totalMinutes = 0;
  const dayMinutes = {};
  DAYS_ALL.forEach((d) => (dayMinutes[d] = 0));

  classes.forEach((cls) => {
    const dur = Math.max(0, toMinutes(cls.end) - toMinutes(cls.start));
    cls.days.forEach((d) => {
      totalSessions++;
      totalMinutes += dur;
      dayMinutes[d] += dur;
    });
  });

  let busiestDay = "—";
  let maxMin = 0;
  const freeDaysList = [];

  DAYS_ALL.forEach((d) => {
    if (dayMinutes[d] > maxMin) {
      maxMin = dayMinutes[d];
      busiestDay = DAY_NAMES_FULL[d];
    }
    if (dayMinutes[d] === 0) freeDaysList.push(d);
  });

  statSubjects.textContent = uniqueCodes.size;
  statSessions.textContent = totalSessions;
  statHours.textContent = `${(totalMinutes / 60).toFixed(1).replace(/\.0$/, "")}h`;
  statBusiest.textContent = busiestDay;
  statBusiestSub.textContent = maxMin > 0 ? `${formatDuration(maxMin)} of classes` : "No classes";
  statFreeDays.textContent = freeDaysList.length;
  statFreeDaysSub.textContent = freeDaysList.length ? freeDaysList.join(", ") : "Classes every day";
}

/* ==========================================================================
   DASHBOARD RENDERING (WEEKLY GRID & DAY CARDS)
   ========================================================================== */
function getFilteredClasses() {
  if (!scheduleData) return [];
  const q = searchQuery.trim().toLowerCase();
  return scheduleData.classes
    .map((c, idx) => ({ ...c, idx }))
    .filter((c) => {
      if (activeDayFilter !== "ALL" && !c.days.includes(activeDayFilter)) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
      );
    });
}

function getVisibleDays() {
  if (activeDayFilter !== "ALL") return [activeDayFilter];
  if (showWeekends) return [...DAYS_ALL];
  return ["Mon", "Tue", "Wed", "Thu", "Fri"];
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
    conflictList.innerHTML = conflicts.map((cf) => `
      <li><strong>${DAY_NAMES_FULL[cf.day]}:</strong> ${escapeHtml(cf.a.code)} (${format12h(cf.a.start)}–${format12h(cf.a.end)}) overlaps with ${escapeHtml(cf.b.code)} (${format12h(cf.b.start)}–${format12h(cf.b.end)})</li>
    `).join("");
  } else {
    conflictBanner.classList.add("hidden");
  }

  const filtered = getFilteredClasses();
  const visibleDays = getVisibleDays();

  renderWeeklyGrid(filtered, visibleDays, conflictingIndices);
  renderDayCards(filtered, visibleDays, conflictingIndices);
}

// Compute side-by-side lane layout for overlapping blocks in a single day
function layoutDayBlocks(dayClasses) {
  const items = dayClasses
    .map((c) => ({ ...c, s: toMinutes(c.start), e: toMinutes(c.end), col: 0, totalCols: 1 }))
    .sort((a, b) => a.s - b.s || b.e - a.e);

  // Group into overlapping clusters
  const clusters = [];
  let currentCluster = [];
  let clusterEnd = -1;

  items.forEach((item) => {
    if (currentCluster.length === 0 || item.s < clusterEnd) {
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.e);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = item.e;
    }
  });
  if (currentCluster.length) clusters.push(currentCluster);

  // Assign lanes within each cluster
  clusters.forEach((cluster) => {
    const colEnds = [];
    cluster.forEach((item) => {
      let placed = false;
      for (let i = 0; i < colEnds.length; i++) {
        if (item.s >= colEnds[i]) {
          item.col = i;
          colEnds[i] = item.e;
          placed = true;
          break;
        }
      }
      if (!placed) {
        item.col = colEnds.length;
        colEnds.push(item.e);
      }
    });
    const total = colEnds.length;
    cluster.forEach((item) => (item.totalCols = total));
  });

  return items;
}

function renderWeeklyGrid(classes, days, conflictingIndices) {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  let minHour = 7;
  let maxHour = 18;
  classes.forEach((c) => {
    minHour = Math.min(minHour, Math.floor(toMinutes(c.start) / 60));
    maxHour = Math.max(maxHour, Math.ceil(toMinutes(c.end) / 60));
  });
  if (maxHour <= minHour) maxHour = minHour + 8;

  const totalHours = maxHour - minHour;
  const totalHeight = totalHours * PIXELS_PER_HOUR;

  gridView.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "timetable-grid";
  grid.style.gridTemplateColumns = `72px repeat(${days.length}, minmax(110px, 1fr))`;

  // Header row
  const corner = document.createElement("div");
  corner.className = "grid-header-cell";
  corner.textContent = "Time";
  grid.appendChild(corner);

  days.forEach((d) => {
    const cell = document.createElement("div");
    cell.className = `grid-header-cell ${d === todayKey ? "is-today" : ""}`;
    cell.innerHTML = `<span>${d}</span>${d === todayKey ? `<span class="today-dot">Today</span>` : ""}`;
    grid.appendChild(cell);
  });

  // Time labels column
  const timeCol = document.createElement("div");
  timeCol.className = "time-column";
  for (let h = minHour; h < maxHour; h++) {
    const slot = document.createElement("div");
    slot.className = "time-slot-label";
    slot.textContent = format12h(`${String(h).padStart(2, "0")}:00`);
    timeCol.appendChild(slot);
  }
  grid.appendChild(timeCol);

  // Day columns
  days.forEach((day) => {
    const col = document.createElement("div");
    col.className = `day-column ${day === todayKey ? "is-today" : ""}`;
    col.style.height = `${totalHeight}px`;

    // Current time indicator line
    if (day === todayKey && nowMin >= minHour * 60 && nowMin <= maxHour * 60) {
      const line = document.createElement("div");
      line.className = "now-line";
      line.style.top = `${((nowMin - minHour * 60) / 60) * PIXELS_PER_HOUR}px`;
      col.appendChild(line);
    }

    const dayClasses = classes.filter((c) => c.days.includes(day));

    // Free time blocks
    if (showFreeTime && dayClasses.length >= 2) {
      const gaps = getFreePeriodsForDay(dayClasses);
      gaps.forEach((g) => {
        const top = ((g.startMin - minHour * 60) / 60) * PIXELS_PER_HOUR + 2;
        const height = (g.duration / 60) * PIXELS_PER_HOUR - 4;
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

    // Class blocks with side-by-side overlap handling
    const laidOut = layoutDayBlocks(dayClasses);
    laidOut.forEach((cls) => {
      const top = ((cls.s - minHour * 60) / 60) * PIXELS_PER_HOUR + 1;
      const height = Math.max(32, ((cls.e - cls.s) / 60) * PIXELS_PER_HOUR - 3);
      const isConflict = conflictingIndices.has(cls.idx) && cls.totalCols > 1;
      const isOngoing = day === todayKey && nowMin >= cls.s && nowMin < cls.e;

      const block = document.createElement("div");
      block.className = `class-block ${isConflict ? "is-conflict" : ""} ${isOngoing ? "is-ongoing" : ""}`;
      block.style.top = `${top}px`;
      block.style.height = `${height}px`;
      block.style.background = cls.color || "#4f46e5";

      const widthPct = 100 / cls.totalCols;
      block.style.left = `calc(${cls.col * widthPct}% + 3px)`;
      block.style.width = `calc(${widthPct}% - 6px)`;

      block.innerHTML = `
        <div class="class-code-row">
          <span class="class-code">${escapeHtml(cls.code)}</span>
          ${isConflict ? `<span class="conflict-pill">!</span>` : ""}
        </div>
        ${cls.title ? `<div class="class-title">${escapeHtml(cls.title)}</div>` : ""}
        <div class="class-meta">${format12h(cls.start)}–${format12h(cls.end)}${cls.room ? " • " + escapeHtml(cls.room) : ""}</div>
      `;
      block.title = `${cls.code}${cls.title ? " — " + cls.title : ""}\n${format12h(cls.start)} – ${format12h(cls.end)}${cls.room ? "\nRoom: " + cls.room : ""}\nClick to edit`;
      block.addEventListener("click", () => openClassModal(cls.idx));
      col.appendChild(block);
    });

    grid.appendChild(col);
  });

  gridView.appendChild(grid);
}

function renderDayCards(classes, days, conflictingIndices) {
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
  cardsView.innerHTML = "";

  days.forEach((day) => {
    const dayClasses = classes
      .filter((c) => c.days.includes(day))
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    const card = document.createElement("div");
    card.className = `day-card ${day === todayKey ? "is-today" : ""}`;
    card.innerHTML = `
      <div class="day-card-header">
        <h3>${DAY_NAMES_FULL[day]} ${day === todayKey ? `<span class="today-dot">Today</span>` : ""}</h3>
        <span class="day-card-count">${dayClasses.length ? `${dayClasses.length} class${dayClasses.length > 1 ? "es" : ""}` : "Free"}</span>
      </div>
    `;

    if (dayClasses.length === 0) {
      card.innerHTML += `<div class="empty-day-box">No classes scheduled — Free day</div>`;
    } else {
      dayClasses.forEach((cls, i) => {
        if (showFreeTime && i > 0) {
          const prevEnd = toMinutes(dayClasses[i - 1].end);
          const curStart = toMinutes(cls.start);
          if (curStart - prevEnd >= 30) {
            const gap = document.createElement("div");
            gap.className = "card-free-gap";
            gap.textContent = `Free period • ${formatDuration(curStart - prevEnd)}`;
            card.appendChild(gap);
          }
        }

        const isConflict = conflictingIndices.has(cls.idx);
        const item = document.createElement("div");
        item.className = `card-class-item ${isConflict ? "is-conflict" : ""}`;
        item.style.borderLeftColor = cls.color || "#4f46e5";
        item.innerHTML = `
          <div class="card-item-head">
            <span class="card-item-code">${escapeHtml(cls.code)}</span>
            ${isConflict ? `<span class="conflict-pill">Conflict</span>` : ""}
          </div>
          ${cls.title ? `<div class="card-item-title">${escapeHtml(cls.title)}</div>` : ""}
          <div class="card-item-meta">${format12h(cls.start)} – ${format12h(cls.end)}${cls.room ? " • " + escapeHtml(cls.room) : ""}</div>
        `;
        item.addEventListener("click", () => openClassModal(cls.idx));
        card.appendChild(item);
      });
    }

    cardsView.appendChild(card);
  });
}

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
   TOOLBAR CONTROLS (SEARCH, FILTER, VIEW, THEME)
   ========================================================================== */
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderDashboard();
});

dayFilterPills.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill-btn");
  if (!btn) return;
  activeDayFilter = btn.dataset.day;
  dayFilterPills.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderDashboard();
});

function setTimetableView(view) {
  activeView = view;
  gridView.classList.toggle("hidden", view !== "grid");
  cardsView.classList.toggle("hidden", view !== "cards");
  viewGridBtn.classList.toggle("active", view === "grid");
  viewCardsBtn.classList.toggle("active", view === "cards");
}

viewGridBtn.addEventListener("click", () => setTimetableView("grid"));
viewCardsBtn.addEventListener("click", () => setTimetableView("cards"));

themeSelect.addEventListener("change", (e) => {
  captureArea.setAttribute("data-theme", e.target.value);
  localStorage.setItem("schedsnap_theme", e.target.value);
});

toggleFreeTime.addEventListener("change", (e) => {
  showFreeTime = e.target.checked;
  renderDashboard();
});

toggleWeekends.addEventListener("change", (e) => {
  showWeekends = e.target.checked;
  renderDashboard();
});

/* ==========================================================================
   ADD / EDIT / DELETE CLASS MODAL WITH LIVE VALIDATION
   ========================================================================== */
function buildColorSwatches() {
  colorSwatches.innerHTML = "";
  SUBJECT_PALETTE.forEach((hex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-swatch";
    btn.style.background = hex;
    btn.dataset.color = hex;
    btn.title = hex;
    btn.addEventListener("click", () => selectColorSwatch(hex));
    colorSwatches.appendChild(btn);
  });
}

function selectColorSwatch(hex) {
  cColor.value = hex;
  colorSwatches.querySelectorAll(".color-swatch").forEach((b) => {
    b.classList.toggle("selected", b.dataset.color.toLowerCase() === hex.toLowerCase());
  });
}

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
    selectColorSwatch(cls.color || SUBJECT_PALETTE[0]);
    deleteClassBtn.classList.remove("hidden");
  } else {
    modalTitle.textContent = "Add New Class";
    classForm.reset();
    cStart.value = "09:00";
    cEnd.value = "10:30";
    selectColorSwatch(SUBJECT_PALETTE[(scheduleData?.classes.length || 0) % SUBJECT_PALETTE.length]);
    deleteClassBtn.classList.add("hidden");
  }

  classModal.classList.remove("hidden");
  checkModalLiveOverlap();
}

function closeClassModal() {
  classModal.classList.add("hidden");
}

function checkModalLiveOverlap() {
  if (!scheduleData) return;
  const idx = Number(editIndex.value);
  const start = toMinutes(cStart.value);
  const end = toMinutes(cEnd.value);
  const selectedDays = [...document.querySelectorAll("#dayCheckboxes input:checked")].map((b) => b.value);

  if (!selectedDays.length || end <= start) {
    modalOverlapWarn.classList.add("hidden");
    return;
  }

  const overlaps = [];
  scheduleData.classes.forEach((cls, i) => {
    if (i === idx) return;
    const sharedDays = cls.days.filter((d) => selectedDays.includes(d));
    if (!sharedDays.length) return;
    const os = toMinutes(cls.start);
    const oe = toMinutes(cls.end);
    if (start < oe && os < end) {
      overlaps.push(`${cls.code} (${sharedDays.join(", ")} ${format12h(cls.start)}–${format12h(cls.end)})`);
    }
  });

  if (overlaps.length > 0) {
    modalOverlapWarn.textContent = `Heads up: This time overlaps with ${overlaps.join("; ")}.`;
    modalOverlapWarn.classList.remove("hidden");
  } else {
    modalOverlapWarn.classList.add("hidden");
  }
}

[cStart, cEnd].forEach((el) => el.addEventListener("change", checkModalLiveOverlap));
document.querySelectorAll("#dayCheckboxes input").forEach((cb) => cb.addEventListener("change", checkModalLiveOverlap));

addClassBtn.addEventListener("click", () => openClassModal(-1));
closeModalBtn.addEventListener("click", closeClassModal);
closeModalX.addEventListener("click", closeClassModal);

classForm.addEventListener("submit", (e) => {
  e.preventDefault();
  modalValidationMsg.classList.add("hidden");

  const code = cCode.value.trim();
  const selectedDays = [...document.querySelectorAll("#dayCheckboxes input:checked")].map((b) => b.value);

  if (!code) {
    modalValidationMsg.textContent = "Please enter a course code.";
    modalValidationMsg.classList.remove("hidden");
    return;
  }
  if (selectedDays.length === 0) {
    modalValidationMsg.textContent = "Please select at least one meeting day.";
    modalValidationMsg.classList.remove("hidden");
    return;
  }
  if (!cStart.value || !cEnd.value || toMinutes(cEnd.value) <= toMinutes(cStart.value)) {
    modalValidationMsg.textContent = "End time must be later than start time.";
    modalValidationMsg.classList.remove("hidden");
    return;
  }

  const entry = {
    code,
    title: cTitle.value.trim(),
    room: cRoom.value.trim(),
    start: cStart.value,
    end: cEnd.value,
    days: selectedDays,
    color: cColor.value || "#4f46e5",
    uncertain: false,
    note: ""
  };

  const idx = Number(editIndex.value);
  if (idx >= 0) {
    scheduleData.classes[idx] = entry;
    showToast(`Updated ${code}.`, "success");
  } else {
    scheduleData.classes.push(entry);
    showToast(`Added ${code} to your schedule.`, "success");
  }

  saveSchedule();
  closeClassModal();
  renderDashboard();
});

deleteClassBtn.addEventListener("click", () => {
  const idx = Number(editIndex.value);
  if (idx < 0) return;
  const cls = scheduleData.classes[idx];
  openConfirm(
    "Delete Class",
    `Are you sure you want to remove "${cls.code}${cls.title ? " — " + cls.title : ""}" from your timetable?`,
    () => {
      scheduleData.classes.splice(idx, 1);
      saveSchedule();
      closeClassModal();
      renderDashboard();
      showToast(`Deleted ${cls.code}.`, "info");
    }
  );
});

/* ==========================================================================
   EXPORT (HIGH-RES PNG, PDF, & PRINT) WITH LAYOUT SELECTION
   ========================================================================== */
function openExportModal() {
  const radio = exportModal.querySelector(`input[name="exportLayout"][value="${activeView}"]`);
  if (radio) radio.checked = true;
  exportModal.classList.remove("hidden");
}

function closeExportModal() {
  exportModal.classList.add("hidden");
}

closeExportX.addEventListener("click", closeExportModal);

function getChosenExportLayout() {
  const checked = exportModal.querySelector('input[name="exportLayout"]:checked');
  return checked ? checked.value : activeView;
}

async function captureTimetableCanvas(layout) {
  const prevView = activeView;
  setTimetableView(layout);

  // Temporarily expand horizontal scroll so nothing is clipped in PNG/PDF
  const prevOverflow = gridView.style.overflowX;
  const prevWidth = captureArea.style.width;
  if (layout === "grid") {
    gridView.style.overflowX = "visible";
    captureArea.style.width = `${Math.max(captureArea.scrollWidth, 1080)}px`;
  }

  await new Promise((r) => setTimeout(r, 120));

  const bgColor = getComputedStyle(captureArea).backgroundColor || "#ffffff";
  const canvas = await html2canvas(captureArea, {
    scale: 2,
    useCORS: true,
    backgroundColor: bgColor
  });

  // Restore original layout & styles
  gridView.style.overflowX = prevOverflow;
  captureArea.style.width = prevWidth;
  setTimetableView(prevView);

  return canvas;
}

exportPngBtn.addEventListener("click", async () => {
  const layout = getChosenExportLayout();
  exportPngBtn.disabled = true;
  try {
    const canvas = await captureTimetableCanvas(layout);
    const link = document.createElement("a");
    link.download = `SchedSnap-${layout === "grid" ? "Weekly-Grid" : "Day-Cards"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    closeExportModal();
    showToast("High-resolution PNG downloaded!", "success");
  } catch (err) {
    showToast("Failed to export PNG. Please try again.", "error");
  } finally {
    exportPngBtn.disabled = false;
  }
});

exportPdfBtn.addEventListener("click", async () => {
  const layout = getChosenExportLayout();
  exportPdfBtn.disabled = true;
  try {
    const canvas = await captureTimetableCanvas(layout);
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const isLandscape = canvas.width >= canvas.height;
    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 28;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const renderW = canvas.width * ratio;
    const renderH = canvas.height * ratio;
    const x = (pageW - renderW) / 2;
    const y = (pageH - renderH) / 2;

    pdf.addImage(imgData, "PNG", x, y, renderW, renderH);
    pdf.save(`SchedSnap-${layout === "grid" ? "Weekly-Grid" : "Day-Cards"}.pdf`);
    closeExportModal();
    showToast("PDF timetable downloaded!", "success");
  } catch (err) {
    showToast("Failed to export PDF. Please try again.", "error");
  } finally {
    exportPdfBtn.disabled = false;
  }
});

exportPrintBtn.addEventListener("click", () => {
  const layout = getChosenExportLayout();
  closeExportModal();
  setTimetableView(layout);
  setTimeout(() => window.print(), 150);
});

// Close modals on backdrop click or Escape key
[classModal, exportModal, confirmModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    classModal.classList.add("hidden");
    exportModal.classList.add("hidden");
    confirmModal.classList.add("hidden");
  }
});

init();
