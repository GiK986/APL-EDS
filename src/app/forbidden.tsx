export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-foreground">403</h1>
        <p className="mt-4 text-sm text-muted-foreground">Нямате право на достъп до този каталог.</p>
        <p className="mt-2 text-sm text-muted-foreground">Достъпът се осъществява през Next Catalogue.</p>
      </div>
    </div>
  );
}
