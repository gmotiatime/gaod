import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MoleculeIcon from '../components/MoleculeIcon';
import { EyeOff } from 'lucide-react';

const DesignPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#F8F8F6] text-[#1A1A1A] font-sans relative">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl px-4 mt-32 mb-20 z-10 flex flex-col items-start">

        {/* PHILOSOPHY SECTION */}
        <div className="mb-32 w-full">
            {/* Header / Intro */}
             <div className="mb-16">
                 <MoleculeIcon className="w-16 h-16 text-[#1A1A1A] mb-8" mode="static" />
                 <span className="text-gray-500 font-mono text-sm tracking-widest uppercase mb-4 block">Philosophy</span>
                 <h1 className="font-serif text-5xl md:text-7xl text-[#1A1A1A] leading-tight max-w-4xl">
                    Gaod is the domain-specific AI for next-gen creators.
                 </h1>
                 <p className="text-2xl text-gray-400 mt-8 max-w-2xl leading-relaxed">
                    A minimalist approach to visual hierarchy, typography, and motion. We believe in tools that disappear, leaving only the creator and their work.
                 </p>
             </div>
        </div>

        {/* DESIGN SYSTEM SECTION */}
        <div className="w-full mb-32">
             <div className="mb-12 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-serif">Design System</h2>
             </div>

             {/* Colors */}
             <div className="mb-20">
                <h3 className="text-sm font-mono uppercase text-gray-500 mb-8 tracking-wider">Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {/* Color Card: Cream */}
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                        <div className="h-24 w-full rounded-lg bg-[#F8F8F6] border border-gray-100"></div>
                        <div>
                            <p className="font-medium text-[#1A1A1A]">Cream</p>
                            <p className="text-xs text-gray-400 font-mono">#F8F8F6</p>
                        </div>
                     </div>
                      {/* Color Card: Charcoal */}
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                        <div className="h-24 w-full rounded-lg bg-[#1A1A1A]"></div>
                        <div>
                            <p className="font-medium text-[#1A1A1A]">Charcoal</p>
                            <p className="text-xs text-gray-400 font-mono">#1A1A1A</p>
                        </div>
                     </div>
                      {/* Color Card: Black */}
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                        <div className="h-24 w-full rounded-lg bg-[#111111]"></div>
                        <div>
                            <p className="font-medium text-[#1A1A1A]">Black</p>
                            <p className="text-xs text-gray-400 font-mono">#111111</p>
                        </div>
                     </div>
                      {/* Color Card: White */}
                     <div className="bg-[#1A1A1A] p-4 rounded-xl border border-gray-800 shadow-sm flex flex-col gap-4">
                        <div className="h-24 w-full rounded-lg bg-white"></div>
                        <div>
                            <p className="font-medium text-white">White</p>
                            <p className="text-xs text-gray-500 font-mono">#FFFFFF</p>
                        </div>
                     </div>
                </div>
             </div>

             {/* Typography */}
             <div className="mb-20">
                <h3 className="text-sm font-mono uppercase text-gray-500 mb-8 tracking-wider">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-2 mb-4">
                            <span className="font-mono text-xs text-gray-400">Headings / Serif / Times New Roman</span>
                        </div>
                        <h1 className="font-serif text-6xl">Aa Bb Cc</h1>
                        <h2 className="font-serif text-4xl">The quick brown fox jumps over the lazy dog.</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-2 mb-4">
                             <span className="font-mono text-xs text-gray-400">Body / Sans / Inter</span>
                        </div>
                        <p className="font-sans text-4xl">Aa Bb Cc</p>
                        <p className="font-sans text-lg leading-relaxed text-gray-600">
                            The quick brown fox jumps over the lazy dog. Designed for legibility and clarity in user interfaces.
                            Scale your output with tools that understand your context.
                        </p>
                    </div>
                </div>
             </div>
        </div>

        {/* DESIGN KIT / COMPONENTS SECTION */}
        <div className="w-full mb-32">
             <div className="mb-12 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-serif">Design Kit</h2>
             </div>

             {/* Icons */}
             <div className="mb-20">
                <h3 className="text-sm font-mono uppercase text-gray-500 mb-8 tracking-wider">Iconography</h3>
                <div className="p-8 bg-white rounded-2xl border border-gray-200 flex items-center justify-around gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <MoleculeIcon className="w-24 h-24 text-[#1A1A1A]" mode="static" />
                        <span className="text-xs font-mono text-gray-400">Hero Mode</span>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <MoleculeIcon className="w-12 h-12 text-[#1A1A1A]" mode="navbar" />
                        <span className="text-xs font-mono text-gray-400">Navbar Mode</span>
                    </div>
                </div>
             </div>

             {/* UI Elements Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">

                 {/* Buttons */}
                 <div>
                    <h3 className="text-sm font-mono uppercase text-gray-500 mb-8 tracking-wider">Buttons</h3>
                    <div className="p-8 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6 items-start">
                        <button className="bg-[#1A1A1A] text-white font-medium py-3 px-6 rounded-full hover:bg-black transition-colors shadow-lg">
                            Primary Action
                        </button>
                        <button className="bg-white border border-gray-200 text-[#1A1A1A] font-medium px-6 py-3 rounded-full hover:bg-gray-50 hover:border-gray-900 transition-colors">
                            Secondary Action
                        </button>
                         <button className="text-gray-500 hover:text-[#1A1A1A] font-medium text-sm transition-colors">
                            Text Link
                        </button>
                    </div>
                 </div>

                 {/* Inputs */}
                 <div>
                    <h3 className="text-sm font-mono uppercase text-gray-500 mb-8 tracking-wider">Inputs</h3>
                    <div className="p-8 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
                        <input
                          type="text"
                          placeholder="Default Input"
                          className="w-full bg-white border border-gray-200 text-[#1A1A1A] placeholder-gray-400 text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block w-full p-3.5 outline-none shadow-sm"
                          readOnly
                        />
                         <div className="relative">
                             <input
                              type="password"
                              value="password123"
                              className="w-full bg-white border border-gray-200 text-[#1A1A1A] placeholder-gray-400 text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block w-full p-3.5 outline-none shadow-sm"
                              readOnly
                            />
                            <div className="absolute right-3.5 top-3.5 text-gray-400">
                              <EyeOff className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                 </div>

             </div>

             {/* Cards / Layouts */}
             <div className="mb-20">
                <h3 className="text-sm font-mono uppercase text-gray-500 mb-8 tracking-wider">Cards & Layouts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Replicated Bento Card */}
                    <div className="col-span-1 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between h-[320px] shadow-sm">
                        <div className="flex-grow flex items-center justify-center relative opacity-80">
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
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-2">
                                 <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                                 <h3 className="text-[#1A1A1A] font-medium text-lg">Card Title</h3>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Standard card component used for features and bento grids.
                            </p>
                        </div>
                    </div>

                    {/* Dark Card */}
                    <div className="col-span-1 bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 flex flex-col justify-between h-[320px] shadow-sm text-white">
                        <div className="flex-grow flex items-center justify-center relative">
                             <MoleculeIcon className="w-16 h-16 text-white opacity-20" mode="static" />
                        </div>
                        <div className="mt-6">
                            <h3 className="text-white font-medium text-lg mb-2">Dark Variant</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Used for high-emphasis or pro features.
                            </p>
                        </div>
                    </div>

                </div>
             </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default DesignPage;
