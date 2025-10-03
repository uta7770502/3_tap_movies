const API_KEY = "aed5acb88a9374b39d1662a6f4eb4c8f";
const BASE_URL = "https://api.themoviedb.org/3";

document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const query = document.getElementById("searchInput").value;
  if (query) searchMovies(query);
});

function searchMovies(query) {
  fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ja`)
    .then(res => res.json())
    .then(data => displayResults(data.results))
    .catch(err => console.error(err));
}

function searchByGenre(genreId) {
  fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=ja`)
    .then(res => res.json())
    .then(data => displayResults(data.results))
    .catch(err => console.error(err));
}

function searchKeyword(keyword) {
  searchMovies(keyword);
}

function fetchTrending() {
  fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=ja`)
    .then(res => res.json())
    .then(data => displayResults(data.results))
    .catch(err => console.error(err));
}

function displayResults(movies) {
  const results = document.getElementById("results");
  results.innerHTML = "";
  if (!movies || movies.length === 0) {
    results.innerHTML = "<p>該当する映画が見つかりませんでした。</p>";
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

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
    `;
    results.appendChild(card);
  });
}