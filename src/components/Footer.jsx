import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import MoleculeIcon from './MoleculeIcon';

const Footer = () => {
  return (
    <>
      {/* Pre-Footer CTA Section */}
      <div className="w-full bg-[#111111] text-white py-32 px-4 flex flex-col items-center justify-center text-center">
        <h2 className="font-serif text-5xl md:text-7xl mb-8 tracking-tight">
          Try Gaod now.
        </h2>
        <button className="bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
          Request early access
          <ArrowUp className="w-4 h-4 rotate-45" />
        </button>
      </div>

      <footer className="w-full bg-[#111111] text-white py-24 px-4 mt-auto border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col justify-between min-h-[40vh]">
          {/* Top Section: Logo & CTA */}
          <div className="flex flex-col items-start gap-8">
            {/* Large Logo Placeholder / Brand Element */}
            <div className="mb-12">
              <MoleculeIcon className="w-32 h-32 text-white" />
            </div>
          </div>

          {/* Middle Section: Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 text-sm font-medium">
            <div className="flex flex-col gap-4">
              <Link
                to="/design"
                className="hover:text-gray-300 transition-colors"
              >
                Design
              </Link>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Request Access
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Enterprise
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Careers
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                FAQ
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Privacy
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#" className="hover:text-gray-300 transition-colors">
                LinkedIn
              </a>
              {/* Add more social links if needed */}
            </div>
          </div>

          {/* Bottom Section: Copyright & Status */}
          <div className="flex flex-col md:flex-row justify-between items-end mt-24 gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-full px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Operational
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                ©2025 Gaod AI, Inc.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
