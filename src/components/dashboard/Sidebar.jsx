import { Plus, MessageSquare, Settings, LogOut, X, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import MoleculeIcon from '../MoleculeIcon';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/auth';
import { cn } from '../../lib/utils';

const Sidebar = ({ user, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onOpenSettings, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  return (
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
        )}

        <aside className={cn(
            "fixed md:relative inset-y-0 left-0 z-50 w-72 bg-[#F8F8F6] border-r border-gray-200 flex flex-col transition-transform duration-300 transform md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <MoleculeIcon className="w-8 h-8 text-[#1A1A1A]" mode="navbar" />
                <span className="font-serif text-xl font-bold tracking-tight">Gaod</span>
            </div>
            <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:text-[#1A1A1A]">
                <X className="w-6 h-6" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-4 mb-6">
            <button
                onClick={() => { onNewChat(); if(window.innerWidth < 768) onClose(); }}
                className="w-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 py-3 rounded-full hover:bg-black transition-all shadow-sm font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            <div className="px-4 py-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
              Recent Chats
            </div>

            {chats.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No chat history.
                </div>
            )}

            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                    "group relative flex items-center rounded-lg transition-all",
                    activeChatId === chat.id ? "bg-white shadow-sm border border-gray-100" : "hover:bg-white/50 border border-transparent"
                )}
              >
                  <button
                    onClick={() => { onSelectChat(chat.id); if(window.innerWidth < 768) onClose(); }}
                    className="flex-1 flex items-center gap-3 px-4 py-3 text-left w-full overflow-hidden"
                  >
                    <MessageSquare className={cn("w-4 h-4 flex-shrink-0", activeChatId === chat.id ? "text-[#1A1A1A]" : "text-gray-400 group-hover:text-[#1A1A1A]")} />
                    <span className={cn("text-sm truncate font-sans", activeChatId === chat.id ? "text-[#1A1A1A] font-medium" : "text-gray-600 group-hover:text-[#1A1A1A]")}>
                      {chat.title}
                    </span>
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all absolute right-2"
                    title="Delete Chat"
                  >
                      <Trash2 className="w-3 h-3" />
                  </button>
              </div>
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
              <button
                onClick={onOpenSettings}
                className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 hover:text-[#1A1A1A] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
              >
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
    </>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  chats: PropTypes.array.isRequired,
  activeChatId: PropTypes.string,
  onSelectChat: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
  onDeleteChat: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Sidebar;
