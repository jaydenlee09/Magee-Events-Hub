import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users, PartyPopper, Trophy, BookOpen, Music, Palette, Pizza, GraduationCap, Building2 } from "lucide-react";
import { FaComments } from "react-icons/fa";
import { db } from "../firebase/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import PageFade from '../PageFade';

interface EventData {
  id: string;
  title: string;
  clubName?: string;
  date?: string;
  time?: string;
  location?: string;
  targetAudience?: string;
  description?: string;
  organizer?: string;
  category?: string;
  icon?: string;
}

const SkeletonCard = () => (
  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 animate-pulse">
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg sm:rounded-xl" />
      <div className="h-5 sm:h-6 w-32 sm:w-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
    </div>
    <div className="h-4 sm:h-5 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded mb-2 sm:mb-3" />
    <div className="h-3 sm:h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded mb-4 sm:mb-6" />
    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
      <div className="h-3 sm:h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
      <div className="h-3 sm:h-4 w-1/3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
      <div className="h-3 sm:h-4 w-1/4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
    </div>
    <div className="h-8 sm:h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg sm:rounded-xl" />
  </div>
);

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All Events");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "approvedEvents"));
        const approved = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as EventData[];
        setEvents(approved);
      } catch (error) {
        console.error("Error fetching approved events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "approvedEvents", eventId));
      setEvents(events => events.filter(e => e.id !== eventId));
    } catch (error) {
      alert("Failed to delete event. Check console for details.");
      console.error("Failed to delete event:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "TBD";
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const categories = ["All Events", "Academic", "Sports", "Cultural", "Social", "Spirit Day", "Club Event", "Other"];
  
  const filteredEvents = activeFilter === "All Events" 
    ? events 
    : events.filter(event => event.category === activeFilter);

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'academic':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 dark:from-red-900/40 dark:to-red-800/40 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'sports':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      case 'cultural':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900/40 dark:to-purple-800/40 dark:text-purple-200 border-purple-200 dark:border-purple-700';
      case 'social':
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'spirit day':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-800/40 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'club event':
        return 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 dark:from-pink-900/40 dark:to-pink-800/40 dark:text-pink-200 border-pink-200 dark:border-pink-700';
      case 'other':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 dark:from-gray-800/40 dark:to-gray-700/40 dark:text-gray-200 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 dark:from-gray-800/40 dark:to-gray-700/40 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };



  const iconMap: Record<string, React.ReactNode> = {
    Calendar: <Calendar />,
    PartyPopper: <PartyPopper />,
    Trophy: <Trophy />,
    BookOpen: <BookOpen />,
    Users: <Users />,
    Music: <Music />,
    Palette: <Palette />,
    Pizza: <Pizza />,
    GraduationCap: <GraduationCap />,
    Building2: <Building2 />,
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus(null);
    if (!feedback.trim()) {
      setFeedbackStatus("Please enter your feedback.");
      return;
    }
    try {
      await addDoc(collection(db, "feedback"), {
        feedback,
        email: feedbackEmail,
        submittedAt: new Date(),
      });
      setFeedback("");
      setFeedbackEmail("");
      setFeedbackStatus("Thank you for your feedback!");
    } catch (error) {
      setFeedbackStatus("Failed to send feedback. Please try again.");
    }
  };

  return (
    <>
      <PageFade />
      {/* Enhanced Modal Overlay */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md">
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-fadeIn border border-white/20 dark:border-gray-700/50">
            <button
              className="absolute top-6 right-6 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-300 dark:hover:bg-gray-600 text-3xl font-bold focus:outline-none transition-all duration-200 hover:scale-110 rounded-xl w-10 h-10 flex items-center justify-center"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close details modal"
            >
              ×
            </button>
            
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                                 <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                  {iconMap[selectedEvent.icon || "Calendar"] || <Calendar />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                  {selectedEvent.title}
                </h2>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getCategoryColor(selectedEvent.category)}`}>
                  {selectedEvent.category}
                </span>
              </div>
            </div>
            
            <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
              <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed whitespace-pre-line">
                {selectedEvent.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                             <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                 <Calendar className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedEvent.date)}</p>
                </div>
              </div>
                             <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                 <Clock className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatTime(selectedEvent.time)}</p>
                </div>
              </div>
                             <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                 <MapPin className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedEvent.location || "TBD"}</p>
                </div>
              </div>
                             <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                 <Users className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Audience</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedEvent.targetAudience || "All students"}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Organized by <span className="font-semibold text-gray-900 dark:text-white">{selectedEvent.organizer || "Unknown"}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md">
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-8 animate-fadeIn border border-white/20 dark:border-gray-700/50">
            <button
              className="absolute top-6 right-6 bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-3xl font-bold focus:outline-none transition-colors duration-200 hover:scale-110 rounded-xl w-10 h-10 flex items-center justify-center shadow-lg"
              onClick={() => { setShowFeedbackModal(false); setFeedbackStatus(null); }}
              aria-label="Close feedback modal"
            >
              ×
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                💬
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Send Feedback
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Help us improve by sharing your thoughts
              </p>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 hover:border-blue-300 focus:border-blue-500 resize-none font-sans bg-white dark:bg-gray-800"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={feedbackEmail}
                  onChange={e => setFeedbackEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 hover:border-blue-300 focus:border-blue-500 font-sans bg-white dark:bg-gray-800"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Send Feedback
              </button>
              
              {feedbackStatus && (
                <div className={`mt-4 p-4 rounded-xl text-center font-medium ${
                  feedbackStatus.startsWith('Thank') 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                }`}>
                  {feedbackStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Main Content */}
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 py-4 sm:py-6 relative overflow-hidden ${
        typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
          ? 'animate-fadeIn-dark'
          : 'animate-fadeIn'
      }`}>
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] bg-[length:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]"></div>
        </div>
        
        {/* Midnight Mist Glow - Dark Mode Only */}
        <div className="absolute inset-0 pointer-events-none dark:block hidden">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 140%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
                radial-gradient(circle at 50% 140%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
                radial-gradient(circle at 50% 140%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
              `,
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-8 sm:mb-12 pt-16 sm:pt-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
              Magee Events Hub
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
              Discover, join, and enjoy amazing events happening at Magee! 
            </p>
          </div>

          {/* Enhanced Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-10 justify-center px-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 ${
                  activeFilter === category
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-xl shadow-pink-500/30 scale-105'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Enhanced Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-16">
                <div className="max-w-md mx-auto px-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-4xl mb-4 sm:mb-6 mx-auto">
                    📅
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-100 mb-2 sm:mb-3">
                    No events found
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                    There are no approved events at the moment. Check back soon or submit a new event to get things started!
                  </p>
                </div>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-pink-200 dark:hover:border-pink-700 overflow-hidden"
                  key={event.id}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Event Header */}
                  <div className="relative flex justify-between items-start mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        {iconMap[event.icon || "Calendar"] || <Calendar />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 line-clamp-2">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    <span className={`flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border text-center ml-2 sm:ml-4 flex-shrink-0 ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="relative mb-4 sm:mb-6">
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="relative space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium">{formatTime(event.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium">{event.location || "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium">{event.targetAudience || "All students"}</span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="relative pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Organized by <span className="font-semibold text-gray-900 dark:text-white">{event.organizer || "Unknown"}</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="relative space-y-3">
                                         <button 
                       className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 group-hover:shadow-xl"
                       onClick={() => setSelectedEvent(event)}
                     >
                      View Details
                    </button>
                    
                    {isAdmin && (
                      <button
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold shadow transition-all duration-300 hover:from-gray-500 hover:to-gray-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        onClick={() => handleDelete(event.id)}
                      >
                        Delete Event
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Feedback Button */}
      <button
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-2xl px-6 py-4 font-semibold text-lg flex items-center gap-3 transition-all duration-300 transform hover:scale-110 hover:shadow-3xl hover:shadow-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-300 backdrop-blur-sm"
        onClick={() => setShowFeedbackModal(true)}
        aria-label="Send Feedback"
      >
        <FaComments size={24} />
        <span className="hidden sm:inline">Send Feedback</span>
      </button>
    </>
  );
};

export default EventsPage;