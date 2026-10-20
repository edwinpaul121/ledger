import Link from "next/link";

// Slim attribution strip shown on every page (data-provider terms ask for it).
export default function SiteCredits() {
  return (
    <div className="border-t border-ink-line bg-ink px-6 py-5 text-center text-xs text-paper-faint md:px-20">
      <p>
        Movie &amp; TV data from TMDB. Game data from IGDB. Book data from Open Library. This
        product uses the TMDB API but is not endorsed or certified by TMDB.{" "}
        <Link href="/credits" className="underline hover:text-mint">
          Credits
        </Link>
      </p>
    </div>
  );
}
