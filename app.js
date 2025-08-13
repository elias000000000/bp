// ==========================
// Globale Variablen
// ==========================
let transactions = [];
let categories = [];
let archive = [];
let totalBudget = 0;
let payday = null;
let currentTheme = 'standard';
let quotes = [
  "Sparen ist der erste Schritt zum Vermögen.",
  "Kleine Ausgaben summieren sich zu grossen Beträgen.",
  "Wer sein Budget kennt, lebt entspannter.",
  "Planung ist der halbe Weg zum Ziel.",
  "Jeder Franken zählt.",
  "Spare heute, profitiere morgen."
];
let chart = null;

// ==========================
// DOM-Elemente selektieren
// ==========================
const greetingEl = document.getElementById('greeting');
const monthRangeEl = document.getElementById('monthRange');
const monthTextEl = document.getElementById('monthText');
const budgetWordEl = document.getElementById('budgetWord');
const currentDateEl = document.getElementById('currentDate');
const quoteEl = document.getElementById('quote');
const totalBudgetInput = document.getElementById('totalBudget');
const saveBudgetBtn = document.getElementById('saveBudget');
const txCategorySelect = document.getElementById('txCategory');
const txDescInput = document.getElementById('txDesc');
const txAmountInput = document.getElementById('txAmount');
const addTxBtn = document.getElementById('addTx');
const spentEl = document.getElementById('spent');
const remainingEl = document.getElementById('remaining');
const transactionListEl = document.getElementById('transactionList');
const historyListEl = document.getElementById('historyList');
const savedAmountEl = document.getElementById('savedAmount');
const categoriesListEl = document.getElementById('categoriesList');
const newCategoryNameInput = document.getElementById('newCategoryName');
const addCategoryBtn = document.getElementById('addCategory');
const exportWordBtn = document.getElementById('exportWord');
const exportCSVBtn = document.getElementById('exportCSV');
const exportChartBtn = document.getElementById('exportChart');
const paydaySelectSettings = document.getElementById('paydaySelectSettings');
const savePaydaySettingsBtn = document.getElementById('savePaydaySettings');
const archiveListEl = document.getElementById('archiveList');

// Modals
const welcomeModal = document.getElementById('welcomeModal');
const infoModal = document.getElementById('infoModal');
const categoryInfoModal = document.getElementById('categoryInfoModal');
const paydayModal = document.getElementById('paydayModal');
const userNameInput = document.getElementById('userName');
const saveNameBtn = document.getElementById('saveName');
const closeInfoBtn = document.getElementById('closeInfo');
const closeCategoryInfoBtn = document.getElementById('closeCategoryInfo');
const savePaydayBtn = document.getElementById('savePayday');

// Menü-Elemente
const menuButton = document.getElementById('menuButton');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenuBtn = document.getElementById('closeMenu');
const menuItems = document.querySelectorAll('.menu-item');

// ==========================
// Initialisierung
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  showDate();
  showQuote();
  updateUI();
  checkPaydayAutoArchive();
  showModal(welcomeModal);
});

// ==========================
// Funktionen: Datum, Zitat
// ==========================
function showDate() {
  const now = new Date();
  const monthName = now.toLocaleString('de-DE', { month: 'long' });
  const year = now.getFullYear();
  currentDateEl.textContent = now.toLocaleString('de-DE');
  monthTextEl.textContent = `${monthName} ${year}`;
}

function showQuote() {
  const today = new Date().getDate();
  const index = today % quotes.length;
  quoteEl.innerHTML = `<span style="color: var(--accent)">&ldquo;</span>${quotes[index]}<span style="color: var(--accent)">&rdquo;</span>`;
}

// ==========================
// Popups anzeigen
// ==========================
function showModal(modal) {
  modal.setAttribute('aria-hidden', 'false');
}
function hideModal(modal) {
  modal.setAttribute('aria-hidden', 'true');
}

