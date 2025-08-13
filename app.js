// ===============================
// Globale Variablen
// ===============================
let userName = "";
let totalBudget = 0;
let spentAmount = 0;
let transactions = [];
let categories = [];
let payday = null;
let archive = [];
let quotes = [
  "Spare in der Zeit, dann hast du in der Not.",
  "Kleine Ausgaben summieren sich schnell.",
  "Ein Budget gibt dir Freiheit, nicht Einschränkung.",
  "Heute sparen, morgen genießen.",
  "Dein Geld arbeitet für dich, wenn du es lässt."
];
let currentTheme = "standard";
let chartInstance = null;

// ===============================
// DOM-Elemente
// ===============================
const greetingEl = document.getElementById("greeting");
const monthTextEl = document.getElementById("monthText");
const currentDateEl = document.getElementById("currentDate");
const quoteEl = document.getElementById("quote");
const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");
const txCategoryEl = document.getElementById("txCategory");
const txDescEl = document.getElementById("txDesc");
const txAmountEl = document.getElementById("txAmount");
const addTxBtn = document.getElementById("addTx");
const totalBudgetEl = document.getElementById("totalBudget");
const saveBudgetBtn = document.getElementById("saveBudget");
const historyListEl = document.getElementById("historyList");
const transactionListEl = document.getElementById("transactionList");
const categoriesListEl = document.getElementById("categoriesList");
const newCategoryNameEl = document.getElementById("newCategoryName");
const addCategoryBtn = document.getElementById("addCategory");
const archiveListEl = document.getElementById("archiveList");
const categoryChartEl = document.getElementById("categoryChart");

// Menu
const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const closeMenuBtn = document.getElementById("closeMenu");
const menuItems = document.querySelectorAll(".menu-item");

// Modals
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

// Settings
document.querySelectorAll("[data-theme-select]").forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.themeSelect;
    setTheme(theme);
  });
});
document.getElementById("exportCSV").addEventListener("click", exportCSV);
document.getElementById("exportWord").addEventListener("click", exportWord);
document.getElementById("exportChart").addEventListener("click", exportChartPNG);

// ===============================
// Initialisierung
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initDateAndQuote();
  initPaydayOptions();
  showModal(welcomeModal);
});

// ===============================
// UI Init
// ===============================
function initDateAndQuote() {
  const now = new Date();
  const month = now.toLocaleString("de-DE", { month: "long" });
  const year = now.getFullYear();
  monthTextEl.textContent = `${month} ${year}`;
  currentDateEl.textContent = now.toLocaleString();
  const quoteIndex = now.getDate() % quotes.length;
  quoteEl.textContent = `"${quotes[quoteIndex]}"`;
}

function initPaydayOptions() {
  for (let d = 1; d <= 28; d++) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    paydaySelect.appendChild(opt);
  }
}

// ===============================
// Modal-Funktionen
// ===============================
function showModal(modal) {
  modal.setAttribute("aria-hidden", "false");
}
function hideModal(modal) {
  modal.setAttribute("aria-hidden", "true");
}

// Willkommen
saveNameBtn.addEventListener("click", () => {
  if (userNameInput.value.trim() !== "") {
    userName = userNameInput.value.trim();
    greetingEl.textContent = `Hallo ${userName}`;
    hideModal(welcomeModal);
    showModal(infoModal);
  }
});

// Info
closeInfoBtn.addEventListener("click", () => {
  hideModal(infoModal);
  showModal(categoryInfoModal);
});

// Kategorie Info
closeCategoryInfoBtn.addEventListener("click", () => {
  hideModal(categoryInfoModal);
  showModal(paydayModal);
});

// Payday speichern
savePaydayBtn.addEventListener("click", () => {
  payday = parseInt(paydaySelect.value);
  hideModal(paydayModal);
  saveState();
});

// ===============================
// Budget & Transaktionen
// ===============================
saveBudgetBtn.addEventListener("click", () => {
  totalBudget = parseFloat(totalBudgetEl.value) || 0;
  updateBudgetDisplay();
  saveState();
});

addTxBtn.addEventListener("click", () => {
  const category = txCategoryEl.value;
  const desc = txDescEl.value.trim();
  const amount = parseFloat(txAmountEl.value);
  if (!category || !desc || isNaN(amount)) return;

  transactions.push({ category, desc, amount, date: new Date().toISOString() });
  spentAmount += amount;
  updateBudgetDisplay();
  renderTransactions();
  renderHistory();
  renderChart();
  saveState();
  txDescEl.value = "";
  txAmountEl.value = "";
});

function updateBudgetDisplay() {
  spentEl.textContent = `CHF ${spentAmount.toFixed(2)}`;
  const remaining = totalBudget - spentAmount;
  remainingEl.textContent = `CHF ${remaining.toFixed(2)}`;
  if (remaining < 200) {
    remainingEl.classList.add("red-alert");
  } else {
    remainingEl.classList.remove("red-alert");
  }
}

