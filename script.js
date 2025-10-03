const apiKey = "YOUR_API_KEY";
let currentPage = 1;
let currentQuery = "";
let currentMode = "";

async function fetchMovies(url, append=false) {
  const res = await fetch(url);
  const data = await res.json();
  const resultsDiv = document.getElementById("results");

  if (!append) resultsDiv.innerHTML = "";

  data.results.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>公開日: ${movie.release_date || "情報なし"}</p>
      <p>評価: ⭐ ${movie.vote_average || "?"}/10</p>
      <p class="overview">${movie.overview ? movie.overview.slice(0, 100) + "..." : "説明なし"}</p>
      <button onclick="toggleFavorite(${movie.id}, '${movie.title.replace(/'/g,"")}')">お気に入り</button>
    `;
    card.onclick = () => showDetails(movie.id);
    resultsDiv.appendChild(card);
  });

  document.getElementById("loadMoreBtn").style.display = data.page < data.total_pages ? "block" : "none";
}

function searchMovies(query) {
  currentQuery = query;
  currentPage = 1;
  currentMode = "search";
  fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ja&query=${query}&page=${currentPage}`);
}

function searchByGenre(id) {
  currentQuery = id;
  currentPage = 1;
  currentMode = "genre";
  fetchMovies(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ja&with_genres=${id}&page=${currentPage}`);
}

function searchKeyword(keyword) {
  searchMovies(keyword);
}

function fetchTrending() {
  currentPage = 1;
  currentMode = "trending";
  fetchMovies(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=ja&page=${currentPage}`);
}

function loadMore() {
  currentPage++;
  if (currentMode === "search") {
    fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ja&query=${currentQuery}&page=${currentPage}`, true);
  } else if (currentMode === "genre") {
    fetchMovies(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ja&with_genres=${currentQuery}&page=${currentPage}`, true);
  } else if (currentMode === "trending") {
    fetchMovies(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=ja&page=${currentPage}`, true);
  }
}

function toggleFavorite(id, title) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.find(f => f.id === id)) {
    favorites = favorites.filter(f => f.id !== id);
  } else {
    favorites.push({id, title});
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert("お気に入りを更新しました！");
}

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  favorites.forEach(fav => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${fav.title}</h3>
      <button onclick="removeFavorite(${fav.id})">削除</button>
    `;
    resultsDiv.appendChild(card);
  });
  document.getElementById("loadMoreBtn").style.display = "none";
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showFavorites();
}

async function showDetails(id) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ja`);
  const movie = await res.json();
  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = `
    <h2>${movie.title}</h2>
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" style="width:100%">
    <p>公開日: ${movie.release_date || "情報なし"}</p>
    <p>評価: ⭐ ${movie.vote_average || "?"}/10</p>
    <p>${movie.overview || "説明なし"}</p>
  `;
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  searchMovies(document.getElementById("searchInput").value);
});