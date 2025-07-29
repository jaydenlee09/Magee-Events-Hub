import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import EventsPage from "./pages/EventsPage";
import SchedulePage from "./pages/SchedulePage";
import SubmitEventPage from "./pages/SubmitEventPage";
import AdminPage from "./pages/AdminPage";
import './App.css';

function App() {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem("isAdmin") === "true";
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<EventsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/submit" element={<SubmitEventPage />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;