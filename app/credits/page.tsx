import fs from "node:fs";
import path from "node:path";
import { getCatalogMeta } from "@/lib/catalog-meta";

export const dynamic = "force-dynamic";
export const metadata = { title: "Credits · Ledger" };

export default async function CreditsPage() {
  const dump = await getCatalogMeta("books_dump_date");

  // Drop TMDB's official logo (from themoviedb.org/about/logos-attribution) at
  // public/tmdb-logo.svg and it shows up here automatically.
  const hasLogo = fs.existsSync(path.join(process.cwd(), "public", "tmdb-logo.svg"));

  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-10 px-6 py-16 md:px-0">
      <h1 className="font-display text-4xl text-paper">Credits</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-paper">Movies &amp; TV</h2>
        {hasLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/tmdb-logo.svg" alt="TMDB" className="h-6 w-auto self-start" />
        )}
        <p className="text-paper-dim">
          This product uses the TMDB API but is not endorsed or certified by TMDB. Movie and
          show data and images come from{" "}
          <a className="underline hover:text-mint" href="https://www.themoviedb.org">
            The Movie Database (TMDB)
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-paper">Games</h2>
        <p className="text-paper-dim">
          Game data and images come from{" "}
          <a className="underline hover:text-mint" href="https://www.igdb.com">
            IGDB
          </a>
          , used under the Twitch Developer Service Agreement.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-paper">Books</h2>
        <p className="text-paper-dim">
          Book data and covers come from{" "}
          <a className="underline hover:text-mint" href="https://openlibrary.org">
            Open Library
          </a>
          , imported from their monthly{" "}
          <a className="underline hover:text-mint" href="https://openlibrary.org/developers/dumps">
            data dump
          </a>
          {dump ? (
            <>
              {" "}
              dated <strong className="text-paper">{dump}</strong>
            </>
          ) : null}
          , plus occasional lookups of newly added books through the Open Library API.
        </p>
      </section>
    </main>
  );
}
