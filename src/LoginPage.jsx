import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from './lib/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await auth.login(email, password);

      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F8F6] p-4 font-sans">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Logo */}
        <div className="mb-8">
           <svg viewBox="0 0 100 100" fill="currentColor" className="w-16 h-16 text-[#1A1A1A]">
            <circle cx="50" cy="50" r="12" />
            <circle cx="50" cy="20" r="10" />
            <circle cx="80" cy="50" r="10" />
            <circle cx="50" cy="80" r="10" />
            <circle cx="20" cy="50" r="10" />
            <path d="M50 38 L50 20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <path d="M62 50 L80 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <path d="M50 62 L50 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <path d="M38 50 L20 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <circle cx="29" cy="29" r="8" />
            <circle cx="71" cy="29" r="8" />
            <circle cx="71" cy="71" r="8" />
            <circle cx="29" cy="71" r="8" />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-3 text-center tracking-tight">Welcome to Gaod</h1>
        <p className="text-gray-500 mb-10 text-center text-sm tracking-wide">Sign in to access your Gaod space</p>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-1">
             <input 
              type="email" 
              placeholder="name@work-email.com" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className={`w-full bg-white border ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'} text-[#1A1A1A] placeholder-gray-400 text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block w-full p-3.5 transition-all outline-none shadow-sm`}
              disabled={loading}
            />
          </div>

          <div className="space-y-1 relative">
             <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className={`w-full bg-white border ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'} text-[#1A1A1A] placeholder-gray-400 text-sm rounded-lg focus:ring-1 focus:ring-black focus:border-black block w-full p-3.5 transition-all outline-none shadow-sm`}
              disabled={loading}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm mt-2 px-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white font-medium py-3.5 px-4 rounded-lg hover:bg-black transition-all shadow-md hover:shadow-lg mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
          </button>
        </form>

        <div className="mt-10 text-center text-xs text-gray-400 leading-relaxed">
          By signing in, you agree to our <br/>
          <a href="#" className="underline hover:text-[#1A1A1A] transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-[#1A1A1A] transition-colors">Privacy Policy</a>.
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
