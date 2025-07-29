import { useState, useEffect } from 'react';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
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
    icon: string;
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
        icon: "🎒"
    },
    {
        id: "101",
        title: "National Day of Truth & Reconciliation",
        date: "2025-09-30",
        type: "holiday",
        description: "School closed for National Day of Truth & Reconciliation",
        icon: "🧡"
    },
    {
        id: "102",
        title: "Thanksgiving Day",
        date: "2025-10-13",
        type: "holiday",
        description: "School closed for Thanksgiving Day",
        icon: "🦃"
    },
    {
        id: "103",
        title: "Remembrance Day",
        date: "2025-11-11",
        type: "holiday",
        description: "School closed for Remembrance Day",
        icon: "🌺"
    },
    {
        id: "104",
        title: "Last Day of Instruction Before Winter Vacation",
        date: "2025-12-19",
        type: "holiday",
        description: "Last day of classes before winter break",
        icon: "❄️"
    },
    {
        id: "105",
        title: "Winter Vacation Period",
        date: "2025-12-22",
        type: "holiday",
        description: "Winter vacation begins",
        icon: "⛄"
    },
    {
        id: "106",
        title: "Winter Vacation Period",
        date: "2026-01-02",
        type: "holiday",
        description: "Winter vacation ends",
        icon: "⛄"
    },
    {
        id: "107",
        title: "School Re-opens after Winter Vacation",
        date: "2026-01-05",
        type: "holiday",
        description: "School resumes after winter break",
        icon: "🏫"
    },
    {
        id: "108",
        title: "Family Day",
        date: "2026-02-16",
        type: "holiday",
        description: "School closed for Family Day",
        icon: "👨‍👩‍👧‍👦"
    },
    {
        id: "109",
        title: "Last Day of Instruction Before Spring Vacation",
        date: "2026-03-13",
        type: "holiday",
        description: "Last day of classes before spring break",
        icon: "🌸"
    },
    {
        id: "110",
        title: "Spring Vacation Period",
        date: "2026-03-16",
        type: "holiday",
        description: "Spring vacation begins",
        icon: "🌷"
    },
    {
        id: "111",
        title: "Spring Vacation Period",
        date: "2026-03-27",
        type: "holiday",
        description: "Spring vacation ends",
        icon: "🌷"
    },
    {
        id: "112",
        title: "School Re-opens after Spring Vacation",
        date: "2026-03-30",
        type: "holiday",
        description: "School resumes after spring break",
        icon: "🏫"
    },
    {
        id: "113",
        title: "Good Friday",
        date: "2026-04-03",
        type: "holiday",
        description: "School closed for Good Friday",
        icon: "🐇"
    },
    {
        id: "114",
        title: "Easter Monday",
        date: "2026-04-06",
        type: "holiday",
        description: "School closed for Easter Monday",
        icon: "🐣"
    },
    {
        id: "115",
        title: "Victoria Day",
        date: "2026-05-18",
        type: "holiday",
        description: "School closed for Victoria Day",
        icon: "👑"
    },
    {
        id: "116",
        title: "Last Full Day of Pupil Attendance",
        date: "2026-06-25",
        type: "holiday",
        description: "Last full day of classes for students",
        icon: "🎓"
    },
    {
        id: "117",
        title: "Administrative/School Closing Day",
        date: "2026-06-26",
        type: "holiday",
        description: "Administrative/School closing day",
        icon: "🔒"
    },
    // --- Added Pro-D Days for 2025-2026 ---
    {
        id: "200",
        title: "Professional Development Day (School set)",
        date: "2025-09-26",
        type: "pro-d",
        description: "Professional Development Day (Date set by school) - No classes",
        icon: "📚"
    },
    {
        id: "201",
        title: "Professional Development Day (Province wide)",
        date: "2025-10-24",
        type: "pro-d",
        description: "Professional Development Day (Province wide) - No classes",
        icon: "🛠️"
    },
    {
        id: "202",
        title: "Professional Development Day (District wide)",
        date: "2025-11-21",
        type: "pro-d",
        description: "Professional Development Day (District wide) - No classes",
        icon: "🏫"
    },
    {
        id: "203",
        title: "Professional Development Day (District wide)",
        date: "2026-02-13",
        type: "pro-d",
        description: "Professional Development Day (District wide) - No classes",
        icon: "🏫"
    },
    {
        id: "204",
        title: "Indigenous Focus Day (District wide)",
        date: "2026-04-20",
        type: "pro-d",
        description: "Indigenous Focus Day (District wide) - No classes",
        icon: "🪶"
    },
    {
        id: "205",
        title: "Professional Development Day (School set)",
        date: "2026-05-15",
        type: "pro-d",
        description: "Professional Development Day (Date set by school) - No classes",
        icon: "📚"
    },
    // --- Added Collaboration Days for 2025-2026 ---
    {
        id: "300",
        title: "Collaboration Day (AM)",
        date: "2025-09-15",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: "🤝"
    },
    {
        id: "301",
        title: "Collaboration Day (AM)",
        date: "2025-11-03",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: "🤝"
    },
    {
        id: "302",
        title: "Collaboration Day (PM)",
        date: "2025-12-15",
        type: "collab",
        description: "PM Collaboration - Period 4 ends at 1:40",
        icon: "🤝"
    },
    {
        id: "303",
        title: "Collaboration Day (AM)",
        date: "2026-01-12",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: "🤝"
    },
    {
        id: "304",
        title: "Collaboration Day (AM)",
        date: "2026-02-09",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: "🤝"
    },
    {
        id: "305",
        title: "Collaboration Day (AM)",
        date: "2026-04-13",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: "🤝"
    },
    {
        id: "306",
        title: "Collaboration Day (AM)",
        date: "2026-05-11",
        type: "collab",
        description: "AM Collaboration - Period 1 starts at 10:00",
        icon: "🤝"
    },
    {
        id: "307",
        title: "Collaboration Day (PM)",
        date: "2026-06-15",
        type: "collab",
        description: "PM Collaboration - Period 4 ends at 1:40",
        icon: "🤝"
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
                return '📚';
            case 'sports':
                return '⚽';
            case 'cultural':
                return '🎭';
            case 'social':
                return '🎉';
            case 'spirit day':
                return '🎨';
            case 'club event':
                return '🏛️';
            default:
                return '📅';
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
        if (type === 'pro-d') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200';
        if (type === 'holiday') return 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200';
        if (type === 'collab') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200';
        if (type === 'user-event') return 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200';
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700/70 dark:text-gray-200';
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
                        radial-gradient(circle at 50% 140%, rgba(70, 85, 110, 0.25) 0%, transparent 60%),
                        radial-gradient(circle at 50% 140%, rgba(99, 102, 241, 0.2) 0%, transparent 70%),
                        radial-gradient(circle at 50% 140%, rgba(181, 184, 208, 0.15) 0%, transparent 80%)
                      `,
                    }}
                  />
                </div>
                <div className="w-full">
                    {/* Enhanced Header */}
                    <div className="text-center mb-8 sm:mb-12 pt-16 sm:pt-20">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
                            Magee's Schedule
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                            See upcoming holidays, pro-d days, and student events! 
                            Stay organized with our comprehensive school calendar.
                        </p>
                    </div>
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 w-full overflow-x-auto mx-auto max-w-none px-2 sm:px-4 md:px-8">
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
                                        className={`relative rounded-xl sm:rounded-2xl px-1 sm:px-2 pt-1 sm:pt-2 pb-2 sm:pb-3 min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] cursor-pointer transition-all duration-300 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/20 overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl hover:scale-105 ${isSelected ? 'ring-2 ring-red-500 shadow-red-500/25' : isToday ? 'ring-2 ring-red-400 shadow-red-400/25' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}`}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        <div className="text-right text-xs font-bold text-gray-700 dark:text-gray-200 pr-1">
                                            {date.getDate()}
                                        </div>
                                        <div className="flex flex-col gap-0.5 sm:gap-1 mt-1 flex-1">
                                            {events.slice(0, 1).map(e => (
                                                <div key={e.id} className={`truncate px-1 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs font-semibold flex items-center gap-1 ${eventPillClass(e.type)}`}> 
                                                    <span className="text-sm sm:text-base">{e.icon}</span>
                                                    <span className="hidden sm:inline">{e.title.length > 20 ? e.title.slice(0, 12) + '…' : e.title}</span>
                                                    <span className="sm:hidden">{e.title.length > 10 ? e.title.slice(0, 6) + '…' : e.title}</span>
                                                </div>
                                            ))}
                                            {events.length > 1 && (
                                                <div className="text-[8px] sm:text-[10px] text-gray-400 text-center">+{events.length - 1}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Enhanced Sidebar */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100/50 dark:border-gray-700/50 overflow-y-auto flex flex-col lg:w-[32rem]">
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
                                            <span className={`flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border text-center flex-shrink-0 ${badgeClass(e.type)}`}>
                                                {e.type === 'pro-d' ? 'Pro-D' : e.type === 'holiday' ? 'Holiday' : e.category || 'Event'}
                                            </span>
                                        </div>
                                        
                                        <div className="relative mb-3 sm:mb-4">
                                            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{e.description}</p>
                                        </div>
                                        
                                        {e.type === 'user-event' && (
                                            <div className="relative space-y-1 sm:space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                                {e.time && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-red-500">Time:</span>
                                                        <span>{formatTime(e.time)}</span>
                                                    </div>
                                                )}
                                                {e.location && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-red-500">Location:</span>
                                                        <span>{e.location}</span>
                                                    </div>
                                                )}
                                                {e.organizer && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-red-500">Organizer:</span>
                                                        <span>{e.organizer}</span>
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
                                    📅
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
        </>
    );
};

export default SchedulePage;