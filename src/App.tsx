import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import MarqueeSection from './components/MarqueeSection';
import ProjectsSection from './components/ProjectsSection';
import FeaturesSection from './components/FeaturesSection';
import ContactSection from './components/ContactSection';
import CustomCursor from './components/ui/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import GlobalScene from './components/GlobalScene';
import { useGyroscope } from './hooks/useGyroscope';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { gyroData, requestAccess, needsPermission } = useGyroscope();

  return (
    <div className="bg-[var(--color-bg)] text-dark relative min-h-screen">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {!isLoading && (
        <>
          <CustomCursor />
          <GlobalScene />

          {needsPermission && (
            <button
              onClick={requestAccess}
              className="fixed bottom-6 right-6 z-50 brutal-button px-4 py-2 text-xs font-black uppercase tracking-widest"
            >
              <span>Enable 3D Tilt</span>
            </button>
          )}

          <Navbar />
          <main>
            <HeroSection />
            <MarqueeSection />
            <AboutSection />
            <div id="projects">
              <FeaturesSection />
              <ProjectsSection />
            </div>
            <ContactSection />
          </main>

          {/* Premium footer */}
          <footer className="bg-dark border-t-[5px] border-dark py-10 px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-[var(--color-primary)] border-2 border-white inline-block" />
                <span className="text-white font-display font-black text-lg uppercase tracking-tighter">
                  Katrate
                </span>
              </div>

              {/* Center copy */}
              <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} — All Rights Reserved
              </p>

              {/* Right: design credit */}
              <div className="flex items-center gap-2">
                <span className="brutal-tag bg-transparent border-white/20 text-white/40 text-[10px]">
                  Designed with brutal precision
                </span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
