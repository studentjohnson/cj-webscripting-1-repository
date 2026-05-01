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

let library = JSON.parse(localStorage.getItem("audioLibrary")) || [];
let lastSearchBooks = [];

searchBtn.addEventListener("click", searchAudiobooks);
filterSelect.addEventListener("change", showLibrary);
recommendBtn.addEventListener("click", getRecommendations);
themeBtn.addEventListener("click", toggleTheme);

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchAudiobooks();
  }
});

function saveLibrary() {
  localStorage.setItem("audioLibrary", JSON.stringify(library));
}

function getAuthorNames(book) {
  if (!book.authors || book.authors.length === 0) {
    return "Unknown Author";
  }

  return book.authors
    .map(function (author) {
      return `${author.first_name} ${author.last_name}`.trim();
    })
    .join(", ");
}

function getGenreName(book) {
  if (!book.genres || book.genres.length === 0) {
    return "Other";
  }

  return book.genres[0].name || "Other";
}

function getCoverImage(book) {
  if (book.coverart) {
    return book.coverart;
  }

  return "https://via.placeholder.com/300x420?text=Audiobook";
}

async function searchAudiobooks() {
  const searchTerm = searchInput.value.trim();
  const type = searchType.value;

  if (searchTerm === "") {
    statusMessage.textContent = "Please enter something to search.";
    searchResults.innerHTML = "";
    return;
  }

  statusMessage.textContent = "Searching the audio shelves...";
  searchResults.innerHTML = "";
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  const params = new URLSearchParams();
  params.set(type, searchTerm);
  params.set("format", "json");
  params.set("extended", "1");
  params.set("coverart", "1");
  params.set("limit", "12");

  const url = `https://librivox.org/api/feed/audiobooks/?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.books || data.books.length === 0) {
      statusMessage.textContent = "No audiobooks found. Try another search.";
      return;
    }

    statusMessage.textContent = `Found ${data.books.length} audiobook(s).`;
    showSearchResults(data.books);
  } catch (error) {
    statusMessage.textContent = "Something went wrong. Please try again.";
    searchResults.innerHTML = "";
    console.error(error);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
}

function showSearchResults(books) {
  lastSearchBooks = books;

  searchResults.innerHTML = books
    .map(function (book) {
      return `
        <div class="book-card">
          <img src="${getCoverImage(book)}" alt="${book.title}">
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${getAuthorNames(book)}</p>
          <p><strong>Category:</strong> ${getGenreName(book)}</p>
          <p class="small-text"><strong>Time:</strong> ${book.totaltime || "Not listed"}</p>
          <div class="card-buttons">
            <button onclick="addBook(${book.id})">Add</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function addBook(bookId) {
  const book = lastSearchBooks.find(function (item) {
    return Number(item.id) === Number(bookId);
  });

  if (!book) {
    statusMessage.textContent = "Could not add that audiobook.";
    return;
  }

  const alreadySaved = library.some(function (item) {
    return Number(item.id) === Number(book.id);
  });

  if (alreadySaved) {
    statusMessage.textContent = "That audiobook is already in your library.";
    return;
  }

  const savedBook = {
    id: Number(book.id),
    title: book.title,
    author: getAuthorNames(book),
    image: getCoverImage(book),
    category: getGenreName(book),
    time: book.totaltime || "Not listed",
    favorite: false,
    rating: 0
  };

  library.push(savedBook);
  saveLibrary();
  showLibrary();
  updateStats();

  statusMessage.textContent = `"${book.title}" was added to your library.`;
}

function showLibrary() {
  const filter = filterSelect.value;
  let booksToShow = library;

  if (filter === "favorites") {
    booksToShow = library.filter(function (book) {
      return book.favorite === true;
    });
  } else if (filter !== "all") {
    booksToShow = library.filter(function (book) {
      return book.category === filter;
    });
  }

  if (booksToShow.length === 0) {
    libraryList.innerHTML = `<p class="empty-message">No audiobooks to show yet.</p>`;
    return;
  }

  libraryList.innerHTML = booksToShow
    .map(function (book) {
      return `
        <div class="book-card">
          <img src="${book.image}" alt="${book.title}">
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Time:</strong> ${book.time}</p>

          <label>Category</label>
          <select onchange="changeCategory(${book.id}, this.value)">
            ${categoryOption(book.category, "Fantasy")}
            ${categoryOption(book.category, "Mystery")}
            ${categoryOption(book.category, "Adventure")}
            ${categoryOption(book.category, "History")}
            ${categoryOption(book.category, "Poetry")}
            ${categoryOption(book.category, "Other")}
          </select>

          <label>Rating</label>
          <select onchange="changeRating(${book.id}, this.value)">
            ${ratingOption(book.rating, 0, "Not Rated")}
            ${ratingOption(book.rating, 1, "1 Star")}
            ${ratingOption(book.rating, 2, "2 Stars")}
            ${ratingOption(book.rating, 3, "3 Stars")}
            ${ratingOption(book.rating, 4, "4 Stars")}
            ${ratingOption(book.rating, 5, "5 Stars")}
          </select>

          <div class="card-buttons">
            <button class="favorite-btn" onclick="toggleFavorite(${book.id})">
              ${book.favorite ? "Unfavorite" : "Favorite"}
            </button>
            <button class="remove-btn" onclick="removeBook(${book.id})">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function categoryOption(currentCategory, optionName) {
  const selected = currentCategory === optionName ? "selected" : "";
  return `<option value="${optionName}" ${selected}>${optionName}</option>`;
}

function ratingOption(currentRating, value, text) {
  const selected = Number(currentRating) === value ? "selected" : "";
  return `<option value="${value}" ${selected}>${text}</option>`;
}

function changeCategory(bookId, newCategory) {
  const book = library.find(function (item) {
    return Number(item.id) === Number(bookId);
  });

  if (book) {
    book.category = newCategory;
    saveLibrary();
    showLibrary();
    updateStats();
  }
}

function changeRating(bookId, newRating) {
  const book = library.find(function (item) {
    return Number(item.id) === Number(bookId);
  });

  if (book) {
    book.rating = Number(newRating);
    saveLibrary();
    updateStats();
  }
}

function toggleFavorite(bookId) {
  const book = library.find(function (item) {
    return Number(item.id) === Number(bookId);
  });

  if (book) {
    book.favorite = !book.favorite;
    saveLibrary();
    showLibrary();
    updateStats();
  }
}

function removeBook(bookId) {
  library = library.filter(function (book) {
    return Number(book.id) !== Number(bookId);
  });

  saveLibrary();
  showLibrary();
  updateStats();
}

function updateStats() {
  totalSaved.textContent = library.length;

  const favorites = library.filter(function (book) {
    return book.favorite === true;
  });

  favoriteCount.textContent = favorites.length;

  const ratedBooks = library.filter(function (book) {
    return book.rating > 0;
  });

  if (ratedBooks.length === 0) {
    averageRating.textContent = "0";
  } else {
    const total = ratedBooks.reduce(function (sum, book) {
      return sum + book.rating;
    }, 0);

    averageRating.textContent = (total / ratedBooks.length).toFixed(1);
  }

  topCategory.textContent = findTopCategory();
}

function findTopCategory() {
  if (library.length === 0) {
    return "None";
  }

  const counts = {};

  library.forEach(function (book) {
    counts[book.category] = (counts[book.category] || 0) + 1;
  });

  let bestCategory = "None";
  let bestCount = 0;

  for (let category in counts) {
    if (counts[category] > bestCount) {
      bestCategory = category;
      bestCount = counts[category];
    }
  }

  return bestCategory;
}

async function getRecommendations() {
  const category = findTopCategory();

  if (category === "None") {
    recommendMessage.textContent = "Add audiobooks first so recommendations can work.";
    recommendResults.innerHTML = "";
    return;
  }

  recommendMessage.textContent = `Looking for more ${category} audiobooks...`;
  recommendResults.innerHTML = "";
  recommendBtn.disabled = true;
  recommendBtn.textContent = "Loading...";

  const params = new URLSearchParams();
  params.set("genre", category);
  params.set("format", "json");
  params.set("extended", "1");
  params.set("coverart", "1");
  params.set("limit", "6");

  const url = `https://librivox.org/api/feed/audiobooks/?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.books || data.books.length === 0) {
      recommendMessage.textContent = "No recommendations found right now.";
      return;
    }

    recommendMessage.textContent = `Recommended because you like ${category}.`;

    recommendResults.innerHTML = data.books
      .map(function (book) {
        return `
          <div class="book-card">
            <img src="${getCoverImage(book)}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${getAuthorNames(book)}</p>
            <p><strong>Category:</strong> ${getGenreName(book)}</p>
            <p class="small-text"><strong>Time:</strong> ${book.totaltime || "Not listed"}</p>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    recommendMessage.textContent = "Could not load recommendations. Try again.";
    recommendResults.innerHTML = "";
    console.error(error);
  } finally {
    recommendBtn.disabled = false;
    recommendBtn.textContent = "Get Recommendations";
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeBtn.textContent = "Switch to Light Mode";
    localStorage.setItem("audioTheme", "dark");
  } else {
    themeBtn.textContent = "Switch to Dark Mode";
    localStorage.setItem("audioTheme", "light");
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem("audioTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "Switch to Light Mode";
  }
}

loadTheme();
showLibrary();
updateStats();
