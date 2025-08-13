// =========================
// Globale Variablen
// =========================
let userName = "";
let categories = [];
let transactions = [];
let archive = [];
let totalBudget = 0;
let payday = null;

const quotes = [
  "Spare, wenn du kannst, damit du hast, wenn du musst.",
  "Jeder Rappen zählt.",
  "Plane heute, damit du morgen frei bist.",
  "Wer das Kleine nicht ehrt, ist des Grossen nicht wert.",
  "Dein Budget ist dein bester Freund.",
  "Ausgaben im Griff, Leben im Griff."
];

// =========================
// DOM Referenzen
// =========================
const greetingEl = document.getElementById("greeting");
const monthTextEl = document.getElementById("monthText");
const currentDateEl = document.getElementById("currentDate");
const quoteEl = document.getElementById("quote");

const totalBudgetEl = document.getElementById("totalBudget");
const saveBudgetBtn = document.getElementById("saveBudget");
const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");

const txCategoryEl = document.getElementById("txCategory");
const txDescEl = document.getElementById("txDesc");
const txAmountEl = document.getElementById("txAmount");
const addTxBtn = document.getElementById("addTx");

const historyListEl = document.getElementById("historyList");
const transactionListEl = document.getElementById("transactionList");

const categoriesListEl = document.getElementById("categoriesList");
const newCategoryNameEl = document.getElementById("newCategoryName");
const addCategoryBtn = document.getElementById("addCategory");

const archiveListEl = document.getElementById("archiveList");

const exportCSVBtn = document.getElementById("exportCSV");
const exportWordBtn = document.getElementById("exportWord");
const exportChartBtn = document.getElementById("exportChart");

const welcomeModal = document.getElementById("welcomeModal");
const saveNameBtn = document.getElementById("saveName");
const userNameInput = document.getElementById("userName");

const infoModal = document.getElementById("infoModal");
const closeInfoBtn = document.getElementById("closeInfo");

const categoryInfoModal = document.getElementById("categoryInfoModal");
const closeCategoryInfoBtn = document.getElementById("closeCategoryInfo");

const paydayModal = document.getElementById("paydayModal");
const paydaySelect = document.getElementById("paydaySelect");
const savePaydayBtn = document.getElementById("savePayday");

const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const closeMenuBtn = document.getElementById("closeMenu");

// =========================
// Init
// =========================
document.addEventListener("DOMContentLoaded", () => {
  initDate();
  initQuote();
  initPaydayOptions();
  loadFromStorage();
  showPopupSequence();
  attachEventListeners();
  updateUI();
});

// =========================
// Initial Setup Functions
// =========================
function initDate() {
  const now = new Date();
  const month = now.toLocaleString("de-DE", { month: "long" });
  const year = now.getFullYear();
  const date = now.toLocaleDateString("de-DE");
  const time = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  monthTextEl.textContent = `${month} ${year}`;
  currentDateEl.textContent = `${date} ${time}`;
}

function initQuote() {
  const todayIndex = new Date().getDate() % quotes.length;
  const currentTheme = document.body.className.replace("theme-", "");
  quoteEl.innerHTML = `<span style="color: var(--accent)">„</span>${quotes[todayIndex]}<span style="color: var(--accent)">“</span>`;
}

function initPaydayOptions() {
  for (let i = 1; i <= 28; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    paydaySelect.appendChild(opt);
  }
}

function showPopupSequence() {
  openModal(welcomeModal);
}

function loadFromStorage() {
  const data = JSON.parse(localStorage.getItem("budgetAppData")) || {};
  userName = data.userName || "";
  categories = data.categories || [];
  transactions = data.transactions || [];
  archive = data.archive || [];
  totalBudget = data.totalBudget || 0;
  payday = data.payday || null;
}

function saveToStorage() {
  localStorage.setItem(
    "budgetAppData",
    JSON.stringify({ userName, categories, transactions, archive, totalBudget, payday })
  );
}

