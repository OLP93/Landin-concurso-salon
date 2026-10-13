import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <path d="M16 3c4 0 7 4 7 10v9a7 7 0 0 1-14 0v-9C9 7 12 3 16 3Z" className="fill-blush stroke-primary" strokeWidth="1.5" />
      <path d="M12 11c1-3 2.5-4.5 4-4.5" className="stroke-card" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Logo /> Concurso del Salón
        </Link>
        <nav className="flex gap-4 text-sm" aria-label="Principal">
          <Link to="/resultado" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
            Resultado
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} [NOMBRE DEL SALÓN]</p>
        <nav className="flex flex-wrap gap-4" aria-label="Legal">
          <Link to="/bases-legales" className="hover:text-foreground underline-offset-4 hover:underline">Bases legales</Link>
          <Link to="/privacidad" className="hover:text-foreground underline-offset-4 hover:underline">Política de privacidad</Link>
          <Link to="/admin" className="opacity-70 hover:text-foreground">Acceso salón</Link>
        </nav>
      </div>
    </footer>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(storage.getCookiePref() === null), []);
  if (!visible) return null;
  const elegir = (v: "todas" | "necesarias") => {
    storage.setCookiePref(v);
    setVisible(false);
  };
  return (
    <div role="dialog" aria-live="polite" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border bg-card p-4 shadow-soft">
      <p className="text-sm text-muted-foreground">
        Usamos almacenamiento local necesario para que el concurso funcione y, si lo aceptas, para recordar tus preferencias.{" "}
        <Link to="/privacidad" className="text-primary underline underline-offset-4">Más información</Link>.
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => elegir("necesarias")}>Solo necesarias</Button>
        <Button size="sm" onClick={() => elegir("todas")}>Aceptar</Button>
      </div>
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>;
}

export function MessageCard({ title, children, tone = "default" }: { title: string; children?: React.ReactNode; tone?: "default" | "success" }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border bg-card p-8 text-center shadow-soft">
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${tone === "success" ? "bg-success/15 text-success" : "bg-accent text-primary"}`} aria-hidden="true">
        {tone === "success" ? "✓" : "✦"}
      </div>
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </div>
  );
}
