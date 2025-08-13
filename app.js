document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const menuBtn = document.getElementById("menuButton");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenuBtn = document.getElementById("closeMenu");
  const menuItems = document.querySelectorAll(".menu-item");

  const greeting = document.getElementById("greeting");
  const monthText = document.getElementById("monthText");
  const currentDate = document.getElementById("currentDate");
  const quoteEl = document.getElementById("quote");
  const remainingEl = document.getElementById("remaining");

  const userNameInput = document.getElementById("userName");
  const saveNameBtn = document.getElementById("saveName");
  const welcomeModal = document.getElementById("welcomeModal");
  const infoModal = document.getElementById("infoModal");
  const categoryInfoModal = document.getElementById("categoryInfoModal");
  const paydayModal = document.getElementById("paydayModal");

  const closeInfoBtn = document.getElementById("closeInfo");
  const closeCategoryInfoBtn = document.getElementById("closeCategoryInfo");
  const paydaySelect = document.getElementById("paydaySelect");
  const savePaydayBtn = document.getElementById("savePayday");

  const txCategory = document.getElementById("txCategory");
  const txDesc = document.getElementById("txDesc");
  const txAmount = document.getElementById("txAmount");
  const addTxBtn = document.getElementById("addTx");

  const totalBudgetInput = document.getElementById("totalBudget");
  const saveBudgetBtn = document.getElementById("saveBudget");
  const spentEl = document.getElementById("spent");

  const historyList = document.getElementById("historyList"); // jetzt in Tab Auflistung
  const transactionList = document.getElementById("transactionList"); // jetzt in Tab Verlauf

  const exportCSVBtn = document.getElementById("exportCSV");
  const exportWordBtn = document.getElementById("exportWord");
  const exportChartBtn = document.getElementById("exportChart");

  const categoriesList = document.getElementById("categoriesList");
  const newCategoryName = document.getElementById("newCategoryName");
  const addCategoryBtn = document.getElementById("addCategory");

  const archiveList = document.getElementById("archiveList");
  const savedAmountEl = document.getElementById("savedAmount");

  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  let totalBudget = parseFloat(localStorage.getItem("totalBudget") || "0");
  let categories = JSON.parse(localStorage.getItem("categories") || "[]");
  let userName = localStorage.getItem("userName") || "";
  let payday = parseInt(localStorage.getItem("payday") || "1");
  let archives = JSON.parse(localStorage.getItem("archives") || "[]");

  const quotes = [
    "Spare, bevor du ausgibst.",
    "Kleine Schritte führen zu großen Ersparnissen.",
    "Disziplin heute, Freiheit morgen.",
    "Ein Budget ist ein Plan für deine Träume.",
    "Jeder Franken zählt."
  ];

  /* ========== INIT ========== */
  const now = new Date();
  const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  monthText.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  currentDate.textContent = now.toLocaleString("de-CH");
  quoteEl.innerHTML = `<span style="color:var(--accent)">„</span>${quotes[now.getDate() % quotes.length]}<span style="color:var(--accent)">“</span>`;

  if (!userName) {
    welcomeModal.setAttribute("aria-hidden", "false");
  } else {
    greeting.textContent = `Hallo ${userName}`;
    checkPayday();
  }

  renderCategories();
  renderTransactions();
  updateBudget();

  /* ========== MENU ========== */
  menuBtn.addEventListener("click", () => {
    menuOverlay.setAttribute("aria-hidden", "false");
  });
  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.setAttribute("aria-hidden", "true");
  });
  menuOverlay.addEventListener("click", e => {
    if (e.target.id === "menuBackdrop") {
      menuOverlay.setAttribute("aria-hidden", "true");
    }
  });
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.getElementById(`tab-${item.dataset.tab}`).classList.add("active");
      menuOverlay.setAttribute("aria-hidden", "true");
    });
  });

  /* ========== POPUPS ========== */
  saveNameBtn.addEventListener("click", () => {
    userName = userNameInput.value.trim();
    if (!userName) return;
    localStorage.setItem("userName", userName);
    greeting.textContent = `Hallo ${userName}`;
    welcomeModal.setAttribute("aria-hidden", "true");
    infoModal.setAttribute("aria-hidden", "false");
  });

  closeInfoBtn.addEventListener("click", () => {
    infoModal.setAttribute("aria-hidden", "true");
    categoryInfoModal.setAttribute("aria-hidden", "false");
  });

  closeCategoryInfoBtn.addEventListener("click", () => {
    categoryInfoModal.setAttribute("aria-hidden", "true");
    paydayModal.setAttribute("aria-hidden", "false");
  });

  savePaydayBtn.addEventListener("click", () => {
    payday = parseInt(paydaySelect.value);
    localStorage.setItem("payday", payday);
    paydayModal.setAttribute("aria-hidden", "true");
  });

  /* ========== CATEGORIES ========== */
  addCategoryBtn.addEventListener("click", () => {
    const name = newCategoryName.value.trim();
    if (!name) return;
    categories.push(name);
    localStorage.setItem("categories", JSON.stringify(categories));
    newCategoryName.value = "";
    renderCategories();
  });

  function renderCategories() {
    categoriesList.innerHTML = "";
    txCategory.innerHTML = "";
    categories.forEach(cat => {
      const chip = document.createElement("div");
      chip.className = "panel";
      chip.textContent = cat;
      categoriesList.appendChild(chip);

      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      txCategory.appendChild(option);
    });
  }

  /* ========== TRANSACTIONS ========== */
  addTxBtn.addEventListener("click", () => {
    const category = txCategory.value;
    const desc = txDesc.value.trim();
    const amount = parseFloat(txAmount.value);
    if (!category || !desc || isNaN(amount) || amount <= 0) return;
    transactions.push({ category, desc, amount, date: new Date().toLocaleDateString("de-CH") });
    localStorage.setItem("transactions", JSON.stringify(transactions));
    txDesc.value = "";
    txAmount.value = "";
    renderTransactions();
    updateBudget();
  });

  function renderTransactions() {
    historyList.innerHTML = "";
    transactionList.innerHTML = "";
    transactions.forEach(tx => {
      const el = document.createElement("div");
      el.className = "panel";
      el.textContent = `${tx.date} – ${tx.category}: ${tx.desc} – CHF ${tx.amount.toFixed(2)}`;
      historyList.appendChild(el);
      transactionList.appendChild(el.cloneNode(true));
    });
  }

  /* ========== BUDGET ========== */
  saveBudgetBtn.addEventListener("click", () => {
    totalBudget = parseFloat(totalBudgetInput.value);
    if (isNaN(totalBudget) || totalBudget <= 0) return;
    localStorage.setItem("totalBudget", totalBudget);
    updateBudget();
  });

  function updateBudget() {
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

  /* ========== EXPORTS ========== */
  exportCSVBtn.addEventListener("click", () => {
    let csv = "Kategorie,Beschreibung,Betrag\n";
    transactions.forEach(tx => {
      csv += `${tx.category},${tx.desc},${tx.amount}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verlauf.csv";
    a.click();
  });

  exportWordBtn.addEventListener("click", () => {
    const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = window.docx;
    const rows = transactions.map(tx => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(tx.category)] }),
        new TableCell({ children: [new Paragraph(tx.desc)] }),
        new TableCell({ children: [new Paragraph(`CHF ${tx.amount.toFixed(2)}`)] })
      ]
    }));
    const table = new Table({ rows: [new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Kategorie")] }),
        new TableCell({ children: [new Paragraph("Beschreibung")] }),
        new TableCell({ children: [new Paragraph("Betrag")] })
      ]
    }), ...rows] });
    const doc = new Document({ sections: [{ children: [table] }] });
    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "verlauf.docx";
      a.click();
    });
  });

  exportChartBtn.addEventListener("click", () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "diagramm.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  /* ========== ARCHIVE PAYDAY ========== */
  function checkPayday() {
    const today = new Date();
    if (today.getDate() === payday) {
      if (transactions.length > 0) {
        archives.push({
          date: `${monthNames[today.getMonth()]} ${today.getFullYear()}`,
          transactions: [...transactions],
          total: transactions.reduce((sum, tx) => sum + tx.amount, 0)
        });
        localStorage.setItem("archives", JSON.stringify(archives));
        transactions = [];
        localStorage.setItem("transactions", JSON.stringify([]));
        renderTransactions();
        updateBudget();
        renderArchive();
      }
    }
  }

  function renderArchive() {
    archiveList.innerHTML = "";
    archives.forEach(a => {
      const el = document.createElement("div");
      el.className = "panel";
      el.innerHTML = `<strong>${a.date}</strong> – Total: CHF ${a.total.toFixed(2)}`;
      archiveList.appendChild(el);
    });
  }
  renderArchive();
});
