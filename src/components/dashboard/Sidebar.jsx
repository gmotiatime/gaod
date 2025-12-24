import { Plus, MessageSquare, Settings, LogOut, X, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import MoleculeIcon from '../MoleculeIcon';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({
  user,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenSettings,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-50 w-72 bg-[#F8F8F6] border-r border-gray-200 flex flex-col transition-transform duration-300 transform md:translate-x-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MoleculeIcon className="w-8 h-8 text-[#1A1A1A]" mode="navbar" />
            <span className="font-serif text-xl font-bold tracking-tight text-[#1A1A1A]">
              Gaod
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:text-[#1A1A1A] transition-colors rounded-lg hover:bg-gray-200/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-6">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 py-3 rounded-full hover:bg-black transition-all shadow-md hover:shadow-lg font-medium text-sm transform active:scale-95 duration-100"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
          <div className="px-4 py-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            Recent Chats
          </div>

          {chats.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm italic font-serif">
              Start creating...
            </div>
          )}

          <AnimatePresence initial={false}>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  'group relative flex items-center rounded-xl transition-all duration-200 overflow-hidden',
                  activeChatId === chat.id
                    ? 'bg-white shadow-sm ring-1 ring-black/5'
                    : 'hover:bg-white/50 border border-transparent'
                )}
              >
                {activeChatId === chat.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#1A1A1A] rounded-r-full" />
                )}

                <button
                  onClick={() => {
                    onSelectChat(chat.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className="flex-1 flex items-center gap-3 px-4 py-3 text-left w-full overflow-hidden"
                >
                  <MessageSquare
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      activeChatId === chat.id
                        ? 'text-[#1A1A1A]'
                        : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm truncate font-medium transition-colors',
                      activeChatId === chat.id
                        ? 'text-[#1A1A1A]'
                        : 'text-gray-600 group-hover:text-[#1A1A1A]'
                    )}
                  >
                    {chat.title}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all absolute right-1 mr-1 rounded-lg hover:bg-red-50"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-200 bg-[#F8F8F6]">
          <div className="flex items-center gap-3 px-2 mb-4 bg-white/50 p-2 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A1A1A] to-gray-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-gray-500 truncate font-mono">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-gray-600 hover:text-[#1A1A1A] bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all shadow-sm hover:shadow"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-transparent rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
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
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
