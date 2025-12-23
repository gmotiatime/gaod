// Using a simpler approach to avoid complex imports
import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, User, Save, Lock } from 'lucide-react';
import { auth } from '../../lib/auth';

const SettingsModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // In a real app, this would call an API
    // Here we just update localStorage user data
    try {
        const users = JSON.parse(localStorage.getItem('brand_ai_users') || '[]');
        const userIndex = users.findIndex(u => u.email === user.email);

        if (userIndex !== -1) {
            const updatedUser = { ...users[userIndex], name };
            if (password) updatedUser.password = password; // Should hash in real app

            users[userIndex] = updatedUser;
            localStorage.setItem('brand_ai_users', JSON.stringify(users));

            // Update session
            const { password: _, ...safeUser } = updatedUser;
            localStorage.setItem('brand_ai_session', JSON.stringify(safeUser));

            onUpdateUser(safeUser);
            setMessage('Profile updated successfully.');
            setTimeout(() => {
                setMessage('');
                onClose();
            }, 1500);
        }
    } catch (err) {
        setError('Failed to update profile');
        console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-200">

        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-[#1A1A1A]">Profile Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

            <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Display Name</label>
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
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2">New Password (Optional)</label>
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

            {message && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{message}</div>}
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

            <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white font-medium py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                Save Changes
            </button>

        </form>

      </div>
    </div>
  );
};

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onUpdateUser: PropTypes.func.isRequired
};

export default SettingsModal;
