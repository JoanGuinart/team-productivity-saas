export default function DemoReadonlyBanner() {
  return (
    <div className="w-full border-b border-amber-300 bg-amber-100 text-amber-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <p className="font-medium">
          Demo publica en modo solo lectura. Puedes explorar, pero no se guardan cambios.
        </p>
      </div>
    </div>
  );
}
