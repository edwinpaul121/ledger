import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { recordView } from "@/lib/view-history";
import BookActions from "@/components/book/BookActions";
import BookDetailsGrid from "@/components/book/BookDetailsGrid";
import ReviewSection from "@/components/movie/ReviewSection";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) notFound();

  const userId = await getCurrentUserId();

  const myEntry = userId
    ? await prisma.entry.findUnique({
        where: { userId_bookId: { userId, bookId: book.id } },
      })
    : null;

  if (userId) {
    await recordView({
      userId,
      path: `/books/${book.id}`,
      title: book.title,
      kind: "book",
      bookId: book.id,
    });
  }

  const cover = book.coverId ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg` : null;

  return (
    <main>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-16 md:flex-row md:px-20">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={book.title}
            className="w-[200px] shrink-0 self-start rounded-xl border border-ink-line shadow-2xl md:w-[240px]"
          />
        )}

        <div className="flex flex-1 flex-col gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-paper-dim">
            {book.firstPublishYear && <span>{book.firstPublishYear}</span>}
            {book.authors && <span>{book.authors}</span>}
          </div>

          <h1 className="font-display text-4xl text-paper md:text-5xl">{book.title}</h1>

          {book.rating !== null && (
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-md bg-panel px-2.5 py-1 font-semibold text-mint">
                {book.rating.toFixed(1)} / 5
              </span>
              {book.ratingCount !== null && (
                <span className="text-paper-faint">
                  {book.ratingCount.toLocaleString()} ratings on Open Library
                </span>
              )}
            </div>
          )}

          {book.description && (
            <p className="max-w-2xl whitespace-pre-line leading-relaxed text-paper-dim">
              {book.description}
            </p>
          )}

          <BookActions
            bookId={book.id}
            bookTitle={book.title}
            signedIn={!!userId}
            initialFavorite={myEntry?.favorite ?? false}
            initialStatus={myEntry?.status ?? null}
            initialProgressLabel={myEntry?.progressLabel ?? null}
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pb-24 pt-14 md:px-20">
        <BookDetailsGrid
          authors={book.authors}
          firstPublishYear={book.firstPublishYear}
          subjects={book.subjects}
          ratingCount={book.ratingCount}
        />

        <ReviewSection />
      </div>
    </main>
  );
}
