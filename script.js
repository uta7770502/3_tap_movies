// 🎬 TMDb APIキーを必ず入力してください
const apiKey = "aed5acb88a9374b39d1662a6f4eb4c8f";

let currentPage = 1;
let currentQuery = "";
let currentMode = "";

// -----------------------------
// 映画データを取得＆表示
// -----------------------------
async function fetchMovies(url, append = false) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const resultsDiv = document.getElementById("results");

    if (!append) resultsDiv.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "<p>該当する映画が見つかりませんでした。</p>";
      return;
    }

    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>公開日: ${movie.release_date || "不明"}</p>
        <p>評価: ⭐ ${movie.vote_average}</p>
        <p class="overview">${movie.overview || "説明なし"}</p>
      `;
      card.onclick = () => showDetails(movie.id);
      resultsDiv.appendChild(card);
    });
  } catch (error) {
    console.error("APIエラー:", error);
    document.getElementById("results").innerHTML = "<p>データ取得に失敗しました。</p>";
  }
}

// -----------------------------
// 検索フォーム
// -----------------------------
function searchMovies(query) {
  currentQuery = query;
  currentPage = 1;
  currentMode = "search";
  fetchMovies(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ja-JP&query=${encodeURIComponent(query)}&page=${currentPage}`
  );
}

// -----------------------------
// ジャンル検索
// -----------------------------
function searchByGenre(id) {
  currentQuery = id;
  currentPage = 1;
  currentMode = "genre";
  fetchMovies(
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ja-JP&with_genres=${id}&page=${currentPage}`
  );
}

// -----------------------------
// 人気・トレンド映画
// -----------------------------
function fetchTrending() {
  currentPage = 1;
  currentMode = "trending";
  fetchMovies(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=ja-JP&page=${currentPage}`
  );
}

// -----------------------------
// もっと見る
// -----------------------------
function loadMore() {
  currentPage++;
  if (currentMode === "search") {
    fetchMovies(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ja-JP&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`,
      true
    );
  } else if (currentMode === "genre") {
    fetchMovies(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ja-JP&with_genres=${currentQuery}&page=${currentPage}`,
      true
    );
  } else if (currentMode === "trending") {
    fetchMovies(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=ja-JP&page=${currentPage}`,
      true
    );
  }
}

// -----------------------------
// お気に入り（ローカルストレージ）
// -----------------------------
function toggleFavorite(id, title) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.find(f => f.id === id)) {
    favorites = favorites.filter(f => f.id !== id);
  } else {
    favorites.push({ id, title });
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
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
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showFavorites();
}

// -----------------------------
// 詳細モーダル
// -----------------------------
async function showDetails(id) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ja-JP`
  );
  const movie = await res.json();
  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = `
    <h2>${movie.title}</h2>
    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
    <p>公開日: ${movie.release_date || "不明"}</p>
    <p>評価: ⭐ ${movie.vote_average}</p>
    <p>${movie.overview || "説明なし"}</p>
  `;
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// -----------------------------
// イベントリスナー
// -----------------------------
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const query = document.getElementById("searchInput").value;
  if (query) searchMovies(query);
});

document.getElementById("loadMoreBtn").addEventListener("click", loadMore);
