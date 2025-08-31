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
import AnimatedBackground from "../components/AnimatedBackground";
import { FaCalendarAlt, FaUser, FaMapMarkerAlt, FaEnvelope, FaUsers, FaCheck, FaTimes, FaEdit, FaComments, FaChartBar, FaLock, FaBell, FaSearch, FaEllipsisH, FaTachometerAlt, FaRegCalendarCheck, FaFilter, FaSortAmountDown, FaSortAmountUp, FaDownload, FaEye, FaRegClock, FaCog, FaSignOutAlt, FaArchive, FaTrash, FaExclamationTriangle } from "react-icons/fa";

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
  archivedAt?: any;
  expiresAt?: any;
}

interface FeedbackData {
  id: string;
  feedback: string;
  email?: string;
  submittedAt: any;
  archivedAt?: any;
  expiresAt?: any;
}

const AdminPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<EventData | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [feedbackSortOrder, setFeedbackSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [archivedEvents, setArchivedEvents] = useState<EventData[]>([]);
  const [archivedFeedback, setArchivedFeedback] = useState<FeedbackData[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'feedback' | 'archived'>('events');
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmButtonText, setConfirmButtonText] = useState('Confirm');

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    pendingEventsCount: 0,
    approvedEventsCount: 0,
    declinedEventsCount: 0,
    feedbackCount: 0,
    categoryCounts: {} as Record<string, number>,
    monthlyEventCounts: {} as Record<string, number>,
    recentActivity: [] as {action: string, timestamp: Date, item: string}[]
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending events
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
        
        // Fetch archived events
        const archivedEventsSnapshot = await getDocs(collection(db, "archivedEvents"));
        console.log("Initial fetch - archived events count:", archivedEventsSnapshot.docs.length);
        
        const fetchedArchivedEvents = archivedEventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled Event",
            description: data.description,
            category: data.category,
            date: data.date,
            time: data.time,
            timePeriod: data.timePeriod,
            location: data.location,
            organizer: data.organizer,
            targetAudience: data.targetAudience,
            email: data.email,
            notes: data.notes,
            icon: data.icon,
            archivedAt: data.archivedAt || new Date(),
            expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };
        }) as EventData[];
        
        console.log("Initial fetch - processed archived events:", fetchedArchivedEvents);
        setArchivedEvents(fetchedArchivedEvents);
        
        // Fetch archived feedback
        const archivedFeedbackSnapshot = await getDocs(collection(db, "archivedFeedback"));
        console.log("Initial fetch - archived feedback count:", archivedFeedbackSnapshot.docs.length);
        
        const fetchedArchivedFeedback = archivedFeedbackSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            feedback: data.feedback || "",
            email: data.email,
            submittedAt: data.submittedAt,
            archivedAt: data.archivedAt || new Date(),
            expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };
        }) as FeedbackData[];
        
        console.log("Initial fetch - processed archived feedback:", fetchedArchivedFeedback);
        setArchivedFeedback(fetchedArchivedFeedback);
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
  
  // Show custom confirmation modal
  const showCustomConfirmation = (
    title: string, 
    message: string, 
    action: () => Promise<void>,
    buttonText: string = 'Confirm'
  ) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmButtonText(buttonText);
    setShowConfirmModal(true);
  };

  const handleDecline = async (id: string) => {
    console.log("Declining event with ID:", id);
    
    const declineAction = async () => {
      try {
        // Get the event item
        const eventToArchive = events.find(item => item.id === id);
        console.log("Event to archive:", eventToArchive);
        if (!eventToArchive) return;
        
        // Create a new object without the id field
        const { id: originalId, ...eventWithoutId } = eventToArchive;
        
        // Add to archived events
        const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await addDoc(collection(db, "archivedEvents"), {
          ...eventWithoutId,
          archivedAt: new Date(),
          expiresAt: oneWeekFromNow,
          status: "declined",
          originalId: originalId // Store the original ID as a reference if needed
        });
        
        // Delete from events collection
        await deleteDoc(doc(db, "pendingEvents", id));
        
        // Update UI with functional state update
        setEvents(currentEvents => currentEvents.filter(event => event.id !== id));
        
        // Fetch all archived events to update the UI
        const archivedSnapshot = await getDocs(collection(db, "archivedEvents"));
        console.log("Archived events docs count:", archivedSnapshot.docs.length);
        
        const fetchedArchived = archivedSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Archived event doc data:", data);
          return {
            id: doc.id,
            title: data.title || "Untitled Event",
            description: data.description,
            category: data.category,
            date: data.date,
            time: data.time,
            timePeriod: data.timePeriod,
            location: data.location,
            organizer: data.organizer,
            targetAudience: data.targetAudience,
            email: data.email,
            notes: data.notes,
            icon: data.icon,
            archivedAt: data.archivedAt,
            expiresAt: data.expiresAt,
            status: data.status
          };
        }) as EventData[];
        
        console.log("Processed archived events:", fetchedArchived);
        
        // Update archived events
        setArchivedEvents(fetchedArchived);
      } catch (error) {
        console.error("Error declining event:", error);
      }
    };
    
    showCustomConfirmation(
      'Decline Event',
      'Are you sure you want to decline this event?',
      declineAction,
      'Decline'
    );
  };

  const handleApprove = async (event: EventData) => {
    const approveAction = async () => {
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
    };
    
    showCustomConfirmation(
      'Approve Event',
      'Are you sure you want to approve this event?',
      approveAction,
      'Approve'
    );
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

  // Preview event function
  const handlePreviewEvent = (event: EventData) => {
    setPreviewEvent(event);
  };

  const closePreviewModal = () => {
    setPreviewEvent(null);
  };

  // Filter functions
  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleFilterApply = (category: string) => {
    setFilterCategory(category);
    setShowFilterModal(false);
  };

  // Sort functions
  const handleSortClick = () => {
    setShowSortModal(true);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setShowSortModal(false);
  };

  // Export function
  const handleExport = () => {
    // Create CSV data from events
    const headers = ["Title", "Description", "Date", "Time", "Location", "Organizer", "Target Audience"];
    const csvData = events.map(event => [
      event.title || "",
      event.description || "",
      event.date || "",
      event.time || "",
      event.location || "",
      event.organizer || "",
      event.targetAudience || ""
    ]);
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pending-events.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Analytics functions
  const handleOpenAnalytics = async () => {
    try {
      // Fetch approved events for analytics
      const approvedEventsSnapshot = await getDocs(collection(db, "events"));
      const approvedEvents = approvedEventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EventData[];
      
      // Calculate category counts
      const categoryCounts: Record<string, number> = {};
      approvedEvents.forEach(event => {
        const category = event.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Calculate monthly event counts for the last 6 months
      const monthlyEventCounts: Record<string, number> = {};
      const today = new Date();
      
      for (let i = 0; i < 6; i++) {
        const month = new Date(today);
        month.setMonth(today.getMonth() - i);
        const monthKey = month.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyEventCounts[monthKey] = 0;
      }
      
      approvedEvents.forEach(event => {
        if (event.date) {
          const eventDate = new Date(event.date);
          const monthKey = eventDate.toLocaleString('default', { month: 'short', year: '2-digit' });
          if (monthlyEventCounts[monthKey] !== undefined) {
            monthlyEventCounts[monthKey] += 1;
          }
        }
      });
      
      // Get recent activity (simple mock data for now)
      const recentActivity = [
        { action: "Event Approved", timestamp: new Date(), item: "Club Fair 2023" },
        { action: "Feedback Received", timestamp: new Date(Date.now() - 86400000), item: "user@example.com" },
        { action: "Event Declined", timestamp: new Date(Date.now() - 172800000), item: "Canceled Workshop" },
        { action: "Event Edited", timestamp: new Date(Date.now() - 259200000), item: "Sports Game" },
      ];
      
      // Update analytics data
      setAnalyticsData({
        pendingEventsCount: events.length,
        approvedEventsCount: approvedEvents.length,
        declinedEventsCount: 0, // We don't track declined events separately
        feedbackCount: feedback.length,
        categoryCounts,
        monthlyEventCounts,
        recentActivity
      });
      
      // Show the modal
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  // Feedback and Event archive functions
  const handleDeleteFeedback = async (id: string) => {
    console.log("Deleting feedback with ID:", id);
    
    const archiveFeedbackAction = async () => {
      try {
        // Get the feedback item
        const feedbackToArchive = feedback.find(item => item.id === id);
        console.log("Feedback to archive:", feedbackToArchive);
        if (!feedbackToArchive) return;
        
        // Create a new object without the id field
        const { id: originalId, ...feedbackWithoutId } = feedbackToArchive;
        
        // Add to archived feedback
        const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await addDoc(collection(db, "archivedFeedback"), {
          ...feedbackWithoutId,
          archivedAt: new Date(),
          expiresAt: oneWeekFromNow,
          originalId: originalId // Store the original ID as a reference if needed
        });
        
        // Delete from feedback collection
        await deleteDoc(doc(db, "feedback", id));
        
        // Update UI with functional state update
        setFeedback(currentFeedback => currentFeedback.filter(item => item.id !== id));
        
        // Fetch all archived feedback documents
        const archivedSnapshot = await getDocs(collection(db, "archivedFeedback"));
        console.log("Archived feedback docs count:", archivedSnapshot.docs.length);
        
        const fetchedArchived = archivedSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Archived feedback doc data:", data);
          return {
            id: doc.id,
            feedback: data.feedback || "",
            email: data.email,
            submittedAt: data.submittedAt,
            archivedAt: data.archivedAt,
            expiresAt: data.expiresAt
          };
        }) as FeedbackData[];
        
        console.log("Processed archived feedback:", fetchedArchived);
        
        // Update archived feedback
        setArchivedFeedback(fetchedArchived);
      } catch (error) {
        console.error("Error archiving feedback:", error);
      }
    };
    
    showCustomConfirmation(
      'Archive Feedback',
      'Are you sure you want to move this feedback to archive?',
      archiveFeedbackAction,
      'Archive'
    );
  };
  
  // handleDeleteEvent function removed as it's no longer needed
  // The functionality has been moved directly into handleDecline
  
  // Permanent delete functions for archived items
  const handlePermanentlyDeleteArchivedFeedback = async (id: string) => {
    const deleteFeedbackAction = async () => {
      try {
        await deleteDoc(doc(db, "archivedFeedback", id));
        setArchivedFeedback(archivedFeedback.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error permanently deleting feedback:", error);
      }
    };
    
    showCustomConfirmation(
      'Permanently Delete Feedback',
      'Are you sure you want to permanently delete this feedback? This action cannot be undone.',
      deleteFeedbackAction,
      'Delete Forever'
    );
  };
  
  const handlePermanentlyDeleteArchivedEvent = async (id: string) => {
    const deleteEventAction = async () => {
      try {
        await deleteDoc(doc(db, "archivedEvents", id));
        setArchivedEvents(archivedEvents.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error permanently deleting event:", error);
      }
    };
    
    showCustomConfirmation(
      'Permanently Delete Event',
      'Are you sure you want to permanently delete this event? This action cannot be undone.',
      deleteEventAction,
      'Delete Forever'
    );
  };  // Function to get filtered and sorted events
  const getFilteredAndSortedEvents = () => {
    let filteredEvents = [...events];
    
    // Apply category filter
    if (filterCategory) {
      filteredEvents = filteredEvents.filter(event => 
        event.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    
    // Apply sorting
    if (sortOrder === 'newest') {
      filteredEvents.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      filteredEvents.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
    }
    
    return filteredEvents;
  };
  
  // Function to get sorted feedback
  const getSortedFeedback = () => {
    let sortedFeedback = [...feedback];
    
    // Apply sorting based on submission date
    if (feedbackSortOrder === 'newest') {
      sortedFeedback.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt.seconds * 1000).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt.seconds * 1000).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      sortedFeedback.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt.seconds * 1000).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt.seconds * 1000).getTime() : 0;
        return dateA - dateB;
      });
    }
    
    return sortedFeedback;
  };

  return (
    <>
      <AnimatedBackground />
      <PageFade />
      <div className="min-h-screen relative overflow-hidden bg-transparent z-10">
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Feedback</p>
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
                <button 
                  onClick={handleOpenAnalytics}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium flex items-center gap-1.5"
                >
                  <FaTachometerAlt size={12} /> View Full Analytics
                </button>
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
                  <button
                    onClick={() => setActiveTab('archived')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'archived'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <FaArchive size={14} />
                    Archive ({archivedEvents.length + archivedFeedback.length})
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {activeTab === 'events' && (
                    <>
                      <div className="relative">
                        <button 
                          onClick={handleFilterClick}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm"
                        >
                          <FaFilter size={12} /> Filter
                        </button>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={handleSortClick}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm"
                        >
                          <FaSortAmountDown size={12} /> Sort
                        </button>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={handleExport}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm"
                        >
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
                        {getFilteredAndSortedEvents().map((event) => (
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
                                  <button 
                                    onClick={() => handlePreviewEvent(event)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                  >
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
                                  onClick={() => {
                                    console.log("Decline button clicked for event:", event.id);
                                    handleDecline(event.id);
                                  }}
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
                      <h3 className="font-semibold text-gray-800 dark:text-white">Feedback</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {feedback.length} Total
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setFeedbackSortOrder(feedbackSortOrder === 'newest' ? 'oldest' : 'newest')}
                        className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                      >
                        {feedbackSortOrder === 'newest' ? (
                          <>
                            <FaSortAmountDown size={12} /> Newest First
                          </>
                        ) : (
                          <>
                            <FaSortAmountUp size={12} /> Oldest First
                          </>
                        )}
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
                      {getSortedFeedback().map((item) => (
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
                                    {item.email ? item.email : `Anonymous User #${item.id.substring(0, 4)}`}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <FaEnvelope className="text-gray-400 text-xs" />
                                    <span className="text-sm">Feedback #{item.id.substring(0, 4)}</span>
                                  </div>
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
                            <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                              <button 
                                onClick={() => {
                                  console.log("Delete button clicked for feedback:", item.id);
                                  handleDeleteFeedback(item.id);
                                }}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white shadow-sm hover:shadow transition-all duration-200"
                              >
                                <FaTrash size={11} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Archive Tab Content */}
              {activeTab === 'archived' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Archive</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {archivedEvents.length + archivedFeedback.length} Total • Items will be deleted after 7 days
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            const deleteAllAction = async () => {
                              for (const event of archivedEvents) {
                                await deleteDoc(doc(db, "archivedEvents", event.id));
                              }
                              for (const item of archivedFeedback) {
                                await deleteDoc(doc(db, "archivedFeedback", item.id));
                              }
                              setArchivedEvents([]);
                              setArchivedFeedback([]);
                            };
                            
                            showCustomConfirmation(
                              'Delete All Archived Items',
                              'Are you sure you want to permanently delete ALL archived items? This action cannot be undone.',
                              deleteAllAction,
                              'Delete All Forever'
                            );
                          }}
                          className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <FaTrash size={14} />
                          Delete All
                        </button>
                      </div>
                    </div>
                    
                    {archivedEvents.length === 0 && archivedFeedback.length === 0 ? (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
                        <div className="mx-auto w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
                          <FaArchive className="text-4xl text-purple-500 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Archive is Empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          When you delete events or feedback, they will appear here for 7 days before being permanently removed.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Archived Events Section */}
                        {archivedEvents.length > 0 && (
                          <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Archived Events</h4>
                            <div className="space-y-4">
                              {archivedEvents.map((event) => (
                                <div
                                  key={event.id}
                                  className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
                                >
                                  <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                          <FaCalendarAlt className="text-lg" />
                                        </div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white">
                                          {event.title}
                                        </h3>
                                      </div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Archived on {event.archivedAt?.toDate?.().toLocaleDateString() || 'Unknown date'} • 
                                        Will be deleted on {event.expiresAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                        {event.description || 'No description provided'}
                                      </p>
                                    </div>
                                    
                                    <button
                                      onClick={() => handlePermanentlyDeleteArchivedEvent(event.id)}
                                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                                    >
                                      <FaTrash size={11} /> Permanently Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Archived Feedback Section */}
                        {archivedFeedback.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Archived Feedback</h4>
                            <div className="space-y-4">
                              {archivedFeedback.map((item) => (
                                <div
                                  key={item.id}
                                  className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
                                >
                                  <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                          <FaComments className="text-lg" />
                                        </div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white">
                                          {item.email ? item.email : `Anonymous User #${item.id.substring(0, 4)}`}
                                        </h3>
                                      </div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Archived on {item.archivedAt?.toDate?.().toLocaleDateString() || 'Unknown date'} • 
                                        Will be deleted on {item.expiresAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                        {item.feedback}
                                      </p>
                                    </div>
                                    
                                    <button
                                      onClick={() => handlePermanentlyDeleteArchivedFeedback(item.id)}
                                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                                    >
                                      <FaTrash size={11} /> Permanently Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Preview Event Modal */}
        {previewEvent && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Event Preview</h3>
                <button 
                  onClick={closePreviewModal}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Pending
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {previewEvent.category || "Uncategorized"}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{previewEvent.title}</h2>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mt-3">
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                    {previewEvent.description || "No description provided"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400">
                        <FaCalendarAlt size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                          {previewEvent.date ? formatDate(previewEvent.date) : "Not specified"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400">
                        <FaRegClock size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                          {previewEvent.time || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
                        <FaMapMarkerAlt size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                          {previewEvent.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400">
                        <FaUser size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Organizer</p>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                          {previewEvent.organizer || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {previewEvent.targetAudience && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400">
                      <FaUsers size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Target Audience</p>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                        {previewEvent.targetAudience}
                      </p>
                    </div>
                  </div>
                )}

                {previewEvent.notes && (
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Additional Notes:</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-line">
                        {previewEvent.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={closePreviewModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
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

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Filter Events</h3>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  >
                    <option value="">All Categories</option>
                    <option value="Club Event">Club Event</option>
                    <option value="School Event">School Event</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFilterApply(filterCategory)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sort Modal */}
        {showSortModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sort Events</h3>
                <button 
                  onClick={() => setShowSortModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="newest"
                      name="sortOrder"
                      value="newest"
                      checked={sortOrder === 'newest'}
                      onChange={() => setSortOrder('newest')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor="newest" className="ml-2 block text-gray-700 dark:text-gray-300">
                      Newest First
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="oldest"
                      name="sortOrder"
                      value="oldest"
                      checked={sortOrder === 'oldest'}
                      onChange={() => setSortOrder('oldest')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor="oldest" className="ml-2 block text-gray-700 dark:text-gray-300">
                      Oldest First
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowSortModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSortChange(sortOrder)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Apply Sorting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartBar className="text-red-500" /> 
                Detailed Analytics Dashboard
              </h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-800/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Events</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{analyticsData.pendingEventsCount}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <FaRegCalendarCheck className="text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Events</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analyticsData.approvedEventsCount}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <FaCheck className="text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analyticsData.feedbackCount}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <FaComments className="text-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {analyticsData.pendingEventsCount + analyticsData.approvedEventsCount + analyticsData.feedbackCount}
                      </p>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <FaChartBar className="text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Events by Category</h4>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.categoryCounts).map(([category, count]) => (
                      <div key={category} className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mr-2">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-pink-500 h-4 rounded-full"
                            style={{ width: `${Math.min(100, (count / analyticsData.approvedEventsCount) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="min-w-[100px] text-sm flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                          <span className="text-gray-600 dark:text-gray-400">{count}</span>
                        </div>
                      </div>
                    ))}
                    {Object.keys(analyticsData.categoryCounts).length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No category data available</p>
                    )}
                  </div>
                </div>
                
                {/* Monthly Events */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Monthly Event Trends</h4>
                  <div className="h-48 flex items-end justify-between">
                    {Object.entries(analyticsData.monthlyEventCounts).map(([month, count]) => (
                      <div key={month} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-gradient-to-t from-red-500 to-pink-500 rounded-t-md"
                          style={{ height: `${Math.max(10, (count / Math.max(...Object.values(analyticsData.monthlyEventCounts), 1)) * 100)}%` }}
                        ></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {analyticsData.recentActivity.map((activity, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{activity.action}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{activity.item}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fadeIn">
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3">
                <FaExclamationTriangle className="text-amber-500 dark:text-amber-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{confirmTitle}</h3>
            </div>
            
            <p className="mb-6 text-gray-600 dark:text-gray-300">{confirmMessage}</p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await confirmAction();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                {confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;
