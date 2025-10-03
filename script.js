const API_KEY = "aed5acb88a9374b39d1662a6f4eb4c8f";
const BASE_URL = "https://api.themoviedb.org/3";

let currentPage = 1;
let currentQuery = "";
let currentMode = "search"; // "search", "genre", "trending", "favorites"

document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const query = document.getElementById("searchInput").value;
  if (query) searchMovies(query);
});

function searchMovies(query, page = 1) {
  currentQuery = query;
  currentPage = page;
  currentMode = "search";
  fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ja&page=${page}`)
    .then(res => res.json())
    .then(data => {
      displayResults(data.results, page > 1);
      toggleLoadMore(data.page < data.total_pages);
    });
}

function searchByGenre(genreId, page = 1) {
  currentQuery = genreId;
  currentPage = page;
  currentMode = "genre";
  fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=ja&page=${page}`)
    .then(res => res.json())
    .then(data => {
      displayResults(data.results, page > 1);
      toggleLoadMore(data.page < data.total_pages);
    });
}

function searchKeyword(keyword) {
  searchMovies(keyword);
}

function fetchTrending(page = 1) {
  currentPage = page;
  currentMode = "trending";
  fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=ja&page=${page}`)
    .then(res => res.json())
    .then(data => {
      displayResults(data.results, page > 1);
      toggleLoadMore(data.page < data.total_pages);
    });
}

function displayResults(movies, append = false) {
  const results = document.getElementById("results");
  if (!append) results.innerHTML = "";
  if (!movies || movies.length === 0) {
    results.innerHTML = "<p>該当する映画が見つかりませんでした。</p>";
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => showDetails(movie.id);

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Image";

    const overview = movie.overview
      ? movie.overview.slice(0, 100) + (movie.overview.length > 100 ? "..." : "")
      : "説明はありません。";

    card.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>公開日: ${movie.release_date || "不明"}</p>
      <p>⭐ ${movie.vote_average || "N/A"}</p>
      <p>${overview}</p>
      ${currentMode === "favorites" 
        ? `<button onclick="event.stopPropagation(); removeFromFavorites(${movie.id})">❌ 削除</button>`
        : `<button onclick="event.stopPropagation(); addToFavorites(${movie.id}, '${movie.title.replace(/'/g, "\'")}', '${poster}')">⭐ お気に入り</button>`}
    `;
    results.appendChild(card);
  });
}

function toggleLoadMore(show) {
  document.getElementById("loadMoreBtn").style.display = show ? "block" : "none";
}

function loadMore() {
  currentPage++;
  if (currentMode === "search") {
    searchMovies(currentQuery, currentPage);
  } else if (currentMode === "genre") {
    searchByGenre(currentQuery, currentPage);
  } else if (currentMode === "trending") {
    fetchTrending(currentPage);
  }
}

function addToFavorites(id, title, poster) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.some(m => m.id === id)) {
    favorites.push({ id, title, poster });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("お気に入りに追加しました！");
  } else {
    alert("すでにお気に入りに入っています");
  }
}

function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(m => m.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showFavorites();
}

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  currentMode = "favorites";
  currentPage = 1;
  toggleLoadMore(false);
  displayResults(favorites);
}

function showDetails(id) {
  fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ja`)
    .then(res => res.json())
    .then(movie => {
      const modalBody = document.getElementById("modal-body");
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";
      modalBody.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="${poster}" style="max-width:200px;">
        <p><strong>公開日:</strong> ${movie.release_date}</p>
        <p><strong>評価:</strong> ⭐ ${movie.vote_average}</p>
        <p>${movie.overview}</p>
      `;
      document.getElementById("modal").style.display = "flex";
    });
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}