import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users, Eye, Trash2, User } from "lucide-react";
import { FaComments } from "react-icons/fa";
import { db } from "../firebase/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import PageFade from '../PageFade';
import AnimatedBackground from "../components/AnimatedBackground";
import SkeletonCard from "../components/SkeletonCard";
import type { EventData, ClubData, ViewType } from "../components/events/EventsPageTypes";
import { formatDate, formatTime, getCategoryColor, getCategoryColorGradient } from "../components/events/EventsPageUtils";
import { iconMap } from "../components/events/IconMap";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import FeedbackModal from "../components/FeedbackModal";
import ViewToggle from "../components/events/ViewToggle";
import FilterButtons from "../components/events/FilterButtons";
import EventModal from "../components/events/EventModal";
// import ClubModal from "../components/clubs/ClubModal"; // Uncomment when ClubModal is created
import addCustomStyles from "../utils/customStyles";
import { filterEvents } from "../components/events/CategoryUtils";

// Moved to separate component file

/**
 * Events & Clubs Page component
 */
const EventsPage: React.FC = () => {
  // View state
  const [activeView, setActiveView] = useState<ViewType>('events');
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [events, setEvents] = useState<EventData[]>([]);
  const [clubs, setClubs] = useState<ClubData[]>([]);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>("All Events");
  const [selectedClubFilter, setSelectedClubFilter] = useState<string | null>(null);
  
  // Selected item state
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedClub, setSelectedClub] = useState<ClubData | null>(null);
  
  // Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [minimizedClubNote, setMinimizedClubNote] = useState(true);
  
  // Feedback state moved to FeedbackModal.tsx
  
  // New club state
  const [newClub, setNewClub] = useState<Partial<ClubData>>({
    category: '',
    icon: 'Users'
  });
  
  // Admin state
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem("isAdmin") === "true";
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmButtonText, setConfirmButtonText] = useState('Delete');

  // Placeholder clubs data
  const placeholderClubs: ClubData[] = [
    {
      id: '1',
      name: 'Student Council',
      description: 'The voice of Magee students! We organize school events, advocate for student interests, and work to make Magee an amazing place for everyone.',
      category: 'Leadership',
      meetingDays: 'Every Tuesday',
      meetingTime: '3:15 PM',
      location: 'Room 201',
      sponsor: 'Ms. Johnson',
      icon: 'Users',
      members: 25,
      leaderEmail: 'student.council@learn.vsb.bc.ca'
    },
    {
      id: '2',
      name: 'Robotics Club',
      description: 'Design, build, and program robots! Join us to participate in competitions and learn about engineering, programming, and teamwork.',
      category: 'STEM',
      meetingDays: 'Monday & Wednesday',
      meetingTime: '3:30 PM',
      location: 'Tech Lab',
      sponsor: 'Mr. Smith',
      icon: 'BookOpen',
      members: 20,
      leaderEmail: 'robotics.club@learn.vsb.bc.ca'
    },
    {
      id: '3',
      name: 'Arts & Culture Club',
      description: 'Celebrate diversity through art! We explore different cultures through various art forms, music, dance, and food.',
      category: 'Arts',
      meetingDays: 'Every Friday',
      meetingTime: '3:15 PM',
      location: 'Art Room',
      sponsor: 'Mrs. Lee',
      icon: 'Palette',
      members: 30,
      leaderEmail: 'arts.culture@learn.vsb.bc.ca'
    },
    {
      id: '4',
      name: 'Environmental Club',
      description: 'Make a difference in our environment! We work on sustainability projects, recycling initiatives, and raising awareness about environmental issues.',
      category: 'Service',
      meetingDays: 'Thursday',
      meetingTime: '3:20 PM',
      location: 'Room 105',
      sponsor: 'Mr. Green',
      icon: 'Calendar',
      members: 15,
      leaderEmail: 'environmental.club@learn.vsb.bc.ca'
    },
    {
      id: '5',
      name: 'Chess Club',
      description: 'Develop strategic thinking and have fun! All skill levels welcome. We participate in tournaments and offer beginner lessons.',
      category: 'Games',
      meetingDays: 'Tuesday & Thursday',
      meetingTime: '3:30 PM',
      location: 'Library',
      sponsor: 'Dr. White',
      icon: 'Trophy',
      members: 18,
      leaderEmail: 'chess.club@learn.vsb.bc.ca'
    },
    {
      id: '6',
      name: 'Music Appreciation',
      description: 'Share your love for music! We explore different genres, learn about music history, and sometimes have jam sessions.',
      category: 'Arts',
      meetingDays: 'Wednesday',
      meetingTime: '3:15 PM',
      location: 'Music Room',
      sponsor: 'Ms. Melody',
      icon: 'Music',
      members: 22,
      leaderEmail: 'music.club@learn.vsb.bc.ca'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, "approvedEvents"));
        const approved = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as EventData[];
        setEvents(approved);
        
        // Fetch clubs from Firebase
        const clubsSnapshot = await getDocs(collection(db, "clubs"));
        const existingClubs = clubsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ClubData[];
        
        // If Firebase clubs collection is empty, initialize it with placeholder clubs
        if (existingClubs.length === 0) {
          const addedClubs: ClubData[] = [];
          
          for (const club of placeholderClubs) {
            // Remove the hardcoded ID before adding to Firestore
            const { id, ...clubWithoutId } = club;
            
            // Add to Firestore and get the new ID
            const docRef = await addDoc(collection(db, "clubs"), clubWithoutId);
            
            // Add to local array with Firestore ID
            addedClubs.push({ ...clubWithoutId, id: docRef.id } as ClubData);
          }
          
          setClubs(addedClubs);
        } else {
          // Use existing clubs from Firebase
          setClubs(existingClubs);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (eventId: string) => {
    const deleteAction = async () => {
      try {
        await deleteDoc(doc(db, "approvedEvents", eventId));
        setEvents(events => events.filter(e => e.id !== eventId));
      } catch (error) {
        alert("Failed to delete event. Check console for details.");
        console.error("Failed to delete event:", error);
      }
    };
    
    // Show the custom confirmation modal
    showCustomConfirmation(
      'Delete Event', 
      'Are you sure you want to delete this event? This action cannot be undone.',
      deleteAction,
      'Delete Forever'
    );
  };

  // Function to show custom confirmation modal
  const showCustomConfirmation = (
    title: string, 
    message: string, 
    action: () => Promise<void>,
    buttonText: string = 'Delete'
  ) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmButtonText(buttonText);
    setShowConfirmModal(true);
  };

  // Category related functions moved to CategoryUtils.tsx
  
  const filteredEvents = filterEvents(events, activeFilter, selectedClubFilter);

  // Category styling utility functions moved to EventsPageUtils.ts



  // Icon mapping moved to IconMap.tsx

  const handleDeleteClub = async (clubId: string) => {
    const deleteClubAction = async () => {
      try {
        // Delete from Firebase
        await deleteDoc(doc(db, "clubs", clubId));
        
        // Remove the club from state
        setClubs(prevClubs => prevClubs.filter(club => club.id !== clubId));
      } catch (error) {
        alert("Failed to delete club. Please try again.");
        console.error("Failed to delete club:", error);
      }
    };
    
    // Show the custom confirmation modal
    showCustomConfirmation(
      'Delete Club', 
      'Are you sure you want to delete this club? This action cannot be undone.',
      deleteClubAction,
      'Delete Forever'
    );
  };

  // Function to reset all clubs in Firestore (for admin use only to fix duplicates)
  const resetClubs = async () => {
    if (!isAdmin) return;
    
    if (!window.confirm("This will delete ALL clubs and re-add the default ones. Are you sure?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete all existing clubs
      const clubsSnapshot = await getDocs(collection(db, "clubs"));
      const deletePromises = clubsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // Add placeholder clubs without their hardcoded IDs
      const addedClubs: ClubData[] = [];
      
      for (const club of placeholderClubs) {
        // Remove the hardcoded ID before adding to Firestore
        const { id, ...clubWithoutId } = club;
        
        // Add to Firestore and get the new ID
        const docRef = await addDoc(collection(db, "clubs"), clubWithoutId);
        
        // Add to local array with Firestore ID
        addedClubs.push({ ...clubWithoutId, id: docRef.id } as ClubData);
      }
      
      setClubs(addedClubs);
      alert("Clubs have been reset successfully.");
    } catch (error) {
      console.error("Error resetting clubs:", error);
      alert("Failed to reset clubs. See console for details.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddClub = async () => {
    // Validate required fields
    if (!newClub.name || !newClub.description || !newClub.category) {
      alert("Please fill out all required fields: Name, Description, and Category");
      return;
    }

    // Check if a club with the same name already exists
    const clubExists = clubs.some(club => 
      club.name.toLowerCase() === newClub.name?.toLowerCase()
    );

    if (clubExists) {
      alert("A club with this name already exists. Please use a different name.");
      return;
    }

    try {
      // Create new club object with default values for any missing fields
      const clubToAdd: Omit<ClubData, 'id'> = {
        name: newClub.name,
        description: newClub.description,
        category: newClub.category,
        meetingDays: newClub.meetingDays || 'TBD',
        meetingTime: newClub.meetingTime || 'TBD',
        location: newClub.location || 'TBD',
        sponsor: newClub.sponsor || 'TBD',
        icon: newClub.icon || 'Users',
        members: newClub.members || 0,
        leaderEmail: newClub.leaderEmail || '',
      };

      // Add to Firebase
      const docRef = await addDoc(collection(db, "clubs"), clubToAdd);
      
      // Add to clubs array with Firebase ID
      const newClubWithId = { ...clubToAdd, id: docRef.id };
      setClubs(prevClubs => [...prevClubs, newClubWithId as ClubData]);
      
      // Reset form and close modal
      setNewClub({
        category: '',
        icon: 'Users'
      });
      setShowAddClubModal(false);
      
      // Show success message
      alert("Club added successfully!");
    } catch (error) {
      alert("Failed to add club. Please try again.");
      console.error("Failed to add club:", error);
    }
  };

  // Feedback submission logic moved to FeedbackModal.tsx

  return (
    <>
      <PageFade />
      <AnimatedBackground />
      {/* Club Details Modal */}
      {selectedClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-xl p-4">
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full mx-auto animate-fadeIn border border-white/20 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-300 dark:hover:bg-gray-600 text-2xl sm:text-3xl font-bold focus:outline-none transition-all duration-200 hover:scale-110 rounded-xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
              onClick={() => setSelectedClub(null)}
            >
              ×
            </button>

            <div className="p-6 sm:p-8">
              {/* Club Header */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  {iconMap[selectedClub.icon || "Users"] || <Users className="w-8 h-8 sm:w-10 sm:h-10" />}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedClub.name}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                    {selectedClub.category}
                  </span>
                </div>
              </div>

              {/* Club Description */}
              <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
                <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
                  {selectedClub.description}
                </p>
              </div>

              {/* Meeting Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {selectedClub.meetingDays && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Calendar className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Meeting Days</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedClub.meetingDays}</p>
                    </div>
                  </div>
                )}
                {selectedClub.meetingTime && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Clock className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Meeting Time</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedClub.meetingTime}</p>
                    </div>
                  </div>
                )}
                {selectedClub.location && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <MapPin className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedClub.location}</p>
                    </div>
                  </div>
                )}
                {selectedClub.members !== undefined && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Users className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Members</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedClub.members} members</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sponsor Info and Contact Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                {/* Sponsor Info */}
                {selectedClub.sponsor && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sponsored by <span className="font-semibold text-gray-900 dark:text-white">{selectedClub.sponsor}</span>
                  </p>
                )}

                {/* Contact Leaders Section */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Contact Club Leaders</p>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <a href={`mailto:${selectedClub.leaderEmail || 'club.leader@learn.vsb.bc.ca'}`} className="text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors flex-1 truncate">
                      {selectedClub.leaderEmail || 'club.leader@learn.vsb.bc.ca'}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClub.leaderEmail || 'club.leader@learn.vsb.bc.ca');
                        const button = document.getElementById('clubEmailCopyButton');
                        if (button) {
                          button.classList.add('copied');
                          setTimeout(() => button.classList.remove('copied'), 2000);
                        }
                      }}
                      id="clubEmailCopyButton"
                      className="group relative ml-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-red-200 dark:hover:border-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-opacity duration-200 group-[.copied]:opacity-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute opacity-0 transition-opacity duration-200 text-green-500 dark:text-green-400 group-[.copied]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity duration-200 group-[.copied]:opacity-100 whitespace-nowrap">
                        Copied!
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal - Now using extracted component */}
      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />

      {/* Modern Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />

      {/* Enhanced Main Content - Better mobile padding */}
      <div className={`min-h-screen bg-transparent px-1 xs:px-2 sm:px-3 md:px-6 pt-16 xs:pt-20 sm:pt-16 md:pt-16 pb-2 xs:py-3 sm:py-4 md:py-6 relative overflow-hidden z-10 ${
        typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
          ? 'animate-fadeIn-dark'
          : 'animate-fadeIn'
      }`}>
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] bg-[length:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]"></div>
        </div>
        
        {/* Red Glow Effect - Dark Mode Only */}
        <div className="absolute inset-0 pointer-events-none dark:block hidden">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 140%, rgba(110, 70, 70, 0.5) 0%, transparent 60%),
                radial-gradient(circle at 50% 140%, rgba(241, 99, 99, 0.4) 0%, transparent 70%),
                radial-gradient(circle at 50% 140%, rgba(208, 181, 181, 0.3) 0%, transparent 80%)
              `,
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header - Mobile optimized */}
          <div className="text-center mb-3 xs:mb-4 sm:mb-6 md:mb-8 pt-0 xs:pt-2 sm:pt-4 md:pt-8">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 md:mb-3 tracking-tight">
              Magee Events Hub
            </h1>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-1 xs:px-2 sm:px-4">
              Discover, join, and enjoy amazing events happening at Magee! 
            </p>
          </div>

          {/* View Toggle Component */}
          <ViewToggle activeView={activeView} onViewChange={setActiveView} />

          {/* Admin Add Club Button - Only shown when in clubs view and user is admin */}
          {activeView === 'clubs' && isAdmin && (
            <div className="flex justify-center gap-4 my-6">
              <button 
                onClick={() => setShowAddClubModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Club
              </button>
              
              {/* Reset Clubs button - for fixing duplicates */}
              <button 
                onClick={resetClubs}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                title="Use this to fix duplicate clubs issue"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset Clubs
              </button>
            </div>
          )}

          {/* Filter Buttons Component - Only show for events view */}
          {activeView === 'events' && (
            <FilterButtons 
              activeFilter={activeFilter} 
              selectedClubFilter={selectedClubFilter}
              setActiveFilter={setActiveFilter}
              setSelectedClubFilter={setSelectedClubFilter}
            />
          )}
          {activeView === 'clubs' && (
            <div className="max-w-4xl mx-auto mb-12 relative group">
              <div className="relative overflow-hidden backdrop-blur-sm transition-all duration-500 rounded-3xl bg-gradient-to-r from-white/90 via-gray-50/90 to-white/90 dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-800/90 shadow-lg border border-red-200/30 dark:border-red-700/20 hover:shadow-xl hover:border-red-200/50 dark:hover:border-red-700/30">
                {/* Subtle decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500/10 via-pink-500/5 to-purple-500/5 blur-3xl transform rotate-12 group-hover:rotate-[30deg] transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/5 via-cyan-500/5 to-red-500/5 blur-3xl transform -rotate-12 group-hover:-rotate-[30deg] transition-transform duration-700"></div>
                
                {/* Main content with padding */}
                <div className="relative p-6 md:p-8">
                  {/* Icon and heading - improved for mobile */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-500 dark:text-red-400 shadow-sm transform transition-transform duration-500 group-hover:scale-110">
                        <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                            Don't see your club?
                          </h3>
                          {/* Compact email link when minimized */}
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${minimizedClubNote ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                            <a href="mailto:1236885@learn.vsb.bc.ca" className="text-sm text-red-500 dark:text-red-400 font-medium hover:text-red-600 dark:hover:text-red-300 transition-colors whitespace-nowrap">
                              Contact us
                            </a>
                          </div>
                        </div>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${minimizedClubNote ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100 mt-2'}`}>
                          <p className="text-base text-gray-600 dark:text-gray-300">
                            Help us make the Magee Events Hub more complete!
                          </p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMinimizedClubNote(prev => !prev)}
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label={minimizedClubNote ? "Expand note" : "Minimize note"}
                    >
                      {minimizedClubNote ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Message - Only show if not minimized */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${minimizedClubNote ? 'max-h-0 opacity-0 mb-0' : 'max-h-96 opacity-100 mt-6'}`}>
                    <div className="relative p-4 bg-gray-50/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/70 dark:border-gray-700/50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100/80 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Club leaders, we want to ensure all Magee clubs are represented accurately. If your club isn't listed or needs updates, please reach out using the contact information below.
                        </p>
                      </div>
                    </div>
                  
                    {/* Email contact with copy button - Only visible when expanded */}
                    <div className="flex items-center gap-3 p-4 mt-3 bg-gray-50/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/70 dark:border-gray-700/50">
                      <div className="w-8 h-8 bg-red-100/80 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <a href="mailto:1236885@learn.vsb.bc.ca" className="text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors">
                        1236885@learn.vsb.bc.ca
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('1236885@learn.vsb.bc.ca');
                          const button = document.getElementById('copyButton');
                          if (button) {
                            button.classList.add('copied');
                            setTimeout(() => button.classList.remove('copied'), 2000);
                          }
                        }}
                        id="copyButton"
                        className="group relative ml-auto w-9 h-9 bg-white dark:bg-gray-700 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200/70 dark:border-gray-700/70"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-opacity duration-200 group-[.copied]:opacity-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute opacity-0 transition-opacity duration-200 text-green-500 dark:text-green-400 group-[.copied]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity duration-200 group-[.copied]:opacity-100">
                          Copied!
                        </span>
                      </button>
                    </div>
                    <style>
                      {`
                        @keyframes checkmark {
                          0% { transform: scale(0.8); }
                          50% { transform: scale(1.2); }
                          100% { transform: scale(1); }
                        }
                        #copyButton.copied svg {
                          animation: checkmark 0.4s ease-in-out forwards;
                        }
                      `}
                    </style>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Content Grid with enhanced spacing and mobile improvements */}
          {activeView === 'events' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-2 xs:px-3 sm:px-4 md:px-5">
              {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-12 md:py-20">
                <div className="max-w-md mx-auto px-3 sm:px-4">
                  <div className="relative">
                    {/* Improved gradient glow effect */}
                    <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-pink-500/30 to-transparent dark:from-red-400/50 dark:via-pink-400/40 dark:to-transparent rounded-full blur-3xl scale-125 transform animate-pulse-slow"></div>
                    
                    {/* Animated calendar illustration */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 mx-auto mb-6 sm:mb-8 md:mb-10 animate-float">
                      {/* Outer glow */}
                      <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/30 blur-lg opacity-70"></div>
                      
                      {/* Calendar background */}
                      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 dark:border-gray-700 w-full h-full flex flex-col">
                        {/* Calendar header */}
                        <div className="bg-red-500 dark:bg-red-600 h-1/4 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 absolute top-2 right-2 rounded-full bg-white/70 dark:bg-white/50 shadow-inner"></div>
                          <div className="w-1.5 h-1.5 absolute top-2 left-2 rounded-full bg-white/70 dark:bg-white/50 shadow-inner"></div>
                        </div>
                        
                        {/* Calendar body */}
                        <div className="flex-1 p-2.5 flex flex-col justify-center items-center">
                          <div className="w-full h-1/2 flex justify-center items-center">
                            <div className="w-1/2 h-full flex justify-center items-center border-2 border-red-500 dark:border-red-400 rounded-md">
                            </div>
                          </div>
                          
                          {/* Calendar grid dots */}
                          <div className="grid grid-cols-3 gap-1 mt-2 w-3/4">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-5 relative">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500">
                      No events found
                    </span>
                  </h2>
                  
                  <div className="max-w-md mx-auto">
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-6">
                      There are no approved events at the moment. Check back soon or submit a new event!
                    </p>
                    
                    <div className="flex justify-center">
                      <a 
                        href="/submit" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Submit an Event
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  className="group relative bg-gradient-to-br from-white/90 via-white/90 to-gray-50/90 dark:from-gray-800/90 dark:via-gray-800/90 dark:to-gray-900/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/80 dark:border-gray-700/80 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-red-300/50 dark:hover:border-red-700/50"
                  key={event.id}
                >
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/10 via-pink-500/10 to-orange-500/10 blur-3xl transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-red-500/5 blur-3xl transform -rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Glass effect top accent bar */}
                  <div className={`h-2 w-full absolute top-0 left-0 ${getCategoryColorGradient(event.category)}`}></div>
                  
                  <div className="p-4 xs:p-5 sm:p-6 md:p-7 relative z-10">
                    {/* Event Header with Category Badge - improved for mobile */}
                    <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-5">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0">
                          {iconMap[event.icon || "Calendar"] || <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wide ${getCategoryColor(event.category)}`}>
                              {event.category}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300 line-clamp-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-red-600">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Description with improved styling and mobile optimization */}
                    <div className="relative mb-3 sm:mb-5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl p-2 sm:p-3.5 border border-gray-100/80 dark:border-gray-700/80">
                      <p className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Details in an organized grid - improved for mobile */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-3 mb-3 sm:mb-6">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1.5 sm:p-2.5 rounded-xl border border-gray-100/80 dark:border-gray-700/80">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-200 truncate">{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1.5 sm:p-2.5 rounded-xl border border-gray-100/80 dark:border-gray-700/80">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-200 truncate">{formatTime(event.time)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1.5 sm:p-2.5 rounded-xl border border-gray-100/80 dark:border-gray-700/80">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-200 truncate">{event.location || "TBD"}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1.5 sm:p-2.5 rounded-xl border border-gray-100/80 dark:border-gray-700/80">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-200 truncate">{event.targetAudience || "All students"}</span>
                      </div>
                    </div>

                    {/* Organizer with styling similar to old version but with icon - optimized for mobile */}
                    <div className="pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 mb-3 sm:mb-5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Organized by <span className="font-semibold text-gray-900 dark:text-white">{event.organizer || "Unknown"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons with improved styling - mobile optimized */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button 
                        className="flex-1 py-2.5 sm:py-3.5 px-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm sm:text-base font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center gap-1.5 sm:gap-2"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        View Details
                      </button>
                      
                      {isAdmin && (
                        <button
                          className="flex-1 py-2.5 sm:py-3.5 px-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm sm:text-base font-semibold shadow transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center justify-center gap-1.5 sm:gap-2"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-2 xs:px-3 sm:px-4 md:px-5">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : clubs.length === 0 ? (
                <div className="col-span-full text-center py-8 sm:py-16">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                      <Users className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      No clubs found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      There are no clubs listed at the moment. Check back soon!
                    </p>
                  </div>
                </div>
              ) : (
                clubs.map((club) => (
                  <div 
                    key={club.id}
                    className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-red-200 dark:hover:border-red-700 flex flex-col"
                  >
                    {/* Soft gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 via-white/95 to-gray-50/90 dark:from-gray-800/90 dark:via-gray-800/95 dark:to-gray-800/90 opacity-100 group-hover:opacity-90 transition-opacity duration-500"></div>
                    
                    {/* Decorative shapes and accents */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/5 via-pink-500/5 to-purple-500/5 blur-3xl transform rotate-12 group-hover:rotate-[30deg] transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 via-cyan-500/5 to-teal-500/5 blur-3xl transform -rotate-12 group-hover:-rotate-[30deg] transition-transform duration-700"></div>
                    
                    {/* Top Image */}
                    <div className="relative h-44 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60 z-10"></div>
                      <img
                        src={`https://source.unsplash.com/800x400/?${club.category.toLowerCase()},${club.name.toLowerCase().replace(/\s+/g, '')}`}
                        alt={club.name}
                        className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 filter brightness-95"
                      />
                      <div className="absolute top-4 left-4">
                        <img 
                          src={`https://source.unsplash.com/100x100/?icon,${club.category.toLowerCase()}`} 
                          alt={`${club.name} icon`}
                          className="w-8 h-8 rounded-lg object-cover opacity-0"
                        />
                      </div>
                    </div>
                    
                    {/* Club Icon - Styled similar to the screenshot */}
                    <div className="relative z-20 -mt-8 ml-5">
                      <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg relative overflow-hidden">
                        {/* Dynamic gradient based on category */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600"></div>
                        <div className="relative z-10">
                          {iconMap[club.icon || "Users"] || <Users className="w-8 h-8" />}
                        </div>
                      </div>
                    </div>

                    {/* Content - Mobile optimized padding */}
                    <div className="p-4 xs:p-5 sm:p-6 relative z-10 flex-grow">
                      {/* Title and Tag */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                          {club.name}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50">
                          {club.category}
                        </span>
                      </div>
                      
                      {/* Member count */}
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-3">
                        <Users className="w-4 h-4" />
                        <span>{club.members} members</span>
                      </div>
                      
                      {/* Meeting Schedule - Improved for mobile */}
                      <div className="flex flex-col xs:flex-row xs:items-center flex-wrap mb-3 sm:mb-4 gap-2 xs:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                          <span>{club.meetingDays || "Every Tuesday"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                          <span>{club.meetingTime || "3:15 PM"}</span>
                        </div>
                      </div>
                      
                      {/* Description with better line clamping and backdrop blur - mobile optimized */}
                      <div className="relative mb-4 sm:mb-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 border border-gray-100/80 dark:border-gray-700/80">
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {club.description}
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 bg-gradient-to-t from-white/90 dark:from-gray-900/90 to-transparent"></div>
                      </div>

                      {/* Location Tag with Icon - Improved for mobile */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          <MapPin className="w-3 h-3 mr-1 text-red-500" />
                          {club.location || "Room 201"}
                        </div>
                        
                        {/* Category Tags - Mobile optimized */}
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium text-white bg-red-500">
                          {club.category === "STEM" ? "STEM" : 
                           club.category === "Leadership" ? "LEADERSHIP" : 
                           club.category === "Arts" ? "ARTS" : club.category}
                        </div>
                        
                        {/* Tech Lab Tag - Only for relevant clubs */}
                        {(club.category === "STEM" || club.name.includes("Tech") || club.name.includes("Robotics")) && (
                          <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Tech Lab
                          </div>
                        )}
                        
                        {/* Arts Room Tag */}
                        {(club.category === "Arts" || club.name.includes("Art")) && (
                          <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            Art Room
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons - Restyled to match screenshot - mobile optimized */}
                      <div className="flex gap-2 sm:gap-3 mt-auto">
                        <button
                          className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center"
                          onClick={() => setSelectedClub(club)}
                        >
                          <span>Club Details</span>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        <button
                          className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center"
                          onClick={() => {
                            setActiveView('events');
                            setSelectedClubFilter(club.name);
                            setActiveFilter('All Events');
                          }}
                        >
                          <span>View Events</span>
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" />
                        </button>
                      </div>
                      
                      {/* Admin Delete Button - Only shown to admins */}
                      {isAdmin && (
                        <div className="absolute top-4 right-4 z-20">
                          <button
                            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClub(club.id);
                            }}
                            aria-label="Delete club"
                            title="Delete club"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Club Modal */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-xl p-4">
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border border-white/20 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto p-6">
            <button
              className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-300 dark:hover:bg-gray-600 text-2xl font-bold rounded-xl w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110"
              onClick={() => setShowAddClubModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add New Club</h2>
              <p className="text-gray-600 dark:text-gray-300">Fill out the details for the new club</p>
            </div>

            <div className="space-y-4">
              {/* Club Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name*</label>
                <input
                  type="text"
                  value={newClub.name || ''}
                  onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter club name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description*</label>
                <textarea
                  value={newClub.description || ''}
                  onChange={(e) => setNewClub({...newClub, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter club description"
                  rows={4}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category*</label>
                <select
                  value={newClub.category || ''}
                  onChange={(e) => setNewClub({...newClub, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Academic">Academic</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                  <option value="Service">Service</option>
                  <option value="Games">Games</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Two columns layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Meeting Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Days</label>
                  <input
                    type="text"
                    value={newClub.meetingDays || ''}
                    onChange={(e) => setNewClub({...newClub, meetingDays: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g. Every Tuesday"
                  />
                </div>

                {/* Meeting Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Time</label>
                  <input
                    type="text"
                    value={newClub.meetingTime || ''}
                    onChange={(e) => setNewClub({...newClub, meetingTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g. 3:30 PM"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newClub.location || ''}
                    onChange={(e) => setNewClub({...newClub, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g. Room 203"
                  />
                </div>

                {/* Sponsor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sponsor</label>
                  <input
                    type="text"
                    value={newClub.sponsor || ''}
                    onChange={(e) => setNewClub({...newClub, sponsor: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g. Mr. Smith"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                  <select
                    value={newClub.icon || 'Users'}
                    onChange={(e) => setNewClub({...newClub, icon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Users">Users</option>
                    <option value="BookOpen">Book</option>
                    <option value="Trophy">Trophy</option>
                    <option value="Music">Music</option>
                    <option value="Palette">Palette</option>
                    <option value="Calendar">Calendar</option>
                    <option value="Building2">Building</option>
                  </select>
                </div>

                {/* Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Members</label>
                  <input
                    type="number"
                    min="0"
                    value={newClub.members || ''}
                    onChange={(e) => setNewClub({...newClub, members: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g. 25"
                  />
                </div>
              </div>

              {/* Leader Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leader Email</label>
                <input
                  type="email"
                  value={newClub.leaderEmail || ''}
                  onChange={(e) => setNewClub({...newClub, leaderEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g. club.leader@learn.vsb.bc.ca"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowAddClubModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all hover:from-red-600 hover:to-red-700"
                  onClick={handleAddClub}
                >
                  Add Club
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern Floating Feedback Button - Increased size */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 z-40 group animate-float scale-110"
        onClick={() => setShowFeedbackModal(true)}
        aria-label="Send Feedback"
      >
        <div className="relative">
          {/* Outer glow effect - enlarged */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 group-hover:blur-xl animate-gentle-pulse"></div>
          
          {/* Animated border with shimmer - enlarged */}
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-90 group-hover:opacity-100 
                         shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300 animate-shimmer"></div>
          
          {/* Button Content with wave effect - Larger size with increased padding */}
          <div className="relative flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 text-white overflow-hidden">
            {/* Background shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
            
            {/* Message Icon with Animation - larger size */}
            <div className="relative flex-shrink-0">
              <FaComments size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[5deg]" />
            </div>
            
            {/* Text with slide animation - larger font */}
            <div className="overflow-hidden">
              <span className="hidden sm:block whitespace-nowrap sm:text-sm md:text-base font-medium transform transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/90">
                Send Feedback
              </span>
            </div>
            
            {/* Mobile text (only shows on small screens) - larger font */}
            <span className="sm:hidden text-sm font-medium">Feedback</span>
          </div>
        </div>
      </button>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        onConfirm={async () => {
          setShowConfirmModal(false);
          await confirmAction();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

// Add custom styles
addCustomStyles();

export default EventsPage;