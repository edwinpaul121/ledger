import TrendingRow from "@/components/trending/TrendingRow";
import TrendingSearch from "@/components/trending/TrendingSearch";
import { getTrending } from "@/lib/trending";

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const { film, show, game, book } = await getTrending();

  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 py-14 md:px-20">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-paper md:text-5xl">Trending Now</h1>
        <p className="max-w-xl text-lg text-paper-dim">
          Ranked by what people tracked on Ledger this week, topped up with the most popular
          titles from TMDB, IGDB and Open Library.
        </p>
      </div>

      <TrendingSearch>
        {film.length > 0 && <TrendingRow kind="film" items={film} />}
        {show.length > 0 && <TrendingRow kind="show" items={show} />}
        {game.length > 0 && <TrendingRow kind="game" items={game} />}
        {book.length > 0 && <TrendingRow kind="book" items={book} />}

        {film.length + show.length + game.length + book.length === 0 && (
          <p className="text-paper-dim">
            Nothing to show yet — run the catalog imports (see the README) and it&apos;ll fill in.
          </p>
        )}
      </TrendingSearch>
    </main>
  );
}
