import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-1 font-display text-3xl text-paper">Welcome back</h1>
      <p className="mb-8 text-sm text-paper-dim">Sign in to start keeping your record.</p>
      <AuthForm />
    </main>
  );
}
