import { useState, useEffect } from 'react';
import { FaAngleLeft, FaAngleRight, FaClock, FaMapMarkerAlt, FaUser, FaInfoCircle, FaGraduationCap, FaHeart, FaDrumstickBite, FaSnowflake, FaSnowman, FaSchool, FaUsers, FaSeedling, FaEgg, FaCrown, FaShieldAlt, FaBook, FaTools, FaFeather, FaHandshake } from "react-icons/fa";
import { MdEvent, MdSportsSoccer, MdTheaterComedy, MdCelebration, MdPalette, MdBusiness, MdLocalFlorist, MdPets } from "react-icons/md";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import PageFade from '../PageFade';
// Removed: import './SchedulePage.css';

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    type: "pro-d" | "holiday" | "user-event" | "collab";
    description: string;
    icon: React.ReactNode;
    category?: string;
    time?: string;
    location?: string;
    organizer?: string;
}

const scheduleEvents: ScheduleEvent[] = [

    // --- Added Important Dates for 2025-2026 ---
    {
        id: "100",
        title: "First Day of School for Students",
        date: "2025-09-02",
        type: "holiday",
        description: "First day of classes for students",
        icon: <FaGraduationCap className="w-4 h-4" />
    },
    {
        id: "101",
        title: "National Day of Truth & Reconciliation",
        date: "2025-09-30",
        type: "holiday",
        description: "School closed for National Day of Truth & Reconciliation",
        icon: <FaHeart className="w-4 h-4" />
    },
    {
        id: "102",
        title: "Thanksgiving Day",
        date: "2025-10-13",
        type: "holiday",
        description: "School closed for Thanksgiving Day",
        icon: <FaDrumstickBite className="w-4 h-4" />
    },
    {
        id: "103",
        title: "Remembrance Day",
        date: "2025-11-11",
        type: "holiday",
        description: "School closed for Remembrance Day",
        icon: <MdLocalFlorist className="w-4 h-4" />
    },
    {
        id: "104",
        title: "Last Day of Instruction Before Winter Vacation",
        date: "2025-12-19",
        type: "holiday",
        description: "Last day of classes before winter break",
        icon: <FaSnowflake className="w-4 h-4" />
    },
    {
        id: "105",
        title: "Winter Vacation Period",
        date: "2025-12-22",
        type: "holiday",
        description: "Winter vacation begins",
        icon: <FaSnowman className="w-4 h-4" />
    },
    {
        id: "106",
        title: "Winter Vacation Period",
        date: "2026-01-02",
        type: "holiday",
        description: "Winter vacation ends",
        icon: <FaSnowman className="w-4 h-4" />
    },
    {
        id: "107",
        title: "School Re-opens after Winter Vacation",
        date: "2026-01-05",
        type: "holiday",
        description: "School resumes after winter break",
        icon: <FaSchool className="w-4 h-4" />
    },
    {
        id: "108",
        title: "Family Day",
        date: "2026-02-16",
        type: "holiday",
        description: "School closed for Family Day",
        icon: <FaUsers className="w-4 h-4" />
    },
    {
        id: "109",
        title: "Last Day of Instruction Before Spring Vacation",
        date: "2026-03-13",
        type: "holiday",
        description: "Last day of classes before spring break",
        icon: <MdLocalFlorist className="w-4 h-4" />
    },
    {
        id: "110",
        title: "Spring Vacation Period",
        date: "2026-03-16",
        type: "holiday",
        description: "Spring vacation begins",
        icon: <FaSeedling className="w-4 h-4" />
    },
    {
        id: "111",
        title: "Spring Vacation Period",
        date: "2026-03-27",
        type: "holiday",
        description: "Spring vacation ends",
        icon: <FaSeedling className="w-4 h-4" />
    },
    {
        id: "112",
        title: "School Re-opens after Spring Vacation",
        date: "2026-03-30",
        type: "holiday",
        description: "School resumes after spring break",
        icon: <FaSchool className="w-4 h-4" />
    },
    {
        id: "113",
        title: "Good Friday",
        date: "2026-04-03",
        type: "holiday",
        description: "School closed for Good Friday",
        icon: <MdPets className="w-4 h-4" />
    },
    {
        id: "114",
        title: "Easter Monday",
        date: "2026-04-06",
        type: "holiday",
        description: "School closed for Easter Monday",
        icon: <FaEgg className="w-4 h-4" />
    },
    {
        id: "115",
        title: "Victoria Day",
        date: "2026-05-18",
        type: "holiday",
        description: "School closed for Victoria Day",
        icon: <FaCrown className="w-4 h-4" />
    },
    {
        id: "116",
        title: "Last Full Day of Pupil Attendance",
        date: "2026-06-25",
        type: "holiday",
        description: "Last full day of classes for students",
        icon: <FaGraduationCap className="w-4 h-4" />
    },
    {
        id: "117",
        title: "Administrative/School Closing Day",
        date: "2026-06-26",
        type: "holiday",
        description: "Administrative/School closing day",
        icon: <FaShieldAlt className="w-4 h-4" />
    },
    // --- Added Pro-D Days for 2025-2026 ---
    {
        id: "200",
        title: "Professional Development Day (School set)",
        date: "2025-09-26",
        type: "pro-d",
        description: "Professional Development Day (Date set by school) - No classes",
        icon: <FaBook className="w-4 h-4" />
    },
    {
        id: "201",
        title: "Professional Development Day (Province wide)",
        date: "2025-10-24",
        type: "pro-d",
        description: "Professional Development Day (Province wide) - No classes",
        icon: <FaTools className="w-4 h-4" />
    },
    {
        id: "202",
        title: "Professional Development Day (District wide)",
        date: "2025-11-21",
        type: "pro-d",
        description: "Professional Development Day (District wide) - No classes",
        icon: <FaSchool className="w-4 h-4" />
    },
    {
        id: "203",
        title: "Professional Development Day (District wide)",
        date: "2026-02-13",
        type: "pro-d",
        description: "Professional Development Day (District wide) - No classes",
        icon: <FaSchool className="w-4 h-4" />
    },
    {
        id: "204",
        title: "Indigenous Focus Day (District wide)",
        date: "2026-04-20",
        type: "pro-d",
        description: "Indigenous Focus Day (District wide) - No classes",
        icon: <FaFeather className="w-4 h-4" />
    },
    {
        id: "205",
        title: "Professional Development Day (School set)",
        date: "2026-05-15",
        type: "pro-d",
        description: "Professional Development Day (Date set by school) - No classes",
        icon: <FaBook className="w-4 h-4" />
    },
    // --- Added Collaboration Days for 2025-2026 ---
    {
        id: "300",
        title: "Collaboration Day (AM)",
        date: "2025-09-15",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: <FaHandshake className="w-4 h-4" />
    },
    {
        id: "301",
        title: "Collaboration Day (AM)",
        date: "2025-11-03",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: <FaHandshake className="w-4 h-4" />
    },
    {
        id: "302",
        title: "Collaboration Day (PM)",
        date: "2025-12-15",
        type: "collab",
        description: "PM Collaboration - Period 4 ends at 1:40",
        icon: <FaHandshake className="w-4 h-4" />
    },
    {
        id: "303",
        title: "Collaboration Day (AM)",
        date: "2026-01-12",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: <FaHandshake className="w-4 h-4" />
    },
    {
        id: "304",
        title: "Collaboration Day (AM)",
        date: "2026-02-09",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: <FaHandshake className="w-4 h-4" />
    },
    {
        id: "305",
        title: "Collaboration Day (AM)",
        date: "2026-04-13",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: <FaHandshake className="w-4 h-4" />
    },
    {
        id: "306",
        title: "Collaboration Day (AM)",
        date: "2026-05-11",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: <FaHandshake className="w-4 h-4" />
    },
    {
        id: "307",
        title: "Collaboration Day (PM)",
        date: "2026-06-15",
        type: "collab",
        description: "PM Collaboration - Period 4 ends at 1:40",
        icon: <FaHandshake className="w-4 h-4" />
    },
];

