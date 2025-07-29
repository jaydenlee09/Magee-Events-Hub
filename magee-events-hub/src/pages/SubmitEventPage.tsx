import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Calendar, PartyPopper, Trophy, BookOpen, Users, Music, Palette, Pizza, GraduationCap, Building2, Send } from "lucide-react";
import PageFade from '../PageFade';

console.log("✅ db connected", db);

interface FormData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  timePeriod: string;
  location: string;
  organizer: string;
  targetAudience: string;
  email: string;
  notes: string;
  icon: string;
}

const iconOptions = [
  { name: "Calendar", icon: <Calendar /> },
  { name: "PartyPopper", icon: <PartyPopper /> },
  { name: "Trophy", icon: <Trophy /> },
  { name: "BookOpen", icon: <BookOpen /> },
  { name: "Users", icon: <Users /> },
  { name: "Music", icon: <Music /> },
  { name: "Palette", icon: <Palette /> },
  { name: "Pizza", icon: <Pizza /> },
  { name: "GraduationCap", icon: <GraduationCap /> },
  { name: "Building2", icon: <Building2 /> },
];



const SubmitEventPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    timePeriod: "AM",
    location: "",
    organizer: "",
    targetAudience: "",
    email: "",
    notes: "",
    icon: "Calendar"
  });
  const [customTargetAudience, setCustomTargetAudience] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleIconSelect = (iconName: string) => {
    setFormData({ ...formData, icon: iconName });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.date) newErrors.date = "Event date is required";
    if (!formData.time) newErrors.time = "Start time is required";
    else if (!/^(0[1-9]|1[0-2]):[0-5][0-9]$/.test(formData.time)) newErrors.time = "Enter time in hh:mm 12-hour format";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.organizer.trim()) newErrors.organizer = "Organizer name is required";
    
    // Check if date is in the past
    if (formData.date && new Date(formData.date) < new Date()) {
      newErrors.date = "Event date cannot be in the past";
    }
    
    // Email validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine time and timePeriod into 12-hour format
      const timeString = formData.time && formData.timePeriod ? `${formData.time} ${formData.timePeriod}` : "";
      
      await addDoc(collection(db, "pendingEvents"), {
        ...formData,
        time: timeString, // Override with combined time string
        submittedAt: new Date(),
      });
      setShowSuccessModal(true);
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        timePeriod: "AM",
        location: "",
        organizer: "",
        targetAudience: "",
        email: "",
        notes: "",
        icon: "Calendar"
      });
      setCustomTargetAudience("");
      setIsOtherSelected(false);
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      <PageFade />
      
      {/* Beautiful Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md">
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 animate-fadeIn border border-white/20 dark:border-gray-700/50">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg animate-bounce">
                ✓
              </div>
              
              {/* Success Message */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Event Submitted!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                Your event has been successfully submitted and will be reviewed by an administrator. You'll be notified once it's approved!
              </p>
              
              {/* Action Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-12 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-300 hover:from-emerald-500 hover:to-green-500 hover:shadow-green-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Great!
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 px-6 relative overflow-hidden ${
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
        
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Form Container */}
          <div className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
            {/* Enhanced Professional Header */}
            <div className="relative overflow-hidden">
              {/* Background matching card */}
              <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"></div>
              
              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[length:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]"></div>
              </div>
              
              {/* Content */}
              <div className="relative px-8 py-12 text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Send className="w-10 h-10 text-white" />
                </div>
                
                {/* Main Title */}
                <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white">
                Submit New Event
              </h2>
                
                {/* Subtitle */}
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Share your event with the Magee community
                </p>
                
                {/* Requirements Notice */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/30 rounded-2xl border border-red-200 dark:border-red-700 shadow-lg">
                  <span className="text-2xl">📝</span>
                  <span className="text-sm font-medium text-red-700 dark:text-red-200">All fields marked with * are required</span>
                </div>
              </div>
            </div>

            {/* Enhanced Form */}
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
              {/* Basic Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    1
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Basic Information
                  </h3>
                </div>
                
                {/* Enhanced Icon Picker */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Event Icon</label>
                  <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                    {iconOptions.map(opt => (
                      <button
                        type="button"
                        key={opt.name}
                        className={`group aspect-square w-16 h-16 p-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 hover:scale-105 flex items-center justify-center ${
                          formData.icon === opt.name 
                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 scale-110 shadow-lg' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        onClick={() => handleIconSelect(opt.name)}
                        aria-label={`Select icon ${opt.name}`}
                      >
                        <div className="text-2xl text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                          {opt.icon}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Event Title */}
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                        errors.title ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                      placeholder="Enter event title"
                    />
                    {errors.title && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.title}
                      </p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 resize-none ${
                        errors.description ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                      placeholder="Enter event description"
                    />
                    {errors.description && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 cursor-pointer font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                        errors.category ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <option value="">Select event category</option>
                      <option value="Academic">Academic</option>
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Social">Social</option>
                      <option value="Spirit Day">Spirit Day</option>
                      <option value="Club Event">Club Event</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.category && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.category}
                      </p>
                    )}
                  </div>
                  
                  {/* Target Audience */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Target Audience</label>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "Other") {
                          setIsOtherSelected(true);
                          setFormData({ ...formData, targetAudience: "Other" });
                        } else {
                          setIsOtherSelected(false);
                          setCustomTargetAudience("");
                          setFormData({ ...formData, targetAudience: value });
                        }
                      }}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 hover:border-red-300 focus:border-red-500 font-sans text-lg bg-white dark:bg-gray-800 cursor-pointer"
                    >
                      <option value="">Select target audience</option>
                      <option value="All students">All students</option>
                      <option value="Grade 12 only">Grade 12 only</option>
                      <option value="Grade 11 only">Grade 11 only</option>
                      <option value="Grade 10 only">Grade 10 only</option>
                      <option value="Grade 9 only">Grade 9 only</option>
                      <option value="Club members only">Club members only</option>
                      <option value="Other">Other (specify below)</option>
                    </select>
                    {isOtherSelected && (
                      <input
                        type="text"
                        value={customTargetAudience}
                        onChange={(e) => {
                          setCustomTargetAudience(e.target.value);
                          setFormData({ ...formData, targetAudience: e.target.value });
                        }}
                        className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 hover:border-red-300 focus:border-red-500 font-sans text-lg bg-white dark:bg-gray-800 mt-3"
                        placeholder="Specify target audience"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    2
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Date & Time
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Event Date */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                        errors.date ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.date}
                      </p>
                    )}
                  </div>
                  
                  {/* Start Time */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Start Time *</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        name="time"
                        value={formData.time}
                        onChange={e => {
                          // Only allow numbers and colon, max length 5 (hh:mm)
                          const val = e.target.value.replace(/[^0-9:]/g, '').slice(0, 5);
                          setFormData({ ...formData, time: val });
                        }}
                        placeholder="hh:mm"
                        className={`w-2/3 px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                          errors.time ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                        }`}
                        pattern="^(0[1-9]|1[0-2]):[0-5][0-9]$"
                        autoComplete="off"
                      />
                      <div className="flex gap-2">
                        {['AM', 'PM'].map(period => (
                          <button
                            type="button"
                            key={period}
                            className={`px-6 py-4 rounded-2xl font-bold border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 ${
                              formData.timePeriod === period 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg' 
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            onClick={() => setFormData({ ...formData, timePeriod: period })}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    {errors.time && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.time}
                      </p>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                        errors.location ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                      placeholder="Enter event location"
                    />
                    {errors.location && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.location}
                      </p>
                    )}
                  </div>
                  
                  {/* Organizer */}
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Organizer *</label>
                    <input
                      type="text"
                      name="organizer"
                      value={formData.organizer}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                        errors.organizer ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                      placeholder="Enter organizer name"
                    />
                    {errors.organizer && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.organizer}
                      </p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                        errors.email ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                      placeholder="Enter organizer email"
                    />
                    {errors.email && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 resize-none ${
                        errors.notes ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                      placeholder="Enter any additional notes"
                    />
                    {errors.notes && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {errors.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <div className="pt-10 border-t-2 border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-6 px-8 rounded-2xl text-xl font-bold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200 font-sans shadow-2xl ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/30 hover:shadow-red-400/40'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Send className="w-6 h-6" />
                      Submit Event for Review
                    </span>
                  )}
                </button>
              </div>


            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitEventPage;