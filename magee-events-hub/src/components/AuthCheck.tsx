import React, { useState } from 'react';
import { auth, signUpWithEmail, signInWithEmail, signOutUser, resendVerificationEmail } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AuthForm from './AuthForm';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string>();
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Check for an existing session when component mounts
  React.useEffect(() => {
    if (user?.emailVerified) {
      // User is signed in and verified, make sure they're on the right page
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/auth') {
        window.location.href = '/submit';
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const handleAuth = async (email: string, password: string) => {
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setShowVerificationPrompt(true);
      } else {
        const user = await signInWithEmail(email, password);
        if (user.emailVerified) {
          // Redirect to submit page after successful verification
          window.location.href = '/submit';
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user || (user && !user.emailVerified && !showVerificationPrompt)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center space-y-6">
          {showVerificationPrompt ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We've sent a verification link to your email. Please check your inbox and verify your email address to continue.
              </p>
              <button
                onClick={async () => {
                  try {
                    await resendVerificationEmail();
                    setError("Verification email resent. Please check your inbox.");
                  } catch (err: any) {
                    setError(err.message);
                  }
                }}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => signOutUser()}
                className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {isSignUp 
                  ? "Sign up with your school email to submit events" 
                  : "Sign in with your school email to continue"}
              </p>
              <AuthForm
                isSignUp={isSignUp}
                onSubmit={handleAuth}
                onToggleMode={() => {
                  setIsSignUp(!isSignUp);
                  setError(undefined);
                }}
                error={error}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  if (!user.email?.endsWith('@learn.vsb.bc.ca')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unauthorized Access</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Sorry, you are not authorized to submit events. Only authorized school staff and club leaders can submit events.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Signed in as: {user.email}
          </p>
          <button
            onClick={() => signOutUser()}
            className="w-full px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Not Verified</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please verify your email before accessing this page. Check your inbox for a verification link.
          </p>
          <div className="space-y-4">
            <button
              onClick={async () => {
                try {
                  await resendVerificationEmail();
                  setError("Verification email resent. Please check your inbox.");
                } catch (err: any) {
                  setError(err.message);
                }
              }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Resend Verification Email
            </button>
            <button
              onClick={() => signOutUser()}
              className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthCheck;
