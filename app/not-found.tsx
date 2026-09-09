import { HardLink } from "@/components/hard-link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xs uppercase tracking-[0.32em] text-gold">404</p>
      <h1 className="mt-3 font-display text-4xl text-cream">This tablet went dark.</h1>
      <p className="mt-4 text-cream/70">The vein you followed is not on the living emerald. Return to the catalog.</p>
      <HardLink
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full border border-gold/40 bg-gold/10 px-5 font-display text-sm uppercase tracking-[0.18em] text-gold transition hover:bg-gold/20"
      >
        Back to the tablet
      </HardLink>
    </main>
  );
}