// =========================
// Event Listeners
// =========================
function attachEventListeners() {
  saveNameBtn.addEventListener("click", () => {
    userName = userNameInput.value.trim();
    greetingEl.textContent = `Hallo ${userName}`;
    saveToStorage();
    closeModal(welcomeModal);
    openModal(infoModal);
  });

  closeInfoBtn.addEventListener("click", () => {
    closeModal(infoModal);
    openModal(categoryInfoModal);
  });

  closeCategoryInfoBtn.addEventListener("click", () => {
    closeModal(categoryInfoModal);
    openModal(paydayModal);
  });

  savePaydayBtn.addEventListener("click", () => {
    payday = parseInt(paydaySelect.value);
    saveToStorage();
    closeModal(paydayModal);
  });

  saveBudgetBtn.addEventListener("click", () => {
    totalBudget = parseFloat(totalBudgetEl.value) || 0;
    saveToStorage();
    updateUI();
  });

  addCategoryBtn.addEventListener("click", () => {
    const name = newCategoryNameEl.value.trim();
    if (name && !categories.includes(name)) {
      categories.push(name);
      newCategoryNameEl.value = "";
      saveToStorage();
      updateCategoriesUI();
    }
  });

  addTxBtn.addEventListener("click", () => {
    const category = txCategoryEl.value;
    const desc = txDescEl.value.trim();
    const amount = parseFloat(txAmountEl.value);
    if (category && desc && amount > 0) {
      transactions.push({ category, desc, amount, date: new Date().toISOString() });
      txDescEl.value = "";
      txAmountEl.value = "";
      saveToStorage();
      updateUI();
    }
  });

  exportCSVBtn.addEventListener("click", exportCSV);
  exportWordBtn.addEventListener("click", exportWord);
  exportChartBtn.addEventListener("click", exportChartAsPNG);

  // Hamburger menu
  menuButton.addEventListener("click", () => {
    menuOverlay.setAttribute("aria-hidden", "false");
  });

  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.setAttribute("aria-hidden", "true");
  });

  document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      showTab(tab);
      menuOverlay.setAttribute("aria-hidden", "true");
    });
  });
}

// =========================
// UI Functions
// =========================
function updateUI() {
  greetingEl.textContent = `Hallo ${userName}`;
  updateCategoriesUI();
  updateTransactionsUI();
  updateHistoryUI();
  updateArchiveUI();
  updateBudgetUI();
}

function updateCategoriesUI() {
  categoriesListEl.innerHTML = "";
  txCategoryEl.innerHTML = "";
  categories.forEach(cat => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = cat;
    categoriesListEl.appendChild(chip);

    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    txCategoryEl.appendChild(opt);
  });
}

function updateTransactionsUI() {
  transactionListEl.innerHTML = "";
  transactions.forEach(tx => {
    const div = document.createElement("div");
    div.textContent = `${tx.category} - ${tx.desc} - CHF ${tx.amount.toFixed(2)}`;
    transactionListEl.appendChild(div);
  });
}

function updateHistoryUI() {
  historyListEl.innerHTML = "";
  // z.B. gleiche Liste oder andere Darstellung
  transactions.forEach(tx => {
    const div = document.createElement("div");
    div.textContent = `${new Date(tx.date).toLocaleDateString("de-DE")} - ${tx.category} - ${tx.desc} - CHF ${tx.amount.toFixed(2)}`;
    historyListEl.appendChild(div);
  });
}

function updateArchiveUI() {
  archiveListEl.innerHTML = "";
  archive.forEach(item => {
    const div = document.createElement("div");
    div.textContent = `${item.month} ${item.year} - CHF ${item.total.toFixed(2)} übrig`;
    archiveListEl.appendChild(div);
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

// =========================
// Tab Switch
// =========================
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");
}

// =========================
// Modal Controls
// =========================
function openModal(modal) {
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.setAttribute("aria-hidden", "true");
}

// =========================
// Exports
// =========================
function exportCSV() {
  let csv = "Kategorie,Beschreibung,Betrag\n";
  transactions.forEach(tx => {
    csv += `${tx.category},${tx.desc},${tx.amount}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "auflistung.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportWord() {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } = window.docx;
  const grouped = {};
  transactions.forEach(tx => {
    if (!grouped[tx.category]) grouped[tx.category] = [];
    grouped[tx.category].push(tx);
  });

  const rows = [];
  for (let cat in grouped) {
    rows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(cat)], columnSpan: 3 })
      ]
    }));
    grouped[cat].forEach(tx => {
      rows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("")] }),
          new TableCell({ children: [new Paragraph(tx.desc)] }),
          new TableCell({ children: [new Paragraph(`CHF ${tx.amount.toFixed(2)}`)] })
        ]
      }));
    });
    const total = grouped[cat].reduce((sum, tx) => sum + tx.amount, 0);
    rows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("")] }),
        new TableCell({ children: [new Paragraph("Total:")] }),
        new TableCell({ children: [new Paragraph(`CHF ${total.toFixed(2)}`)] })
      ]
    }));
  }

  const table = new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
  const doc = new Document({ sections: [{ children: [table] }] });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auflistung.docx";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function exportChartAsPNG() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const categoriesSum = {};

  transactions.forEach(tx => {
    categoriesSum[tx.category] = (categoriesSum[tx.category] || 0) + tx.amount;
  });

  const chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoriesSum),
      datasets: [{
        data: Object.values(categoriesSum),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40"]
      }]
    }
  });

  setTimeout(() => {
    const link = document.createElement("a");
    link.download = "diagramm.png";
    link.href = chart.toBase64Image();
    link.click();
  }, 1000);
}
