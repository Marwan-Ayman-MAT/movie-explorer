import axios from "axios";

const api = axios.create({
  baseURL: "/api/tmdb",
  headers: { Accept: "application/json" },
  timeout: 15000,
});

const posterUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : "";
const backdropUrl = (path) => path ? `https://image.tmdb.org/t/p/w1280${path}` : "";

export function normalizeMovie(movie) {
  return {
    id: String(movie.id),
    title: movie.title || movie.original_title || "Untitled movie",
    overview: movie.overview || "No synopsis is available for this film yet.",
    poster: posterUrl(movie.poster_path),
    backdrop: backdropUrl(movie.backdrop_path || movie.poster_path),
    releaseDate: movie.release_date || "",
    voteAverage: Number(movie.vote_average || 0),
    popularity: Number(movie.popularity || 0),
    genreIds: (movie.genre_ids || movie.genres?.map((genre) => genre.id) || []).map(String),
    runtime: Number(movie.runtime || 0),
    tagline: movie.tagline || "",
  };
}

async function getMoviePage(path, params = {}) {
  const { data } = await api.get(path, { params: { language: "en-US", include_adult: false, ...params } });
  return {
    items: (data.results || []).map(normalizeMovie),
    page: Number(data.page || 1),
    totalPages: Math.min(500, Number(data.total_pages || 1)),
    totalResults: Number(data.total_results || 0),
  };
}

export const getPopularMovies = ({ page = 1 } = {}) => getMoviePage("/movie/popular", { page });
export const getNowPlayingMovies = ({ page = 1 } = {}) => getMoviePage("/movie/now_playing", { page });
export const getTopRatedMovies = ({ page = 1 } = {}) => getMoviePage("/movie/top_rated", { page });
export const getTrendingMovies = ({ page = 1 } = {}) => getMoviePage("/trending/movie/week", { page });
export const searchMovies = (query, page = 1) => getMoviePage("/search/movie", { query, page });

export function discoverMovies({ genreId = "all", sortBy = "popular", page = 1 }) {
  const sortMap = {
    popular: "popularity.desc",
    rating: "vote_average.desc",
    recent: "primary_release_date.desc",
  };
  return getMoviePage("/discover/movie", {
    page,
    sort_by: sortMap[sortBy] || sortMap.popular,
    ...(genreId !== "all" ? { with_genres: genreId } : {}),
    ...(sortBy === "rating" ? { "vote_count.gte": 100 } : {}),
  });
}

export async function getMovieById(id) {
  const { data } = await api.get(`/movie/${encodeURIComponent(id)}`, { params: { language: "en-US" } });
  return normalizeMovie(data);
}

export async function getMovieTrailer(id) {
  const { data } = await api.get(`/movie/${encodeURIComponent(id)}/videos`, { params: { language: "en-US" } });
  const videos = data.results || [];
  const trailer = videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official)
    || videos.find((video) => video.site === "YouTube" && video.type === "Trailer")
    || videos.find((video) => video.site === "YouTube" && video.type === "Teaser");
  return trailer?.key ? `https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}` : "";
}

export const getSimilarMovies = (id, page = 1) => getMoviePage(`/movie/${encodeURIComponent(id)}/similar`, { page });

export async function getGenres() {
  const { data } = await api.get("/genre/movie/list", { params: { language: "en-US" } });
  return (data.genres || []).map((genre) => ({ id: String(genre.id), name: genre.name }));
}
