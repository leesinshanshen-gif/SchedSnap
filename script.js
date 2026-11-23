const PALETTE = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c",
  "#059669", "#0891b2", "#4f46e5", "#b45309"
];

let currentRotation = 0;
let uploadedImageEl = null;
let scheduleData = null;

// DOM Elements
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const keyStatus = document.getElementById("keyStatus");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const cameraInput = document.getElementById("cameraInput");
const sampleBtn = document.getElementById("sampleBtn");
const previewBox = document.getElementById("previewBox");
const previewImg = document.getElementById("previewImg");
const rotateBtn = document.getElementById("rotateBtn");
const clearImgBtn = document.getElementById("clearImgBtn");
const scanBtn = document.getElementById("scanBtn");
const scanStatus = document.getElementById("scanStatus");

const uploadSection = document.getElementById("uploadSection");
const studioSection = document.getElementById("studioSection");
const themeSelect = document.getElementById("themeSelect");
const viewGridBtn = document.getElementById("viewGridBtn");
const viewCardsBtn = document.getElementById("viewCardsBtn");
const addClassBtn = document.getElementById("addClassBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");

const headerInstitution = document.getElementById("headerInstitution");
const headerTitle = document.getElementById("headerTitle");
const headerMeta = document.getElementById("headerMeta");
const gridView = document.getElementById("gridView");
const cardsView = document.getElementById("cardsView");

const classModal = document.getElementById("classModal");
const modalTitle = document.getElementById("modalTitle");
const classForm = document.getElementById("classForm");
const editIndex = document.getElementById("editIndex");
const cCode = document.getElementById("cCode");
const cTitle = document.getElementById("cTitle");
const cRoom = document.getElementById("cRoom");
const cStart = document.getElementById("cStart");
const cEnd = document.getElementById("cEnd");
const deleteClassBtn = document.getElementById("deleteClassBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// --- INIT ---
const savedKey = localStorage.getItem("schedsnap_api_key");
if (savedKey) {
  apiKeyInput.value = savedKey;
  keyStatus.textContent = "Key saved";
}

const savedSchedule = localStorage.getItem("schedsnap_data");
if (savedSchedule) {
  scheduleData = JSON.parse(savedSchedule);
  showStudio();
}

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  localStorage.setItem("schedsnap_api_key", key);
  keyStatus.textContent = "Key saved";
});

// --- IMAGE UPLOAD & ROTATION ---
function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    currentRotation = 0;
    const img = new Image();
    img.onload = () => {
      uploadedImageEl = img;
      renderPreview();
      previewBox.classList.remove("hidden");
      scanStatus.textContent = "";
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
  const isRotated = currentRotation % 180 !== 0;

  // Limit max dimension to 1600px for fast uploads
  const scale = Math.min(1, 1600 / Math.max(uploadedImageEl.width, uploadedImageEl.height));
  const w = uploadedImageEl.width * scale;
  const h = uploadedImageEl.height * scale;

  canvas.width = isRotated ? h : w;
  canvas.height = isRotated ? w : h;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(uploadedImageEl, -w / 2, -h / 2, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { dataUrl, base64: dataUrl.split(",")[1] };
}

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
cameraInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

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

rotateBtn.addEventListener("click", () => {
  currentRotation = (currentRotation + 90) % 360;
  renderPreview();
});

clearImgBtn.addEventListener("click", () => {
  uploadedImageEl = null;
  previewBox.classList.add("hidden");
  fileInput.value = "";
  cameraInput.value = "";
});

// --- SCAN IMAGE WITH GEMINI API ---
scanBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    scanStatus.textContent = "Please paste and save your Gemini API key at the top right first.";
    return;
  }
  if (!uploadedImageEl) return;

  scanBtn.disabled = true;
  scanStatus.textContent = "Scanning schedule... please wait.";

  const prompt = `Extract the class schedule from this image and return ONLY valid JSON with this exact schema:
{
  "institution": "School or University name",
  "title": "Class Schedule",
  "meta": "Student Name • Section • Term",
  "classes": [
    {
      "code": "Course code e.g. ITE 012",
      "title": "Course title",
      "days": ["Mon", "Wed"],
      "start": "08:30",
      "end": "09:30",
      "room": "Room number"
    }
  ]
}
Use 24-hour HH:MM format for start/end and 3-letter days: Mon, Tue, Wed, Thu, Fri, Sat, Sun. Split classes that have different times on different days into separate items.`;

  try {
    const { base64 } = getRotatedBase64();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: base64 } }
          ]
        }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!res.ok) throw new Error(`API Error (${res.status}). Check your API key.`);
    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    scheduleData = JSON.parse(cleanText);

    saveAndRender();
    showStudio();
  } catch (err) {
    scanStatus.textContent = `Error: ${err.message}`;
  } finally {
    scanBtn.disabled = false;
  }
});

