/* ==========================================================================
   SchedSnap — Design Board (Phone Wallpaper Builder)
   Reads live schedule from window.SchedSnapAPI without modifying existing data.
   ========================================================================== */
(function () {
  "use strict";

  const STORAGE_KEY_SAVED = "schedsnap_design_board_saved_v1";
  const STORAGE_KEY_ACTIVE = "schedsnap_design_board_active_v1";

  const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_FULL = {
    Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
    Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
  };
  const JS_DAY_TO_KEY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Device resolution presets (width x height in px)
  const DEVICE_PRESETS = [
    { id: "auto", label: "Auto-Detected Device", w: 1179, h: 2556 },
    { id: "iphone16", label: "iPhone 15 / 16 (1179×2556)", w: 1179, h: 2556 },
    { id: "iphone16pm", label: "iPhone 15 / 16 Pro Max (1290×2796)", w: 1290, h: 2796 },
    { id: "iphonese", label: "iPhone SE (750×1334)", w: 750, h: 1334 },
    { id: "galaxys", label: "Samsung Galaxy S Series (1080×2340)", w: 1080, h: 2340 },
    { id: "pixel", label: "Google Pixel Series (1080×2400)", w: 1080, h: 2400 },
    { id: "custom", label: "Custom Size", w: 1080, h: 1920 }
  ];

  // Palette overrides (or use each subject's own color)
  const WALLPAPER_PALETTES = {
    subject: { label: "Subject Colors", colors: null },
    pastel: { label: "Pastel", colors: ["#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#fb923c"] },
    sage: { label: "Sage & Earth", colors: ["#6b705c", "#a5a58d", "#b7b7a4", "#cb997e", "#ddbea9", "#8c7a6b"] },
    minimal: { label: "Minimalist", colors: ["#1e293b", "#334155", "#475569", "#64748b", "#0f172a", "#4b5563"] },
    vibrant: { label: "Vibrant", colors: ["#4f46e5", "#ec4899", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"] },
    gold: { label: "Gold & Slate", colors: ["#d97706", "#ca8a04", "#b45309", "#f59e0b", "#a16207", "#eab308"] }
  };

  // 8 Ready-Made Templates: includes the 5 existing SchedSnap themes + 3 aesthetic wallpaper presets
  const WALLPAPER_TEMPLATES = [
    {
      id: "modern-indigo",
      name: "Modern Indigo",
      tag: "SchedSnap Theme",
      state: {
        bgType: "gradient", bgColor: "#eef2ff", gradStart: "#e0e7ff", gradEnd: "#f5f3ff", gradAngle: 145,
        pattern: "dots", textColor: "#0f172a", panelBg: "#ffffff", accentColor: "#4f46e5", accentFg: "#ffffff",
        blockStyle: "rounded", palette: "subject", fontFamily: "'Plus Jakarta Sans', sans-serif",
        blockOpacity: 92, radius: 10, osDarkText: true
      }
    },
    {
      id: "minimalist-slate",
      name: "Minimalist Slate",
      tag: "SchedSnap Theme",
      state: {
        bgType: "solid", bgColor: "#f8fafc", gradStart: "#f8fafc", gradEnd: "#e2e8f0", gradAngle: 180,
        pattern: "none", textColor: "#0f172a", panelBg: "#ffffff", accentColor: "#18181b", accentFg: "#ffffff",
        blockStyle: "outlined", palette: "minimal", fontFamily: "'Inter', sans-serif",
        blockOpacity: 95, radius: 6, osDarkText: true
      }
    },
    {
      id: "soft-pastel",
      name: "Soft Pastel",
      tag: "SchedSnap Theme",
      state: {
        bgType: "gradient", bgColor: "#fff1f2", gradStart: "#ffe4e6", gradEnd: "#ede9fe", gradAngle: 135,
        pattern: "botanical", textColor: "#3f2e3e", panelBg: "#ffffff", accentColor: "#db2777", accentFg: "#ffffff",
        blockStyle: "glass", palette: "pastel", fontFamily: "'Nunito', sans-serif",
        blockOpacity: 82, radius: 14, osDarkText: true
      }
    },
    {
      id: "university-gold",
      name: "University Gold",
      tag: "SchedSnap Theme",
      state: {
        bgType: "gradient", bgColor: "#18181b", gradStart: "#18181b", gradEnd: "#27272a", gradAngle: 160,
        pattern: "diagonal", textColor: "#fafafa", panelBg: "#27272a", accentColor: "#facc15", accentFg: "#18181b",
        blockStyle: "rounded", palette: "gold", fontFamily: "'Poppins', sans-serif",
        blockOpacity: 90, radius: 10, osDarkText: false
      }
    },
    {
      id: "dark-dev",
      name: "Dark Dev",
      tag: "SchedSnap Theme",
      state: {
        bgType: "solid", bgColor: "#0d1117", gradStart: "#0d1117", gradEnd: "#161b22", gradAngle: 150,
        pattern: "grid", textColor: "#e6edf3", panelBg: "#161b22", accentColor: "#58a6ff", accentFg: "#0d1117",
        blockStyle: "glass", palette: "vibrant", fontFamily: "'JetBrains Mono', monospace",
        blockOpacity: 85, radius: 8, osDarkText: false
      }
    },
    {
      id: "sage-editorial",
      name: "Sage Editorial",
      tag: "Aesthetic",
      state: {
        bgType: "gradient", bgColor: "#dcd7cc", gradStart: "#e4e0d5", gradEnd: "#c8c2b3", gradAngle: 150,
        pattern: "botanical", textColor: "#3d3b32", panelBg: "#f5f2ea", accentColor: "#545243", accentFg: "#ffffff",
        blockStyle: "glass", palette: "sage", fontFamily: "'Playfair Display', serif",
        blockOpacity: 80, radius: 14, osDarkText: true
      }
    },
    {
      id: "espresso-glass",
      name: "Espresso Glass",
      tag: "Glassmorphism",
      state: {
        bgType: "gradient", bgColor: "#2c1e16", gradStart: "#3b261b", gradEnd: "#1a110c", gradAngle: 140,
        pattern: "botanical", textColor: "#f5ebe0", panelBg: "#5c4033", accentColor: "#d4a373", accentFg: "#1a110c",
        blockStyle: "glass", palette: "sage", fontFamily: "'Plus Jakarta Sans', sans-serif",
        blockOpacity: 62, radius: 16, osDarkText: false
      }
    },
    {
      id: "sky-minimal",
      name: "Sky Minimal",
      tag: "Clean",
      state: {
        bgType: "gradient", bgColor: "#e0f2fe", gradStart: "#e0f2fe", gradEnd: "#f0fdf4", gradAngle: 165,
        pattern: "none", textColor: "#0c4a6e", panelBg: "#ffffff", accentColor: "#0284c7", accentFg: "#ffffff",
        blockStyle: "rounded", palette: "subject", fontFamily: "'Inter', sans-serif",
        blockOpacity: 88, radius: 12, osDarkText: true
      }
    }
  ];

  // Clean SVG Stickers / Icons (no blurry emoji scaling)
  const STICKERS = [
    { id: "heart", label: "Heart", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.33-8.28C.68 9.35 2.42 5 6.3 5c2.1 0 3.7 1.15 4.7 2.6C12 6.15 13.6 5 15.7 5c3.88 0 5.62 4.35 3.63 7.72C19 16.65 12 21 12 21z"/></svg>` },
    { id: "star", label: "Star", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
    { id: "sparkle", label: "Sparkle", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2z"/></svg>` },
    { id: "book", label: "Book", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
    { id: "grad", label: "Grad Cap", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>` },
    { id: "coffee", label: "Coffee", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>` },
    { id: "cal", label: "Calendar", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
    { id: "pin", label: "Pin", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>` }
  ];

  // Detect approximate physical screen resolution of the user's phone
  function detectDeviceResolution() {
    const dpr = window.devicePixelRatio || 2;
    const sw = Math.round(Math.min(window.screen.width, window.screen.height) * dpr);
    const sh = Math.round(Math.max(window.screen.width, window.screen.height) * dpr);
    // Use detected resolution only if it looks like a portrait phone aspect ratio
    if (sw >= 640 && sw <= 1600 && sh / sw >= 1.5 && sh / sw <= 2.4) {
      return { w: sw, h: sh };
    }
    return { w: 1179, h: 2556 };
  }

  function createDefaultBoardState() {
    const detected = detectDeviceResolution();
    return {
      templateId: "sage-editorial",
      screenMode: "lock", // "lock" | "home"
      showOverlay: true,
      showSafeZones: false,
      layout: "week", // "today" | "week" | "daylist" | "next3" | "minimal"
      bgType: "gradient", // "solid" | "gradient" | "photo"
      bgColor: "#dcd7cc",
      gradStart: "#e4e0d5",
      gradEnd: "#c8c2b3",
      gradAngle: 150,
      photoDataUrl: "",
      photoBlur: 4,
      photoDim: 15,
      pattern: "botanical",
      textColor: "#3d3b32",
      panelBg: "#f5f2ea",
      accentColor: "#545243",
      accentFg: "#ffffff",
      osDarkText: true,
      palette: "sage",
      blockStyle: "glass", // "rounded" | "sharp" | "outlined" | "glass"
      fontFamily: "'Playfair Display', serif",
      fontSize: 10,
      fontBold: false,
      fontItalic: false,
      spacing: 4,
      radius: 12,
      blockOpacity: 82,
      showRoom: true,
      showTime: true,
      showTitle: false,
      showWeekends: false,
      showFreePeriods: true,
      deviceId: "auto",
      exportW: detected.w,
      exportH: detected.h,
      // Main schedule widget position & width in % of canvas (starts safely below clock & above bottom icons)
      widgetBox: { x: 5, y: 29, w: 90 },
      // Extra user-added custom text & sticker elements
      extras: []
    };
  }

  let boardState = createDefaultBoardState();
  let savedBoards = [];
  let undoStack = [];
  let undoIdx = -1;
  let selectedId = null; // "widget" or extra.id
  let dragCtx = null;

  // DOM container reference
  let rootEl = null;

  /* ========================================================================
     UTILITIES
     ======================================================================== */
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hexToRgba(hex, alpha01) {
    const clean = (hex || "#ffffff").replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const num = parseInt(full, 16);
    if (isNaN(num)) return `rgba(255,255,255,${alpha01})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha01})`;
  }

  function isLightHex(hex) {
    const clean = (hex || "#ffffff").replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const num = parseInt(full, 16);
    if (isNaN(num)) return true;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 155;
  }

  function toMin(hhmm) {
    if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return 0;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function fmtTime(hhmm) {
    if (window.SchedSnapAPI && typeof window.SchedSnapAPI.formatTime === "function") {
      return window.SchedSnapAPI.formatTime(hhmm);
    }
    if (!hhmm) return "";
    let [h, m] = hhmm.split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  }

  function toast(msg, type = "info") {
    if (window.SchedSnapAPI && typeof window.SchedSnapAPI.showToast === "function") {
      window.SchedSnapAPI.showToast(msg, type);
    }
  }

  function getSchedule() {
    return window.SchedSnapAPI ? window.SchedSnapAPI.getSchedule() : null;
  }

  function saveActiveState() {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(boardState));
    } catch {
      // Ignore quota errors if user uploaded a huge photo
    }
  }

  function pushUndo() {
    const snap = JSON.stringify(boardState);
    if (undoIdx >= 0 && undoStack[undoIdx] === snap) return;
    undoStack = undoStack.slice(0, undoIdx + 1);
    undoStack.push(snap);
    if (undoStack.length > 35) undoStack.shift();
    undoIdx = undoStack.length - 1;
    updateUndoBtns();
  }

  function updateUndoBtns() {
    const u = document.getElementById("dbUndoBtn");
    const r = document.getElementById("dbRedoBtn");
    if (u) u.disabled = undoIdx <= 0;
    if (r) r.disabled = undoIdx >= undoStack.length - 1;
  }

  function getBlockColor(cls, index) {
    const pal = WALLPAPER_PALETTES[boardState.palette];
    if (!pal || !pal.colors) return cls.color || "#4f46e5";
    return pal.colors[index % pal.colors.length];
  }

  /* ========================================================================
     BUILD DESIGN BOARD UI SKELETON
     ======================================================================== */
  function mountUI() {
    rootEl = document.getElementById("designBoardRoot");
    if (!rootEl) return;

    const detected = detectDeviceResolution();
    DEVICE_PRESETS[0].w = detected.w;
    DEVICE_PRESETS[0].h = detected.h;
    DEVICE_PRESETS[0].label = `Auto-Detected (${detected.w}×${detected.h})`;

    rootEl.innerHTML = `
      <div class="db-topbar">
        <div class="db-topbar-title">
          <div style="display:flex;align-items:center;gap:0.55rem;flex-wrap:wrap;margin-bottom:0.2rem;">
            <button type="button" id="dbBackTimetableBtn" class="btn btn-secondary btn-sm" aria-label="Back to Timetable">← Back to Timetable</button>
            <h2>Wallpaper Studio</h2>
          </div>
          <p>Turn your SchedSnap timetable into a lock screen or home screen wallpaper.</p>
        </div>
        <div id="dbTopActions" class="db-topbar-actions">
          <button type="button" id="dbUndoBtn" class="btn btn-secondary db-btn-44" aria-label="Undo wallpaper change" title="Undo" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            <span>Undo</span>
          </button>
          <button type="button" id="dbRedoBtn" class="btn btn-secondary db-btn-44" aria-label="Redo wallpaper change" title="Redo" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
            <span>Redo</span>
          </button>
          <button type="button" id="dbResetBtn" class="btn btn-danger-soft db-btn-44" aria-label="Reset wallpaper design">Reset</button>
          <button type="button" id="dbTopDownloadBtn" class="btn btn-primary db-btn-44" aria-label="Download Wallpaper PNG">Download Wallpaper PNG</button>
        </div>
      </div>

      <!-- Empty State when user has no classes yet -->
      <div id="dbEmptyState" class="card db-empty-state hidden">
        <div class="db-empty-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        </div>
        <h3>No classes on your schedule yet</h3>
        <p class="muted">Scan your enrollment form or add a few classes first—Design Board will automatically pull them in with zero re-typing.</p>
        <div class="db-empty-actions">
          <button type="button" id="dbGoScanBtn" class="btn btn-primary db-btn-44">Scan Enrollment Form</button>
          <button type="button" id="dbGoAddBtn" class="btn btn-secondary db-btn-44">Add Classes Manually</button>
        </div>
      </div>

      <!-- Main Workspace (Mobile: Preview Top, Tools Bottom; Desktop: Tools Left, Preview Right) -->
      <div id="dbWorkspace" class="db-workspace">
        <!-- LIVE PHONE PREVIEW STAGE -->
        <div class="db-stage-panel">
          <div class="db-stage-controls">
            <div class="db-seg" role="group" aria-label="Screen preview mode">
              <button type="button" class="db-seg-btn active" data-screen="lock">Lock Screen</button>
              <button type="button" class="db-seg-btn" data-screen="home">Home Screen</button>
            </div>
            <button type="button" id="dbToggleOverlayBtn" class="db-toggle-pill active" aria-pressed="true">Clock Overlay</button>
            <button type="button" id="dbToggleSafeBtn" class="db-toggle-pill" aria-pressed="false">Safe Zones</button>
          </div>

          <div class="db-phone-frame">
            <div class="db-phone-notch" aria-hidden="true"></div>
            <div id="dbCanvas" class="db-canvas" aria-label="Wallpaper design canvas">
              <img id="dbBgPhoto" class="db-bg-photo hidden" alt="" />
              <div id="dbBgDim" class="db-bg-dim"></div>
              <div id="dbBgPattern" class="db-bg-pattern" data-pattern="botanical"></div>

              <!-- Safe zone dotted guides -->
              <div id="dbSafeTop" class="db-safe-zone db-safe-top hidden"><span>Clock &amp; Widgets Safe Zone</span></div>
              <div id="dbSafeBottom" class="db-safe-zone db-safe-bottom hidden"><span>Bottom Icons Safe Zone</span></div>

              <!-- Draggable / Resizable Elements Layer -->
              <div id="dbElementsLayer" class="db-elements-layer"></div>

              <!-- Lock / Home Screen Faded Overlay -->
              <div id="dbOsOverlay" class="db-os-overlay"></div>
            </div>
          </div>

          <p class="muted" style="font-size:0.78rem;text-align:center;">Tap any element on the phone to move or resize it. Overlays &amp; guides are hidden in the exported PNG.</p>
        </div>

        <!-- CUSTOMIZATION TOOLS PANEL -->
        <div class="db-tools-panel">
          <div class="db-tool-tabs" role="tablist" aria-label="Design Board tool categories">
            <button type="button" class="db-tool-tab active" role="tab" data-tab="templates">Templates</button>
            <button type="button" class="db-tool-tab" role="tab" data-tab="layout">Layout</button>
            <button type="button" class="db-tool-tab" role="tab" data-tab="bg">Background</button>
            <button type="button" class="db-tool-tab" role="tab" data-tab="style">Style &amp; Font</button>
            <button type="button" class="db-tool-tab" role="tab" data-tab="elements">Text &amp; Stickers</button>
            <button type="button" class="db-tool-tab" role="tab" data-tab="export">Save &amp; Export</button>
          </div>

          <div class="db-tool-body">
            <!-- TAB 1: TEMPLATES -->
            <div class="db-tool-pane active" data-pane="templates">
              <span class="field-label-sm">Starting Themes &amp; Wallpaper Templates</span>
              <div id="dbTplGrid" class="db-tpl-grid"></div>
            </div>

            <!-- TAB 2: LAYOUT & TOGGLES -->
            <div class="db-tool-pane" data-pane="layout">
              <span class="field-label-sm">Schedule Layout</span>
              <div id="dbLayoutGrid" class="db-option-grid">
                <button type="button" class="db-opt-btn" data-layout="today">Today Only</button>
                <button type="button" class="db-opt-btn active" data-layout="week">Full Week Grid</button>
                <button type="button" class="db-opt-btn" data-layout="daylist">Day List (Stacked)</button>
                <button type="button" class="db-opt-btn" data-layout="next3">Next 3 Classes</button>
                <button type="button" class="db-opt-btn" data-layout="minimal">Minimal (Next Class)</button>
              </div>

              <div class="divider-line"></div>
              <span class="field-label-sm">Visible Details</span>
              <label class="switch-row"><span>Show Classroom</span><input type="checkbox" id="dbShowRoom" checked /></label>
              <label class="switch-row"><span>Show Class Time</span><input type="checkbox" id="dbShowTime" checked /></label>
              <label class="switch-row"><span>Show Course Title</span><input type="checkbox" id="dbShowTitle" /></label>
              <label class="switch-row"><span>Show Weekends (Sat–Sun)</span><input type="checkbox" id="dbShowWeekends" /></label>
              <label class="switch-row"><span>Show Free Periods</span><input type="checkbox" id="dbShowFree" checked /></label>
            </div>

            <!-- TAB 3: BACKGROUND -->
            <div class="db-tool-pane" data-pane="bg">
              <span class="field-label-sm">Background Type</span>
              <div id="dbBgTypeGroup" class="db-seg" style="width:100%;display:grid;grid-template-columns:repeat(3,1fr);">
                <button type="button" class="db-seg-btn" data-bgtype="solid">Solid</button>
                <button type="button" class="db-seg-btn active" data-bgtype="gradient">Gradient</button>
                <button type="button" class="db-seg-btn" data-bgtype="photo">Photo</button>
              </div>

              <div id="dbBgSolidBox" class="hidden">
                <label class="color-input-card"><span>Background Color</span><input type="color" id="dbBgColor" /></label>
              </div>

              <div id="dbBgGradBox">
                <div class="color-grid-2">
                  <label class="color-input-card"><span>Start Color</span><input type="color" id="dbGradStart" /></label>
                  <label class="color-input-card"><span>End Color</span><input type="color" id="dbGradEnd" /></label>
                </div>
                <label class="slider-field">
                  <span>Gradient Angle (<strong id="dbValGradAngle">150°</strong>)</span>
                  <input type="range" id="dbGradAngle" min="0" max="360" step="15" />
                </label>
              </div>

              <div id="dbBgPhotoBox" class="hidden">
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.7rem;">
                  <label class="btn btn-primary db-btn-44">
                    <span>Upload Photo</span>
                    <input type="file" id="dbPhotoInput" accept="image/*" hidden />
                  </label>
                  <button type="button" id="dbRemovePhotoBtn" class="btn btn-ghost db-btn-44 text-danger hidden">Remove Photo</button>
                </div>
                <label class="slider-field">
                  <span>Photo Blur (<strong id="dbValBlur">4px</strong>)</span>
                  <input type="range" id="dbPhotoBlur" min="0" max="20" step="1" />
                </label>
                <label class="slider-field">
                  <span>Photo Dim (<strong id="dbValDim">15%</strong>)</span>
                  <input type="range" id="dbPhotoDim" min="0" max="75" step="5" />
                </label>
              </div>

              <div class="divider-line"></div>
              <span class="field-label-sm">Built-In Pattern Overlay</span>
              <div id="dbPatternGrid" class="db-option-grid">
                <button type="button" class="db-opt-btn" data-pattern="none">None</button>
                <button type="button" class="db-opt-btn" data-pattern="dots">Soft Dots</button>
                <button type="button" class="db-opt-btn" data-pattern="grid">Subtle Grid</button>
                <button type="button" class="db-opt-btn" data-pattern="diagonal">Diagonal Lines</button>
                <button type="button" class="db-opt-btn active" data-pattern="botanical">Soft Light</button>
              </div>
            </div>

            <!-- TAB 4: STYLE, COLORS & TYPOGRAPHY -->
            <div class="db-tool-pane" data-pane="style">
              <div class="form-field">
                <label for="dbFontSelect">Font Family</label>
                <select id="dbFontSelect" class="select-input">
                  <option value="'Inter', sans-serif">Inter (Clean)</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Modern)</option>
                  <option value="'Poppins', sans-serif">Poppins (Geometric)</option>
                  <option value="'Nunito', sans-serif">Nunito (Soft Rounded)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Editorial)</option>
                  <option value="'JetBrains Mono', monospace">JetBrains Mono (Dev)</option>
                </select>
              </div>

              <div style="display:flex;gap:0.5rem;">
                <button type="button" id="dbBoldBtn" class="db-opt-btn" style="flex:1;" aria-pressed="false"><strong>Bold</strong></button>
                <button type="button" id="dbItalicBtn" class="db-opt-btn" style="flex:1;" aria-pressed="false"><em>Italic</em></button>
              </div>

              <label class="slider-field">
                <span>Font Size (<strong id="dbValFontSize">10px</strong>)</span>
                <input type="range" id="dbFontSize" min="8" max="15" step="1" />
              </label>

              <span class="field-label-sm">Block Style</span>
              <div id="dbBlockStyleGrid" class="db-option-grid">
                <button type="button" class="db-opt-btn" data-bstyle="rounded">Rounded</button>
                <button type="button" class="db-opt-btn" data-bstyle="sharp">Sharp</button>
                <button type="button" class="db-opt-btn" data-bstyle="outlined">Outlined</button>
                <button type="button" class="db-opt-btn active" data-bstyle="glass">Glass (Blur)</button>
              </div>

              <span class="field-label-sm">Subject Color Palette</span>
              <div id="dbPaletteGrid" class="db-option-grid"></div>

              <div class="color-grid-2">
                <label class="color-input-card"><span>Text Color</span><input type="color" id="dbTextColor" /></label>
                <label class="color-input-card"><span>Card / Panel</span><input type="color" id="dbPanelBg" /></label>
                <label class="color-input-card"><span>Accent</span><input type="color" id="dbAccentColor" /></label>
              </div>

              <label class="slider-field">
                <span>Spacing (<strong id="dbValSpacing">4px</strong>)</span>
                <input type="range" id="dbSpacing" min="2" max="12" step="1" />
              </label>
              <label class="slider-field">
                <span>Corner Radius (<strong id="dbValRadius">12px</strong>)</span>
                <input type="range" id="dbRadius" min="0" max="22" step="2" />
              </label>
              <label class="slider-field">
                <span>Panel Opacity (<strong id="dbValOpacity">82%</strong>)</span>
                <input type="range" id="dbOpacity" min="25" max="100" step="5" />
              </label>
            </div>

            <!-- TAB 5: CUSTOM TEXT & STICKERS -->
            <div class="db-tool-pane" data-pane="elements">
              <span class="field-label-sm">Add Custom Text (Quote, Name, or Motto)</span>
              <div style="display:flex;gap:0.45rem;">
                <input type="text" id="dbNewTextInput" class="select-input" placeholder="e.g. Stay focused • BSCS" />
                <button type="button" id="dbAddTextBtn" class="btn btn-primary db-btn-44">Add</button>
              </div>

              <div class="divider-line"></div>
              <span class="field-label-sm">Add Stickers &amp; Icons</span>
              <div id="dbStickerGrid" class="db-sticker-grid"></div>

              <div class="divider-line"></div>
              <span class="field-label-sm">Selected Element Controls</span>
              <div id="dbSelectedControls" class="muted" style="font-size:0.8rem;">
                Tap the schedule card or any added text/sticker on the phone mockup to move or resize it.
              </div>
            </div>

            <!-- TAB 6: DEVICE SIZE, SAVE & EXPORT -->
            <div class="db-tool-pane" data-pane="export">
              <div class="form-field">
                <label for="dbDeviceSelect">Phone Size Preset</label>
                <select id="dbDeviceSelect" class="select-input"></select>
              </div>

              <div id="dbCustomSizeRow" class="form-grid-2 hidden">
                <div class="form-field">
                  <label for="dbCustomW">Width (px)</label>
                  <input type="text" id="dbCustomW" inputmode="numeric" value="1080" />
                </div>
                <div class="form-field">
                  <label for="dbCustomH">Height (px)</label>
                  <input type="text" id="dbCustomH" inputmode="numeric" value="1920" />
                </div>
              </div>

              <div class="db-export-btns">
                <button type="button" id="dbDownloadBtn" class="btn btn-primary db-btn-44">Download PNG</button>
                <button type="button" id="dbShareBtn" class="btn btn-secondary db-btn-44">Share</button>
              </div>

              <div class="db-howto-box">
                <h4>How to Set as Wallpaper</h4>
                <p style="margin-bottom:0.35rem;"><strong>iPhone (iOS):</strong></p>
                <ol style="margin-bottom:0.55rem;">
                  <li>Open the downloaded image in <strong>Photos</strong>.</li>
                  <li>Tap the <strong>Share</strong> icon → <strong>Use as Wallpaper</strong>.</li>
                  <li>Pinch slightly if needed so it aligns cleanly, then tap <strong>Add</strong>.</li>
                </ol>
                <p style="margin-bottom:0.35rem;"><strong>Android:</strong></p>
                <ol>
                  <li>Open the image in <strong>Gallery</strong> or <strong>Google Photos</strong>.</li>
                  <li>Tap the menu (<strong>⋮</strong>) → <strong>Set as wallpaper</strong> (or <strong>Use as</strong>).</li>
                  <li>Choose <strong>Lock screen</strong>, <strong>Home screen</strong>, or both.</li>
                </ol>
              </div>

              <div class="divider-line"></div>
              <span class="field-label-sm">Saved Wallpaper Designs</span>
              <div style="display:flex;gap:0.45rem;">
                <input type="text" id="dbSaveNameInput" class="select-input" placeholder="Design name (e.g. Finals Lockscreen)" />
                <button type="button" id="dbSaveBoardBtn" class="btn btn-primary db-btn-44">Save</button>
              </div>
              <div id="dbSavedList" style="display:flex;flex-direction:column;gap:0.45rem;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    populateStaticControls();
    bindEvents();
  }

  function populateStaticControls() {
    // Templates grid
    const tplGrid = document.getElementById("dbTplGrid");
    tplGrid.innerHTML = "";
    WALLPAPER_TEMPLATES.forEach((tpl) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "db-tpl-card";
      btn.dataset.tpl = tpl.id;
      const bg = tpl.state.bgType === "gradient"
        ? `linear-gradient(${tpl.state.gradAngle}deg, ${tpl.state.gradStart}, ${tpl.state.gradEnd})`
        : tpl.state.bgColor;
      btn.innerHTML = `
        <div class="db-tpl-swatch" style="background:${bg}">
          <i style="background:${tpl.state.accentColor};width:55%;"></i>
          <i style="background:${tpl.state.panelBg};width:85%;opacity:0.85;"></i>
        </div>
        <span class="db-tpl-name">${escapeHtml(tpl.name)}</span>
        <span class="db-tpl-tag">${escapeHtml(tpl.tag)}</span>
      `;
      btn.addEventListener("click", () => {
        boardState = { ...boardState, ...tpl.state, templateId: tpl.id };
        saveActiveState();
        syncInputs();
        renderBoard();
        pushUndo();
        toast(`Applied "${tpl.name}" wallpaper template.`, "success");
      });
      tplGrid.appendChild(btn);
    });

    // Palettes
    const palGrid = document.getElementById("dbPaletteGrid");
    palGrid.innerHTML = "";
    Object.entries(WALLPAPER_PALETTES).forEach(([key, pal]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "db-opt-btn";
      btn.dataset.pal = key;
      btn.textContent = pal.label;
      btn.addEventListener("click", () => {
        boardState.palette = key;
        saveActiveState();
        syncInputs();
        renderBoard();
        pushUndo();
      });
      palGrid.appendChild(btn);
    });

    // Stickers
    const stickerGrid = document.getElementById("dbStickerGrid");
    stickerGrid.innerHTML = "";
    STICKERS.forEach((st) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "db-sticker-btn";
      btn.title = `Add ${st.label}`;
      btn.setAttribute("aria-label", `Add ${st.label} icon`);
      btn.innerHTML = `<span style="width:20px;height:20px;display:inline-flex;">${st.svg}</span>`;
      btn.addEventListener("click", () => {
        const id = "el_" + Date.now();
        boardState.extras.push({
          id, type: "sticker", stickerId: st.id,
          x: 44, y: 21, size: 28, color: boardState.accentColor
        });
        selectedId = id;
        saveActiveState();
        renderBoard();
        renderSelectedControls();
        pushUndo();
      });
      stickerGrid.appendChild(btn);
    });

    // Device presets
    const devSel = document.getElementById("dbDeviceSelect");
    devSel.innerHTML = "";
    DEVICE_PRESETS.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.label;
      devSel.appendChild(opt);
    });
  }

  /* ========================================================================
     EVENT BINDINGS
     ======================================================================== */
  function bindEvents() {
    // Back to Timetable & Quick Download PNG
    document.getElementById("dbBackTimetableBtn").addEventListener("click", () => {
      if (window.SchedSnapAPI) window.SchedSnapAPI.navigateTo("dashboard");
    });
    document.getElementById("dbTopDownloadBtn").addEventListener("click", () => exportWallpaper("download"));

    // Empty state shortcuts
    document.getElementById("dbGoScanBtn").addEventListener("click", () => {
      if (window.SchedSnapAPI) window.SchedSnapAPI.navigateTo("upload");
    });
    document.getElementById("dbGoAddBtn").addEventListener("click", () => {
      if (window.SchedSnapAPI) window.SchedSnapAPI.navigateTo("review");
    });

    // Undo / Redo / Reset
    document.getElementById("dbUndoBtn").addEventListener("click", () => {
      if (undoIdx > 0) {
        undoIdx--;
        boardState = JSON.parse(undoStack[undoIdx]);
        saveActiveState();
        syncInputs();
        renderBoard();
        updateUndoBtns();
      }
    });
    document.getElementById("dbRedoBtn").addEventListener("click", () => {
      if (undoIdx < undoStack.length - 1) {
        undoIdx++;
        boardState = JSON.parse(undoStack[undoIdx]);
        saveActiveState();
        syncInputs();
        renderBoard();
        updateUndoBtns();
      }
    });
    document.getElementById("dbResetBtn").addEventListener("click", () => {
      boardState = createDefaultBoardState();
      selectedId = null;
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
      toast("Design Board reset to default.", "info");
    });

    // Tool Tabs
    rootEl.querySelectorAll(".db-tool-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        rootEl.querySelectorAll(".db-tool-tab").forEach((t) => t.classList.toggle("active", t === tab));
        rootEl.querySelectorAll(".db-tool-pane").forEach((p) => p.classList.toggle("active", p.dataset.pane === target));
      });
    });

    // Lock / Home Screen toggle
    rootEl.querySelectorAll("[data-screen]").forEach((btn) => {
      btn.addEventListener("click", () => {
        boardState.screenMode = btn.dataset.screen;
        saveActiveState();
        syncInputs();
        renderBoard();
      });
    });

    // Overlay & Safe Zone toggles
    document.getElementById("dbToggleOverlayBtn").addEventListener("click", () => {
      boardState.showOverlay = !boardState.showOverlay;
      saveActiveState();
      syncInputs();
      renderBoard();
    });
    document.getElementById("dbToggleSafeBtn").addEventListener("click", () => {
      boardState.showSafeZones = !boardState.showSafeZones;
      saveActiveState();
      syncInputs();
      renderBoard();
    });

    // Layout buttons
    document.getElementById("dbLayoutGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-layout]");
      if (!btn) return;
      boardState.layout = btn.dataset.layout;
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
    });

    // Detail toggles
    [
      ["dbShowRoom", "showRoom"], ["dbShowTime", "showTime"],
      ["dbShowTitle", "showTitle"], ["dbShowWeekends", "showWeekends"],
      ["dbShowFree", "showFreePeriods"]
    ].forEach(([id, key]) => {
      document.getElementById(id).addEventListener("change", (e) => {
        boardState[key] = e.target.checked;
        saveActiveState();
        renderBoard();
        pushUndo();
      });
    });

    // Background type
    document.getElementById("dbBgTypeGroup").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-bgtype]");
      if (!btn) return;
      boardState.bgType = btn.dataset.bgtype;
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
    });

    // Colors & sliders
    const bindColor = (id, key) => {
      const el = document.getElementById(id);
      el.addEventListener("input", (e) => {
        boardState[key] = e.target.value;
        if (key === "bgColor" || key === "gradStart") {
          boardState.osDarkText = isLightHex(e.target.value);
        }
        saveActiveState();
        renderBoard();
      });
      el.addEventListener("change", () => pushUndo());
    };
    bindColor("dbBgColor", "bgColor");
    bindColor("dbGradStart", "gradStart");
    bindColor("dbGradEnd", "gradEnd");
    bindColor("dbTextColor", "textColor");
    bindColor("dbPanelBg", "panelBg");
    bindColor("dbAccentColor", "accentColor");

    const bindSlider = (id, labelId, key, unit) => {
      const el = document.getElementById(id);
      const lbl = document.getElementById(labelId);
      el.addEventListener("input", (e) => {
        boardState[key] = Number(e.target.value);
        lbl.textContent = `${e.target.value}${unit}`;
        saveActiveState();
        renderBoard();
      });
      el.addEventListener("change", () => pushUndo());
    };
    bindSlider("dbGradAngle", "dbValGradAngle", "gradAngle", "°");
    bindSlider("dbPhotoBlur", "dbValBlur", "photoBlur", "px");
    bindSlider("dbPhotoDim", "dbValDim", "photoDim", "%");
    bindSlider("dbFontSize", "dbValFontSize", "fontSize", "px");
    bindSlider("dbSpacing", "dbValSpacing", "spacing", "px");
    bindSlider("dbRadius", "dbValRadius", "radius", "px");
    bindSlider("dbOpacity", "dbValOpacity", "blockOpacity", "%");

    // Photo upload
    document.getElementById("dbPhotoInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          const maxDim = 1400;
          const sc = Math.min(1, maxDim / Math.max(img.width, img.height));
          c.width = Math.round(img.width * sc);
          c.height = Math.round(img.height * sc);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          boardState.photoDataUrl = c.toDataURL("image/jpeg", 0.85);
          boardState.bgType = "photo";
          boardState.osDarkText = false;
          saveActiveState();
          syncInputs();
          renderBoard();
          pushUndo();
          toast("Background photo applied.", "success");
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    });

    document.getElementById("dbRemovePhotoBtn").addEventListener("click", () => {
      boardState.photoDataUrl = "";
      boardState.bgType = "gradient";
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
    });

    // Pattern buttons
    document.getElementById("dbPatternGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pattern]");
      if (!btn) return;
      boardState.pattern = btn.dataset.pattern;
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
    });

    // Typography & block style
    document.getElementById("dbFontSelect").addEventListener("change", (e) => {
      boardState.fontFamily = e.target.value;
      saveActiveState();
      renderBoard();
      pushUndo();
    });
    document.getElementById("dbBoldBtn").addEventListener("click", () => {
      boardState.fontBold = !boardState.fontBold;
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
    });
    document.getElementById("dbItalicBtn").addEventListener("click", () => {
      boardState.fontItalic = !boardState.fontItalic;
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
    });
    document.getElementById("dbBlockStyleGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-bstyle]");
      if (!btn) return;
      boardState.blockStyle = btn.dataset.bstyle;
      saveActiveState();
      syncInputs();
      renderBoard();
      pushUndo();
    });

    // Add Custom Text
    document.getElementById("dbAddTextBtn").addEventListener("click", () => {
      const input = document.getElementById("dbNewTextInput");
      const txt = input.value.trim();
      if (!txt) return toast("Enter some text first.", "info");
      const id = "el_" + Date.now();
      boardState.extras.push({
        id, type: "text", text: txt,
        x: 18, y: 23, size: 14, color: boardState.textColor
      });
      input.value = "";
      selectedId = id;
      saveActiveState();
      renderBoard();
      renderSelectedControls();
      pushUndo();
    });

    // Deselect when tapping empty canvas area
    document.getElementById("dbCanvas").addEventListener("pointerdown", (e) => {
      if (e.target.id === "dbCanvas" || e.target.id === "dbElementsLayer") {
        selectedId = null;
        renderBoard();
        renderSelectedControls();
      }
    });

    // Device Size selector
    document.getElementById("dbDeviceSelect").addEventListener("change", (e) => {
      const dev = DEVICE_PRESETS.find((d) => d.id === e.target.value);
      boardState.deviceId = e.target.value;
      if (dev && dev.id !== "custom") {
        boardState.exportW = dev.w;
        boardState.exportH = dev.h;
      }
      saveActiveState();
      syncInputs();
      updateCanvasAspect();
    });
    ["dbCustomW", "dbCustomH"].forEach((id) => {
      document.getElementById(id).addEventListener("change", () => {
        const w = Math.max(400, Math.min(3000, parseInt(document.getElementById("dbCustomW").value, 10) || 1080));
        const h = Math.max(600, Math.min(4000, parseInt(document.getElementById("dbCustomH").value, 10) || 1920));
        boardState.exportW = w;
        boardState.exportH = h;
        saveActiveState();
        updateCanvasAspect();
      });
    });

    // Export Download & Share
    document.getElementById("dbDownloadBtn").addEventListener("click", () => exportWallpaper("download"));
    document.getElementById("dbShareBtn").addEventListener("click", () => exportWallpaper("share"));

    // Save Design
    document.getElementById("dbSaveBoardBtn").addEventListener("click", () => {
      const inp = document.getElementById("dbSaveNameInput");
      const name = inp.value.trim() || `Wallpaper ${savedBoards.length + 1}`;
      savedBoards.push({ id: "wb_" + Date.now(), name, state: JSON.parse(JSON.stringify(boardState)) });
      persistSavedBoards();
      inp.value = "";
      renderSavedBoards();
      toast(`Saved "${name}".`, "success");
    });
  }

  /* ========================================================================
     SYNC CONTROLS & CANVAS ASPECT RATIO
     ======================================================================== */
  function syncInputs() {
    rootEl.querySelectorAll("[data-screen]").forEach((b) => b.classList.toggle("active", b.dataset.screen === boardState.screenMode));
    const ovBtn = document.getElementById("dbToggleOverlayBtn");
    ovBtn.classList.toggle("active", boardState.showOverlay);
    ovBtn.setAttribute("aria-pressed", String(boardState.showOverlay));
    const sfBtn = document.getElementById("dbToggleSafeBtn");
    sfBtn.classList.toggle("active", boardState.showSafeZones);
    sfBtn.setAttribute("aria-pressed", String(boardState.showSafeZones));

    rootEl.querySelectorAll(".db-tpl-card").forEach((c) => c.classList.toggle("active", c.dataset.tpl === boardState.templateId));
    rootEl.querySelectorAll("[data-layout]").forEach((b) => b.classList.toggle("active", b.dataset.layout === boardState.layout));
    rootEl.querySelectorAll("[data-bgtype]").forEach((b) => b.classList.toggle("active", b.dataset.bgtype === boardState.bgType));
    rootEl.querySelectorAll("[data-pattern]").forEach((b) => b.classList.toggle("active", b.dataset.pattern === boardState.pattern));
    rootEl.querySelectorAll("[data-bstyle]").forEach((b) => b.classList.toggle("active", b.dataset.bstyle === boardState.blockStyle));
    rootEl.querySelectorAll("[data-pal]").forEach((b) => b.classList.toggle("active", b.dataset.pal === boardState.palette));

    document.getElementById("dbShowRoom").checked = boardState.showRoom;
    document.getElementById("dbShowTime").checked = boardState.showTime;
    document.getElementById("dbShowTitle").checked = boardState.showTitle;
    document.getElementById("dbShowWeekends").checked = boardState.showWeekends;
    document.getElementById("dbShowFree").checked = boardState.showFreePeriods;

    document.getElementById("dbBgSolidBox").classList.toggle("hidden", boardState.bgType !== "solid");
    document.getElementById("dbBgGradBox").classList.toggle("hidden", boardState.bgType !== "gradient");
    document.getElementById("dbBgPhotoBox").classList.toggle("hidden", boardState.bgType !== "photo");
    document.getElementById("dbRemovePhotoBtn").classList.toggle("hidden", !boardState.photoDataUrl);

    document.getElementById("dbBgColor").value = boardState.bgColor;
    document.getElementById("dbGradStart").value = boardState.gradStart;
    document.getElementById("dbGradEnd").value = boardState.gradEnd;
    document.getElementById("dbGradAngle").value = boardState.gradAngle;
    document.getElementById("dbValGradAngle").textContent = `${boardState.gradAngle}°`;
    document.getElementById("dbPhotoBlur").value = boardState.photoBlur;
    document.getElementById("dbValBlur").textContent = `${boardState.photoBlur}px`;
    document.getElementById("dbPhotoDim").value = boardState.photoDim;
    document.getElementById("dbValDim").textContent = `${boardState.photoDim}%`;

    document.getElementById("dbFontSelect").value = boardState.fontFamily;
    document.getElementById("dbBoldBtn").classList.toggle("active", boardState.fontBold);
    document.getElementById("dbItalicBtn").classList.toggle("active", boardState.fontItalic);
    document.getElementById("dbFontSize").value = boardState.fontSize;
    document.getElementById("dbValFontSize").textContent = `${boardState.fontSize}px`;
    document.getElementById("dbTextColor").value = boardState.textColor;
    document.getElementById("dbPanelBg").value = boardState.panelBg;
    document.getElementById("dbAccentColor").value = boardState.accentColor;
    document.getElementById("dbSpacing").value = boardState.spacing;
    document.getElementById("dbValSpacing").textContent = `${boardState.spacing}px`;
    document.getElementById("dbRadius").value = boardState.radius;
    document.getElementById("dbValRadius").textContent = `${boardState.radius}px`;
    document.getElementById("dbOpacity").value = boardState.blockOpacity;
    document.getElementById("dbValOpacity").textContent = `${boardState.blockOpacity}%`;

    document.getElementById("dbDeviceSelect").value = boardState.deviceId;
    document.getElementById("dbCustomSizeRow").classList.toggle("hidden", boardState.deviceId !== "custom");
    document.getElementById("dbCustomW").value = boardState.exportW;
    document.getElementById("dbCustomH").value = boardState.exportH;
    updateCanvasAspect();
  }

  function updateCanvasAspect() {
    const canvas = document.getElementById("dbCanvas");
    if (!canvas) return;
    const baseW = window.innerWidth < 400 ? 276 : 300;
    const ratio = (boardState.exportH || 2556) / (boardState.exportW || 1179);
    const clampedRatio = Math.max(1.5, Math.min(2.3, ratio));
    canvas.style.width = `${baseW}px`;
    canvas.style.height = `${Math.round(baseW * clampedRatio)}px`;
  }

  /* ========================================================================
     RENDER PHONE PREVIEW CANVAS
     ======================================================================== */
  function renderBoard() {
    const sched = getSchedule();
    const hasClasses = Boolean(sched && Array.isArray(sched.classes) && sched.classes.length > 0);
    document.getElementById("dbEmptyState").classList.toggle("hidden", hasClasses);
    document.getElementById("dbWorkspace").classList.toggle("hidden", !hasClasses);
    const topActs = document.getElementById("dbTopActions");
    if (topActs) topActs.classList.toggle("hidden", !hasClasses);
    if (!hasClasses) return;

    const canvas = document.getElementById("dbCanvas");
    const bgPhoto = document.getElementById("dbBgPhoto");
    const bgDim = document.getElementById("dbBgDim");
    const bgPattern = document.getElementById("dbBgPattern");

    // 1. Background rendering
    if (boardState.bgType === "solid") {
      canvas.style.background = boardState.bgColor;
      bgPhoto.classList.add("hidden");
      bgDim.style.opacity = "0";
    } else if (boardState.bgType === "gradient") {
      canvas.style.background = `linear-gradient(${boardState.gradAngle}deg, ${boardState.gradStart}, ${boardState.gradEnd})`;
      bgPhoto.classList.add("hidden");
      bgDim.style.opacity = "0";
    } else if (boardState.bgType === "photo" && boardState.photoDataUrl) {
      canvas.style.background = "#0f172a";
      bgPhoto.src = boardState.photoDataUrl;
      bgPhoto.style.filter = `blur(${boardState.photoBlur}px)`;
      bgPhoto.classList.remove("hidden");
      bgDim.style.opacity = String(boardState.photoDim / 100);
    } else {
      canvas.style.background = boardState.bgColor;
      bgPhoto.classList.add("hidden");
      bgDim.style.opacity = "0";
    }
    bgPattern.dataset.pattern = boardState.pattern;
    bgPattern.style.color = boardState.textColor;

    // 2. Safe Zones
    document.getElementById("dbSafeTop").classList.toggle("hidden", !boardState.showSafeZones);
    document.getElementById("dbSafeBottom").classList.toggle("hidden", !boardState.showSafeZones);

    // 3. OS Overlay (Lock Screen or Home Screen)
    const osOverlay = document.getElementById("dbOsOverlay");
    osOverlay.classList.toggle("hidden", !boardState.showOverlay);
    osOverlay.classList.toggle("dark-text", boardState.osDarkText);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M/i, "");
    const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

    if (boardState.screenMode === "lock") {
      osOverlay.innerHTML = `
        <div>
          <div class="db-os-status"><span>${timeStr}</span><span>5G • 100%</span></div>
          <div class="db-lock-clock-wrap">
            <div class="db-lock-date">${escapeHtml(dateStr)}</div>
            <div class="db-lock-time">${escapeHtml(timeStr)}</div>
          </div>
        </div>
        <div>
          <div class="db-lock-bottom">
            <span class="db-lock-btn-circle" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M9 3h6l-1 5H10L9 3z"/></svg>
            </span>
            <span class="db-lock-btn-circle" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </span>
          </div>
          <div class="db-home-bar"></div>
        </div>
      `;
    } else {
      osOverlay.innerHTML = `
        <div class="db-os-status"><span>${timeStr}</span><span>5G • 100%</span></div>
        <div>
          <div class="db-home-dock">
            <span class="db-home-app-icon"></span>
            <span class="db-home-app-icon"></span>
            <span class="db-home-app-icon"></span>
            <span class="db-home-app-icon"></span>
          </div>
          <div class="db-home-bar"></div>
        </div>
      `;
    }

    // 4. Render Draggable Elements Layer
    const layer = document.getElementById("dbElementsLayer");
    layer.innerHTML = "";

    // 4A. Main Schedule Widget
    const widgetWrap = document.createElement("div");
    widgetWrap.className = `db-draggable ${selectedId === "widget" ? "selected" : ""}`;
    widgetWrap.dataset.elId = "widget";
    widgetWrap.style.left = `${boardState.widgetBox.x}%`;
    widgetWrap.style.top = `${boardState.widgetBox.y}%`;
    widgetWrap.style.width = `${boardState.widgetBox.w}%`;
    widgetWrap.innerHTML = buildScheduleWidgetHtml(sched) + `<div class="db-resize-handle" data-resize="widget" title="Drag to resize">↘</div>`;
    attachPointerHandlers(widgetWrap, "widget");
    layer.appendChild(widgetWrap);

    // 4B. Extra Custom Text & Sticker Elements
    boardState.extras.forEach((ex) => {
      const el = document.createElement("div");
      el.className = `db-draggable ${selectedId === ex.id ? "selected" : ""}`;
      el.dataset.elId = ex.id;
      el.style.left = `${ex.x}%`;
      el.style.top = `${ex.y}%`;

      if (ex.type === "text") {
        el.innerHTML = `
          <div class="db-custom-text" style="color:${ex.color};font-size:${ex.size}px;font-family:${boardState.fontFamily};font-weight:${boardState.fontBold ? 700 : 600};font-style:${boardState.fontItalic ? "italic" : "normal"};">${escapeHtml(ex.text)}</div>
          <button type="button" class="db-delete-elem-btn" data-del="${ex.id}" aria-label="Delete text">×</button>
          <div class="db-resize-handle" data-resize="${ex.id}">↘</div>
        `;
      } else if (ex.type === "sticker") {
        const st = STICKERS.find((s) => s.id === ex.stickerId) || STICKERS[0];
        el.innerHTML = `
          <div class="db-sticker-el" style="width:${ex.size}px;height:${ex.size}px;color:${ex.color};">${st.svg}</div>
          <button type="button" class="db-delete-elem-btn" data-del="${ex.id}" aria-label="Delete sticker">×</button>
          <div class="db-resize-handle" data-resize="${ex.id}">↘</div>
        `;
      }

      const delBtn = el.querySelector(".db-delete-elem-btn");
      if (delBtn) {
        delBtn.addEventListener("pointerdown", (ev) => ev.stopPropagation());
        delBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          boardState.extras = boardState.extras.filter((item) => item.id !== ex.id);
          selectedId = null;
          saveActiveState();
          renderBoard();
          renderSelectedControls();
          pushUndo();
        });
      }

      attachPointerHandlers(el, ex.id);
      layer.appendChild(el);
    });
  }

  /* ========================================================================
     SCHEDULE WIDGET LAYOUTS (5 MODES)
     ======================================================================== */
  function buildScheduleWidgetHtml(sched) {
    const alpha = boardState.blockOpacity / 100;
    const panelRgba = hexToRgba(boardState.panelBg, boardState.blockStyle === "glass" ? Math.min(alpha, 0.78) : alpha);
    const styleVars = [
      `--db-panel-bg:${panelRgba}`,
      `--db-text:${boardState.textColor}`,
      `--db-accent:${boardState.accentColor}`,
      `--db-accent-fg:${isLightHex(boardState.accentColor) ? "#0f172a" : "#ffffff"}`,
      `--db-font:${boardState.fontFamily}`,
      `--db-font-size:${boardState.fontSize}px`,
      `--db-font-weight:${boardState.fontBold ? 700 : 500}`,
      `--db-font-style:${boardState.fontItalic ? "italic" : "normal"}`,
      `--db-gap:${boardState.spacing}px`,
      `--db-radius:${boardState.radius}px`
    ].join(";");

    const classes = sched.classes || [];
    const days = boardState.showWeekends ? [...DAYS_ORDER] : ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const headerSub = [sched.courseSection, sched.semester].filter(Boolean).join(" • ") || sched.institution || "";

    let bodyHtml = "";
    if (boardState.layout === "week") {
      bodyHtml = renderLayoutWeekGrid(classes, days);
    } else if (boardState.layout === "daylist") {
      bodyHtml = renderLayoutDayList(classes, days);
    } else if (boardState.layout === "today") {
      bodyHtml = renderLayoutToday(classes);
    } else if (boardState.layout === "next3") {
      bodyHtml = renderLayoutNext3(classes);
    } else {
      bodyHtml = renderLayoutMinimal(classes);
    }

    return `
      <div class="db-sched-widget style-${boardState.blockStyle}" style="${styleVars}">
        ${boardState.layout !== "minimal" ? `
          <div class="db-widget-title">${escapeHtml(sched.title || "Class Schedule")}</div>
          ${headerSub ? `<div class="db-widget-sub">${escapeHtml(headerSub)}</div>` : ""}
        ` : ""}
        ${bodyHtml}
      </div>
    `;
  }

  function blockInlineStyle(colorHex) {
    const alpha = boardState.blockOpacity / 100;
    if (boardState.blockStyle === "outlined") {
      return `color:${boardState.textColor};border-color:${colorHex};`;
    }
    const fg = isLightHex(colorHex) ? "#0f172a" : "#ffffff";
    const bg = boardState.blockStyle === "glass" ? hexToRgba(colorHex, Math.min(alpha, 0.78)) : hexToRgba(colorHex, alpha);
    return `background:${bg};color:${fg};`;
  }

  function renderLayoutWeekGrid(classes, days) {
    const cols = days.map((day) => {
      const items = classes
        .map((c, idx) => ({ ...c, idx }))
        .filter((c) => c.days.includes(day))
        .sort((a, b) => toMin(a.start) - toMin(b.start));

      let colBody = "";
      items.forEach((cls, i) => {
        if (boardState.showFreePeriods && i > 0) {
          const gap = toMin(cls.start) - toMin(items[i - 1].end);
          if (gap >= 45) colBody += `<div class="db-free-pill">Free</div>`;
        }
        const colHex = getBlockColor(cls, cls.idx);
        colBody += `
          <div class="db-block block-${boardState.blockStyle}" style="${blockInlineStyle(colHex)}">
            <div class="db-block-code">${escapeHtml(cls.code)}</div>
            ${boardState.showTitle && cls.title ? `<div class="db-block-title">${escapeHtml(cls.title)}</div>` : ""}
            ${boardState.showTime ? `<div class="db-block-meta">${fmtTime(cls.start).replace(" AM", "a").replace(" PM", "p")}</div>` : ""}
            ${boardState.showRoom && cls.room ? `<div class="db-block-meta">${escapeHtml(cls.room)}</div>` : ""}
          </div>
        `;
      });

      if (!items.length) colBody = `<div class="db-free-pill">—</div>`;
      return `
        <div class="db-week-col">
          <div class="db-day-pill-head">${day}</div>
          ${colBody}
        </div>
      `;
    }).join("");

    return `<div class="db-week-grid" style="grid-template-columns:repeat(${days.length}, minmax(0, 1fr));">${cols}</div>`;
  }

  function renderLayoutDayList(classes, days) {
    const groups = days.map((day) => {
      const items = classes
        .map((c, idx) => ({ ...c, idx }))
        .filter((c) => c.days.includes(day))
        .sort((a, b) => toMin(a.start) - toMin(b.start));
      if (!items.length && !boardState.showFreePeriods) return "";

      let rows = items.map((cls) => {
        const colHex = getBlockColor(cls, cls.idx);
        return `
          <div class="db-row-card block-${boardState.blockStyle}" style="${blockInlineStyle(colHex)}">
            <div class="db-row-left">
              <div class="db-block-code">${escapeHtml(cls.code)}</div>
              ${boardState.showTitle && cls.title ? `<div class="db-block-title">${escapeHtml(cls.title)}</div>` : ""}
            </div>
            <div class="db-row-right">
              ${boardState.showTime ? `<div>${fmtTime(cls.start)}</div>` : ""}
              ${boardState.showRoom && cls.room ? `<div>${escapeHtml(cls.room)}</div>` : ""}
            </div>
          </div>
        `;
      }).join("");

      if (!items.length) rows = `<div class="db-free-pill">Free Day</div>`;
      return `<div class="db-day-group"><div class="db-day-group-label">${DAY_FULL[day]}</div>${rows}</div>`;
    }).join("");

    return `<div class="db-stack-list">${groups}</div>`;
  }

  function getUpcomingOrdered(classes) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const list = [];
    for (let offset = 0; offset < 7; offset++) {
      const dKey = JS_DAY_TO_KEY[(now.getDay() + offset) % 7];
      const dayItems = classes
        .map((c, idx) => ({ ...c, idx, dayKey: dKey, offset }))
        .filter((c) => c.days.includes(dKey))
        .filter((c) => offset > 0 || toMin(c.end) > nowMin)
        .sort((a, b) => toMin(a.start) - toMin(b.start));
      list.push(...dayItems);
    }
    return list;
  }

  function renderLayoutToday(classes) {
    const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
    const items = classes
      .map((c, idx) => ({ ...c, idx }))
      .filter((c) => c.days.includes(todayKey))
      .sort((a, b) => toMin(a.start) - toMin(b.start));

    if (!items.length) {
      const next = getUpcomingOrdered(classes)[0];
      return `
        <div class="db-stack-list">
          <div class="db-free-pill">No classes today (${DAY_FULL[todayKey]})</div>
          ${next ? `
            <div class="db-day-group-label">Next Up • ${DAY_FULL[next.dayKey]}</div>
            <div class="db-row-card block-${boardState.blockStyle}" style="${blockInlineStyle(getBlockColor(next, next.idx))}">
              <div class="db-row-left"><div class="db-block-code">${escapeHtml(next.code)}</div></div>
              <div class="db-row-right">${boardState.showTime ? fmtTime(next.start) : ""}${boardState.showRoom && next.room ? " • " + escapeHtml(next.room) : ""}</div>
            </div>
          ` : ""}
        </div>
      `;
    }

    const rows = items.map((cls, i) => {
      let gapHtml = "";
      if (boardState.showFreePeriods && i > 0) {
        const g = toMin(cls.start) - toMin(items[i - 1].end);
        if (g >= 30) gapHtml = `<div class="db-free-pill">Free break (${g}m)</div>`;
      }
      return gapHtml + `
        <div class="db-row-card block-${boardState.blockStyle}" style="${blockInlineStyle(getBlockColor(cls, cls.idx))}">
          <div class="db-row-left">
            <div class="db-block-code">${escapeHtml(cls.code)}</div>
            ${boardState.showTitle && cls.title ? `<div class="db-block-title">${escapeHtml(cls.title)}</div>` : ""}
          </div>
          <div class="db-row-right">
            ${boardState.showTime ? `<div>${fmtTime(cls.start)}–${fmtTime(cls.end)}</div>` : ""}
            ${boardState.showRoom && cls.room ? `<div>${escapeHtml(cls.room)}</div>` : ""}
          </div>
        </div>
      `;
    }).join("");

    return `<div class="db-day-group-label" style="margin-bottom:4px;">Today • ${DAY_FULL[todayKey]}</div><div class="db-stack-list">${rows}</div>`;
  }

  function renderLayoutNext3(classes) {
    const next3 = getUpcomingOrdered(classes).slice(0, 3);
    if (!next3.length) return `<div class="db-free-pill">No upcoming classes</div>`;

    const rows = next3.map((cls) => `
      <div class="db-row-card block-${boardState.blockStyle}" style="${blockInlineStyle(getBlockColor(cls, cls.idx))}">
        <div class="db-row-left">
          <div class="db-block-code">${escapeHtml(cls.code)} <span style="opacity:0.75;font-weight:500;">(${cls.dayKey})</span></div>
          ${boardState.showTitle && cls.title ? `<div class="db-block-title">${escapeHtml(cls.title)}</div>` : ""}
        </div>
        <div class="db-row-right">
          ${boardState.showTime ? `<div>${fmtTime(cls.start)}</div>` : ""}
          ${boardState.showRoom && cls.room ? `<div>${escapeHtml(cls.room)}</div>` : ""}
        </div>
      </div>
    `).join("");

    return `<div class="db-day-group-label" style="margin-bottom:4px;">Next 3 Classes</div><div class="db-stack-list">${rows}</div>`;
  }

  function renderLayoutMinimal(classes) {
    const next = getUpcomingOrdered(classes)[0];
    if (!next) return `<div class="db-minimal-card">No upcoming classes</div>`;
    const colHex = getBlockColor(next, next.idx);
    return `
      <div class="db-minimal-card block-${boardState.blockStyle}" style="${blockInlineStyle(colHex)}">
        <div class="db-minimal-kicker">Next Class • ${DAY_FULL[next.dayKey]}</div>
        <div class="db-minimal-code">${escapeHtml(next.code)}</div>
        ${boardState.showTitle && next.title ? `<div class="db-minimal-meta">${escapeHtml(next.title)}</div>` : ""}
        <div class="db-minimal-meta">
          ${boardState.showTime ? fmtTime(next.start) : ""}${boardState.showRoom && next.room ? " • " + escapeHtml(next.room) : ""}
        </div>
      </div>
    `;
  }

  /* ========================================================================
     DRAG TO MOVE & RESIZE (UNIFIED MOUSE + TOUCH POINTER EVENTS)
     ======================================================================== */
  function attachPointerHandlers(el, id) {
    el.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".db-delete-elem-btn")) return;
      e.stopPropagation();
      selectedId = id;
      rootEl.querySelectorAll(".db-draggable").forEach((n) => n.classList.toggle("selected", n.dataset.elId === id));
      renderSelectedControls();

      const canvas = document.getElementById("dbCanvas");
      const rect = canvas.getBoundingClientRect();
      const isResize = Boolean(e.target.closest(".db-resize-handle"));

      let startObj;
      if (id === "widget") {
        startObj = { ...boardState.widgetBox };
      } else {
        const ex = boardState.extras.find((item) => item.id === id);
        if (!ex) return;
        startObj = { ...ex };
      }

      dragCtx = {
        id, isResize,
        startX: e.clientX, startY: e.clientY,
        canvasW: rect.width, canvasH: rect.height,
        startObj, el
      };
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragCtx || dragCtx.id !== id) return;
      const dxPct = ((e.clientX - dragCtx.startX) / dragCtx.canvasW) * 100;
      const dyPct = ((e.clientY - dragCtx.startY) / dragCtx.canvasH) * 100;

      if (id === "widget") {
        if (dragCtx.isResize) {
          const newW = Math.max(45, Math.min(98, Math.round(dragCtx.startObj.w + dxPct)));
          boardState.widgetBox.w = newW;
          el.style.width = `${newW}%`;
        } else {
          const nx = Math.max(0, Math.min(100 - boardState.widgetBox.w, dragCtx.startObj.x + dxPct));
          const ny = Math.max(2, Math.min(82, dragCtx.startObj.y + dyPct));
          boardState.widgetBox.x = Math.round(nx * 10) / 10;
          boardState.widgetBox.y = Math.round(ny * 10) / 10;
          el.style.left = `${boardState.widgetBox.x}%`;
          el.style.top = `${boardState.widgetBox.y}%`;
        }
      } else {
        const ex = boardState.extras.find((item) => item.id === id);
        if (!ex) return;
        if (dragCtx.isResize) {
          const deltaPx = (e.clientX - dragCtx.startX) * 0.4;
          ex.size = Math.max(10, Math.min(72, Math.round(dragCtx.startObj.size + deltaPx)));
          const inner = ex.type === "text" ? el.querySelector(".db-custom-text") : el.querySelector(".db-sticker-el");
          if (inner) {
            if (ex.type === "text") inner.style.fontSize = `${ex.size}px`;
            else { inner.style.width = `${ex.size}px`; inner.style.height = `${ex.size}px`; }
          }
        } else {
          ex.x = Math.max(0, Math.min(90, Math.round((dragCtx.startObj.x + dxPct) * 10) / 10));
          ex.y = Math.max(2, Math.min(92, Math.round((dragCtx.startObj.y + dyPct) * 10) / 10));
          el.style.left = `${ex.x}%`;
          el.style.top = `${ex.y}%`;
        }
      }
    });

    el.addEventListener("pointerup", () => {
      if (!dragCtx || dragCtx.id !== id) return;
      dragCtx = null;
      saveActiveState();
      pushUndo();
      renderSelectedControls();
    });
  }

  function renderSelectedControls() {
    const box = document.getElementById("dbSelectedControls");
    if (!box) return;
    if (!selectedId) {
      box.innerHTML = `<span class="muted">Tap the schedule card or any text/sticker on the phone to move, resize, or recolor it.</span>`;
      return;
    }

    if (selectedId === "widget") {
      box.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <strong>Selected: Schedule Widget</strong>
          <label class="slider-field" style="margin:0;">
            <span>Width (${boardState.widgetBox.w}%)</span>
            <input type="range" id="dbSelWidgetW" min="50" max="98" value="${boardState.widgetBox.w}" />
          </label>
          <button type="button" id="dbCenterWidgetBtn" class="btn btn-secondary btn-sm">Center Safely Below Clock</button>
        </div>
      `;
      document.getElementById("dbSelWidgetW").addEventListener("input", (e) => {
        boardState.widgetBox.w = Number(e.target.value);
        boardState.widgetBox.x = Math.round(((100 - boardState.widgetBox.w) / 2) * 10) / 10;
        saveActiveState();
        renderBoard();
      });
      document.getElementById("dbCenterWidgetBtn").addEventListener("click", () => {
        boardState.widgetBox = { x: 5, y: 29, w: 90 };
        saveActiveState();
        renderBoard();
        pushUndo();
      });
      return;
    }

    const ex = boardState.extras.find((item) => item.id === selectedId);
    if (!ex) return;
    box.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.55rem;">
        <strong>Selected: ${ex.type === "text" ? "Custom Text" : "Sticker Icon"}</strong>
        ${ex.type === "text" ? `<input type="text" id="dbSelTextEdit" class="select-input" value="${escapeHtml(ex.text)}" />` : ""}
        <div class="color-grid-2" style="margin:0;">
          <label class="color-input-card"><span>Color</span><input type="color" id="dbSelColor" value="${ex.color}" /></label>
          <button type="button" id="dbSelDeleteBtn" class="btn btn-danger-soft db-btn-44">Delete</button>
        </div>
        <label class="slider-field" style="margin:0;">
          <span>Size (${ex.size}px)</span>
          <input type="range" id="dbSelSize" min="10" max="64" value="${ex.size}" />
        </label>
      </div>
    `;

    if (ex.type === "text") {
      document.getElementById("dbSelTextEdit").addEventListener("input", (e) => {
        ex.text = e.target.value;
        saveActiveState();
        renderBoard();
      });
    }
    document.getElementById("dbSelColor").addEventListener("input", (e) => {
      ex.color = e.target.value;
      saveActiveState();
      renderBoard();
    });
    document.getElementById("dbSelSize").addEventListener("input", (e) => {
      ex.size = Number(e.target.value);
      saveActiveState();
      renderBoard();
    });
    document.getElementById("dbSelDeleteBtn").addEventListener("click", () => {
      boardState.extras = boardState.extras.filter((i) => i.id !== ex.id);
      selectedId = null;
      saveActiveState();
      renderBoard();
      renderSelectedControls();
      pushUndo();
    });
  }

  /* ========================================================================
     SAVE, RENAME, & DELETE WALLPAPER DESIGNS
     ======================================================================== */
  function persistSavedBoards() {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedBoards));
    } catch {
      toast("Storage full. Delete an older saved design first.", "warning");
    }
  }

  function renderSavedBoards() {
    const list = document.getElementById("dbSavedList");
    if (!list) return;
    if (!savedBoards.length) {
      list.innerHTML = `<p class="muted" style="font-size:0.8rem;">No saved wallpaper designs yet.</p>`;
      return;
    }

    list.innerHTML = "";
    savedBoards.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "db-saved-item";
      row.innerHTML = `
        <span><strong>${escapeHtml(item.name)}</strong></span>
        <div class="db-saved-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-act="load" data-i="${idx}">Load</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="rename" data-i="${idx}">Rename</button>
          <button type="button" class="btn btn-ghost btn-sm text-danger" data-act="del" data-i="${idx}" aria-label="Delete saved design">✕</button>
        </div>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.i);
        const act = btn.dataset.act;
        if (act === "load") {
          boardState = { ...createDefaultBoardState(), ...savedBoards[i].state };
          selectedId = null;
          saveActiveState();
          syncInputs();
          renderBoard();
          pushUndo();
          toast(`Loaded "${savedBoards[i].name}".`, "success");
        } else if (act === "rename") {
          const nextName = window.prompt("Rename saved wallpaper:", savedBoards[i].name);
          if (nextName && nextName.trim()) {
            savedBoards[i].name = nextName.trim();
            persistSavedBoards();
            renderSavedBoards();
          }
        } else if (act === "del") {
          savedBoards.splice(i, 1);
          persistSavedBoards();
          renderSavedBoards();
          toast("Deleted saved wallpaper.", "info");
        }
      });
    });
  }

  /* ========================================================================
     HIGH-RES EXACT PHONE RESOLUTION EXPORT & WEB SHARE API
     ======================================================================== */
  async function waitForAssets(container) {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    const imgs = [...container.querySelectorAll("img")].filter((img) => !img.classList.contains("hidden") && img.src);
    await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; }))));
  }

  async function exportWallpaper(mode) {
    const dlBtn = document.getElementById("dbDownloadBtn");
    const shBtn = document.getElementById("dbShareBtn");
    dlBtn.disabled = true;
    shBtn.disabled = true;

    const canvasEl = document.getElementById("dbCanvas");
    const prevSelected = selectedId;
    const prevOverlay = boardState.showOverlay;
    const prevSafe = boardState.showSafeZones;
    const prevRadius = canvasEl.style.borderRadius;

    try {
      // Hide UI overlays, safe zone guides, and selection outlines for a clean wallpaper PNG
      selectedId = null;
      boardState.showOverlay = false;
      boardState.showSafeZones = false;
      renderBoard();
      canvasEl.style.borderRadius = "0px";

      await waitForAssets(canvasEl);
      await new Promise((r) => setTimeout(r, 120));

      const rect = canvasEl.getBoundingClientRect();
      const targetW = boardState.exportW || 1179;
      const targetH = boardState.exportH || 2556;
      const scale = Math.max(2, targetW / rect.width);

      const rawCanvas = await window.html2canvas(canvasEl, {
        scale,
        useCORS: true,
        backgroundColor: null
      });

      // Draw onto an exact-dimension output canvas so the PNG matches the phone's resolution pixel-for-pixel
      const outCanvas = document.createElement("canvas");
      outCanvas.width = targetW;
      outCanvas.height = targetH;
      const ctx = outCanvas.getContext("2d");
      ctx.drawImage(rawCanvas, 0, 0, targetW, targetH);

      const filename = `SchedSnap-Wallpaper-${targetW}x${targetH}.png`;

      if (mode === "share" && navigator.share && navigator.canShare) {
        const blob = await new Promise((res) => outCanvas.toBlob(res, "image/png"));
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "My SchedSnap Wallpaper",
            text: "Created with SchedSnap Design Board",
            files: [file]
          });
          toast("Shared wallpaper!", "success");
          return;
        }
      }

      // Standard Download (also fallback if Share API is unsupported on desktop)
      const link = document.createElement("a");
      link.download = filename;
      link.href = outCanvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast(mode === "share" ? "Web Share not supported on this browser — downloaded PNG instead." : `Downloaded ${targetW}×${targetH} PNG!`, "success");
    } catch (err) {
      toast("Could not export wallpaper. Try again.", "error");
    } finally {
      canvasEl.style.borderRadius = prevRadius;
      selectedId = prevSelected;
      boardState.showOverlay = prevOverlay;
      boardState.showSafeZones = prevSafe;
      renderBoard();
      dlBtn.disabled = false;
      shBtn.disabled = false;
    }
  }

  /* ========================================================================
     PUBLIC API & LIFECYCLE
     ======================================================================== */
  function initDesignBoard() {
    try {
      const activeRaw = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (activeRaw) boardState = { ...createDefaultBoardState(), ...JSON.parse(activeRaw) };
    } catch { /* fallback to default */ }

    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY_SAVED);
      if (savedRaw) savedBoards = JSON.parse(savedRaw);
    } catch { savedBoards = []; }

    mountUI();
    syncInputs();
    renderSavedBoards();
    pushUndo();
  }

  window.DesignBoard = {
    onOpen() {
      if (!rootEl) initDesignBoard();
      syncInputs();
      renderBoard();
      renderSelectedControls();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDesignBoard);
  } else {
    initDesignBoard();
  }
})();
