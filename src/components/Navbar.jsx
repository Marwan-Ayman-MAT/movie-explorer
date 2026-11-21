import { useState } from "react";
import { Film, Heart, Menu, Search, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useMovies } from "../context/MovieContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "Favorites", to: "/favorites" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { favorites } = useMovies();
  const favoriteCount = favorites.length;

  return (
    <header className="site-header">
      <div className="site-header__inner page-shell">
        <Link to="/" className="brand" aria-label="Reelgood home" onClick={() => setMenuOpen(false)}>
          <span className="brand__mark"><Film size={18} strokeWidth={2.3} /></span>
          <span>reelgood<span className="brand__period">.</span></span>
        </Link>

        <nav className={`main-nav ${menuOpen ? "main-nav--open" : ""}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setMenuOpen(false)} className={({ isActive }) => `main-nav__link ${isActive ? "is-active" : ""}`}>
              {item.label}
              {item.to === "/favorites" && favoriteCount > 0 && <span className="nav-count">{favoriteCount}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/movies?focus=search" className="icon-link header-search" aria-label="Search movies"><Search size={19} /></Link>
          <Link to="/favorites" className="watchlist-shortcut" aria-label={`Favorites, ${favoriteCount} saved movies`}><Heart size={17} /><span>{favoriteCount}</span></Link>
          <button className="icon-link menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}
