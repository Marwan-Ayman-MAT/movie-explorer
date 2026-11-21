import { Film } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="page-shell footer-content">
        <div className="footer-brand-block">
          <Link to="/" className="brand brand--footer"><span className="brand__mark"><Film size={17} /></span><span>reelgood<span className="brand__period">.</span></span></Link>
          <p>Good films. Better nights.</p>
        </div>
        <div className="footer-about" id="about">
          <h2>About</h2>
          <p>A movie discovery project for finding popular, trending, and highly rated films.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <h2>Explore</h2>
          <a href="#about">About</a>
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/favorites">Favorites</Link>
          <a href="mailto:?subject=Reelgood%20Movie%20Explorer%20feedback">Contact</a>
        </nav>
        <p className="footer-copyright">© {year} Reelgood Movie Explorer</p>
      </div>
      <section className="tmdb-credit" aria-label="TMDB API attribution"><div className="page-shell tmdb-credit__inner"><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="tmdb-wordmark">TMDB</a><p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p></div></section>
    </footer>
  );
}
