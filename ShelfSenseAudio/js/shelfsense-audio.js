// NOTE:
// The LibriVox API does not support CORS for fetch() requests from the browser.
// Because of this, I went with JSONP instead to retrieve audiobook data.


// ---------------- ELEMENTS ----------------
const searchInput = document.getElementById("searchInput");
const searchType = document.getElementById("searchType");
const searchBtn = document.getElementById("searchBtn");
const statusMessage = document.getElementById("statusMessage");

const searchResults = document.getElementById("searchResults");
const libraryList = document.getElementById("libraryList");
const filterSelect = document.getElementById("filterSelect");

const recommendBtn = document.getElementById("recommendBtn");
const recommendMessage = document.getElementById("recommendMessage");
const recommendResults = document.getElementById("recommendResults");

const totalSaved = document.getElementById("totalSaved");
const favoriteCount = document.getElementById("favoriteCount");
const averageRating = document.getElementById("averageRating");
const topCategory = document.getElementById("topCategory");

const themeBtn = document.getElementById("themeBtn");

// ---------------- DATA ----------------
let library = JSON.parse(localStorage.getItem("audioLibrary")) || [];
let lastSearchBooks = [];

// ---------------- EVENTS ----------------
searchBtn.addEventListener("click", searchAudiobooks);
filterSelect.addEventListener("change", showLibrary);
recommendBtn.addEventListener("click", getRecommendations);
themeBtn.addEventListener("click", toggleTheme);

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchAudiobooks();
  }
});

// ---------------- JSONP FUNCTION ----------------
function fetchJSONP(url, callbackName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    window[callbackName] = function (data) {
      resolve(data);
      document.body.removeChild(script);
      delete window[callbackName];
    };

    script.src = `${url}&callback=${callbackName}`;
    script.onerror = reject;

    document.body.appendChild(script);
  });
}

// ---------------- HELPERS ----------------
function saveLibrary() {
  localStorage.setItem("audioLibrary", JSON.stringify(library));
}

function getAuthorNames(book) {
  if (!book.authors || book.authors.length === 0) {
    return "Unknown Author";
  }

  return book.authors.map(a => `${a.first_name} ${a.last_name}`).join(", ");
}

function getGenreName(book) {
  if (!book.genres || book.genres.length === 0) {
    return "Other";
  }
  return book.genres[0].name;
}

function getCoverImage(book) {
  if (book.coverart && book.coverart !== "") {
    return book.coverart;
  }

  const title = encodeURIComponent(book.title || "Audiobook");
  return `https://covers.openlibrary.org/b/title/${title}-L.jpg`;
}

// ---------------- SEARCH ----------------
async function searchAudiobooks() {
  const searchTerm = searchInput.value.trim();
  const type = searchType.value;

  if (!searchTerm) {
    statusMessage.textContent = "Enter something to search.";
    return;
  }

  statusMessage.textContent = "Searching...";
  searchResults.innerHTML = "";

  const params = new URLSearchParams();
  params.set(type, searchTerm);
  params.set("format", "jsonp");
  params.set("extended", "1");
  params.set("coverart", "1");
  params.set("limit", "12");

  const url = `https://librivox.org/api/feed/audiobooks/?${params.toString()}`;

  try {
    const data = await fetchJSONP(url, "searchCallback");

    if (!data.books || data.books.length === 0) {
      statusMessage.textContent = "No results found.";
      return;
    }

    statusMessage.textContent = `Found ${data.books.length} results`;
    lastSearchBooks = data.books;
    showSearchResults(data.books);

  } catch (err) {
    statusMessage.textContent = "Something went wrong.";
    console.error(err);
  }
}

// ---------------- DISPLAY ----------------
function showSearchResults(books) {
  searchResults.innerHTML = books.map(book => `
    <div class="book-card">
      <img src="${getCoverImage(book)}">
      <h3>${book.title}</h3>
      <p>${getAuthorNames(book)}</p>
      <button onclick="addBook(${book.id})">Add</button>
    </div>
  `).join("");
}

// ---------------- LIBRARY ----------------
function addBook(id) {
  const book = lastSearchBooks.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!book) {
    statusMessage.textContent = "Could not add that audiobook.";
    console.log("Book not found:", id);
    console.log("Current search books:", lastSearchBooks);
    return;
  }

  const alreadySaved = library.some(function (item) {
    return String(item.id) === String(book.id);
  });

  if (alreadySaved) {
    statusMessage.textContent = "Already in library.";
    return;
  }

  const newBook = {
    id: String(book.id),
    title: book.title || "Untitled",
    author: getAuthorNames(book),
    image: getCoverImage(book),
    category: getGenreName(book),
    favorite: false,
    rating: 0
  };

  library.push(newBook);
  saveLibrary();
  showLibrary();
  updateStats();

  statusMessage.textContent = `"${newBook.title}" added!`;
}

// ---------------- SHOW LIBRARY ----------------
function showLibrary() {
  if (library.length === 0) {
    libraryList.innerHTML = "<p>No saved books.</p>";
    return;
  }

  libraryList.innerHTML = library.map(book => `
    <div class="book-card">
      <img src="${book.image}">
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <button onclick="toggleFavorite(${book.id})">
        ${book.favorite ? "Unfavorite" : "Favorite"}
      </button>
      <button onclick="removeBook(${book.id})">Remove</button>
    </div>
  `).join("");
}

// ---------------- FAVORITE / REMOVE ----------------
function toggleFavorite(id) {
  const book = library.find(b => b.id === id);
  book.favorite = !book.favorite;
  saveLibrary();
  showLibrary();
  updateStats();
}

function removeBook(id) {
  library = library.filter(b => b.id !== id);
  saveLibrary();
  showLibrary();
  updateStats();
}

// ---------------- STATS ----------------
function updateStats() {
  totalSaved.textContent = library.length;
  favoriteCount.textContent = library.filter(b => b.favorite).length;
}

// ---------------- RECOMMEND ----------------
async function getRecommendations() {
  const top = findTopCategory();

  if (top === "None") {
    recommendMessage.textContent = "Add books first.";
    return;
  }

  recommendMessage.textContent = "Loading recommendations...";

  const params = new URLSearchParams();
  params.set("genre", top);
  params.set("format", "jsonp");
  params.set("extended", "1");
  params.set("coverart", "1");
  params.set("limit", "6");

  const url = `https://librivox.org/api/feed/audiobooks/?${params.toString()}`;

  try {
    const data = await fetchJSONP(url, "recommendCallback");

    recommendResults.innerHTML = data.books.map(book => `
      <div class="book-card">
        <img src="${getCoverImage(book)}">
        <h3>${book.title}</h3>
      </div>
    `).join("");

  } catch (err) {
    recommendMessage.textContent = "Error loading recommendations.";
  }
}

function findTopCategory() {
  if (library.length === 0) return "None";

  const counts = {};
  library.forEach(b => counts[b.category] = (counts[b.category] || 0) + 1);

  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// ---------------- THEME ----------------
function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeBtn.textContent = "Light Mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeBtn.textContent = "Dark Mode";
    localStorage.setItem("theme", "light");
  }
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
}

// ---------------- INIT ----------------
loadTheme();
showLibrary();
updateStats();
