"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

export default function LoginModal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  function close() {
    router.back();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && close()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm rounded-lg border border-ink-line bg-ink p-7 shadow-2xl">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-paper-dim transition-colors hover:text-paper"
        >
          ✕
        </button>
        <h2 className="mb-1 font-display text-2xl text-paper">Welcome back</h2>
        <p className="mb-6 text-sm text-paper-dim">Sign in to start keeping your record.</p>
        {children}
      </div>
    </div>
  );
}
