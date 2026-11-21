import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, ExternalLink, Heart, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getMovieById, getMovieTrailer, getSimilarMovies } from "../api/tmdb";
import { ErrorState, LoadingState, MovieGrid } from "../components/MovieGrid";
import { useMovies } from "../context/MovieContext";

export default function MovieDetails() {
  const { id } = useParams();
  const { genreMap, isFavorite, toggleFavorite } = useMovies();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setTrailerUrl("");
    getMovieById(id).then((data) => { if (active) setMovie(data); }).catch(() => { if (active) setError("We couldn't find this film in the catalogue."); }).finally(() => { if (active) setLoading(false); });
    getSimilarMovies(id).then((data) => { if (active) setSimilar(data.items.slice(0, 4)); }).catch(() => { if (active) setSimilar([]); });
    getMovieTrailer(id).then((url) => { if (active) setTrailerUrl(url); }).catch(() => { if (active) setTrailerUrl(""); });
    return () => { active = false; };
  }, [id, retryCount]);

  const liveMovie = movie ? { ...movie, isFavorite: isFavorite(movie.id) } : null;

  if (loading) return <main className="page-shell page-main"><LoadingState message="Finding the details…" /></main>;
  if (error || !liveMovie) return <main className="page-shell page-main"><ErrorState message={error || "This movie isn't here."} onRetry={() => setRetryCount((count) => count + 1)} /><Link to="/movies" className="back-link"><ArrowLeft size={16} /> Back to Movies</Link></main>;

  const genres = (liveMovie.genreIds || []).map((genreId) => genreMap[String(genreId)]).filter(Boolean);
  const releaseDate = liveMovie.releaseDate
    ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${liveMovie.releaseDate}T00:00:00Z`))
    : "Release date unavailable";
  const saved = isFavorite(liveMovie.id);

  return (
    <main className="details-page">
      <section className="detail-hero" style={{ "--detail-image": `url("${liveMovie.backdrop || liveMovie.poster}")` }}>
        <div className="detail-hero__scrim" />
        <div className="page-shell detail-hero__inner">
          <Link to="/movies" className="back-link back-link--light"><ArrowLeft size={16} /> Back to Movies</Link>
          <div className="detail-content">
            <div className="detail-poster">{liveMovie.poster ? <img src={liveMovie.poster} alt={`${liveMovie.title} poster`} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="poster-fallback"><span>{liveMovie.title}</span></div>}</div>
            <div className="detail-copy">
              <span className="eyebrow">THE FEATURE PRESENTATION</span>
              <h1>{liveMovie.title}</h1>
              {liveMovie.tagline && <p className="detail-tagline">“{liveMovie.tagline}”</p>}
              <div className="detail-facts"><span><CalendarDays size={15} /> {releaseDate}</span><span><Star size={15} fill="currentColor" /> {Number(liveMovie.voteAverage).toFixed(1)} <small>/ 10</small></span>{liveMovie.runtime > 0 && <span><Clock3 size={15} /> {Math.floor(liveMovie.runtime / 60)}h {liveMovie.runtime % 60}m</span>}</div>
              <div className="detail-genres">{genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
              <p className="detail-overview">{liveMovie.overview}</p>
              <div className="detail-actions"><button className={`button ${saved ? "button--saved" : "button--primary"}`} type="button" aria-pressed={saved} onClick={() => toggleFavorite(liveMovie)}><Heart size={17} fill={saved ? "currentColor" : "none"} />{saved ? "Remove from Favorites" : "Add to Favorites"}</button><Link className="button button--glass" to="/favorites">My Favorites <ArrowRight size={16} /></Link>{trailerUrl && <a className="button button--glass" href={trailerUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Watch Trailer</a>}</div>
            </div>
          </div>
          <span className="detail-vertical-note">A FILM TO REMEMBER <i /></span>
        </div>
      </section>
      {similar.length > 0 && <section className="content-section page-shell similar-section"><div className="section-heading"><div><span className="eyebrow">IF YOU LIKED THIS ONE</span><h2>Similar Movies</h2></div><Link className="text-link" to="/movies">Browse all <ArrowRight size={16} /></Link></div><MovieGrid movies={similar} genreMap={genreMap} /></section>}
    </main>
  );
}
