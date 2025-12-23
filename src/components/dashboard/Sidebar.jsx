import { Plus, MessageSquare, Settings, LogOut } from 'lucide-react';
import PropTypes from 'prop-types';
import MoleculeIcon from '../MoleculeIcon';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/auth';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 border-r border-gray-200 h-full flex flex-col bg-[#F8F8F6] flex-shrink-0">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <MoleculeIcon className="w-8 h-8 text-[#1A1A1A]" mode="navbar" />
        <span className="font-serif text-xl font-bold tracking-tight">Gaod</span>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-6">
        <button className="w-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-black transition-all shadow-sm font-medium text-sm">
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-4 py-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
          Recent
        </div>

        {['Project Alpha Strategy', 'Marketing Copy v2', 'React Component Help', 'Brand Guidelines'].map((chat, i) => (
          <button
            key={i}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center gap-3 group border border-transparent hover:border-gray-100"
          >
            <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-[#1A1A1A] transition-colors" />
            <span className="text-sm text-gray-600 group-hover:text-[#1A1A1A] truncate font-sans">
              {chat}
            </span>
          </button>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-medium">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 hover:text-[#1A1A1A] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
            <Settings className="w-3 h-3" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
};

export default Sidebar;
