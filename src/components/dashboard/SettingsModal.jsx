// Using a simpler approach to avoid complex imports
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, User, Save, Lock, Brain, Trash2 } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('profile'); // profile | memory
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Memory State
  const [memory, setMemory] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      const memKey = `gaod_user_memory_${user.id}`;
      setMemory(localStorage.getItem(memKey) || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const users = JSON.parse(localStorage.getItem('brand_ai_users') || '[]');
      const userIndex = users.findIndex((u) => u.email === user.email);

      if (userIndex !== -1) {
        const updatedUser = { ...users[userIndex], name };
        if (password) updatedUser.password = password;

        users[userIndex] = updatedUser;
        localStorage.setItem('brand_ai_users', JSON.stringify(users));

        // eslint-disable-next-line no-unused-vars
        const { password: _, ...safeUser } = updatedUser;
        localStorage.setItem('brand_ai_session', JSON.stringify(safeUser));

        onUpdateUser(safeUser);
        setMessage('Profile updated successfully.');
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  const handleClearMemory = () => {
    if (
      confirm(
        'Are you sure you want to clear your AI memory? The assistant will forget everything about you.'
      )
    ) {
      const memKey = `gaod_user_memory_${user.id}`;
      localStorage.removeItem(memKey);
      setMemory('');
      setMessage('Memory cleared.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif text-[#1A1A1A]">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'memory' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            AI Memory
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F8F8F6] border border-gray-200 text-[#1A1A1A] text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block p-3 pl-10 outline-none"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                  New Password (Optional)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F8F8F6] border border-gray-200 text-[#1A1A1A] text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block p-3 pl-10 outline-none"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white font-medium py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </form>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div className="bg-[#F8F8F6] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3 text-[#1A1A1A] font-medium">
                  <Brain className="w-4 h-4" />
                  <span>Long-Term Memory</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  This is what Gaod knows about you. It uses this context to
                  provide personalized responses across all chats.
                </p>

                {memory ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {memory}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 italic text-sm">
                    Memory is empty.
                  </div>
                )}
              </div>

              <button
                onClick={handleClearMemory}
                disabled={!memory}
                className="w-full bg-white border border-gray-200 text-red-500 font-medium py-3 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Clear Memory
              </button>
            </div>
          )}

          {message && (
            <div className="mt-4 text-green-600 text-sm bg-green-50 p-3 rounded-lg text-center animate-pulse">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onUpdateUser: PropTypes.func.isRequired,
};

export default SettingsModal;