// --- SAMPLE SCHEDULE ---
sampleBtn.addEventListener("click", () => {
  scheduleData = {
    institution: "Technological Institute of the Philippines",
    title: "BS Computer Science — 2nd Semester",
    meta: "Section CS12S2 • SY 2026–2027",
    classes: [
      { code: "PE 002", title: "PATHFit 2", days: ["Tue"], start: "07:30", end: "09:30", room: "PE CENTER 2F" },
      { code: "ITE 012", title: "Computer Programming 2", days: ["Mon", "Wed"], start: "08:30", end: "09:30", room: "Q-5312" },
      { code: "MATH 015", title: "Symbolic Logic", days: ["Mon", "Wed", "Fri"], start: "09:30", end: "10:30", room: "Q-9401" },
      { code: "MATH 009CS", title: "Probability & Statistics", days: ["Tue"], start: "10:30", end: "12:30", room: "Q-5515" },
      { code: "MATH 009CS", title: "Probability & Statistics Lab", days: ["Thu"], start: "10:30", end: "13:30", room: "Q-5208" },
      { code: "GEC 003", title: "The Contemporary World", days: ["Mon", "Wed", "Fri"], start: "11:30", end: "12:30", room: "Q-9410" },
      { code: "GEC 006", title: "Art Appreciation", days: ["Mon", "Wed", "Fri"], start: "12:30", end: "13:30", room: "Q-9410" },
      { code: "MATH 007X", title: "Calculus 1", days: ["Tue", "Thu"], start: "13:30", end: "15:00", room: "Q-9401" },
      { code: "NSTP 002", title: "National Service Training 2", days: ["Wed"], start: "13:30", end: "16:30", room: "AVR BLDG 1,6" },
      { code: "ITE 012", title: "Computer Programming 2 Lab", days: ["Fri"], start: "13:30", end: "16:30", room: "Q-5313" }
    ]
  };
  saveAndRender();
  showStudio();
});

// --- RENDERING ---
function showStudio() {
  uploadSection.classList.add("hidden");
  studioSection.classList.remove("hidden");
  renderSchedule();
}

