"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "Trending", href: "/trending" },
  { label: "Movies", href: "/movies" },
  { label: "Shows", href: "/shows" },
  { label: "Games", href: "/games" },
  { label: "Books", href: "/books" },
  { label: "Social", href: "/social" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="border-b border-ink-line bg-ink">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-20 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-mint">
            <Library className="size-5 text-ink" strokeWidth={2.25} />
          </span>
          <span className="font-display text-[22px] text-paper">Ledger</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-mint"
                  : "text-paper-dim transition-colors hover:text-paper"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {status === "loading" ? null : session?.user ? (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/dashboard" className="text-paper transition-colors hover:text-mint">
                Dashboard
              </Link>
              <span className="text-paper-dim">{session.user.name ?? session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-ink-line px-4 py-2 text-paper-dim transition-colors hover:border-mint hover:text-paper"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-paper">
                Sign In
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-mint-bright"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
