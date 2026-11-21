import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Heart } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ErrorState, LoadingState } from "./components/MovieGrid";
import { MovieProvider, useMovies } from "./context/MovieContext";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Movies from "./pages/Movies";

function AppLayout() {
  const { isLoading, error, reload, actionError } = useMovies();
  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      {actionError && <div className="toast-error" role="alert"><Heart size={15} />{actionError}</div>}
      {isLoading ? <main className="page-main page-shell"><LoadingState /></main> : error ? <main className="page-main page-shell"><ErrorState message={error} onRetry={reload} /></main> : <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="*" element={<main className="page-main page-shell not-found"><span className="eyebrow">NOT ON THE BILL</span><h1>This page missed its cue.</h1><p>Let’s get you back to something good.</p><Link to="/" className="button button--primary">Back to Reelgood</Link></main>} />
      </Routes>}
      <Footer />
    </div>
  );
}

export default function App() {
  return <BrowserRouter><MovieProvider><AppLayout /></MovieProvider></BrowserRouter>;
}
