export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black tracking-[0.25em] text-primary-foreground">
        V
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          VUMA
        </p>
        <p className="text-sm text-muted-foreground">Salon OS</p>
      </div>
    </div>
  );
}
