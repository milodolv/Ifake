import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-3xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
        Crée des fausses conversations iMessage en 2 minutes
      </h1>
      <p className="mt-5 text-lg text-white/60 max-w-xl">
        Outil interne pour générer des conversations iMessage réalistes,
        les animer et les exporter en vidéo pour ton contenu créateur.
      </p>
      <Link
        href="/editor"
        className="mt-10 px-8 py-3.5 text-base font-semibold rounded-xl bg-accent text-white shadow-glow hover:bg-accent/90 transition"
      >
        Commencer
      </Link>
    </section>
  );
}
