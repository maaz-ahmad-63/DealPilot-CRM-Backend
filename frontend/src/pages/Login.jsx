import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader, Zap, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

// Animated Background Text Component with Pattern
const AnimatedBackground = ({ isDark }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: [0, 0.08, 0.06],
      y: [20, 0, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
  };

  const text = "DEALPILOT";

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Light to Dark Gradient Background */}
      <div className={`absolute inset-0 ${isDark 
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-b from-gray-50 via-gray-100 to-gray-900'}`} 
      />
      
      {/* SVG Pattern Overlay */}
      <svg className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-10' : 'opacity-15'}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill={isDark ? "#e5e7eb" : "#1f2937"} />
          </pattern>
          <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={isDark ? "#4b5563" : "#374151"} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#dots)" opacity="0.5" />
      </svg>

      {/* Animated wave pattern overlay */}
      <motion.svg
        className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-5' : 'opacity-10'}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <path
          fill={isDark ? "#111827" : "#1f2937"}
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,112C960,117,1056,107,1152,101.3C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </motion.svg>

      {/* Animated Text Background */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-8 pointer-events-none top-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`text-8xl font-black tracking-wider text-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {text.split('').map((letter, i) => (
            <motion.span key={i} variants={letterVariants} className="inline-block">
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${isDark ? '#e5e7eb' : '#1f2937'} 35px, ${isDark ? '#e5e7eb' : '#1f2937'} 70px)`,
      }} />

      {/* Animated gradient shift - subtle light/dark */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.1) 0%, rgba(55, 65, 81, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(31, 41, 55, 0.1) 0%, rgba(107, 114, 128, 0.1) 100%)',
        }}
      />
    </div>
  );
};

export function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading, token } = useAuth();
  const { addNotification } = useNotification();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      addNotification('Logged in successfully!', 'success');
      window.location.replace('/dashboard');
    } else {
      addNotification(result.error || 'Login failed', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // Demo credentials
  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'demo123',
    });
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground isDark={isDark} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4 relative z-10"
      >
        {/* Theme Toggle Button */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className={`absolute top-4 right-4 z-20 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isDark
              ? 'bg-gray-800/50 border border-gray-700 text-yellow-400 hover:bg-gray-700/50'
              : 'bg-white/40 border border-gray-300 text-gray-700 hover:bg-white/60'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </motion.button>

        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          className="w-full max-w-md"
        >
          {/* Card with glass-morphism effect */}
          <div className={`backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative overflow-hidden border ${
            isDark
              ? 'bg-gray-900/50 border-gray-700'
              : 'bg-white/80 border-gray-200'
          }`}>
            {/* Gradient border effect */}
            <div className={`absolute inset-0 pointer-events-none rounded-2xl opacity-40 ${
              isDark
                ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-gray-50 to-gray-100'
            }`} />
            
            <div className="relative z-10">
              {/* Logo/Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className={isDark ? 'text-gray-300' : 'text-gray-700'} size={32} />
                </motion.div>
                <h2 className={`text-3xl font-bold text-transparent bg-clip-text ${
                  isDark
                    ? 'bg-gradient-to-r from-gray-200 to-gray-400'
                    : 'bg-gradient-to-r from-gray-800 to-gray-600'
                }`}>
                  DealPilot
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-8"
              >
                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Sign in to your AI-powered CRM</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <div className={`flex items-center rounded-lg px-4 py-3 backdrop-blur transition-colors border ${
                    isDark
                      ? 'bg-gray-800/50 border-gray-600 focus-within:border-gray-500'
                      : 'bg-white border-gray-300 focus-within:border-gray-500'
                  }`}>
                    <Mail size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`flex-1 ml-2 bg-transparent outline-none placeholder-opacity-50 ${
                        isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                  <div className={`flex items-center rounded-lg px-4 py-3 backdrop-blur transition-colors border ${
                    isDark
                      ? 'bg-gray-800/50 border-gray-600 focus-within:border-gray-500'
                      : 'bg-white border-gray-300 focus-within:border-gray-500'
                  }`}>
                    <Lock size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`flex-1 ml-2 bg-transparent outline-none placeholder-opacity-50 ${
                        isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02, boxShadow: isDark ? '0 10px 25px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(0, 0, 0, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className={`w-full mt-6 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all border disabled:opacity-50 ${
                    isDark
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-600 hover:to-gray-800 border-gray-600'
                      : 'bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black border-gray-600'
                  }`}
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={fillDemoCredentials}
                  className={`w-full font-semibold py-3 rounded-lg transition-all backdrop-blur border-2 ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800/30'
                      : 'border-gray-600 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Use Demo Credentials
                </motion.button>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className={`text-center mt-6 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}
              >
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className={`font-semibold transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-900 hover:text-gray-700'
                  }`}
                >
                  Sign up
                </Link>
              </motion.p>
            </div>
          </div>

          {/* Floating card accent */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`mt-8 p-4 backdrop-blur-xl rounded-xl text-center border ${
              isDark
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white/60 border-gray-300'
            }`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              💡 <span className="font-semibold">Tip:</span> Use demo credentials to explore DealPilot
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
