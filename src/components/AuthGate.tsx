import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AuthGate = ({ children }: { children: ReactNode }) => {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState(false);

  if (loading) return null;
  if (user) return <>{children}</>;

  const handleLogin = async () => {
    if (!email || !password) return;
    setBusy(true);
    setError("");
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setError("E-mail of wachtwoord onjuist.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-tile mx-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </span>
          <p className="font-display text-xl font-semibold">Meester Stijn</p>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Log in om toegang te krijgen.</p>

        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="E-mailadres"
            autoFocus
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Wachtwoord"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Inloggen…" : "Inloggen"}
        </button>
      </div>
    </div>
  );
};

export default AuthGate;
