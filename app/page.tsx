export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      {/* Marca: identidade visual, sem texto por cima. */}
      <span aria-hidden className="h-1.5 w-16 rounded-full bg-brand" />

      <h1 className="text-3xl font-bold text-ink-on-paper">Desenrolai — template web</h1>

      <p className="text-ink-on-paper/80">Substitua este conteúdo pelo seu app.</p>

      <a
        className="text-action-on-paper underline underline-offset-4"
        href="https://nextjs.org/docs"
      >
        Documentação do Next.js
      </a>
    </main>
  );
}
