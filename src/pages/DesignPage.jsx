import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DesignPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#F8F8F6] text-[#1A1A1A] font-sans relative">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl px-4 mt-32 mb-20 z-10 flex flex-col items-start">
        <div className="mb-16">
          <span className="text-gray-500 font-mono text-sm tracking-widest uppercase mb-4 block">Design System</span>
          <h1 className="font-serif text-5xl md:text-7xl text-[#1A1A1A] leading-tight">
            Design.
          </h1>
          <p className="text-xl text-gray-500 mt-6 max-w-2xl">
            A minimalist approach to visual hierarchy, typography, and motion.
          </p>
        </div>

        {/* Colors */}
        <section className="w-full mb-20">
          <h2 className="text-2xl font-serif mb-8 border-b border-gray-200 pb-4">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-[#F8F8F6] border border-gray-200 shadow-sm"></div>
              <p className="font-mono text-xs">Cream / #F8F8F6</p>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-[#1A1A1A] shadow-sm"></div>
              <p className="font-mono text-xs">Charcoal / #1A1A1A</p>
            </div>
             <div className="space-y-2">
              <div className="h-32 rounded-lg bg-[#111111] shadow-sm"></div>
              <p className="font-mono text-xs">Black / #111111</p>
            </div>
             <div className="space-y-2">
              <div className="h-32 rounded-lg bg-white border border-gray-200 shadow-sm"></div>
              <p className="font-mono text-xs">White / #FFFFFF</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="w-full mb-20">
          <h2 className="text-2xl font-serif mb-8 border-b border-gray-200 pb-4">Typography</h2>
          <div className="space-y-12">
            <div>
              <p className="text-sm text-gray-400 font-mono mb-2">Display / Serif</p>
              <h1 className="font-serif text-6xl md:text-8xl">Gaod AI</h1>
            </div>
             <div>
              <p className="text-sm text-gray-400 font-mono mb-2">Body / Sans</p>
              <p className="text-xl md:text-2xl max-w-3xl leading-relaxed">
                The quick brown fox jumps over the lazy dog. A clear, readable sans-serif font designed for modern user interfaces and optimal legibility.
              </p>
            </div>
          </div>
        </section>

         {/* Components */}
        <section className="w-full mb-20">
          <h2 className="text-2xl font-serif mb-8 border-b border-gray-200 pb-4">Components</h2>
          <div className="flex flex-wrap gap-8 items-center">
             <button className="bg-[#1A1A1A] text-white font-medium py-3 px-6 rounded-full hover:bg-black transition-colors shadow-lg">
                Primary Button
              </button>
               <button className="bg-[#F2F2F2] text-[#1A1A1A] font-medium px-6 py-3 rounded-full hover:bg-white transition-colors flex items-center gap-2">
                Secondary Button
              </button>
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-full px-3 py-1 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Status Badge</span>
                </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default DesignPage;
