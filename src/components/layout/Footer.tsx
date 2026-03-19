export function Footer() {
  return (
    <footer className="relative z-10 py-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center gap-4">
        <div className="text-slate-400 text-sm">
          <p>Designed and built in deep vastness of the space.</p>
          <p className="mt-2 font-mono text-xs">
            © {new Date().getFullYear()} Remigiusz Bednarczyk. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
