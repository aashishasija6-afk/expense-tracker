const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const categoryTotalsEl = document.getElementById("category-totals");
const transactionCountEl = document.getElementById("transaction-count");
const averageEl = document.getElementById("average");
const listCountEl = document.getElementById("list-count");
const emptyMessage = document.getElementById("empty-message");

const STORAGE_KEY = "pennywise-expenses";

// Load saved expenses safely. Invalid or missing data starts as an empty list.
let expenses = [];
try {
  const savedExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expenses = Array.isArray(savedExpenses) ? savedExpenses : [];
} catch {
  expenses = [];
}

// Set today's date as the default date in the form.
dateInput.value = new Date().toISOString().slice(0, 10);

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatMoney(amount) {
  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function render() {
  list.innerHTML = "";

  // Show newest entries first without changing the saved array.
  [...expenses].reverse().forEach((item) => {
    const li = document.createElement("li");
    li.className = "expense-row";

    const name = document.createElement("span");
    name.className = "expense-name";
    name.textContent = item.title;

    const category = document.createElement("span");
    category.className = "expense-category";
    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = item.category;
    category.appendChild(tag);

    const date = document.createElement("span");
    date.className = "expense-date";
    date.textContent = item.date;

    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = `₹${formatMoney(item.amount)}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", `Delete ${item.title}`);
    deleteBtn.addEventListener("click", () => deleteExpense(item.id));

    li.append(name, category, date, amount, deleteBtn);
    list.appendChild(li);
  });

  updateTotals();
  emptyMessage.hidden = expenses.length > 0;
}

function updateTotals() {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const count = expenses.length;
  totalEl.textContent = formatMoney(total);
  transactionCountEl.textContent = count;
  averageEl.textContent = formatMoney(count ? total / count : 0);
  listCountEl.textContent = `${count} ${count === 1 ? "entry" : "entries"}`;

  const categoryTotals = {};
  expenses.forEach((item) => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) + Number(item.amount);
  });

  categoryTotalsEl.innerHTML = "";
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact-empty";
    const symbol = document.createElement("span");
    symbol.textContent = "◌";
    const message = document.createElement("p");
    message.textContent = "Your category totals will appear here.";
    empty.append(symbol, message);
    categoryTotalsEl.appendChild(empty);
    return;
  }

  sortedCategories.forEach(([category, amount]) => {
    const item = document.createElement("div");
    item.className = "category-item";

    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = category;

    const value = document.createElement("span");
    value.className = "category-amount";
    value.textContent = `₹${formatMoney(amount)}`;

    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${total ? (amount / total) * 100 : 0}%`;

    track.appendChild(fill);
    item.append(name, value, track);
    categoryTotalsEl.appendChild(item);
  });
}

function deleteExpense(id) {
  expenses = expenses.filter((item) => item.id !== id);
  saveExpenses();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || !Number.isFinite(amount) || amount <= 0 || !date) {
    alert("Please enter a valid expense name, amount and date.");
    return;
  }

  const newExpense = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    amount,
    category,
    date
  };

  expenses.push(newExpense);
  saveExpenses();
  render();
  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  titleInput.focus();
});

render();
