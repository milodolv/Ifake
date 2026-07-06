import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
      <span className="text-xl font-bold text-white tracking-tight">iFake</span>
      <Link
        href="/editor"
        className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white shadow-glow hover:bg-accent/90 transition"
      >
        Créer une conversation
      </Link>
    </header>
  );
}
