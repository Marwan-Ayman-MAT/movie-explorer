import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useMovies } from "../context/MovieContext";

function formatYear(date) {
  if (!date) return "—";
  return new Date(`${date}T12:00:00`).getFullYear();
}

function Poster({ movie, className = "" }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`poster ${className}`}>
      {movie.poster && !broken ? <img src={movie.poster} alt={`${movie.title} poster`} loading="lazy" onError={() => setBroken(true)} /> : <div className="poster-fallback"><span>{movie.title}</span></div>}
    </div>
  );
}

export default function MovieCard({ movie, genreMap = {}, index = 0 }) {
  const { toggleFavorite, isFavorite } = useMovies();
  const saved = isFavorite(movie.id);
  const labels = (movie.genreIds || []).map((id) => genreMap[String(id)]).filter(Boolean).slice(0, 2);
  const favoriteLabel = saved ? `Remove ${movie.title} from Favorites` : `Add ${movie.title} to Favorites`;

  return (
    <article className="movie-card" style={{ "--card-index": index }}>
      <div className="movie-card__art">
        <Link to={`/movies/${movie.id}`} className="movie-card__poster-link" aria-label={`View ${movie.title} details`}>
          <Poster movie={movie} />
          <span className="poster-hover"><span>View film <span aria-hidden="true">↗</span></span></span>
        </Link>
        <button className={`favorite-toggle ${saved ? "is-favorite" : ""}`} type="button" aria-label={favoriteLabel} title={favoriteLabel} aria-pressed={saved} onClick={() => toggleFavorite(movie)}>
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        {movie.voteAverage >= 8.5 && <span className="critics-pick">Top pick</span>}
      </div>
      <div className="movie-card__body">
        <div className="movie-card__title-row">
          <Link to={`/movies/${movie.id}`} className="movie-card__title">{movie.title}</Link>
          <span className="rating"><Star size={12} fill="currentColor" />{Number(movie.voteAverage).toFixed(1)}</span>
        </div>
        <div className="movie-card__meta"><span>{formatYear(movie.releaseDate)}</span>{labels.length > 0 && <><span className="meta-separator">·</span><span>{labels[0]}</span></>}</div>
      </div>
    </article>
  );
}
