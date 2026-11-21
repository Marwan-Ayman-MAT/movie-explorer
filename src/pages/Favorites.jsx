import { Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { MovieGrid } from "../components/MovieGrid";
import { useMovies } from "../context/MovieContext";

export default function Favorites() {
  const { favorites, genreMap } = useMovies();

  return (
    <main className="page-main page-shell favorites-page">
      <section className="page-intro favorites-intro">
        <div><span className="eyebrow"><Heart size={13} /> YOUR PERSONAL SHORTLIST</span><h1>My Favorites</h1><p>All the films you want to remember, together in one place.</p></div>
        <div className="watchlist-count"><span className="watchlist-count__icon"><Sparkles size={19} /></span><div><strong>{String(favorites.length).padStart(2, "0")}</strong><span>{favorites.length === 1 ? "film saved" : "films saved"}</span></div></div>
      </section>
      {favorites.length > 0 ? <><div className="results-header favorites-results"><p>Your next movie night is already looking good.</p><span className="saved-indicator"><span /> SAVED LOCALLY</span></div><MovieGrid movies={favorites} genreMap={genreMap} /></> : <div className="watchlist-empty"><span className="watchlist-empty__icon"><Heart size={25} /></span><span className="eyebrow">A LITTLE ROOM FOR MAGIC</span><h2>You haven't added any favorites yet.</h2><p>Save a few films as you explore, and they’ll be right here when it’s time to pick your next watch.</p><Link className="button button--primary" to="/movies"><Sparkles size={16} /> Explore Movies</Link></div>}
    </main>
  );
}
