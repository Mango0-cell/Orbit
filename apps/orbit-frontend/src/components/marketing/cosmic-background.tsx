/**
 * Placeholder cosmic backdrop (nebula glows + faint starfield, pure CSS).
 * SWAP SLOT: replace with a React Bits WebGL background (Aurora / Silk / Particles /
 * Beams) adapted via the orbit-reactbits skill — dynamic-import with ssr:false and a
 * reduced-motion fallback (see orbit-motion).
 */
export function CosmicBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface"
    >
      <div className="absolute left-1/2 top-[-10%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[50vh] w-[50vh] rounded-full bg-secondary/10 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 120px 80px, rgba(255,255,255,0.22), transparent)',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
}
