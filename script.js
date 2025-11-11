const API_KEY = "404cab4ed83fa3debbf7720d25d3d2d6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const popularContainer = document.getElementById("popular-container");
const topRatedContainer = document.getElementById("toprated-container");
const searchInput = document.getElementById("search");
const menu = document.getElementById("menu");
const menuLinks = document.getElementById("menu-links");
const modal = document.getElementById("movie-modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.getElementById("close-modal");

// Utility
function imageUrl(path) { return path ? IMG_URL + path : ""; }

// ===== Load lists =====
getMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`, popularContainer);
getMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`, topRatedContainer);

// Fetch and display movie cards
async function getMovies(url, container) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    container.innerHTML = "";
    data.results.forEach(movie => {
      if (!movie.poster_path) return;
      const el = document.createElement("div");
      el.className = "movie";
      el.innerHTML = `
        <img src="${imageUrl(movie.poster_path)}" alt="${movie.title}">
        <h2>${movie.title}</h2>`;
      el.addEventListener("click", () => openMovieModal(movie.id));
      container.appendChild(el);
    });
  } catch {
    container.innerHTML = "<p>⚠️ Unable to load movies</p>";
  }
}

// ===== Modal with trailer and providers =====
async function openMovieModal(id) {
  modal.classList.remove("hidden");
  modalBody.innerHTML = "<p>Loading details…</p>";

  const [details, videos, providers] = await Promise.all([
    fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`).then(r=>r.json()),
    fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`).then(r=>r.json()),
    fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`).then(r=>r.json())
  ]);

  const trailer = videos.results.find(v => v.site === "YouTube" && v.type === "Trailer");
  const providerList = providers.results?.US?.flatrate || [];

  modalBody.innerHTML = `
    <h2>${details.title}</h2>
    <p>${details.overview || "No description available."}</p>
    ${trailer ? `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>` : "<p>🎥 Trailer not available</p>"}
    ${providerList.length ? `<h3>Available on:</h3><div class="providers">
      ${providerList.map(p => `<div class="provider">${p.provider_name}</div>`).join("")}
    </div>` : "<p>Streaming info not available</p>"}
  `;
}

// Close modal
closeModal.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });

// ===== Search =====
searchInput.addEventListener("keyup", e => {
  const q = e.target.value.trim();
  if (q.length > 2) {
    getMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=en-US&page=1`, popularContainer);
    topRatedContainer.innerHTML = "";
  } else if (q === "") {
    getMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`, popularContainer);
    getMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`, topRatedContainer);
  }
});

// ===== Menu toggle =====
menu.addEventListener("click", () => menuLinks.classList.toggle("hidden"));

// ===== Splash hide =====
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  // fade it out smoothly
  setTimeout(() => {
    splash.classList.add("hidden");
    // fully remove it from the DOM after fade
    setTimeout(() => splash.remove(), 1000);
  }, 2000); // wait 2s before fading out
});
// Ensure modal stays hidden on startup
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("movie-modal").classList.add("hidden");
});