import {
  MdAccountCircle,
  MdBolt,
  MdSatelliteAlt,
  MdTravelExplore,
} from 'react-icons/md';

export function CoreSystems() {
  return (
    <section
      id="features"
      className="relative z-10 bg-surface-container-lowest px-4 py-24 md:px-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-semibold text-on-surface md:text-5xl">
            Core Systems
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Engineered for extreme performance environments.
          </p>
        </div>
        <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:grid-cols-3">
          {/* Stellar Discovery — wide */}
          <div className="group glass-panel relative flex flex-col justify-between overflow-hidden rounded-xl p-8 md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <MdTravelExplore
                className="mb-4 block text-4xl text-primary"
                aria-hidden
              />
              <h3 className="mb-2 text-headline-md text-on-surface">
                Stellar Discovery
              </h3>
              <p className="max-w-md text-body-md text-on-surface-variant">
                Map uncharted territories with AI-driven anomaly detection
                algorithms scanning the cosmic microwave background in
                real-time.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl transition-all duration-700 group-hover:bg-primary/40" />
          </div>

          {/* Comms Link */}
          <div className="group glass-panel relative flex flex-col justify-between overflow-hidden rounded-xl p-8">
            <div className="relative z-10">
              <MdSatelliteAlt
                className="mb-4 block text-4xl text-secondary"
                aria-hidden
              />
              <h3 className="mb-2 text-headline-md text-on-surface">
                Comms Link
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Quantum-entangled transmission protocols ensure zero-latency
                communication across lightyears.
              </p>
            </div>
            <div className="pulse-anim absolute right-0 top-0 h-32 w-32 rounded-full bg-secondary/10 blur-2xl transition-all duration-700 group-hover:bg-secondary/30" />
          </div>

          {/* Galactic Profile */}
          <div className="group glass-panel relative flex flex-col justify-between overflow-hidden rounded-xl p-8">
            <div className="relative z-10">
              <MdAccountCircle
                className="mb-4 block text-4xl text-tertiary"
                aria-hidden
              />
              <h3 className="mb-2 text-headline-md text-on-surface">
                Galactic Profile
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Your universal identity, securely anchored to the decentralized
                ledger.
              </p>
            </div>
            <div className="absolute bottom-10 -left-10 h-40 w-40 rounded-full bg-tertiary/20 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
          </div>

          {/* Thermal Routing — wide, with a burst meter */}
          <div className="group glass-panel relative flex flex-col justify-between overflow-hidden rounded-xl p-8 md:col-span-2">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <MdBolt
                  className="mb-4 block text-4xl text-primary-container"
                  aria-hidden
                />
                <h3 className="mb-2 text-headline-md text-on-surface">
                  Thermal Routing
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  Intelligently route data through high-energy celestial bodies
                  to maximize transmission burst speeds.
                </p>
              </div>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface-dim">
                <div className="pulse-anim h-full w-3/4 bg-gradient-to-r from-primary to-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
