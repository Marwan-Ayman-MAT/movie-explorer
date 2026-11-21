import { Clapperboard, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

export function MovieGrid({ movies, genreMap, className = "" }) {
  if (!movies.length) return <EmptyMovies />;
  return <div className={`movie-grid ${className}`}>{movies.map((movie, index) => <MovieCard key={movie.id} movie={movie} genreMap={genreMap} index={index} />)}</div>;
}

export function EmptyMovies({ title = "Nothing here yet", description = "Try another search, or explore the full collection.", action = true }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon"><Clapperboard size={23} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <Link className="button button--soft" to="/movies"><Compass size={16} /> Explore Movies</Link>}
    </div>
  );
}

export function LoadingState({ message = "Finding something good…" }) {
  return <div className="loading-state" role="status"><span className="spinner" /><span>{message}</span></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="error-state" role="alert"><span className="error-state__mark">!</span><div><h3>We hit a small plot twist</h3><p>{message}</p>{onRetry && <button className="button button--soft" onClick={onRetry} type="button">Try again</button>}</div></div>;
}
