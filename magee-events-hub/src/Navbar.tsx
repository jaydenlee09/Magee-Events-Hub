import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { PiStudent } from "react-icons/pi";
import { FiUser } from "react-icons/fi";
import mageeLogo from './assets/Magee.png';
import { Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase/firebase";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem("isAdmin") === "true";
  const location = useLocation();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply dark class to html element
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Helper to determine if a path is active
  const isActive = (path: string) => location.pathname === path;

  const handleAdminClick = () => {
    setShowModal(true);
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        "jaydenjdlee@gmail.com",
        password
      );
      if (userCredential.user.email === "jaydenjdlee@gmail.com") {
        localStorage.setItem("isAdmin", "true");
        setShowModal(false);
        setError("");
        window.location.reload();
      } else {
        setError("Not authorized as admin.");
      }
    } catch (err) {
      setError("Incorrect password or login failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    window.location.reload();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-3 sm:px-6 py-2 bg-white/80 dark:bg-[#181c23] dark:border-b dark:border-pink-500/40 dark:shadow-pink-900/40 shadow-lg dark:shadow-2xl font-sans transition-colors backdrop-blur-md">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="block h-6 sm:h-8 w-auto mr-1 sm:mr-2">
          <img src={mageeLogo} alt="Logo" className="h-6 sm:h-8 w-auto align-middle" />
        </span>
        <span className="font-bold text-sm sm:text-lg tracking-tight text-gray-800 dark:text-gray-100 select-none">Magee Events Hub</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        <Link
          to="/"
          className={`flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-200
            ${isActive("/") ? "bg-red-100 text-red-700 shadow dark:bg-pink-900/30 dark:text-white" : "text-gray-700 dark:text-white hover:bg-red-100 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-white hover:scale-105 active:scale-95 hover:shadow-md"}
          `}
        >
          <FaCalendarAlt size={16} color={darkMode ? '#fff' : undefined} />
          <span className="hidden sm:inline">Events</span>
        </Link>
        <Link
          to="/schedule"
          className={`flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-200
            ${isActive("/schedule") ? "bg-red-100 text-red-700 shadow dark:bg-pink-900/30 dark:text-white" : "text-gray-700 dark:text-white hover:bg-red-100 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-white hover:scale-105 active:scale-95 hover:shadow-md"}
          `}
        >
          <PiStudent size={16} color={darkMode ? '#fff' : undefined} />
          <span className="hidden sm:inline">Calendar</span>
        </Link>
        <Link
          to="/submit"
          className={`flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-200
            ${isActive("/submit") ? "bg-red-100 text-red-700 shadow dark:bg-pink-900/30 dark:text-white" : "text-gray-700 dark:text-white hover:bg-red-100 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-white hover:scale-105 active:scale-95 hover:shadow-md"}
          `}
        >
          <IoMdAdd size={16} color={darkMode ? '#fff' : undefined} />
          <span className="hidden sm:inline">Submit</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center justify-center p-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500
              ${isActive("/admin") ? "bg-red-100 text-red-700 shadow dark:bg-pink-900/30 dark:text-white" : "text-gray-800 dark:text-gray-100 bg-transparent"}
            `}
            style={{ outline: 'none', borderColor: 'transparent' }}
            title="Admin Panel"
          >
            <FiUser size={16} color={darkMode ? '#e5e7eb' : '#374151'} />
          </Link>
        )}
        {!isAdmin && (
          <button
            className={`flex items-center justify-center p-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500
              ${isActive("/admin") ? "bg-red-100 text-red-700 shadow dark:bg-pink-900/30 dark:text-white" : "text-gray-800 dark:text-gray-100 bg-transparent"}
            `}
            style={{ outline: 'none', borderColor: 'transparent' }}
            onClick={handleAdminClick}
            title="Admin Login"
          >
            <FiUser size={16} color={darkMode ? '#e5e7eb' : '#374151'} />
          </button>
        )}
        {isAdmin && (
          <button className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium text-gray-500 hover:bg-gray-200 hover:text-red-700 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200" onClick={handleLogout}>
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
        {/* Dark mode toggle */}
        <button
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setDarkMode(dm => !dm)}
          className="rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-gray-700" />}
        </button>
      </div>
    </nav>
    {showModal && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 relative mx-4">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            autoFocus
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-2 rounded-lg shadow hover:from-pink-500 hover:to-red-500 transition">Login</button>
            <button type="button" className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-gray-700 transition" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </div>
    )}
    </>
  );
}