"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

type Review = {
  id: string;
  author: string;
  body: string;
  spoiler: boolean;
  revealed: boolean;
};

export default function ReviewSection() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !session?.user) return;
    const author = session.user.name ?? session.user.email ?? "You";
    setReviews((prev) => [
      { id: crypto.randomUUID(), author, body: body.trim(), spoiler, revealed: false },
      ...prev,
    ]);
    setBody("");
    setSpoiler(false);
  }

  function toggleReveal(id: string) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, revealed: !r.revealed } : r)));
  }

  return (
    <section className="flex flex-col gap-6 border-t border-ink-line pt-10">
      <h2 className="font-display text-2xl text-paper">Reviews</h2>

      {status !== "loading" && (
        session?.user ? (
          <form
            onSubmit={submit}
            className="flex flex-col gap-3 rounded-xl border border-ink-line bg-ink-soft p-5"
          >
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
              className="rounded-lg border border-ink-line bg-ink px-3 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-mint"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-paper-dim">
                <input
                  type="checkbox"
                  checked={spoiler}
                  onChange={(e) => setSpoiler(e.target.checked)}
                  className="accent-mint"
                />
                Contains spoilers
              </label>
              <button
                type="submit"
                className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink hover:bg-mint-bright"
              >
                Post review
              </button>
            </div>
            <p className="text-xs text-paper-faint">
              Posting as {session.user.name ?? session.user.email}. Reviews aren&apos;t saved yet
              — this previews how they&apos;ll look and behave. Persistence and star ratings are
              coming next.
            </p>
          </form>
        ) : (
          <a
            href="/login"
            className="flex items-center justify-between rounded-xl border border-ink-line bg-ink-soft px-5 py-4 text-sm text-paper-dim transition-colors hover:border-mint hover:text-paper"
          >
            Sign in to write a review
          </a>
        )
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-paper-faint">No reviews yet. Be the first to write one.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-ink-line bg-ink-soft p-5">
              <p className="mb-2 text-sm font-semibold text-paper">{r.author}</p>
              {r.spoiler && !r.revealed ? (
                <button
                  onClick={() => toggleReveal(r.id)}
                  className="flex items-center gap-2 text-sm font-medium text-paper-dim transition-colors hover:text-paper"
                >
                  <EyeOff className="size-4" /> This review contains spoilers — click to reveal
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {r.spoiler && (
                    <button
                      onClick={() => toggleReveal(r.id)}
                      className="flex w-fit items-center gap-1.5 rounded-md bg-film/10 px-2 py-1 text-xs font-semibold text-film"
                    >
                      <Eye className="size-3.5" /> Spoiler — click to hide
                    </button>
                  )}
                  <p className="text-sm leading-relaxed text-paper">{r.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
