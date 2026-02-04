
import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase().endsWith('@gmail.com')) {
      setIsLoading(true);
      setError('');
      
      // Simulate a brief check before logging in
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } else {
      setError('Please enter a valid Gmail address to access your agenda.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-100">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">SmartPlan</h1>
          </div>
          <h2 className="text-xl font-semibold text-slate-700">Welcome</h2>
          <p className="mt-2 text-sm text-slate-500">
            Securely access your agenda with your Gmail account.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLoginSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 ml-1">
              Gmail Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-lg text-black bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400"
              placeholder="example@gmail.com"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 rounded-xl flex items-center space-x-2 text-rose-600 animate-in fade-in slide-in-from-top-1">
              <i className="fas fa-circle-exclamation text-sm"></i>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all active:scale-[0.98] shadow-lg shadow-indigo-100 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Signing in...
              </span>
            ) : (
              'Enter Workspace'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            By logging in, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
