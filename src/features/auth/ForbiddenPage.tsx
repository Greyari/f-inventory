export default function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">403</h1>
      <p className="text-muted-foreground">
        Anda tidak memiliki akses ke halaman ini.
      </p>
    </div>
  );
}
