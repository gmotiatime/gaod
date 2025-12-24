import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import MoleculeIcon from './MoleculeIcon';

const Navbar = () => {
  return (
    <nav className="fixed top-4 md:top-8 z-50 bg-[#1A1A1A] text-white px-1.5 py-1.5 rounded-full flex items-center gap-4 md:gap-6 shadow-lg left-1/2 transform -translate-x-1/2 max-w-[90vw] md:max-w-none">
      <Link
        to="/"
        className="flex items-center gap-2 pl-3 hover:opacity-80 transition-opacity"
      >
        <MoleculeIcon className="w-5 h-5 text-white" mode="navbar" />
        <span className="font-medium text-sm tracking-wide">Gaod</span>
      </Link>
      <div className="flex items-center gap-1">
        <Link
          to="/login"
          className="text-xs font-medium text-gray-300 hover:text-white px-3 transition-colors"
        >
          Log in
        </Link>
        <button className="bg-[#F2F2F2] text-[#1A1A1A] text-xs font-medium px-4 py-2 rounded-full hover:bg-white transition-colors flex items-center gap-2">
          <span className="hidden sm:inline">Request early access</span>
          <span className="sm:hidden">Access</span>
          <ArrowUp className="w-3 h-3 rotate-45" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