// ==========================
// Budget speichern
// ==========================
saveBudgetBtn.addEventListener('click', () => {
  totalBudget = parseFloat(totalBudgetInput.value) || 0;
  saveState();
  updateUI();
});

// ==========================
// Ausgaben hinzufügen
// ==========================
addTxBtn.addEventListener('click', () => {
  const category = txCategorySelect.value;
  const desc = txDescInput.value.trim();
  const amount = parseFloat(txAmountInput.value) || 0;
  if (!category || !desc || amount <= 0) return;

  transactions.push({ category, desc, amount });
  txDescInput.value = '';
  txAmountInput.value = '';
  saveState();
  updateUI();
});

// ==========================
// Kategorien verwalten
// ==========================
addCategoryBtn.addEventListener('click', () => {
  const name = newCategoryNameInput.value.trim();
  if (!name) return;
  categories.push(name);
  newCategoryNameInput.value = '';
  saveState();
  renderCategories();
});

function renderCategories() {
  categoriesListEl.innerHTML = '';
  txCategorySelect.innerHTML = '';
  categories.forEach(cat => {
    const chip = document.createElement('div');
    chip.className = 'panel';
    chip.textContent = cat;
    chip.addEventListener('click', () => {
      const newName = prompt('Kategorie umbenennen:', cat);
      if (newName) {
        categories[categories.indexOf(cat)] = newName;
        saveState();
        renderCategories();
      }
    });
    chip.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (confirm(`Kategorie "${cat}" löschen?`)) {
        categories = categories.filter(c => c !== cat);
        saveState();
        renderCategories();
      }
    });
    categoriesListEl.appendChild(chip);

    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    txCategorySelect.appendChild(option);
  });
}

// ==========================
// UI aktualisieren
// ==========================
function updateUI() {
  renderCategories();
  renderTransactions();
  updateKPIs();
  renderHistory();
  renderArchive();
}

// ==========================
// KPIs
// ==========================
function updateKPIs() {
  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = totalBudget - spent;
  spentEl.textContent = `CHF ${spent.toFixed(2)}`;
  remainingEl.textContent = `CHF ${remaining.toFixed(2)}`;
  if (remaining < 200) {
    remainingEl.classList.add('red-alert');
  } else {
    remainingEl.classList.remove('red-alert');
  }
  savedAmountEl.textContent = `CHF ${remaining.toFixed(2)}`;
}

// ==========================
// Transaktionen anzeigen
// ==========================
function renderTransactions() {
  transactionListEl.innerHTML = '';
  transactions.forEach(tx => {
    const row = document.createElement('div');
    row.className = 'panel';
    row.innerHTML = `<strong>${tx.category}</strong>: ${tx.desc} - CHF ${tx.amount.toFixed(2)}`;
    transactionListEl.appendChild(row);
  });
}

// ==========================
// Verlauf & Diagramm
// ==========================
function renderHistory() {
  historyListEl.innerHTML = '';
  transactions.forEach(tx => {
    const row = document.createElement('div');
    row.className = 'panel';
    row.textContent = `${tx.category}: ${tx.desc} - CHF ${tx.amount.toFixed(2)}`;
    historyListEl.appendChild(row);
  });

  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (chart) chart.destroy();
  const categorySums = {};
  transactions.forEach(tx => {
    categorySums[tx.category] = (categorySums[tx.category] || 0) + tx.amount;
  });
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categorySums),
      datasets: [{
        data: Object.values(categorySums),
        backgroundColor: [
          '#f1c40f', '#e67e22', '#3498db', '#2ecc71', '#9b59b6', '#ff69b4'
        ]
      }]
    }
  });
}

// ==========================
// Archiv
// ==========================
function renderArchive() {
  archiveListEl.innerHTML = '';
  archive.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'panel';
    row.innerHTML = `<strong>${entry.date}</strong><br><img src="${entry.chart}" style="max-width:100%">`;
    archiveListEl.appendChild(row);
  });
}