function renderTransactions() {
  historyListEl.innerHTML = "";
  transactions.forEach(tx => {
    const item = document.createElement("div");
    item.textContent = `${tx.category} - ${tx.desc}: CHF ${tx.amount.toFixed(2)}`;
    historyListEl.appendChild(item);
  });
}

function renderHistory() {
  transactionListEl.innerHTML = "";
  transactions.forEach(tx => {
    const item = document.createElement("div");
    item.textContent = `${tx.date.split("T")[0]} | ${tx.category} - ${tx.desc} : CHF ${tx.amount.toFixed(2)}`;
    transactionListEl.appendChild(item);
  });
}

function renderChart() {
  const dataByCategory = {};
  transactions.forEach(tx => {
    if (!dataByCategory[tx.category]) dataByCategory[tx.category] = 0;
    dataByCategory[tx.category] += tx.amount;
  });
  const labels = Object.keys(dataByCategory);
  const data = Object.values(dataByCategory);

  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(categoryChartEl, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#a8e063', '#ff7e5f', '#4facfe', '#50c9c3', '#a855f7', '#ff69b4'
        ]
      }]
    }
  });
}

// ===============================
// Kategorien
// ===============================
addCategoryBtn.addEventListener("click", () => {
  const name = newCategoryNameEl.value.trim();
  if (!name) return;
  categories.push(name);
  renderCategories();
  newCategoryNameEl.value = "";
  saveState();
});

function renderCategories() {
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

// ===============================
// Hamburger-Menü & Tabs
// ===============================
menuButton.addEventListener("click", () => {
  menuOverlay.setAttribute("aria-hidden", "false");
});
closeMenuBtn.addEventListener("click", () => {
  menuOverlay.setAttribute("aria-hidden", "true");
});
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    const target = item.getAttribute("data-tab");
    document.getElementById(`tab-${target}`).classList.add("active");
    menuOverlay.setAttribute("aria-hidden", "true");
  });
});

// ===============================
// Themes
// ===============================
function setTheme(theme) {
  document.body.className = `theme-${theme}`;
  currentTheme = theme;
  saveState();
}

// ===============================
// Exports
// ===============================
function exportCSV() {
  let csv = "Kategorie,Beschreibung,Betrag\n";
  transactions.forEach(tx => {
    csv += `${tx.category},${tx.desc},${tx.amount.toFixed(2)}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  downloadFile(url, "auflistung.csv");
}

function exportWord() {
  const { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } = window.docx;
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Kategorie")], width: { size: 33, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Beschreibung")], width: { size: 33, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Betrag")], width: { size: 33, type: WidthType.PERCENTAGE } }),
      ]
    })
  ];
  transactions.forEach(tx => {
    tableRows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(tx.category)] }),
        new TableCell({ children: [new Paragraph(tx.desc)] }),
        new TableCell({ children: [new Paragraph(tx.amount.toFixed(2))] })
      ]
    }));
  });
  const doc = new Document({
    sections: [{ children: [new Table({ rows: tableRows })] }]
  });
  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    downloadFile(url, "auflistung.docx");
  });
}

function exportChartPNG() {
  const url = categoryChartEl.toDataURL("image/png");
  downloadFile(url, "diagramm.png");
}

function downloadFile(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===============================
// Archivierung
// ===============================
function checkPayday() {
  const today = new Date().getDate();
  if (payday && today === payday) {
    archive.push({
      date: new Date().toISOString(),
      transactions: [...transactions],
      totalBudget,
      spentAmount
    });
    transactions = [];
    spentAmount = 0;
    updateBudgetDisplay();
    renderTransactions();
    renderHistory();
    renderChart();
    renderArchive();
    saveState();
  }
}

function renderArchive() {
  archiveListEl.innerHTML = "";
  archive.forEach(entry => {
    const item = document.createElement("div");
    item.textContent = `${entry.date.split("T")[0]} - ${entry.transactions.length} Transaktionen`;
    archiveListEl.appendChild(item);
  });
}

// ===============================
// Speicherung
// ===============================
function saveState() {
  const state = {
    userName, totalBudget, spentAmount, transactions, categories, payday, archive, currentTheme
  };
  localStorage.setItem("budgetApp", JSON.stringify(state));
}

function loadState() {
  const data = JSON.parse(localStorage.getItem("budgetApp") || "{}");
  if (data.userName) {
    userName = data.userName;
    greetingEl.textContent = `Hallo ${userName}`;
  }
  if (data.totalBudget) totalBudget = data.totalBudget;
  if (data.spentAmount) spentAmount = data.spentAmount;
  if (data.transactions) transactions = data.transactions;
  if (data.categories) categories = data.categories;
  if (data.payday) payday = data.payday;
  if (data.archive) archive = data.archive;
  if (data.currentTheme) setTheme(data.currentTheme);

  updateBudgetDisplay();
  renderCategories();
  renderTransactions();
  renderHistory();
  renderChart();
  renderArchive();
}

// ===============================
// Start
// ===============================
loadState();
setInterval(checkPayday, 1000 * 60 * 60); // prüft stündlich
