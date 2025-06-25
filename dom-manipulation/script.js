let quotes = [];

// Load from localStorage or default quotes
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Creativity is intelligence having fun.", category: "Inspiration" },
    { text: "Do what you can with all you have, wherever you are.", category: "Action" }
  ];
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected category to localStorage
function saveLastSelectedCategory(category) {
  localStorage.setItem("lastSelectedCategory", category);
}

// Restore selected category from localStorage
function getLastSelectedCategory() {
  return localStorage.getItem("lastSelectedCategory") || "all";
}

// Populate category dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selected = getLastSelectedCategory();

  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selected) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// Show random quote based on selected category
function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  let filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  saveLastSelectedCategory(category);
}

// Filter and show a quote when dropdown changes
function filterQuotes() {
  showRandomQuote();
}

// Restore last shown quote and category
function restoreLastState() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  }
}

// Add a new quote from form
function addQuote() {
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  quoteInput.value = "";
  categoryInput.value = "";
  alert("New quote added!");
}

// Dynamically create the Add Quote form
function createAddQuoteForm() {
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(formTitle);
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(addButton);
}

// Export all quotes to JSON file
function exportToJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import quotes from a selected JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// App initialization
const quoteDisplay = document.getElementById("quoteDisplay");
loadQuotes();
populateCategories();
createAddQuoteForm();
restoreLastState();