function checkPaydayAutoArchive() {
  if (!payday) return;
  const today = new Date();
  if (today.getDate() === payday) {
    const chartImage = chart ? chart.toBase64Image() : '';
    archive.push({
      date: today.toLocaleDateString(),
      transactions: [...transactions],
      chart: chartImage
    });
    transactions = [];
    saveState();
    updateUI();
  }
}

// ==========================
// Exporte
// ==========================
exportCSVBtn.addEventListener('click', () => {
  let csv = 'Kategorie,Beschreibung,Betrag\n';
  transactions.forEach(tx => {
    csv += `${tx.category},${tx.desc},${tx.amount}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'verlauf.csv';
  a.click();
  URL.revokeObjectURL(url);
});

exportWordBtn.addEventListener('click', () => {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun } = docx;
  const tableRows = [];
  const grouped = {};
  transactions.forEach(tx => {
    if (!grouped[tx.category]) grouped[tx.category] = [];
    grouped[tx.category].push(tx);
  });
  Object.keys(grouped).forEach(cat => {
    tableRows.push(new TableRow({
      children: [new TableCell({ children: [new Paragraph({ text: cat, bold: true })], columnSpan: 3 })]
    }));
    grouped[cat].forEach(tx => {
      tableRows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(tx.category)] }),
          new TableCell({ children: [new Paragraph(tx.desc)] }),
          new TableCell({ children: [new Paragraph(`CHF ${tx.amount.toFixed(2)}`)] })
        ]
      }));
    });
    const total = grouped[cat].reduce((sum, t) => sum + t.amount, 0);
    tableRows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Total')] }),
        new TableCell({ children: [new Paragraph('')] }),
        new TableCell({ children: [new Paragraph(`CHF ${total.toFixed(2)}`)]) }
      ]
    }));
  });
  const doc = new Document({
    sections: [{ children: [new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } })] }]
  });
  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verlauf.docx';
    a.click();
    URL.revokeObjectURL(url);
  });
});

exportChartBtn.addEventListener('click', () => {
  if (!chart) return;
  const link = document.createElement('a');
  link.href = chart.toBase64Image();
  link.download = 'diagramm.png';
  link.click();
});

// ==========================
// Menü
// ==========================
menuButton.addEventListener('click', () => {
  menuOverlay.setAttribute('aria-hidden', 'false');
});
closeMenuBtn.addEventListener('click', () => {
  menuOverlay.setAttribute('aria-hidden', 'true');
});
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${item.dataset.tab}`).classList.add('active');
    menuOverlay.setAttribute('aria-hidden', 'true');
  });
});

// ==========================
// Popups
// ==========================
saveNameBtn.addEventListener('click', () => {
  greetingEl.textContent = `Hallo ${userNameInput.value}`;
  hideModal(welcomeModal);
  showModal(infoModal);
});

closeInfoBtn.addEventListener('click', () => {
  hideModal(infoModal);
  showModal(categoryInfoModal);
});

closeCategoryInfoBtn.addEventListener('click', () => {
  hideModal(categoryInfoModal);
  showModal(paydayModal);
});

savePaydayBtn.addEventListener('click', () => {
  payday = parseInt(document.getElementById('paydaySelect').value, 10);
  hideModal(paydayModal);
  saveState();
});

// ==========================
// State speichern/laden
// ==========================
function saveState() {
  localStorage.setItem('budgetState', JSON.stringify({
    transactions, categories, archive, totalBudget, payday, currentTheme
  }));
}
function loadState() {
  const data = JSON.parse(localStorage.getItem('budgetState'));
  if (!data) return;
  transactions = data.transactions || [];
  categories = data.categories || [];
  archive = data.archive || [];
  totalBudget = data.totalBudget || 0;
  payday = data.payday || null;
  currentTheme = data.currentTheme || 'standard';
  document.body.className = `theme-${currentTheme}`;
}
