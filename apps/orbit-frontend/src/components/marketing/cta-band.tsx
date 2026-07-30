import { MdGroupAdd } from 'react-icons/md';
import { StarBorder } from '@/components/motion/star-border';

export function CtaBand() {
  return (
    <section
      id="community"
      className="relative z-10 border-t border-primary/10 bg-background px-4 py-32 md:px-12"
    >
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at center, color-mix(in oklab, var(--color-primary-container) 10%, transparent), var(--color-background) 70%)',
        }}
      />
      <div className="glass-panel thermal-glow relative z-10 mx-auto max-w-2xl rounded-2xl p-12 text-center">
        <MdGroupAdd
          className="mx-auto mb-6 block text-5xl text-secondary"
          aria-hidden
        />
        <h2 className="mb-4 text-4xl font-semibold text-on-surface md:text-6xl">
          Join the Constellation
        </h2>
        <p className="mb-8 text-body-md text-on-surface-variant">
          Establish your node in the network. Enter your transmission
          coordinates to receive early access protocols.
        </p>
        <form className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
          <input
            type="email"
            required
            aria-label="Email"
            placeholder="Transmission Coordinates (Email)"
            className="w-full flex-grow rounded-md border border-outline-variant bg-surface-dim px-4 py-3 text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          />
          <StarBorder type="submit" innerClassName="px-6 py-3 text-label-md">
            Establish Link
          </StarBorder>
        </form>
      </div>
    </section>
  );
}
