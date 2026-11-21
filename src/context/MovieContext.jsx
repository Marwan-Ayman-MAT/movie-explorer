import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getGenres, getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getTrendingMovies } from "../api/tmdb";
import { readFavorites, writeFavorites } from "../utils/favoritesStorage";

const MovieContext = createContext(null);

export function MovieProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState(readFavorites);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [popularData, nowPlayingData, trendingData, topRatedData, genreData] = await Promise.all([
        getPopularMovies(),
        getNowPlayingMovies(),
        getTrendingMovies(),
        getTopRatedMovies(),
        getGenres(),
      ]);
      setMovies(popularData.items);
      setNowPlaying(nowPlayingData.items);
      setTrending(trendingData.items);
      setTopRated(topRatedData.items);
      setGenres(genreData);
    } catch {
      setError("Live movie data could not load. Check your TMDB token in .env.local and start the app with npm run start.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const isFavorite = useCallback((id) => favorites.some((movie) => String(movie.id) === String(id)), [favorites]);

  const toggleFavorite = useCallback((movie) => {
    const id = String(movie.id);
    const wasSaved = favorites.some((saved) => String(saved.id) === id);
    const next = wasSaved
      ? favorites.filter((saved) => String(saved.id) !== id)
      : [{ ...movie, id, isFavorite: true }, ...favorites];
    try {
      writeFavorites(next);
      setFavorites(next);
      const update = (items) => items.map((item) => String(item.id) === id ? { ...item, isFavorite: !wasSaved } : item);
      setMovies(update);
      setNowPlaying(update);
      setTrending(update);
      setTopRated(update);
      setActionError("");
    } catch {
      setActionError("Your watchlist could not be saved in this browser.");
      window.setTimeout(() => setActionError(""), 4200);
    }
  }, [favorites]);

  const genreMap = useMemo(() => Object.fromEntries(genres.map((genre) => [String(genre.id), genre.name])), [genres]);

  return (
    <MovieContext.Provider value={{ movies, nowPlaying, trending, topRated, genres, genreMap, favorites, isFavorite, isLoading, error, actionError, reload, toggleFavorite }}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("useMovies must be used inside MovieProvider");
  return context;
}
