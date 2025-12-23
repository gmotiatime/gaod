import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/auth';
import { db } from '../lib/db';
import { LogOut, Users, Shield, Key, Save, Plus, Trash2, Cpu, Brain, Search, Database, RefreshCcw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Vertex AI Keys
  const [vertexKey, setVertexKey] = useState('');

  // Supabase Config
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  // Global Settings
  const [systemPrompt, setSystemPrompt] = useState('');

  // Custom Models
  const [customModels, setCustomModels] = useState([]);
  const [newModel, setNewModel] = useState({ name: '', id: 'gemini-2.5-flash-lite', provider: 'vertex' });

  // New User State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [userError, setUserError] = useState('');

  const [savedMessage, setSavedMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const loadSettings = async () => {
        setVertexKey(await db.getSetting('gaod_vertex_key') || '');

        setSupabaseUrl(localStorage.getItem('brand_ai_supabase_url') || '');
        setSupabaseKey(localStorage.getItem('brand_ai_supabase_key') || '');

        setSystemPrompt(await db.getSetting('gaod_system_prompt') || '');

        const models = await db.getSetting('gaod_custom_models');
        setCustomModels(models ? JSON.parse(models) : []);

        try {
            const data = await auth.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    loadSettings();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    await db.setSetting('gaod_vertex_key', vertexKey);
    // Clearing old keys for clarity (optional, but good practice per user request to remove others)
    await db.setSetting('gaod_openai_key', '');
    await db.setSetting('gaod_anthropic_key', '');
    await db.setSetting('gaod_google_key', '');
    await db.setSetting('gaod_search_key', '');
    await db.setSetting('gaod_search_cx', '');

    setSavedMessage('Configuration saved.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleConnectDb = async (e) => {
      e.preventDefault();
      if (!supabaseUrl || !supabaseKey) {
          alert("Please enter both URL and Key.");
          return;
      }

      try {
          const client = createClient(supabaseUrl, supabaseKey);
          const { count, error } = await client.from('app_users').select('*', { count: 'exact', head: true });

          if (error) {
              if (error.code === '42P01') {
                  alert("Connection successful but tables are missing! Please run the SQL Schema provided.");
              } else {
                  throw error;
              }
          } else {
              localStorage.setItem('brand_ai_supabase_url', supabaseUrl);
              localStorage.setItem('brand_ai_supabase_key', supabaseKey);
              if (confirm(`Connection successful! Found ${count !== null ? count : 0} users.\n\nReload page to switch to Supabase mode?`)) {
                  window.location.reload();
              }
          }
      } catch (err) {
          alert(`Connection Failed: ${err.message}`);
          console.error(err);
      }
  };

  const handleSaveSystem = async (e) => {
    e.preventDefault();
    await db.setSetting('gaod_system_prompt', systemPrompt);
    setSavedMessage('Memory updated.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!newModel.name || !newModel.id) return;

    const updatedModels = [...customModels, { ...newModel, uuid: Date.now() }];
    setCustomModels(updatedModels);
    await db.setSetting('gaod_custom_models', JSON.stringify(updatedModels));
    setNewModel({ name: '', id: 'gemini-2.5-flash-lite', provider: 'vertex' });
  };

  const handleDeleteModel = async (uuid) => {
    const updatedModels = customModels.filter(m => m.uuid !== uuid);
    setCustomModels(updatedModels);
    await db.setSetting('gaod_custom_models', JSON.stringify(updatedModels));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserError('');
    if (!newUser.email || !newUser.password || !newUser.name) return;

    try {
      const result = await auth.createUser(newUser);
      if (result.success) {
        setNewUser({ name: '', email: '', password: '', role: 'user' });
        const data = await auth.getAllUsers();
        setUsers(data);
      } else {
        setUserError(result.error);
      }
    } catch (err) {
      setUserError('Failed to create user');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading admin panel...</div>
      </div>
    );
  }

  // Styles from Design Kit
  const cardClass = "bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-8";
  const inputClass = "w-full bg-white border border-gray-200 text-[#1A1A1A] placeholder-gray-400 text-sm rounded-xl focus:ring-1 focus:ring-black focus:border-black block w-full p-4 outline-none shadow-sm transition-all";
  const primaryButtonClass = "bg-[#1A1A1A] text-white font-medium py-3 px-6 rounded-full hover:bg-black transition-colors shadow-lg hover:shadow-xl text-sm flex items-center gap-2 transform active:scale-95 duration-100";
  const sectionHeaderClass = "mb-6 border-b border-gray-100 pb-4 flex items-center gap-3";

  return (
    <div className="min-h-screen bg-[#F8F8F6] font-sans text-[#1A1A1A]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#1A1A1A] text-white p-2 rounded-xl shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">Gaod Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            {currentUser?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8 lg:p-12">
        <header className="mb-12">
          <h1 className="font-serif text-5xl mb-4 text-[#1A1A1A] tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-lg max-w-2xl font-light">Manage system configuration, AI models, and user access securely.</p>
        </header>

        {/* Database Connection */}
        <div className={cardClass}>
           <div className={sectionHeaderClass}>
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Database className="w-5 h-5" />
             </div>
             <h2 className="font-serif text-2xl">Database Connection</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div>
                   <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                       Connect to <strong className="text-[#1A1A1A]">Supabase</strong> (PostgreSQL) to sync data across devices.
                       Leave fields empty to use Local Storage (Offline Mode).
                   </p>
                   <form onSubmit={handleConnectDb} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Project URL</label>
                            <input
                              type="text"
                              value={supabaseUrl}
                              onChange={(e) => setSupabaseUrl(e.target.value)}
                              placeholder="https://xyz.supabase.co"
                              className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Anon Public Key</label>
                            <input
                              type="password"
                              value={supabaseKey}
                              onChange={(e) => setSupabaseKey(e.target.value)}
                              placeholder="eyJh..."
                              className={inputClass}
                            />
                        </div>
                        <div className="pt-2">
                            <button type="submit" className={primaryButtonClass}>
                                <RefreshCcw className="w-4 h-4" />
                                Test & Connect
                            </button>
                        </div>
                   </form>
               </div>

               <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-inner ring-1 ring-white/10 relative group">
                   <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                       <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">SQL Schema Setup</span>
                       <button
                         className="text-xs text-blue-400 hover:text-blue-300 font-mono bg-blue-500/10 px-2 py-1 rounded transition-colors"
                         onClick={() => navigator.clipboard.writeText(document.getElementById('sql-code').innerText)}
                       >
                           Copy SQL
                       </button>
                   </div>
                   <pre id="sql-code" className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap h-64 overflow-y-auto custom-scrollbar selection:bg-blue-500/30">
{`-- Run this in Supabase SQL Editor

create table if not exists app_users (
  id text primary key,
  email text not null unique,
  password text not null,
  name text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists app_settings (
  key text primary key,
  value text
);

create table if not exists chats (
  id text primary key,
  user_id text not null,
  title text,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table app_users enable row level security;
alter table app_settings enable row level security;
alter table chats enable row level security;

-- Allow public access (Demo Mode)
create policy "Public Users" on app_users for all using (true);
create policy "Public Settings" on app_settings for all using (true);
create policy "Public Chats" on chats for all using (true);`}
                   </pre>
               </div>
           </div>
        </div>

        {/* Global Memory */}
        <div className={cardClass}>
           <div className={sectionHeaderClass}>
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Brain className="w-5 h-5" />
             </div>
             <h2 className="font-serif text-2xl">Global Memory</h2>
           </div>
           <p className="text-sm text-gray-500 mb-6">
             Define the core persona and instructions prepended to every chat session.
           </p>
           <form onSubmit={handleSaveSystem} className="space-y-4">
              <textarea
                 value={systemPrompt}
                 onChange={(e) => setSystemPrompt(e.target.value)}
                 className="w-full bg-white border border-gray-200 text-[#1A1A1A] placeholder-gray-400 text-sm rounded-xl focus:ring-1 focus:ring-black focus:border-black block w-full p-6 outline-none shadow-sm min-h-[160px] resize-y font-mono leading-relaxed"
                 placeholder="You are Gaod, a creative assistant..."
              />
              <div className="flex justify-end">
                <button type="submit" className={primaryButtonClass}>
                    <Save className="w-4 h-4" /> Save Memory
                </button>
              </div>
           </form>
        </div>

        {/* API Configuration */}
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
             <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <Key className="w-5 h-5" />
             </div>
             <h2 className="font-serif text-2xl">API Credentials</h2>
          </div>

          <form onSubmit={handleSaveKeys} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Vertex AI API Key (Google Cloud)</label>
                  <input
                    type="password"
                    value={vertexKey}
                    onChange={(e) => setVertexKey(e.target.value)}
                    placeholder="AQ.Ab..."
                    className={inputClass}
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                      Access to models like gemini-2.5-flash-lite via aiplatform.googleapis.com
                  </p>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className={primaryButtonClass}
              >
                <Save className="w-4 h-4" />
                Save Keys
              </button>
              {savedMessage && (
                <span className="text-green-600 text-sm font-medium animate-pulse bg-green-50 px-3 py-1 rounded-full">
                  {savedMessage}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Custom Models */}
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
             <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <Cpu className="w-5 h-5" />
             </div>
             <h2 className="font-serif text-2xl">Chat Models</h2>
          </div>

          <div className="mb-8">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
               <h3 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">Add New Model</h3>
               <form onSubmit={handleAddModel} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Gemini 2.5 Flash"
                      value={newModel.name}
                      onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Model ID</label>
                    <input
                      type="text"
                      placeholder="gemini-2.5-flash-lite"
                      value={newModel.id}
                      onChange={(e) => setNewModel({...newModel, id: e.target.value})}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Provider</label>
                    <select
                       value={newModel.provider}
                       onChange={(e) => setNewModel({...newModel, provider: e.target.value})}
                       className={inputClass}
                    >
                      <option value="vertex">Vertex AI</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-white border border-gray-200 text-[#1A1A1A] font-medium px-4 py-3.5 rounded-xl hover:bg-black hover:text-white hover:border-transparent transition-all shadow-sm flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
               </form>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Model ID</th>
                  <th className="px-6 py-4 font-medium">Provider</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium capitalize border border-gray-200">
                          {model.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteModel(model.uuid)}
                          className="text-red-300 hover:text-red-500 bg-red-50 hover:bg-red-100 rounded-lg p-2 transition-all opacity-0 group-hover:opacity-100"
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
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Users className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl">User Registry</h2>
          </div>

          <div className="mb-8">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
               <h3 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">Add New User</h3>
               <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Role</label>
                    <select
                       value={newUser.role}
                       onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                       className={inputClass}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-white border border-gray-200 text-[#1A1A1A] font-medium px-4 py-3.5 rounded-xl hover:bg-black hover:text-white hover:border-transparent transition-all shadow-sm flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4" /> Add User
                    </button>
                  </div>
               </form>
               {userError && (
                 <p className="text-red-500 text-xs mt-3 bg-red-50 p-2 rounded-lg inline-block">{userError}</p>
               )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A]">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.role === 'admin'
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-mono text-[10px]">
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
