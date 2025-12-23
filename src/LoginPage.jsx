import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Actually, let's stick to the single form with both fields if possible, or progressive.
  // The user provided admin credentials, implying we need both.
  // Screenshot 1 (dark) has both. Screenshot 2 (light) has just email.
  // Let's do a clean single step form with both fields for better UX, styled like the light screenshot.

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'gmotiaaa@gmail.com' && password === '2099121') {
      alert('Login successful! Redirecting...');
      // Here you would redirect
    } else {
      setError("Couldn't find your account.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F8F6] p-4">
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
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2 text-center">Welcome to Gaod</h1>
        <p className="text-gray-500 mb-8 text-center">Sign in to access your Gaod space</p>

        {/* Google Button */}
        <button className="w-full bg-white border border-gray-200 text-[#1A1A1A] font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-6 shadow-sm">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="w-full flex items-center gap-4 mb-6">
          <div className="h-[1px] bg-gray-200 flex-1"></div>
          <span className="text-gray-400 text-xs uppercase">or</span>
          <div className="h-[1px] bg-gray-200 flex-1"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-1">
             <input 
              type="email" 
              placeholder="name@work-email.com" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className={`w-full bg-[#F3F4F6] border ${error ? 'border-red-500 bg-red-50' : 'border-transparent'} text-[#1A1A1A] placeholder-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-black focus:border-transparent block w-full p-3 transition-colors outline-none`}
            />
          </div>

          <div className="space-y-1 relative">
             <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className={`w-full bg-[#F3F4F6] border ${error ? 'border-red-500 bg-red-50' : 'border-transparent'} text-[#1A1A1A] placeholder-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-black focus:border-transparent block w-full p-3 transition-colors outline-none`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm mt-2"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#1A1A1A] text-white font-medium py-3 px-4 rounded-lg hover:bg-black transition-colors shadow-lg mt-4"
          >
            Continue
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          By signing in, you agree to our <br/>
          <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
        </div>

      </div>
    </div>
  );
};

export default LoginPage;