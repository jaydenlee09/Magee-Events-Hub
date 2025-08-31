import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import PageFade from '../PageFade';
import { FaCalendarAlt, FaUser, FaMapMarkerAlt, FaEnvelope, FaUsers, FaCheck, FaTimes, FaEdit, FaComments, FaChartBar, FaLock, FaBell, FaSearch, FaEllipsisH, FaTachometerAlt, FaRegCalendarCheck, FaRegCalendarTimes, FaFilter, FaSortAmountDown, FaSortAmountUp, FaDownload, FaEye, FaRegClock, FaTags, FaCog, FaSignOutAlt } from "react-icons/fa";

interface EventData {
  id: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  timePeriod?: string;
  location?: string;
  organizer?: string;
  targetAudience?: string;
  email?: string;
  notes?: string;
  icon?: string;
}

interface FeedbackData {
  id: string;
  feedback: string;
  email?: string;
  submittedAt: any;
}

const AdminPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'feedback'>('events');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsSnapshot = await getDocs(collection(db, "pendingEvents"));
        const fetchedEvents = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as EventData[];
        setEvents(fetchedEvents);

        // Fetch feedback
        const feedbackSnapshot = await getDocs(collection(db, "feedback"));
        const fetchedFeedback = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FeedbackData[];
        setFeedback(fetchedFeedback);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date not provided";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleDecline = async (id: string) => {
    if (window.confirm("Are you sure you want to decline this event?")) {
      try {
        await deleteDoc(doc(db, "pendingEvents", id));
        setEvents(events.filter(event => event.id !== id));
      } catch (error) {
        console.error("Error declining event:", error);
      }
    }
  };

  const handleApprove = async (event: EventData) => {
    if (window.confirm("Are you sure you want to approve this event?")) {
      try {
        // Add to approved events collection
        await addDoc(collection(db, "events"), {
          ...event,
          id: undefined, // Firestore will generate a new ID
          approvedAt: new Date()
        });
        
        // Delete from pending events
        await deleteDoc(doc(db, "pendingEvents", event.id));
        
        // Update UI
        setEvents(events.filter(e => e.id !== event.id));
      } catch (error) {
        console.error("Error approving event:", error);
      }
    }
  };

  const handleMarkFeedbackAsRead = async (id: string) => {
    try {
      await deleteDoc(doc(db, "feedback", id));
      setFeedback(feedback.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error marking feedback as read:", error);
    }
  };

  const handleEditClick = (event: EventData) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      organizer: event.organizer,
      targetAudience: event.targetAudience,
      email: event.email,
      notes: event.notes,
      icon: event.icon,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    setIsSaving(true);
    try {
      const eventRef = doc(db, "pendingEvents", editingEvent.id);
      await updateDoc(eventRef, editForm);
      
      // Update events list
      setEvents(events.map(event => 
        event.id === editingEvent.id ? { ...event, ...editForm } : event
      ));
      
      // Close modal
      setEditingEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageFade />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Modern Admin Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-md border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Logo and title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                  <FaLock className="text-xl" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white hidden sm:block">Admin Dashboard</h1>
              </div>
              
              {/* Right side - Search and actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
                  />
                </div>
                
                {/* Notification bell */}
                <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition relative">
                  <FaBell className="text-lg" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings */}
                <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <FaCog className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 sm:px-6 py-6 grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            {/* Admin Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Admin User</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last login: Today</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <button className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium flex items-center gap-2">
                  <FaSignOutAlt size={14} /> Sign Out
                </button>
              </div>
            </div>
            
            {/* Stats Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200/60 dark:border-gray-700/60 space-y-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Dashboard Overview</h2>
              
              <div className="space-y-4">
                {/* Pending Events Stat */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-100 dark:border-red-800/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-red-200 dark:border-red-800/50">
                      <FaCalendarAlt className="text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Events</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{events.length}</p>
                    </div>
                  </div>
                  {events.length > 0 && (
                    <div className="text-xs font-medium px-2 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                      Needs Action
                    </div>
                  )}
                </div>
                
                {/* Feedback Stat */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-blue-200 dark:border-blue-800/50">
                      <FaComments className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Feedback</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{feedback.length}</p>
                    </div>
                  </div>
                </div>
                
                {/* Total Items Stat */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-green-200 dark:border-green-800/50">
                      <FaChartBar className="text-green-500 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{events.length + feedback.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium flex items-center gap-1.5">
                  <FaTachometerAlt size={12} /> View Full Analytics
                </a>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9 space-y-6">
            {/* Tab Navigation with Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex space-x-1 mb-4 sm:mb-0">
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'events'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <FaCalendarAlt size={14} />
                    Events ({events.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'feedback'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <FaComments size={14} />
                    Feedback ({feedback.length})
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {activeTab === 'events' && (
                    <>
                      <div className="relative">
                        <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm">
                          <FaFilter size={12} /> Filter
                        </button>
                      </div>
                      <div className="relative">
                        <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm">
                          <FaSortAmountDown size={12} /> Sort
                        </button>
                      </div>
                      <div className="relative">
                        <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm">
                          <FaDownload size={12} /> Export
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Event Tab Content */}
              {activeTab === 'events' && (
                <div className="p-4">
                  {events.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg border border-gray-200/60 dark:border-gray-700/60">
                      <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                        <FaRegCalendarCheck className="text-4xl text-red-500 dark:text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">All Caught Up!</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">There are no pending events that require your attention at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Event Grid with improved cards */}
                      <div className="grid gap-6 xl:grid-cols-2">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                          >
                            {/* Category Indicator */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
                            
                            <div className="flex flex-col sm:flex-row sm:h-full">
                              {/* Left Side: Event Info */}
                              <div className="flex-1 p-6 flex flex-col">
                                {/* Event Header */}
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        Pending
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {event.category || "Uncategorized"}
                                      </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                      {event.title || "Untitled Event"}
                                    </h3>
                                  </div>
                                  
                                  <div className="relative">
                                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                      <FaEllipsisH size={16} />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Event Description */}
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                  {event.description || "No description provided"}
                                </p>
                                
                                {/* Event Details in grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400">
                                      <FaCalendarAlt size={14} />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {formatDate(event.date || "")}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400">
                                      <FaRegClock size={14} />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {event.time || "Not specified"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
                                      <FaMapMarkerAlt size={14} />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {event.location || "Not specified"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400">
                                      <FaUser size={14} />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Organizer</p>
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {event.organizer || "Anonymous"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {event.targetAudience && (
                                    <div className="flex items-center gap-2.5 col-span-1 sm:col-span-2">
                                      <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400">
                                        <FaUsers size={14} />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Target Audience</p>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                          {event.targetAudience}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Preview button */}
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                                    <FaEye size={12} /> Preview Event
                                  </button>
                                </div>
                              </div>
                              
                              {/* Right Side: Action Panel */}
                              <div className="p-6 sm:w-44 lg:w-52 xl:w-56 bg-gray-50 dark:bg-gray-700/50 flex flex-row sm:flex-col gap-3 sm:justify-center">
                                <button
                                  onClick={() => handleApprove(event)}
                                  className="flex-1 sm:flex-none sm:w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white shadow-sm hover:shadow transition-all duration-200"
                                >
                                  <FaCheck size={12} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDecline(event.id)}
                                  className="flex-1 sm:flex-none sm:w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white shadow-sm hover:shadow transition-all duration-200"
                                >
                                  <FaTimes size={12} />
                                  Decline
                                </button>
                                <button
                                  onClick={() => handleEditClick(event)}
                                  className="flex-1 sm:flex-none sm:w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-sm hover:shadow transition-all duration-200"
                                >
                                  <FaEdit size={12} />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {events.length > 0 && (
                        <div className="flex justify-center mt-8">
                          <nav className="inline-flex rounded-xl shadow-sm overflow-hidden">
                            <button className="px-4 py-2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400">
                              Previous
                            </button>
                            <button className="px-4 py-2 bg-red-500 text-white font-medium">
                              1
                            </button>
                            <button className="px-4 py-2 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400">
                              Next
                            </button>
                          </nav>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Tab Content */}
              {activeTab === 'feedback' && (
                <div className="p-4 space-y-6">
                  {/* Filter Bar */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white">User Feedback</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {feedback.length} Total
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                        <FaTags size={12} /> Categories
                      </button>
                      <button className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                        <FaSortAmountUp size={12} /> Newest First
                      </button>
                    </div>
                  </div>
                  
                  {/* Feedback Content */}
                  {feedback.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg border border-gray-200/60 dark:border-gray-700/60">
                      <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                        <FaComments className="text-4xl text-blue-500 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Feedback Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">When users submit feedback, it will appear here for your review.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {feedback.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl transition-all duration-300 group"
                        >
                          <div className="p-5 sm:p-6">
                            {/* Feedback Header */}
                            <div className="flex items-start justify-between mb-5">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                  <FaComments className="text-xl" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {item.submittedAt?.toDate ? 
                                      item.submittedAt.toDate().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      }) : 
                                      'Date not available'
                                    }
                                  </p>
                                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    User Feedback #{item.id.substring(0, 4)}
                                  </h3>
                                  {item.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <FaEnvelope className="text-gray-400 text-xs" />
                                      <span className="text-sm">{item.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.submittedAt?.toDate ? 
                                    item.submittedAt.toDate().toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 
                                    ''
                                  }
                                </p>
                                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                  <FaEllipsisH size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Feedback Content */}
                            <div className="px-0.5">
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-5">
                                <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                                  {item.feedback}
                                </p>
                              </div>
                            </div>
                            
                            {/* Action Bar */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  <FaRegCalendarCheck size={11} /> Archive
                                </button>
                                <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                  <FaRegCalendarTimes size={11} /> Delete
                                </button>
                              </div>
                              
                              <button
                                onClick={() => handleMarkFeedbackAsRead(item.id)}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white shadow-sm hover:shadow transition-all duration-200"
                              >
                                <FaCheck size={11} />
                                Mark as Read
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Edit Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Event</h3>
                <button 
                  onClick={() => setEditingEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={editForm.category || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                    <input
                      type="text"
                      name="time"
                      value={editForm.time || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organizer</label>
                    <input
                      type="text"
                      name="organizer"
                      value={editForm.organizer || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={editForm.targetAudience || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={editForm.description || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 h-32 resize-none"
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={editForm.notes || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 h-24 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck size={14} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;
