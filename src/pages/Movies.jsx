import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, ArrowDownWideNarrow, Clapperboard } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ErrorState, LoadingState, MovieGrid } from "../components/MovieGrid";
import { discoverMovies, getPopularMovies, getTrendingMovies, searchMovies } from "../api/tmdb";
import { useMovies } from "../context/MovieContext";

function sortMovies(movies, sortBy) {
  const sorters = {
    popular: (a, b) => b.popularity - a.popularity,
    rating: (a, b) => b.voteAverage - a.voteAverage,
    recent: (a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""),
  };
  return [...movies].sort(sorters[sortBy] || sorters.popular);
}

function filterAndSort(result, { genreId, sortBy }) {
  const filtered = genreId === "all"
    ? result.items
    : result.items.filter((movie) => movie.genreIds.includes(String(genreId)));
  return { ...result, items: sortMovies(filtered, sortBy) };
}

async function requestPage({ search, genreId, sortBy, page, collection }) {
  if (search) return filterAndSort(await searchMovies(search, page), { genreId, sortBy });
  if (collection === "trending") return filterAndSort(await getTrendingMovies({ page }), { genreId, sortBy });
  if (genreId !== "all" || sortBy !== "popular") return discoverMovies({ genreId, sortBy, page });
  return getPopularMovies({ page });
}

function uniqueMovies(movies) {
  return [...new Map(movies.map((movie) => [movie.id, movie])).values()];
}

export default function Movies() {
  const { genres, genreMap } = useMovies();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [activeGenre, setActiveGenre] = useState(params.get("genre") || "all");
  const [sortBy, setSortBy] = useState(params.get("sort") || "popular");
  const [collection, setCollection] = useState(params.get("collection") || "");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    if (params.get("focus") === "search") searchRef.current?.focus();
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRequestError("");
    const timer = window.setTimeout(async () => {
      try {
        const result = await requestPage({ search: search.trim(), genreId: activeGenre, sortBy, page: 1, collection });
        if (!cancelled) {
          setItems(result.items);
          setPage(1);
          setTotalPages(result.totalPages);
          setTotalResults(result.totalResults);
        }
      } catch {
        if (!cancelled) setRequestError("The movie results could not be loaded. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search.trim() ? 300 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [search, activeGenre, sortBy, collection, retryCount]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (search.trim()) next.set("q", search.trim());
    if (activeGenre !== "all") next.set("genre", activeGenre);
    if (sortBy !== "popular") next.set("sort", sortBy);
    if (collection === "trending") next.set("collection", collection);
    setParams(next, { replace: true });
  }, [search, activeGenre, sortBy, collection, setParams]);

  const clearFilters = () => { setSearch(""); setActiveGenre("all"); setSortBy("popular"); setCollection(""); };
  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setRequestError("");
    try {
      const result = await requestPage({ search: search.trim(), genreId: activeGenre, sortBy, page: nextPage, collection });
      setItems((current) => {
        const combined = uniqueMovies([...current, ...result.items]);
        return search.trim() || collection === "trending" ? sortMovies(combined, sortBy) : combined;
      });
      setPage(nextPage);
    } catch {
      setRequestError("More movies could not be loaded. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="page-main page-shell movies-page">
      <section className="page-intro">
        <div><span className="eyebrow">THE REELGOOD COLLECTION</span><h1>Explore Movies</h1><p>Search for a title, filter by genre, or sort the collection to find your next favorite.</p></div>
        <div className="page-intro__stamp"><Clapperboard size={23} /><span>Millions of films<br />to discover</span></div>
      </section>

      <section className="browse-tools" aria-label="Search and filter movies">
        <label className="search-box"><Search size={19} /><span className="sr-only">Search for movies</span><input ref={searchRef} type="search" placeholder="Search for movies…" value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" className="search-clear" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}</label>
        <div className="sort-box"><ArrowDownWideNarrow size={17} /><label className="sr-only" htmlFor="sort-movies">Sort movies</label><select id="sort-movies" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="popular">Popularity</option><option value="rating">Rating</option><option value="recent">Release Date</option></select></div>
      </section>

      <section className="genre-filter" aria-label="Filter by genre">
        <div className="genre-filter__label"><SlidersHorizontal size={14} /><span>FILTER BY GENRE</span></div>
        <div className="genre-chips"><button type="button" className={`genre-chip ${activeGenre === "all" ? "is-active" : ""}`} onClick={() => setActiveGenre("all")}>All films</button>{genres.map((genre) => <button key={genre.id} type="button" className={`genre-chip ${String(activeGenre) === String(genre.id) ? "is-active" : ""}`} onClick={() => setActiveGenre(String(genre.id))}>{genre.name === "Science Fiction" ? "Sci-Fi" : genre.name}</button>)}</div>
      </section>

      <div className="results-header"><p><strong>{loading ? "…" : (search && activeGenre !== "all") || (collection === "trending" && activeGenre !== "all") ? items.length : totalResults}</strong> {((search && activeGenre !== "all") || (collection === "trending" && activeGenre !== "all")) ? "films shown" : totalResults === 1 ? "film" : "films"}{search && <> matching <span>“{search}”</span></>}{activeGenre !== "all" && <> in <span>{genreMap[activeGenre]}</span></>}{collection === "trending" && !search && <span> · Trending</span>}</p>{(search || activeGenre !== "all" || collection === "trending") && <button type="button" className="clear-filters" onClick={clearFilters}>Clear filters <X size={14} /></button>}</div>
      {loading ? <LoadingState message="Finding your next watch…" /> : requestError ? <ErrorState message={requestError} onRetry={() => setRetryCount((count) => count + 1)} /> : <MovieGrid movies={items} genreMap={genreMap} />}
      {!loading && !requestError && page < totalPages && <div className="load-more-wrap"><button type="button" className="button button--soft load-more" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading more…" : "Load more films"}</button></div>}
    </main>
  );
}
