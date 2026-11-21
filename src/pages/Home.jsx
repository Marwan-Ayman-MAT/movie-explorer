import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useMovies } from "../context/MovieContext";
import { MovieGrid } from "../components/MovieGrid";

function MovieSection({ eyebrow, title, copy, movies, genreMap, link = "/movies" }) {
  return (
    <section className="content-section page-shell">
      <div className="section-heading">
        <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
        <Link className="text-link" to={link}>See all <ArrowRight size={16} /></Link>
      </div>
      <MovieGrid movies={movies} genreMap={genreMap} />
    </section>
  );
}

export default function Home() {
  const { movies, nowPlaying, trending, topRated, genreMap } = useMovies();
  const featured = nowPlaying[0] || movies[0];
  const popular = [...movies].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const trendingMovies = trending.slice(0, 5);
  const highestRated = topRated.slice(0, 5);
  const featuredOverview = featured?.overview?.length > 190 ? `${featured.overview.slice(0, 187).trimEnd()}…` : featured?.overview;

  return (
    <>
      {featured && (
        <section className="hero" style={{ "--hero-image": `url("${featured.backdrop || featured.poster}")` }} aria-label={`Featured movie: ${featured.title}`}>
          <div className="hero__scrim" />
          <div className="hero__inner page-shell">
            <div className="hero-copy">
              <span className="hero-kicker"><Sparkles size={14} /> FEATURED MOVIE</span>
              <h1>{featured.title}</h1>
              <p className="hero-lede">{featuredOverview}</p>
              <div className="hero-feature">
                <div className="hero-feature__line" />
                <div><span className="hero-feature__label">TONIGHT'S PICK</span><span className="hero-feature__meta">{featured.releaseDate?.slice(0, 4) || "Release date unavailable"} <span>·</span> {genreMap[featured.genreIds?.[0]] || "Featured"} <span>·</span> ★ {Number(featured.voteAverage).toFixed(1)}</span></div>
              </div>
              <div className="hero-actions">
                <Link to={`/movies/${featured.id}`} className="button button--primary"><Play size={16} fill="currentColor" /> View Details</Link>
                <Link to="/movies" className="button button--glass">Browse Movies <ArrowRight size={16} /></Link>
              </div>
            </div>
            <div className="hero-side-note"><span>01</span><span className="hero-side-note__rule" /><span>FEATURED FILM</span></div>
            <div className="hero-index"><span>01</span><span>/</span><span>{String(movies.length).padStart(2, "0")}</span></div>
          </div>
        </section>
      )}

      <main className="home-main">
        <div className="intro-strip page-shell"><div><span className="eyebrow">A BETTER KIND OF MOVIE NIGHT</span><p>Skip the endless scrolling. <span>Find a film you’ll love.</span></p></div><div className="intro-strip__note"><span className="intro-strip__dot" /> A collection of audience favorites</div></div>
        <MovieSection eyebrow="THE CROWD PLEASERS" title="Popular Movies" copy="The films everyone's talking about." movies={popular} genreMap={genreMap} />
        <MovieSection eyebrow="WHAT EVERYONE IS WATCHING" title="Trending Movies" copy="The titles gaining momentum this week." movies={trendingMovies} genreMap={genreMap} link="/movies?collection=trending" />
        <MovieSection eyebrow="FOR THE FILM LOVERS" title="Highest rated" copy="Stories that earned their place on the list." movies={highestRated} genreMap={genreMap} />
        <section className="watchlist-callout page-shell"><div className="watchlist-callout__icon"><Sparkles size={22} /></div><div><span className="eyebrow">YOUR PERSONAL SHORTLIST</span><h2>Save the good ones.</h2><p>Build a watchlist as you explore, so your next movie night is already sorted.</p></div><Link to="/favorites" className="button button--primary">Open my watchlist <ArrowRight size={16} /></Link></section>
      </main>
    </>
  );
}
