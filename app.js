// ==========================
// Globale Variablen & State
// ==========================
let userName = "";
let totalBudget = 0;
let transactions = [];
let categories = [];
let payday = null;
let savedAmount = 0;
let archives = [];
let currentTheme = "standard";
let chartInstance = null;

// ==========================
// Zitate (monatlich wiederverwendbar)
// ==========================
const quotes = [
  "Spare, wenn du kannst, damit du hast, wenn du musst.",
  "Jeder Franken zählt.",
  "Kontrolle ist der Schlüssel zu Freiheit.",
  "Ein kleines Budget kann auch grosse Träume erfüllen.",
  "Plane heute, damit du morgen frei bist.",
  "Gib nicht mehr aus, als du hast.",
  "Sparen ist der erste Schritt zum Vermögen."
];

// ==========================
// DOM-Elemente
// ==========================
const greetingEl = document.getElementById("greeting");
const monthRangeEl = document.getElementById("monthRange");
const monthTextEl = document.getElementById("monthText");
const currentDateEl = document.getElementById("currentDate");
const quoteEl = document.getElementById("quote");
const budgetWordEl = document.getElementById("budgetWord");
const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");
const txCategoryEl = document.getElementById("txCategory");
const txDescEl = document.getElementById("txDesc");
const txAmountEl = document.getElementById("txAmount");
const transactionListEl = document.getElementById("transactionList");
const historyListEl = document.getElementById("historyList");
const savedAmountEl = document.getElementById("savedAmount");
const categoriesListEl = document.getElementById("categoriesList");
const archiveListEl = document.getElementById("archiveList");

// Popups
const welcomeModal = document.getElementById("welcomeModal");
const infoModal = document.getElementById("infoModal");
const categoryInfoModal = document.getElementById("categoryInfoModal");
const paydayModal = document.getElementById("paydayModal");

// Menü
const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const menuBackdrop = document.getElementById("menuBackdrop");
const closeMenu = document.getElementById("closeMenu");

// ==========================
// Initialisierung
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  updateHeader();
  renderCategories();
  renderTransactions();
  renderChart();
  checkPayday();
  updateSavedAmount();
  showQuote();

  if (!userName) {
    openModal(welcomeModal);
  }
});

// ==========================
// Menü-Logik
// ==========================
menuButton.addEventListener("click", () => {
  menuOverlay.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
});
menuBackdrop.addEventListener("click", closeMenuOverlay);
closeMenu.addEventListener("click", closeMenuOverlay);

function closeMenuOverlay() {
  menuOverlay.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
}

// Menü-Tabs
document.querySelectorAll(".menu-item").forEach(btn => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
    closeMenuOverlay();
  });
});

// ==========================
// Popup-Logik
// ==========================
document.getElementById("saveName").addEventListener("click", () => {
  const val = document.getElementById("userName").value.trim();
  if (val) {
    userName = val;
    saveToStorage();
    closeModal(welcomeModal);
    openModal(infoModal);
    updateHeader();
  }
});

document.getElementById("closeInfo").addEventListener("click", () => {
  closeModal(infoModal);
  openModal(categoryInfoModal);
});

document.getElementById("closeCategoryInfo").addEventListener("click", () => {
  closeModal(categoryInfoModal);
  openModal(paydayModal);
});

document.getElementById("savePayday").addEventListener("click", () => {
  const val = parseInt(document.getElementById("paydaySelect").value);
  if (val >= 1 && val <= 28) {
    payday = val;
    saveToStorage();
    closeModal(paydayModal);
  }
});

// ==========================
// Budget-Funktionen
// ==========================
document.getElementById("saveBudget").addEventListener("click", () => {
  totalBudget = parseFloat(document.getElementById("totalBudget").value) || 0;
  saveToStorage();
  updateBudgetUI();
});

document.getElementById("addTx").addEventListener("click", () => {
  const cat = txCategoryEl.value;
  const desc = txDescEl.value.trim();
  const amt = parseFloat(txAmountEl.value) || 0;
  if (!cat || !desc || amt <= 0) return;

  transactions.push({ category: cat, description: desc, amount: amt });
  saveToStorage();
  txDescEl.value = "";
  txAmountEl.value = "";
  renderTransactions();
  renderChart();
  updateBudgetUI();
});

function renderTransactions() {
  transactionListEl.innerHTML = "";
  transactions.forEach((tx, i) => {
    const div = document.createElement("div");
    div.className = "panel";
    div.innerHTML = `<strong>${tx.category}</strong><br>${tx.description}<br>CHF ${tx.amount.toFixed(2)}`;
    transactionListEl.appendChild(div);
  });
}

function updateBudgetUI() {
  const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const remaining = totalBudget - spent;
  spentEl.textContent = `CHF ${spent.toFixed(2)}`;
  remainingEl.textContent = `CHF ${remaining.toFixed(2)}`;
  if (remaining < 200) {
    remainingEl.classList.add("red-alert");
  } else {
    remainingEl.classList.remove("red-alert");
  }
}