const SchedulePage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [approvedEvents, setApprovedEvents] = useState<ScheduleEvent[]>([]);
    const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);

    // Add darkMode detection
    const darkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    // Fetch approved events from Firebase
    useEffect(() => {
        const fetchApprovedEvents = async () => {
            try {
                const snapshot = await getDocs(collection(db, "approvedEvents"));
                const events = snapshot.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title || "Untitled Event",
                    date: doc.data().date || "",
                    type: "user-event" as const,
                    description: doc.data().description || "No description",
                    icon: getEventIcon(doc.data().category),
                    category: doc.data().category,
                    time: doc.data().time,
                    location: doc.data().location,
                    organizer: doc.data().organizer
                })) as ScheduleEvent[];
                
                setApprovedEvents(events);
            } catch (error) {
                console.error("Error fetching approved events:", error);
            }
        };

        fetchApprovedEvents();
    }, []);

    // Combine schedule events with approved events
    useEffect(() => {
        setAllEvents([...scheduleEvents, ...approvedEvents]);
    }, [approvedEvents]);

    // Helper function to get icon based on category
    const getEventIcon = (category?: string) => {
        switch (category?.toLowerCase()) {
            case 'academic':
                return <FaBook className="w-4 h-4" />;
            case 'sports':
                return <MdSportsSoccer className="w-4 h-4" />;
            case 'cultural':
                return <MdTheaterComedy className="w-4 h-4" />;
            case 'social':
                return <MdCelebration className="w-4 h-4" />;
            case 'spirit day':
                return <MdPalette className="w-4 h-4" />;
            case 'club event':
                return <MdBusiness className="w-4 h-4" />;
            default:
                return <MdEvent className="w-4 h-4" />;
        }
    };

    const getEventsForDate = (date: Date) => {
        const key = date.toISOString().split('T')[0];
        return allEvents.filter(e => e.date === key);
    };

    const generateDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);

        const start = new Date(firstDay);
        start.setDate(start.getDate() - start.getDay()); // back to Sunday

        const days = [];
        for (let i = 0; i < 42; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push(date);
        }

        return days;
    };

    // Helper for event pill color
    const eventPillClass = (type: string) => {
        if (type === 'pro-d') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200';
        if (type === 'holiday') return 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200';
        if (type === 'collab') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-200';
        if (type === 'user-event') return 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200';
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200';
    };
    
    // Helper for badge color
    const badgeClass = (type: string) => {
        if (type === 'pro-d') return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/80 dark:to-blue-800/80 dark:text-blue-100 border border-blue-200 dark:border-blue-700 shadow-md shadow-blue-200/50 dark:shadow-blue-900/30';
        if (type === 'holiday') return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/80 dark:to-green-800/80 dark:text-green-100 border border-green-200 dark:border-green-700 shadow-md shadow-green-200/50 dark:shadow-green-900/30';
        if (type === 'collab') return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/80 dark:to-yellow-800/80 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-700 shadow-md shadow-yellow-200/50 dark:shadow-yellow-900/30';
        if (type === 'user-event') return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/80 dark:to-red-800/80 dark:text-red-100 border border-red-200 dark:border-red-700 shadow-md shadow-red-200/50 dark:shadow-red-900/30';
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/80 dark:to-gray-700/80 dark:text-gray-100 border border-gray-200 dark:border-gray-600 shadow-md shadow-gray-200/50 dark:shadow-gray-900/30';
    };
    


    // Helper to format time for display
    const formatTime = (timeString?: string) => {
        if (!timeString) return "";
        
        // If it's already in 12-hour format (contains AM/PM), return as is
        if (timeString.includes('AM') || timeString.includes('PM')) {
            return timeString;
        }
        
        // If it's in 24-hour format, convert to 12-hour
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (error) {
            return timeString; // Return original if parsing fails
        }
    };

    return (
        <>
            <PageFade />
            <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 py-4 sm:py-6 relative overflow-hidden ${
                typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                  ? 'animate-fadeIn-dark'
                  : 'animate-fadeIn'
              }`}>
                {/* Subtle Grid Pattern - Simplified */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]"></div>
                </div>
                <div className="w-full">
                    {/* Enhanced Header */}
                    <div className="text-center mb-8 sm:mb-12 pt-16 sm:pt-20">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
                            Magee's Schedule
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                            See upcoming holidays, pro-d days, and student events at Magee! 
                        </p>
                    </div>

                    {/* Container with minimal horizontal spacing */}
                    <div className="max-w-none mx-auto px-2 sm:px-3 lg:px-4">
                        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 w-full">
                            {/* Enhanced Calendar */}
                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100/50 dark:border-gray-700/50 flex flex-col mb-6 sm:mb-8 lg:mb-0 lg:flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
                                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <div className="flex justify-center sm:justify-end gap-2 sm:gap-3">
                                        <button
                                            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            onClick={() => {
                                                const newDate = new Date(currentMonth);
                                                newDate.setMonth(currentMonth.getMonth() - 1);
                                                setCurrentMonth(newDate);
                                            }}
                                        >
                                            <FaAngleLeft size={16} color={darkMode ? '#e5e7eb' : '#374151'} />
                                        </button>
                                        <button
                                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base"
                                            onClick={() => {
                                                setCurrentMonth(new Date());
                                                setSelectedDate(null);
                                            }}
                                        >
                                            Today
                                        </button>
                                        <button
                                            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            onClick={() => {
                                                const newDate = new Date(currentMonth);
                                                newDate.setMonth(currentMonth.getMonth() + 1);
                                                setCurrentMonth(newDate);
                                            }}
                                        >
                                            <FaAngleRight size={16} color={darkMode ? '#e5e7eb' : '#374151'} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                        <div key={day} className="text-center font-bold text-gray-500 dark:text-gray-400 py-2 sm:py-3 border-b-2 border-gray-200 dark:border-gray-700 text-xs sm:text-sm uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1 flex-1">
                                    {generateDays().map((date, index) => {
                                        const isToday = new Date().toDateString() === date.toDateString();
                                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                        const events = getEventsForDate(date);
                                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                                        return (
                                            <div
                                                key={index}
                                                className={`relative rounded-xl sm:rounded-2xl px-1 sm:px-2 pt-1 sm:pt-2 pb-2 sm:pb-3 min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] cursor-pointer transition-all duration-500 ease-out bg-white/90 dark:bg-gray-800/90 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/20 overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:shadow-red-500/10 hover:scale-105 hover:border-red-300 dark:hover:border-red-600 group ${isSelected ? 'ring-2 ring-red-500 shadow-red-500/15 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10' : isToday ? 'ring-2 ring-red-400 shadow-red-400/15' : ''} ${!isCurrentMonth ? 'opacity-40 hover:opacity-70' : ''}`}
                                                onClick={() => setSelectedDate(date)}
                                            >
                                                {/* Enhanced hover overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-600/0 group-hover:from-red-500/5 group-hover:to-red-600/5 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100" />
                                                
                                                {/* Subtle glow effect on hover */}
                                                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-400/0 via-red-500/0 to-red-600/0 group-hover:from-red-400/10 group-hover:via-red-500/5 group-hover:to-red-600/10 transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 blur-sm" />
                                                
                                                <div className="relative text-right text-xs font-bold text-gray-700 dark:text-gray-200 pr-1 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300">
                                                    {date.getDate()}
                                                </div>
                                                <div className="relative flex flex-col gap-0.5 sm:gap-1 mt-1 flex-1">
                                                    {events.slice(0, 1).map(e => (
                                                        <div key={e.id} className={`truncate px-1 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-300 group-hover:scale-105 ${eventPillClass(e.type)}`}> 
                                                            <span className="text-sm sm:text-base group-hover:animate-pulse">{e.icon}</span>
                                                            <span className="hidden sm:inline group-hover:font-bold transition-all duration-300">{e.title.length > 20 ? e.title.slice(0, 12) + '…' : e.title}</span>
                                                            <span className="sm:hidden group-hover:font-bold transition-all duration-300">{e.title.length > 10 ? e.title.slice(0, 6) + '…' : e.title}</span>
                                                        </div>
                                                    ))}
                                                    {events.length > 1 && (
                                                        <div className="text-[8px] sm:text-[10px] text-gray-400 text-center group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300 group-hover:font-semibold">
                                                            +{events.length - 1}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Enhanced Sidebar */}
                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100/50 dark:border-gray-700/50 overflow-y-auto flex flex-col lg:w-[29rem]">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-3 sm:pb-4">Events on {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}</h3>
                                {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
                                    <div className="space-y-3 sm:space-y-4">
                                        {getEventsForDate(selectedDate).map(e => (
                                            <div key={e.id} className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-red-200 dark:hover:border-red-700 overflow-hidden">
                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                
                                                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                                            <span className="text-sm sm:text-lg">{e.icon}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 line-clamp-2 text-sm sm:text-base">
                                                                {e.title}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                                                                         <span className={`flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wide text-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${badgeClass(e.type)}`}>
                                                         {e.type === 'pro-d' ? 'Pro-D' : e.type === 'holiday' ? 'Holiday' : e.type === 'collab' ? 'Collab' : e.category || 'Event'}
                                                     </span>
                                                </div>
                                                
                                                <div className="relative mb-3 sm:mb-4">
                                                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0 mt-1">
                                                                <FaInfoCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-red-600 dark:text-red-400 text-xs sm:text-sm mb-0.5">Details</div>
                                                                <p className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm leading-relaxed font-medium">{e.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {e.type === 'user-event' && (
                                                    <div className="relative space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                                        {e.time && (
                                                            <div className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                                                                <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex-shrink-0">
                                                                    <FaClock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">Time</span>
                                                                    <div className="text-gray-700 dark:text-gray-300 font-medium">{formatTime(e.time)}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {e.location && (
                                                            <div className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                                                                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                                                                    <FaMapMarkerAlt className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">Location</span>
                                                                    <div className="text-gray-700 dark:text-gray-300 font-medium">{e.location}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {e.organizer && (
                                                            <div className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                                                                <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
                                                                    <FaUser className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="font-semibold text-green-600 dark:text-green-400">Organizer</span>
                                                                    <div className="text-gray-700 dark:text-gray-300 font-medium">{e.organizer}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4">
                                            <MdEvent className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-100 mb-2">
                                            No events scheduled
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                            Select a different date to view events
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchedulePage;