// ================================
// Globale Variablen & States
// ================================
let userName = localStorage.getItem("userName") || "";
let payday = parseInt(localStorage.getItem("payday") || "0", 10);
let categories = JSON.parse(localStorage.getItem("categories") || "[]");
let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
let archives = JSON.parse(localStorage.getItem("archives") || "[]");
let currentTheme = localStorage.getItem("theme") || "standard";

// ================================
// DOM-Referenzen
// ================================
const greetingEl = document.getElementById("greeting");
const monthRangeEl = document.getElementById("monthRange");
const monthTextEl = document.getElementById("monthText");
const currentDateEl = document.getElementById("currentDate");
const quoteEl = document.getElementById("quote");
const remainingEl = document.getElementById("remaining");
const spentEl = document.getElementById("spent");

const totalBudgetInput = document.getElementById("totalBudget");
const saveBudgetBtn = document.getElementById("saveBudget");
const txCategorySelect = document.getElementById("txCategory");
const txDescInput = document.getElementById("txDesc");
const txAmountInput = document.getElementById("txAmount");
const addTxBtn = document.getElementById("addTx");

const transactionListEl = document.getElementById("transactionList");
const historyListEl = document.getElementById("historyList");
const savedAmountEl = document.getElementById("savedAmount");
const categoriesListEl = document.getElementById("categoriesList");

const exportWordBtn = document.getElementById("exportWord");
const exportCSVBtn = document.getElementById("exportCSV");
const exportChartBtn = document.getElementById("exportChart");

const archiveListEl = document.getElementById("archiveList");

const welcomeModal = document.getElementById("welcomeModal");
const infoModal = document.getElementById("infoModal");
const categoryInfoModal = document.getElementById("categoryInfoModal");
const paydayModal = document.getElementById("paydayModal");

const saveNameBtn = document.getElementById("saveName");
const closeInfoBtn = document.getElementById("closeInfo");
const closeCategoryInfoBtn = document.getElementById("closeCategoryInfo");
const savePaydayBtn = document.getElementById("savePayday");
const paydaySelect = document.getElementById("paydaySelect");
const paydaySelectSettings = document.getElementById("paydaySelectSettings");
const savePaydaySettingsBtn = document.getElementById("savePaydaySettings");

// ================================
// Hilfsfunktionen
// ================================
function formatCurrency(amount) {
  return `CHF ${amount.toFixed(2)}`;
}

function saveState() {
  localStorage.setItem("userName", userName);
  localStorage.setItem("payday", payday.toString());
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("archives", JSON.stringify(archives));
  localStorage.setItem("theme", currentTheme);
}

// ================================
// Zitat-Logik
// ================================
const quotes = [
  "Spare, wenn du kannst, nicht wenn du musst.",
  "Jeder Franken zählt.",
  "Kleine Schritte führen zum Ziel.",
  "Heute planen, morgen profitieren.",
  "Dein Geld, deine Regeln.",
  "Sparen ist auch investieren.",
  "Budgetieren heisst kontrollieren."
];
function updateQuote() {
  const todayIndex = new Date().getDate() % quotes.length;
  quoteEl.innerHTML = `<span style="color: var(--accent);">“</span>${quotes[todayIndex]}<span style="color: var(--accent);">”</span>`;
}

// ================================
// Theme-Wechsel
// ================================
document.querySelectorAll("[data-theme-select]").forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.getAttribute("data-theme-select");
    document.body.className = `theme-${theme}`;
    currentTheme = theme;
    saveState();
    updateQuote();
  });
});

// ================================
// Popups Steuerung
// ================================
function showModal(modal) {
  modal.setAttribute("aria-hidden", "false");
}
function hideModal(modal) {
  modal.setAttribute("aria-hidden", "true");
}

if (!userName) {
  showModal(welcomeModal);
}

saveNameBtn.addEventListener("click", () => {
  userName = document.getElementById("userName").value.trim();
  if (userName) {
    saveState();
    hideModal(welcomeModal);
    showModal(infoModal);
  }
});
closeInfoBtn.addEventListener("click", () => {
  hideModal(infoModal);
  showModal(categoryInfoModal);
});
closeCategoryInfoBtn.addEventListener("click", () => {
  hideModal(categoryInfoModal);
  showModal(paydayModal);
});
savePaydayBtn.addEventListener("click", () => {
  const day = parseInt(paydaySelect.value, 10);
  if (day >= 1 && day <= 28) {
    payday = day;
    saveState();
    hideModal(paydayModal);
    renderAll();
  }
});

// ================================
// Zahltag speichern aus Settings
// ================================
savePaydaySettingsBtn.addEventListener("click", () => {
  const day = parseInt(paydaySelectSettings.value, 10);
  if (day >= 1 && day <= 28) {
    payday = day;
    saveState();
    renderAll();
  }
});

// ================================
// Kategorien
// ================================
function renderCategories() {
  txCategorySelect.innerHTML = "";
  categoriesListEl.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    txCategorySelect.appendChild(option);

    const chip = document.createElement("div");
    chip.className = "panel";
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      const newName = prompt("Kategorie umbenennen:", cat);
      if (newName) {
        const idx = categories.indexOf(cat);
        categories[idx] = newName.trim();
        saveState();
        renderCategories();
      }
    });
    chip.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (confirm("Kategorie löschen?")) {
        categories = categories.filter(c => c !== cat);
        saveState();
        renderCategories();
      }
    });
    categoriesListEl.appendChild(chip);
  });
}
document.getElementById("addCategory").addEventListener("click", () => {
  const val = document.getElementById("newCategoryName").value.trim();
  if (val && !categories.includes(val)) {
    categories.push(val);
    document.getElementById("newCategoryName").value = "";
    saveState();
    renderCategories();
  }
});

// ================================
// Budget Logik
// ================================
saveBudgetBtn.addEventListener("click", () => {
  const val = parseFloat(totalBudgetInput.value);
  if (!isNaN(val) && val >= 0) {
    localStorage.setItem("totalBudget", val.toString());
    renderAll();
  }
});
addTxBtn.addEventListener("click", () => {
  const cat = txCategorySelect.value;
  const desc = txDescInput.value.trim();
  const amt = parseFloat(txAmountInput.value);
  if (cat && desc && !isNaN(amt) && amt > 0) {
    transactions.push({ cat, desc, amt, date: new Date().toISOString() });
    txDescInput.value = "";
    txAmountInput.value = "";
    saveState();
    renderAll();
  }
});

// ================================
// Verlauf & Diagramm
// ================================
let chartInstance = null;
function renderChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const grouped = {};
  transactions.forEach(tx => {
    grouped[tx.cat] = (grouped[tx.cat] || 0) + tx.amt;
  });
  const labels = Object.keys(grouped);
  const data = Object.values(grouped);
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#f1c40f", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#ff69b4"
        ]
      }]
    }
  });
}

// ================================
// Exporte
// ================================
exportCSVBtn.addEventListener("click", () => {
  let csv = "Kategorie,Beschreibung,Betrag\n";
  transactions.forEach(tx => {
    csv += `${tx.cat},${tx.desc},${tx.amt}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "verlauf.csv";
  a.click();
  URL.revokeObjectURL(url);
});

exportWordBtn.addEventListener("click", () => {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } = docx;
  const grouped = {};
  transactions.forEach(tx => {
    if (!grouped[tx.cat]) grouped[tx.cat] = [];
    grouped[tx.cat].push(tx);
  });
  const rows = [];
  for (const cat in grouped) {
    rows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(cat)], columnSpan: 3 })
      ]
    }));
    grouped[cat].forEach(tx => {
      rows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(tx.cat)] }),
          new TableCell({ children: [new Paragraph(tx.desc)] }),
          new TableCell({ children: [new Paragraph(tx.amt.toFixed(2))] })
        ]
      }));
    });
    const total = grouped[cat].reduce((a, b) => a + b.amt, 0);
    rows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Total")], columnSpan: 2 }),
        new TableCell({ children: [new Paragraph(total.toFixed(2))] })
      ]
    }));
  }
  const table = new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
  const doc = new Document({ sections: [{ children: [table] }] });
  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verlauf.docx";
    a.click();
    URL.revokeObjectURL(url);
  });
});

exportChartBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "diagramm.png";
  link.href = document.getElementById("expenseChart").toDataURL("image/png");
  link.click();
});

// ================================
// Archiv-Funktion
// ================================
function checkPayday() {
  const today = new Date();
  if (payday > 0 && today.getDate() === payday) {
    if (transactions.length > 0) {
      archives.push({
        date: today.toISOString(),
        transactions: [...transactions]
      });
      transactions = [];
      saveState();
      renderAll();
    }
  }
}
function renderArchive() {
  archiveListEl.innerHTML = "";
  archives.forEach(entry => {
    const div = document.createElement("div");
    div.className = "panel";
    div.textContent = `${new Date(entry.date).toLocaleDateString()}: ${entry.transactions.length} Einträge archiviert`;
    archiveListEl.appendChild(div);
  });
}

// ================================
// Rendering
// ================================
function renderAll() {
  greetingEl.textContent = `Hallo ${userName}`;
  const now = new Date();
  monthTextEl.textContent = now.toLocaleString("de-CH", { month: "long", year: "numeric" });
  currentDateEl.textContent = now.toLocaleString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  updateQuote();

  const budget = parseFloat(localStorage.getItem("totalBudget") || "0");
  const spent = transactions.reduce((sum, tx) => sum + tx.amt, 0);
  const remaining = budget - spent;
  spentEl.textContent = formatCurrency(spent);
  remainingEl.textContent = formatCurrency(remaining);
  remainingEl.classList.toggle("red-alert", remaining < 200);

  // Liste
  transactionListEl.innerHTML = "";
  transactions.forEach(tx => {
    const div = document.createElement("div");
    div.className = "panel";
    div.textContent = `${tx.cat}: ${tx.desc} - ${formatCurrency(tx.amt)}`;
    transactionListEl.appendChild(div);
  });

  // Verlauf
  historyListEl.innerHTML = "";
  transactions.forEach(tx => {
    const div = document.createElement("div");
    div.className = "panel";
    div.textContent = `${new Date(tx.date).toLocaleDateString()}: ${tx.cat} - ${tx.desc} (${formatCurrency(tx.amt)})`;
    historyListEl.appendChild(div);
  });

  // Gespart
  savedAmountEl.textContent = formatCurrency(remaining);

  renderCategories();
  renderChart();
  renderArchive();
}

// ================================
// Tab Navigation
// ================================
document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".bottom-nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tabId = btn.dataset.tab;
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(`tab-${tabId}`).classList.add("active");
  });
});

// ================================
// Initialisierung
// ================================
document.body.className = `theme-${currentTheme}`;
renderAll();
checkPayday();
