import { Link, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const links = [
  { to: "/", label: "Start" },
  { to: "/planning", label: "Planning" },
  { to: "/bestanden", label: "Bestanden" },
  { to: "/quotes", label: "Quotes" },
];

export const SiteHeader = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground transition-smooth group-hover:rotate-[-6deg]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Meester Stijn
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
