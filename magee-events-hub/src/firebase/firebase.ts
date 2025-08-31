// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtkkgy2AzD-zRzNbM3lCFM_jO7EqLJvbc",
  authDomain: "magee-events-hub-57271.firebaseapp.com",
  projectId: "magee-events-hub-57271",
  storageBucket: "magee-events-hub-57271.firebasestorage.app",
  messagingSenderId: "263383380166",
  appId: "1:263383380166:web:887c1e6899f21eb26d67c7",
  measurementId: "G-Q7YD9H5KFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable persistent auth state
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistence enabled');
  })
  .catch((error) => {
    console.error('Error enabling persistence:', error);
  });

// List of authorized administrators (non-VSB emails)
// Additional authorized emails (for staff/admin who don't use VSB email)
export const additionalAuthorizedEmails = [
  "jaydenjdlee@gmail.com",
  "sparemail0728@gmail.com"
];

// Authentication functions
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    if (!email.endsWith('@learn.vsb.bc.ca')) {
      throw new Error("Please use your school email (@learn.vsb.bc.ca) to sign up");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send verification email
    await sendEmailVerification(user, {
      url: window.location.origin + '/submit', // Redirect to submit page
      handleCodeInApp: false // Set to false to use default Firebase email handling
    });
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Please sign in instead.");
    }
    console.error("Error signing up:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with:', email);
    
    // Sign in and persist the session
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Force reload user to get latest verification status
    await user.reload();
    console.log('Sign in successful, user:', user.email, 'Verified:', user.emailVerified);
    
    if (!user.emailVerified && !additionalAuthorizedEmails.includes(user.email || '')) {
      console.log('Email not verified:', user.email);
      // Send a new verification email if the previous one expired
      await sendEmailVerification(user, {
        url: window.location.origin + '/submit',
        handleCodeInApp: false
      });
      throw new Error(
        "Your email is not verified. We've sent a new verification link to your email. " +
        "Please check your inbox and spam folder."
      );
    }
    
    // Save some user info to localStorage for quick access
    localStorage.setItem('userEmail', user.email || '');
    localStorage.setItem('lastLogin', new Date().toISOString());
    
    console.log('User verified, session persisted');
    window.location.href = '/submit'; // Redirect after successful sign in
    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error("No account found with this email. Please sign up first.");
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error("Incorrect password. Please try again.");
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many failed attempts. Please try again later.");
    }
    if (error.code === 'auth/network-request-failed') {
      throw new Error("Network error. Please check your internet connection.");
    }
    
    // If it's not one of the above errors, throw the original error
    console.error("Unhandled error signing in:", error);
    throw error.message || "An unknown error occurred. Please try again.";
  }
};

export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    try {
      // Force reload user before checking verification status
      await user.reload();
      
      // Check if already verified after reload
      if (user.emailVerified) {
        throw new Error("Your email is already verified. Please try signing in again.");
      }
      
      await sendEmailVerification(user, {
        url: window.location.origin + '?verified=true',
        handleCodeInApp: false
      });
      
      console.log("Verification email sent to:", user.email);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { db, app, auth };