"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const oauthProviders = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" },
];

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setPassword("");
    setError(null);
    setStatus(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        let res: Response;
        try {
          res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
        } catch {
          setError("Couldn't reach the server. Is it running?");
          setLoading(false);
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (res.status === 409) {
          setError("That email is already in use. Try signing in instead.");
          setMode("signin");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError(data.error ?? `Couldn't create the account (error ${res.status}).`);
          setLoading(false);
          return;
        }

        setStatus("Account created — signing you in…");
      }

      let result: Awaited<ReturnType<typeof signIn>>;
      try {
        result = await signIn("credentials", { email, password, redirect: false });
      } catch (err) {
        console.error("signIn threw:", err);
        setError("Couldn't reach the sign-in service. Check the server logs.");
        setLoading(false);
        return;
      }

      if (result?.error) {
        setStatus(null);
        setError(
          result.error === "CredentialsSignin"
            ? "Incorrect email or password."
            : result.error
        );
        setLoading(false);
        return;
      }

      setError(null);
      setStatus("Signed in! Redirecting…");
      setTimeout(() => {
        window.location.href = "/trending";
      }, 500);
    } catch (err) {
      console.error("Auth request failed:", err);
      setError("Something unexpected went wrong. Check the console/server logs.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex gap-6 border-b border-ink-line text-sm">
        <button
          onClick={() => switchMode("signin")}
          className={`-mb-px border-b-2 pb-3 transition-colors ${
            mode === "signin" ? "border-mint text-paper" : "border-transparent text-paper-dim"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => switchMode("signup")}
          className={`-mb-px border-b-2 pb-3 transition-colors ${
            mode === "signup" ? "border-mint text-paper" : "border-transparent text-paper-dim"
          }`}
        >
          Create account
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {oauthProviders.map((p) => (
          <button
            key={p.id}
            onClick={() => signIn(p.id)}
            className="rounded border border-ink-line py-2.5 text-sm text-paper transition-colors hover:border-mint"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-paper-dim">
        <div className="h-px flex-1 bg-ink-line" />
        or with email
        <div className="h-px flex-1 bg-ink-line" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-ink-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-mint"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-ink-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-mint"
        />
        <input
          type="password"
          placeholder="Password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-ink-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper-dim focus:border-mint"
        />

        {status && <p className="text-sm text-mint">{status}</p>}
        {error && <p className="text-sm text-film">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded bg-mint py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mint-bright disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