function saveAndRender() {
  localStorage.setItem("schedsnap_data", JSON.stringify(scheduleData));
  renderSchedule();
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function format12h(hhmm) {
  let [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getCourseColor(code) {
  const uniqueCodes = [...new Set(scheduleData.classes.map((c) => c.code))];
  const idx = uniqueCodes.indexOf(code);
  return PALETTE[idx % PALETTE.length];
}

function renderSchedule() {
  if (!scheduleData) return;

  headerInstitution.textContent = scheduleData.institution || "Institution";
  headerTitle.textContent = scheduleData.title || "Class Schedule";
  headerMeta.textContent = scheduleData.meta || "";

  const classes = scheduleData.classes || [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  if (classes.some((c) => c.days.includes("Sat"))) days.push("Sat");
  if (classes.some((c) => c.days.includes("Sun"))) days.push("Sun");

  let minHour = 7;
  let maxHour = 18;
  classes.forEach((c) => {
    minHour = Math.min(minHour, Math.floor(toMinutes(c.start) / 60));
    maxHour = Math.max(maxHour, Math.ceil(toMinutes(c.end) / 60));
  });

  // 1. Render Weekly Grid
  const totalHours = maxHour - minHour;
  gridView.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "timetable-grid";
  grid.style.gridTemplateColumns = `72px repeat(${days.length}, 1fr)`;

  // Top Header Row
  grid.innerHTML += `<div class="grid-header-cell">Time</div>`;
  days.forEach((d) => {
    grid.innerHTML += `<div class="grid-header-cell">${d}</div>`;
  });

  // Time Labels Column
  const timeCol = document.createElement("div");
  timeCol.className = "time-column";
  for (let h = minHour; h < maxHour; h++) {
    const label = document.createElement("div");
    label.className = "time-slot-label";
    label.textContent = format12h(`${h}:00`);
    timeCol.appendChild(label);
  }
  grid.appendChild(timeCol);

  // Day Columns
  days.forEach((day) => {
    const col = document.createElement("div");
    col.className = "day-column";
    col.style.height = `${totalHours * 60}px`;

    classes.forEach((cls, idx) => {
      if (!cls.days.includes(day)) return;
      const top = toMinutes(cls.start) - minHour * 60;
      const height = Math.max(30, toMinutes(cls.end) - toMinutes(cls.start));

      const block = document.createElement("div");
      block.className = "class-block";
      block.style.top = `${top}px`;
      block.style.height = `${height - 2}px`;
      block.style.background = getCourseColor(cls.code);
      block.innerHTML = `
        <div class="class-code">${cls.code}</div>
        <div class="class-title">${cls.title || ""}</div>
        <div class="class-meta">${format12h(cls.start)}–${format12h(cls.end)}${cls.room ? " • " + cls.room : ""}</div>
      `;
      block.addEventListener("click", () => openModal(idx));
      col.appendChild(block);
    });

    grid.appendChild(col);
  });
  gridView.appendChild(grid);

  // 2. Render Day Cards View
  cardsView.innerHTML = "";
  days.forEach((day) => {
    const dayClasses = classes
      .map((c, idx) => ({ ...c, idx }))
      .filter((c) => c.days.includes(day))
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `<h3>${day}</h3>`;

    if (dayClasses.length === 0) {
      card.innerHTML += `<p style="color:var(--muted);font-size:0.85rem;">No classes</p>`;
    } else {
      dayClasses.forEach((cls) => {
        const item = document.createElement("div");
        item.className = "card-item";
        item.style.borderLeftColor = getCourseColor(cls.code);
        item.innerHTML = `
          <strong>${cls.code}</strong> — ${cls.title || ""}<br/>
          <small style="color:var(--muted);">${format12h(cls.start)} – ${format12h(cls.end)} ${cls.room ? "• " + cls.room : ""}</small>
        `;
        item.addEventListener("click", () => openModal(cls.idx));
        card.appendChild(item);
      });
    }
    cardsView.appendChild(card);
  });
}

// Save edited header text
[headerInstitution, headerTitle, headerMeta].forEach((el) => {
  el.addEventListener("blur", () => {
    if (!scheduleData) return;
    scheduleData.institution = headerInstitution.textContent.trim();
    scheduleData.title = headerTitle.textContent.trim();
    scheduleData.meta = headerMeta.textContent.trim();
    localStorage.setItem("schedsnap_data", JSON.stringify(scheduleData));
  });
});

// --- TOOLBAR ACTIONS ---
themeSelect.addEventListener("change", (e) => {
  document.body.setAttribute("data-theme", e.target.value);
});

viewGridBtn.addEventListener("click", () => {
  gridView.classList.remove("hidden");
  cardsView.classList.add("hidden");
  viewGridBtn.classList.add("active");
  viewCardsBtn.classList.remove("active");
});

viewCardsBtn.addEventListener("click", () => {
  cardsView.classList.remove("hidden");
  gridView.classList.add("hidden");
  viewCardsBtn.classList.add("active");
  viewGridBtn.classList.remove("active");
});

downloadPngBtn.addEventListener("click", async () => {
  const area = document.getElementById("captureArea");
  const canvas = await html2canvas(area, { scale: 2, backgroundColor: null });
  const link = document.createElement("a");
  link.download = "SchedSnap-Timetable.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

printBtn.addEventListener("click", () => window.print());

resetBtn.addEventListener("click", () => {
  localStorage.removeItem("schedsnap_data");
  scheduleData = null;
  studioSection.classList.add("hidden");
  uploadSection.classList.remove("hidden");
});

// --- MODAL (ADD / EDIT / DELETE) ---
function openModal(index = -1) {
  editIndex.value = index;
  const boxes = document.querySelectorAll("#dayCheckboxes input");

  if (index >= 0) {
    const cls = scheduleData.classes[index];
    modalTitle.textContent = "Edit Class";
    cCode.value = cls.code;
    cTitle.value = cls.title || "";
    cRoom.value = cls.room || "";
    cStart.value = cls.start;
    cEnd.value = cls.end;
    boxes.forEach((b) => (b.checked = cls.days.includes(b.value)));
    deleteClassBtn.classList.remove("hidden");
  } else {
    modalTitle.textContent = "Add Class";
    classForm.reset();
    deleteClassBtn.classList.add("hidden");
  }
  classModal.classList.remove("hidden");
}

addClassBtn.addEventListener("click", () => openModal(-1));
closeModalBtn.addEventListener("click", () => classModal.classList.add("hidden"));

classForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const selectedDays = [...document.querySelectorAll("#dayCheckboxes input:checked")].map((b) => b.value);
  if (selectedDays.length === 0) return alert("Select at least one day.");

  const entry = {
    code: cCode.value.trim(),
    title: cTitle.value.trim(),
    room: cRoom.value.trim(),
    start: cStart.value,
    end: cEnd.value,
    days: selectedDays
  };

  const idx = Number(editIndex.value);
  if (idx >= 0) scheduleData.classes[idx] = entry;
  else scheduleData.classes.push(entry);

  classModal.classList.add("hidden");
  saveAndRender();
});

deleteClassBtn.addEventListener("click", () => {
  const idx = Number(editIndex.value);
  if (idx >= 0) {
    scheduleData.classes.splice(idx, 1);
    classModal.classList.add("hidden");
    saveAndRender();
  }
});