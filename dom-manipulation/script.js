let quotes = [];
let selectedCategory = "all";

const SYNC_INTERVAL = 60000; // 60 seconds
const MOCK_API_URL = "https://jsonplaceholder.typicode.com/posts";

// Load quotes from localStorage or use defaults
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

// Store and restore last selected category
function saveLastSelectedCategory(category) {
  localStorage.setItem("lastSelectedCategory", category);
}

function getLastSelectedCategory() {
  return localStorage.getItem("lastSelectedCategory") || "all";
}

// Populate dropdown with categories
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const storedCategory = getLastSelectedCategory();
  selectedCategory = storedCategory;

  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === storedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// Show a random quote from selected category
function showRandomQuote() {
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  saveLastSelectedCategory(selectedCategory);
}

// Handle category selection
function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  showRandomQuote();
}

// Restore last viewed quote
function restoreLastState() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  }
}

// Add quote and sync to server
function addQuote() {
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  quoteInput.value = "";
  categoryInput.value = "";

  sendQuoteToServer(newQuote);
  alert("New quote added and synced to server!");
}

// Build dynamic form
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

// Export quotes as JSON
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import quotes from JSON file
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

// ✅ Fetch quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(MOCK_API_URL);
    const data = await response.json();

    return data.slice(0, 3).map((post, i) => ({
      text: post.title,
      category: ["Inspiration", "Motivation", "Action"][i % 3]
    }));
  } catch (err) {
    console.error("Failed to fetch from server:", err);
    return [];
  }
}

// ✅ POST quote to mock server
async function sendQuoteToServer(quote) {
  try {
    const response = await fetch(MOCK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    if (response.ok) {
      console.log("Quote sent to server:", quote);
    } else {
      console.error("Failed to send quote to server");
    }
  } catch (error) {
    console.error("Error sending quote:", error);
  }
}

// Sync with server and resolve conflicts (server wins)
async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  let newQuotes = 0;

  for (const serverQuote of serverQuotes) {
    const exists = quotes.some(q => q.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
      newQuotes++;
    }
  }

  if (newQuotes > 0) {
    saveQuotes();
    populateCategories();
    notifySync(`🔄 Synced ${newQuotes} new quotes from s
