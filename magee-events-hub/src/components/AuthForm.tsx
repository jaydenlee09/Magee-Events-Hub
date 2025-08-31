import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  isSignUp: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
  onToggleMode: () => void;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ isSignUp, onSubmit, onToggleMode, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isSchoolEmail = (email: string) => {
    return email.endsWith('@learn.vsb.bc.ca');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.name@learn.vsb.bc.ca"
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
        {email && !isSchoolEmail(email) && (
          <p className="text-sm text-red-500">
            Please use your @learn.vsb.bc.ca email address
          </p>
        )}
      </div>
      
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isSignUp && password.length > 0 && password.length < 6 && (
        <p className="text-sm text-red-500">
          Password must be at least 6 characters long
        </p>
      )}
      
      <button
        type="submit"
        disabled={!isSchoolEmail(email) || (isSignUp && password.length < 6) || isLoading}
        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            {isSignUp ? "Signing Up..." : "Signing In..."}
          </>
        ) : (
          isSignUp ? "Sign Up" : "Sign In"
        )}
      </button>

      <div className="text-sm text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-red-500 hover:text-red-600 font-semibold"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </form>
  );
};

export default AuthForm;
