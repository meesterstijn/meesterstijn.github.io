import { useState, useEffect, type ReactNode } from "react";
import { Lock } from "lucide-react";

const PASSWORD = "nietvoorleerlingen";
const SESSION_KEY = "site_auth";

const AuthGate = ({ children }: { children: ReactNode }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setUnlocked(true);
  }, []);

  const handleUnlock = () => {
    if (pwInput === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-tile mx-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </span>
          <p className="font-display text-xl font-semibold">Meester Stijn</p>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Voer het wachtwoord in om toegang te krijgen.</p>
        <input
          type="password"
          value={pwInput}
          onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          placeholder="Wachtwoord"
          autoFocus
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        {pwError && <p className="mt-2 text-xs text-destructive">Wachtwoord onjuist.</p>}
        <button
          onClick={handleUnlock}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Toegang
        </button>
      </div>
    </div>
  );
};

export default AuthGate;
