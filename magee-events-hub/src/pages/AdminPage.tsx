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
// Removed: import "./AdminPage.css";

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
  icon?: string; // <-- add icon field
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
    const approvedRef = await addDoc(collection(db, "approvedEvents"), {
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
      icon: event.icon ?? "Calendar", // <-- pass icon field
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

  return (
    <>
      <PageFade />
      <div className={
        `min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ` +
        (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
          ? 'animate-fadeIn-dark'
          : 'animate-fadeIn')
      }>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-red-700 mb-10 drop-shadow-lg">Submitted Events</h1>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-300 text-lg font-medium py-10 bg-white dark:bg-gray-800/80 rounded-xl shadow">
                <p>No events submitted yet.</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-200"
                  key={event.id}
                >
                  <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-1 truncate">{event.title || "Untitled Event"}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-2"><span className="font-semibold text-gray-700 dark:text-gray-200">Category:</span> {event.category || "N/A"}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <p><span className="font-semibold text-gray-700 dark:text-gray-200">Date:</span> {event.date || "Not provided"}</p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-200">Time:</span> {event.time || "Not provided"}</p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-200">Location:</span> {event.location || "Not provided"}</p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 text-sm mt-2"><span className="font-semibold">Description:</span> {event.description || "No description"}</p>
                  <p className="text-gray-700 dark:text-gray-200 text-sm"><span className="font-semibold">Organizer:</span> {event.organizer || "Unknown"}</p>
                  <p className="text-gray-700 dark:text-gray-200 text-sm"><span className="font-semibold">Target Audience:</span> {event.targetAudience || "All students"}</p>
                  {event.email && <p className="text-gray-700 dark:text-gray-200 text-sm"><span className="font-semibold">Contact Email:</span> {event.email}</p>}
                  {event.notes && <p className="text-gray-700 dark:text-gray-200 text-sm"><span className="font-semibold">Notes:</span> {event.notes}</p>}

                  <div className="flex gap-3 mt-4">
                    <button
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-2 rounded-lg shadow hover:from-pink-500 hover:to-red-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => handleApprove(event)}
                    >
                      Approve
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold py-2 rounded-lg shadow hover:from-gray-500 hover:to-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      onClick={() => handleDecline(event.id)}
                    >
                      Decline
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold py-2 rounded-lg shadow hover:from-yellow-500 hover:to-yellow-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      onClick={() => handleEditClick(event)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Feedback Section */}
      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-700 mb-10 drop-shadow-lg">User Feedback</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {feedback.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-300 text-lg font-medium py-10 bg-white dark:bg-gray-800/80 rounded-xl shadow">
              <p>No feedback received yet.</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-200"
                key={item.id}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💬</span>
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">Feedback</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                  {item.feedback}
                </p>
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                  {item.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-semibold">From:</span> {item.email}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
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
            ))
          )}
        </div>
      </div>
      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-4">Edit Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editForm.category || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    name="time"
                    value={editForm.time || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Organizer</label>
                  <input
                    type="text"
                    name="organizer"
                    value={editForm.organizer || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={editForm.targetAudience || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={editForm.notes || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border-2 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-2 rounded-lg shadow hover:from-pink-500 hover:to-red-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={handleEditSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold py-2 rounded-lg shadow hover:from-gray-500 hover:to-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={handleEditCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={handleEditCancel}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;
