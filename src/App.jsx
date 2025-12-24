import { useState, useEffect } from 'react';
import { Palette, MousePointer2, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import StickyScrollSection from './components/StickyScrollSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import MoleculeIcon from './components/MoleculeIcon';

function App() {
  const [heroTextIndex, setHeroTextIndex] = useState(0);
  const heroWords = ['Assistant', 'Developer', 'Designer', 'Friend'];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroTextIndex((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroWords.length]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#F8F8F6] text-[#1A1A1A] font-sans relative">
      <Navbar />

      {/* Main Content Wrapper */}
      <main className="flex-grow w-full max-w-6xl px-4 mt-32 z-10 flex flex-col items-center">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center mb-20">
          <div className="mb-6">
            <MoleculeIcon className="w-24 h-24 text-[#1A1A1A]" mode="hero" />
          </div>

          <h1 className="font-serif text-6xl md:text-8xl tracking-tight mb-6 text-[#1A1A1A] flex flex-col items-center gap-2 md:gap-4">
            <span>Your Gaod</span>
            <div className="h-[1.1em] overflow-hidden relative min-w-[300px] flex justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroTextIndex}
                  initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="italic text-gray-400"
                >
                  {heroWords[heroTextIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>

          <p className="text-2xl md:text-3xl text-[#9CA3AF] max-w-2xl leading-tight tracking-tight">
            Gaod is the domain-specific AI for next-gen creators, agencies, and
            the Fortune 500.
          </p>
        </div>

        {/* Benefits Section (Bento Grid) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-32 px-4">
          {/* Card 1: Friendly UI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="col-span-1 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between h-[320px] group overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-grow flex items-center justify-center relative opacity-80 group-hover:opacity-100 transition-opacity">
              {/* Wireframe Mockup */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent rounded-xl" />
              <div className="relative w-3/4 space-y-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                  <div className="h-6 w-3/4 bg-gray-100 rounded-md border border-gray-200" />
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="h-12 w-2/3 bg-gray-100 rounded-md border border-gray-200" />
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                  <div className="h-6 w-1/2 bg-gray-100 rounded-md border border-gray-200" />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                <h3 className="text-[#1A1A1A] font-medium text-lg">
                  Friendly UI
                </h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Seamless navigation and usage with no barriers.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Chat Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="col-span-1 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between h-[320px] group overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-grow flex items-center justify-center relative opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-transparent rounded-xl" />
              {/* Folder/List Wireframe */}
              <div className="relative w-3/4 space-y-2 transform rotate-3">
                <div className="h-8 w-full bg-white rounded-lg border border-gray-200 flex items-center px-2 shadow-sm">
                  <div className="w-20 h-2 bg-gray-300 rounded-full" />
                </div>
                <div className="h-8 w-full bg-white rounded-lg border border-gray-200 flex items-center px-2 translate-x-2 shadow-sm">
                  <div className="w-16 h-2 bg-gray-300 rounded-full" />
                </div>
                <div className="h-8 w-full bg-white rounded-lg border border-gray-200 flex items-center px-2 translate-x-4 shadow-sm">
                  <div className="w-24 h-2 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                <h3 className="text-[#1A1A1A] font-medium text-lg">
                  Chat Management
                </h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Organize workspaces, folders, and permissions.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Maximum Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="col-span-1 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between h-[320px] group overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-grow flex items-center justify-center relative opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-bl from-gray-50 to-transparent rounded-xl" />
              {/* Sliders Wireframe */}
              <div className="relative w-3/4 space-y-4">
                <div className="relative h-1 bg-gray-200 rounded-full">
                  <div className="absolute h-full w-1/3 bg-gray-800 rounded-full" />
                  <div className="absolute left-1/3 w-3 h-3 bg-white border border-gray-300 rounded-full -translate-y-1 -translate-x-1.5 shadow-sm" />
                </div>
                <div className="relative h-1 bg-gray-200 rounded-full">
                  <div className="absolute h-full w-2/3 bg-gray-800 rounded-full" />
                  <div className="absolute left-2/3 w-3 h-3 bg-white border border-gray-300 rounded-full -translate-y-1 -translate-x-1.5 shadow-sm" />
                </div>
                <div className="flex justify-between mt-2">
                  <div className="w-8 h-4 rounded bg-gray-200" />
                  <div className="w-8 h-4 rounded bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                <h3 className="text-[#1A1A1A] font-medium text-lg">
                  Maximum Control
                </h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Fine-tune temperature, top-p, and penalties.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sticky Scroll Section */}
        <div className="w-full mb-32">
          <StickyScrollSection />
        </div>

        {/* Secure Collaboration Section */}
        <div className="w-full mb-32 px-4">
          <div className="mb-16">
            <span className="text-gray-500 font-mono text-sm tracking-widest uppercase mb-4 block">
              Enterprise
            </span>
            <h2 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] leading-tight max-w-2xl">
              Enterprise.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-start gap-6">
              <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-white">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#1A1A1A] mb-3">
                  Brand Guidelines
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Brand Guidelines including Logo Design and Brand Identity set.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-start gap-6">
              <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-white">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#1A1A1A] mb-3">
                  Web Design
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Visually appealing Web Design and Landing Page Design.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-start gap-6">
              <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-white">
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#1A1A1A] mb-3">
                  Framer Development
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Fully Responsive Website Development, done using a no code
                  tool, Framer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="w-full mb-32">
          <PricingSection />
        </div>

        {/* FAQ Section */}
        <div className="w-full mb-32">
          <FAQSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
