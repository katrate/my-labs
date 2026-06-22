import FeatureCarousel from './ui/feature-carousel';

export default function FeaturesSection() {
  return (
    <section className="relative w-full py-20 lg:py-32 bg-accent/10 border-b-[5px] border-dark overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <h2
            className="text-4xl md:text-6xl text-dark font-black tracking-tighter uppercase mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            MY WORKS
          </h2>
          <div className="w-24 h-2 bg-[var(--color-primary)] border border-dark shadow-[2px_2px_0px_0px_var(--color-dark)]" />
        </div>
        <FeatureCarousel />
      </div>
    </section>
  );
}
