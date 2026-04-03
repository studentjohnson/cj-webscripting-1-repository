const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusMessage = document.getElementById("statusMessage");
const results = document.getElementById("results");

searchBtn.addEventListener("click", runSearch);

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    runSearch();
  }
});

async function runSearch() {
  const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    statusMessage.textContent = "Please enter a meal name first, captain.";
    results.innerHTML = "";
    return;
  }

  statusMessage.textContent = "Cooking up your search...";
  results.innerHTML = "";
  searchBtn.disabled = true;
  searchBtn.textContent = "Loading...";

  const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.meals) {
      statusMessage.textContent = "No meals found. Try another search.";
      return;
    }

    statusMessage.textContent = `Found ${data.meals.length} meal(s).`;

    results.innerHTML = data.meals
      .map(function (meal) {
        return `
          <article class="meal-card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h2>${meal.strMeal}</h2>
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p><strong>Area:</strong> ${meal.strArea}</p>
            <p><strong>Instructions:</strong> ${meal.strInstructions.slice(0, 120)}...</p>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    statusMessage.textContent = "Something went wrong. Please try again.";
    results.innerHTML = "";
    console.error("Meal search error:", error);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
}
