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
import { FaCalendarAlt, FaUser, FaMapMarkerAlt, FaClock, FaEnvelope, FaUsers, FaStickyNote, FaCheck, FaTimes, FaEdit, FaComments, FaChartBar } from "react-icons/fa";

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

  const handleApprove = async (event: EventData) => {
    try {
      // Step 1: Add to approvedEvents collection with ALL fields
      await addDoc(collection(db, "approvedEvents"), {
        title: event.title ?? "Untitled Event",
        description: event.description ?? "No description",
        category: event.category ?? "Other",
        date: event.date ?? "Date not provided",
        time: event.time ?? "Time not provided",
        location: event.location ?? "Location not provided",
        organizer: event.organizer ?? "Anonymous",
        targetAudience: event.targetAudience ?? "All students",
        email: event.email ?? "",
        notes: event.notes ?? "",
        icon: event.icon ?? "Calendar",
        approvedAt: new Date(),
      });

      // Step 2: Delete from pendingEvents
      await deleteDoc(doc(db, "pendingEvents", event.id));

      // Step 3: Update local state
      setEvents(events.filter((e) => e.id !== event.id));
    } catch (error) {
      console.error("❌ Failed to approve event:", error);
      alert("Failed to approve event. Check console for details.");
    }
  };

  const handleDecline = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "pendingEvents", eventId));
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error("Error declining event:", error);
    }
  };

  const handleEditClick = (event: EventData) => {
    setEditingEvent(event);
    setEditForm({ ...event });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editingEvent) return;
    setIsSaving(true);
    try {
      const eventRef = doc(db, "pendingEvents", editingEvent.id);
      await updateDoc(eventRef, {
        ...editForm,
      });
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, ...editForm } as EventData : e))
      );
      setEditingEvent(null);
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      alert("Failed to update event. Check console for details.");
      console.error("Failed to update event:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingEvent(null);
  };

  const handleMarkFeedbackAsRead = async (feedbackId: string) => {
    try {
      await deleteDoc(doc(db, "feedback", feedbackId));
      setFeedback(feedback.filter(f => f.id !== feedbackId));
    } catch (error) {
      console.error("Error marking feedback as read:", error);
      alert("Failed to mark feedback as read. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <PageFade />
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 -z-10"></div>
        <div className="max-w-7xl mx-auto pt-20 h-full overflow-y-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Admin Dashboard
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
              Manage submitted events and user feedback
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Events</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{events.length}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <FaCalendarAlt className="text-red-600 dark:text-red-400 text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Feedback Received</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{feedback.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <FaComments className="text-blue-600 dark:text-blue-400 text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{events.length + feedback.length}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <FaChartBar className="text-green-600 dark:text-green-400 text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <FaCalendarAlt size={16} />
              Pending Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'feedback'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <FaComments size={16} />
              User Feedback ({feedback.length})
            </button>
          </div>

          {/* Content Sections */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {events.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Pending Events</h3>
                  <p className="text-gray-500 dark:text-gray-400">All events have been processed!</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    >
                      {/* Event Header */}
                      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 line-clamp-2">
                            {event.title || "Untitled Event"}
                          </h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Pending
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <FaUser className="text-gray-400" />
                          <span>{event.organizer || "Anonymous"}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span>{event.location || "Location not provided"}</span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-6 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {formatDate(event.date || "")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {event.time || "Time not provided"}
                            </span>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            {event.description}
                          </p>
                        )}

                        {event.targetAudience && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaUsers className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {event.targetAudience}
                            </span>
                          </div>
                        )}

                        {event.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300 truncate">
                              {event.email}
                            </span>
                          </div>
                        )}

                        {event.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <FaStickyNote className="text-gray-400 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300 line-clamp-2">
                              {event.notes}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="p-6 pt-0 space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(event)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow hover:from-emerald-500 hover:to-green-500 transition-all duration-200 hover:shadow-lg"
                          >
                            <FaCheck size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecline(event.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-2.5 rounded-xl shadow hover:from-pink-500 hover:to-red-500 transition-all duration-200 hover:shadow-lg"
                          >
                            <FaTimes size={14} />
                            Decline
                          </button>
                        </div>
                        <button
                          onClick={() => handleEditClick(event)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-2.5 rounded-xl shadow hover:from-orange-500 hover:to-yellow-500 transition-all duration-200 hover:shadow-lg"
                        >
                          <FaEdit size={14} />
                          Edit Event
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {feedback.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Feedback Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">User feedback will appear here</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {feedback.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <FaComments className="text-blue-600 dark:text-blue-400 text-xl" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">User Feedback</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.submittedAt?.toDate ? 
                                item.submittedAt.toDate().toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 
                                'Date not available'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
                          {item.feedback}
                        </p>
                        
                                                 {item.email && (
                           <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                             <FaEnvelope className="text-gray-400" />
                             <span>{item.email}</span>
                           </div>
                         )}
                         
                         <div className="pt-4">
                           <button
                             onClick={() => handleMarkFeedbackAsRead(item.id)}
                             className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow hover:from-emerald-500 hover:to-green-500 transition-all duration-200 hover:shadow-lg"
                           >
                             <FaCheck size={14} />
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
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Event</h2>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none transition-colors"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="Enter event title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={editForm.category || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="Enter category"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description || ""}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors resize-none"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Time</label>
                    <input
                      type="text"
                      name="time"
                      value={editForm.time || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="e.g., 2:00 PM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="Enter location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Organizer</label>
                    <input
                      type="text"
                      name="organizer"
                      value={editForm.organizer || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="Enter organizer name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Target Audience</label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={editForm.targetAudience || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="e.g., All students"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Contact Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="Enter contact email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Additional Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={editForm.notes || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors"
                    placeholder="Enter additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow hover:from-pink-500 hover:to-red-500 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                  onClick={handleEditSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold py-3 rounded-xl shadow hover:from-gray-500 hover:to-gray-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                  onClick={handleEditCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;
