import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/auth';
import { LogOut, Users, Shield, Key, Save, Plus, Trash2, Cpu } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // API Keys
  const [openAiKey, setOpenAiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [googleAiKey, setGoogleAiKey] = useState('');

  // Custom Models
  const [customModels, setCustomModels] = useState([]);
  const [newModel, setNewModel] = useState({ name: '', id: '', provider: 'openai' });

  const [savedMessage, setSavedMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    // Load configs
    setOpenAiKey(localStorage.getItem('gaod_openai_key') || '');
    setAnthropicKey(localStorage.getItem('gaod_anthropic_key') || '');
    setGoogleAiKey(localStorage.getItem('gaod_google_key') || '');
    const savedModels = JSON.parse(localStorage.getItem('gaod_custom_models') || '[]');
    setCustomModels(savedModels);

    const fetchData = async () => {
      try {
        const data = await auth.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  const handleSaveKeys = (e) => {
    e.preventDefault();
    localStorage.setItem('gaod_openai_key', openAiKey);
    localStorage.setItem('gaod_anthropic_key', anthropicKey);
    localStorage.setItem('gaod_google_key', googleAiKey);

    setSavedMessage('Configuration saved.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleAddModel = (e) => {
    e.preventDefault();
    if (!newModel.name || !newModel.id) return;

    const updatedModels = [...customModels, { ...newModel, uuid: Date.now() }];
    setCustomModels(updatedModels);
    localStorage.setItem('gaod_custom_models', JSON.stringify(updatedModels));
    setNewModel({ name: '', id: '', provider: 'openai' });
  };

  const handleDeleteModel = (uuid) => {
    const updatedModels = customModels.filter(m => m.uuid !== uuid);
    setCustomModels(updatedModels);
    localStorage.setItem('gaod_custom_models', JSON.stringify(updatedModels));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading admin panel...</div>
      </div>
    );
  }

  // Styles from Design Kit
  const cardClass = "bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8";
  const inputClass = "w-full bg-white border border-gray-200 text-[#1A1A1A] placeholder-gray-400 text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block w-full p-3.5 outline-none shadow-sm";
  const primaryButtonClass = "bg-[#1A1A1A] text-white font-medium py-3 px-6 rounded-full hover:bg-black transition-colors shadow-lg text-sm flex items-center gap-2";
  const sectionHeaderClass = "mb-6 border-b border-gray-100 pb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#F8F8F6] font-sans text-[#1A1A1A]">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#1A1A1A] text-white p-2 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl font-bold">Gaod Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 font-mono">
            {currentUser?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm hover:text-red-600 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
        <header className="mb-12">
          <h1 className="font-serif text-4xl mb-3 text-[#1A1A1A]">Admin Dashboard</h1>
          <p className="text-gray-500 text-lg">Manage system configuration, AI models, and user access.</p>
        </header>

        {/* API Configuration */}
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
             <Key className="w-5 h-5 text-gray-400" />
             <h2 className="font-serif text-2xl">API Keys</h2>
          </div>

          <form onSubmit={handleSaveKeys} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide font-mono">OpenAI API Key</label>
                <input
                  type="password"
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide font-mono">Anthropic API Key</label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide font-mono">Google AI API Key</label>
                <input
                  type="password"
                  value={googleAiKey}
                  onChange={(e) => setGoogleAiKey(e.target.value)}
                  placeholder="AIza..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                className={primaryButtonClass}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              {savedMessage && (
                <span className="text-green-600 text-sm font-medium animate-pulse">
                  {savedMessage}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Custom Models */}
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
             <Cpu className="w-5 h-5 text-gray-400" />
             <h2 className="font-serif text-2xl">Custom Models</h2>
          </div>

          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
               <h3 className="text-sm font-mono uppercase text-gray-500 mb-4 tracking-wider">Add New Model</h3>
               <form onSubmit={handleAddModel} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Finance Bot"
                      value={newModel.name}
                      onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Model ID</label>
                    <input
                      type="text"
                      placeholder="e.g. ft:gpt-3.5-turbo..."
                      value={newModel.id}
                      onChange={(e) => setNewModel({...newModel, id: e.target.value})}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Base Provider</label>
                    <select
                       value={newModel.provider}
                       onChange={(e) => setNewModel({...newModel, provider: e.target.value})}
                       className={inputClass}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-white border border-gray-200 text-[#1A1A1A] font-medium px-4 py-3.5 rounded-lg hover:bg-gray-50 hover:border-black transition-colors shadow-sm flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
               </form>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-mono text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Model ID</th>
                  <th className="px-6 py-4 font-medium">Provider</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customModels.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                      No custom models configured.
                    </td>
                  </tr>
                ) : (
                  customModels.map((model) => (
                    <tr key={model.uuid} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-[#1A1A1A]">{model.name}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{model.id}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium capitalize">
                          {model.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteModel(model.uuid)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Remove model"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management */}
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
            <Users className="w-5 h-5 text-gray-400" />
            <h2 className="font-serif text-2xl">User Registry</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-mono text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {user.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