// ==========================
// Kategorien
// ==========================
document.getElementById("addCategory").addEventListener("click", () => {
  const name = document.getElementById("newCategoryName").value.trim();
  if (name && !categories.includes(name)) {
    categories.push(name);
    saveToStorage();
    renderCategories();
    document.getElementById("newCategoryName").value = "";
  }
});

function renderCategories() {
  txCategoryEl.innerHTML = "";
  categoriesListEl.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    txCategoryEl.appendChild(opt);

    const chip = document.createElement("div");
    chip.className = "panel";
    chip.textContent = cat;
    categoriesListEl.appendChild(chip);
  });
}

// ==========================
// Chart.js Diagramm
// ==========================
function renderChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const dataByCat = {};
  transactions.forEach(tx => {
    dataByCat[tx.category] = (dataByCat[tx.category] || 0) + tx.amount;
  });

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(dataByCat),
      datasets: [{
        data: Object.values(dataByCat),
        backgroundColor: [
          "#f1c40f", "#e67e22", "#3498db", "#8e44ad", "#ff69b4", "#2ecc71"
        ]
      }]
    }
  });
}

// ==========================
// Exporte
// ==========================
document.getElementById("exportCSV").addEventListener("click", () => {
  let csv = "Kategorie,Beschreibung,Betrag\n";
  transactions.forEach(tx => {
    csv += `${tx.category},${tx.description},${tx.amount}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "verlauf.csv";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("exportChart").addEventListener("click", () => {
  const url = document.getElementById("expenseChart").toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "diagramm.png";
  a.click();
});

document.getElementById("exportWord").addEventListener("click", () => {
  const doc = new docx.Document();
  const grouped = {};
  transactions.forEach(tx => {
    if (!grouped[tx.category]) grouped[tx.category] = [];
    grouped[tx.category].push(tx);
  });

  Object.keys(grouped).forEach(cat => {
    doc.addSection({
      children: [
        new docx.Paragraph({ text: cat, heading: docx.HeadingLevel.HEADING_1 }),
        ...grouped[cat].map(tx =>
          new docx.Paragraph(`${tx.description}: CHF ${tx.amount.toFixed(2)}`)
        ),
        new docx.Paragraph({
          text: `Total: CHF ${grouped[cat].reduce((s, t) => s + t.amount, 0).toFixed(2)}`,
          bold: true
        })
      ]
    });
  });

  docx.Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verlauf.docx";
    a.click();
  });
});

// ==========================
// Archivierung
// ==========================
function checkPayday() {
  if (!payday) return;
  const today = new Date();
  if (today.getDate() === payday) {
    archives.push({
      date: today.toLocaleDateString(),
      transactions: [...transactions]
    });
    transactions = [];
    saveToStorage();
    renderTransactions();
    renderArchives();
  }
}

function renderArchives() {
  archiveListEl.innerHTML = "";
  archives.forEach(arc => {
    const div = document.createElement("div");
    div.className = "panel";
    div.innerHTML = `<strong>${arc.date}</strong> - ${arc.transactions.length} Einträge`;
    archiveListEl.appendChild(div);
  });
}

function updateSavedAmount() {
  const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  savedAmount = totalBudget - spent;
  savedAmountEl.textContent = `CHF ${savedAmount.toFixed(2)}`;
}

// ==========================
// Zitate
// ==========================
function showQuote() {
  const today = new Date();
  const quote = quotes[today.getDate() % quotes.length];
  quoteEl.innerHTML = `<span style="color: transparent; background: var(--accent); -webkit-background-clip: text;">“</span>${quote}<span style="color: transparent; background: var(--accent); -webkit-background-clip: text;">”</span>`;
}

// ==========================
// Theme-Wechsel
// ==========================
document.querySelectorAll("[data-theme-select]").forEach(btn => {
  btn.addEventListener("click", () => {
    currentTheme = btn.dataset.themeSelect;
    document.body.className = `theme-${currentTheme}`;
    saveToStorage();
    showQuote();
  });
});

// ==========================
// Tabs umschalten
// ==========================
function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(`tab-${tabId}`).classList.add("active");
}

// ==========================
// Modal-Helfer
// ==========================
function openModal(modal) {
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(modal) {
  modal.setAttribute("aria-hidden", "true");
}

// ==========================
// Storage
// ==========================
function saveToStorage() {
  localStorage.setItem("budgetData", JSON.stringify({
    userName, totalBudget, transactions, categories, payday, savedAmount, archives, currentTheme
  }));
}

function loadFromStorage() {
  const data = JSON.parse(localStorage.getItem("budgetData") || "{}");
  userName = data.userName || "";
  totalBudget = data.totalBudget || 0;
  transactions = data.transactions || [];
  categories = data.categories || [];
  payday = data.payday || null;
  savedAmount = data.savedAmount || 0;
  archives = data.archives || [];
  currentTheme = data.currentTheme || "standard";
  document.body.className = `theme-${currentTheme}`;
}

// ==========================
// Header aktualisieren
// ==========================
function updateHeader() {
  const now = new Date();
  greetingEl.textContent = `Hallo ${userName}`;
  monthTextEl.textContent = `${now.toLocaleString("de-DE", { month: "long" })} ${now.getFullYear()}`;
  currentDateEl.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}
