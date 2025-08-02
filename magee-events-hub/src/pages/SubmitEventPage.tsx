import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Calendar, PartyPopper, Trophy, BookOpen, Users, Music, Palette, Pizza, GraduationCap, Building2, Send, Handshake, Tv2, CheckCircle, AlertCircle, Clock, MapPin, User, Mail, FileText } from "lucide-react";
import PageFade from '../PageFade';

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
  { name: "Handshake", icon: <Handshake /> },
  { name: "Tv2", icon: <Tv2 /> },
];

const categoryOptions = [
  { value: "Academic", label: "Academic", icon: "📚", color: "from-blue-500 to-blue-600", glowColor: "blue" },
  { value: "Sports", label: "Sports", icon: "⚽", color: "from-green-500 to-green-600", glowColor: "green" },
  { value: "Cultural", label: "Cultural", icon: "🎭", color: "from-purple-500 to-purple-600", glowColor: "purple" },
  { value: "Social", label: "Social", icon: "🎉", color: "from-pink-500 to-pink-600", glowColor: "pink" },
  { value: "Spirit Day", label: "Spirit Day", icon: "🎨", color: "from-orange-500 to-orange-600", glowColor: "orange" },
  { value: "Club Event", label: "Club Event", icon: "🏛️", color: "from-indigo-500 to-indigo-600", glowColor: "indigo" },
  { value: "Other", label: "Other", icon: "✨", color: "from-gray-500 to-gray-600", glowColor: "gray" },
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
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    
    if (formData.date && new Date(formData.date) < new Date()) {
      newErrors.date = "Event date cannot be in the past";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit button clicked!");
    console.log("Form data:", formData);
    console.log("Step validation:", getStepValidation(3));
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const timeString = formData.time && formData.timePeriod ? `${formData.time} ${formData.timePeriod}` : "";
      
      await addDoc(collection(db, "pendingEvents"), {
        ...formData,
        time: timeString,
        submittedAt: new Date(),
      });
      setShowSuccessModal(true);
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
      setCurrentStep(1);
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getProgressPercentage = () => {
    return (currentStep / 3) * 100;
  };

  const getStepValidation = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.category && formData.icon;
      case 2:
        return formData.date && formData.time && formData.location.trim();
      case 3:
        return formData.organizer.trim();
      default:
        return false;
    }
  };

  return (
    <>
      <PageFade />
      
      {/* Modern Success Modal with Confetti */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4">
          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${
                    ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500'][Math.floor(Math.random() * 8)]
                  }`}
                />
              </div>
            ))}
          </div>
          
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scaleIn border border-white/20 dark:border-gray-700/50">
            <div className="text-center">
              {/* Success Icon with Pulse Animation */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-5xl mx-auto mb-6 shadow-2xl animate-pulse">
                <CheckCircle className="w-12 h-12" />
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 animate-ping opacity-20"></div>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-slideInUp">
                Event Submitted!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8 animate-slideInUp" style={{animationDelay: '0.2s'}}>
                Your event has been successfully submitted and will be reviewed by an administrator. You'll be notified once it's approved!
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-12 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-300 hover:from-emerald-500 hover:to-green-500 hover:shadow-green-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 animate-slideInUp"
                style={{animationDelay: '0.4s'}}
              >
                Great!
              </button>
            </div>
          </div>
        </div>
      )}
      
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
        
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-8 sm:mb-12 pt-16 sm:pt-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
              Submit New Event
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
              Share your event with the Magee community and help create amazing experiences for everyone!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                    currentStep >= step 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {getStepValidation(step) ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-4 sm:w-8 md:w-16 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  )}
                </div>
              ))}
              </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-1 sm:h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Enhanced Form Container */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 lg:p-12">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h2>
                    <p className="text-gray-600 dark:text-gray-300">Let's start with the essentials</p>
                </div>
                
                  {/* Icon Selection */}
                <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Choose Event Icon</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4 max-w-2xl mx-auto">
                    {iconOptions.map(opt => (
                      <button
                        type="button"
                        key={opt.name}
                          className={`group aspect-square w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 hover:scale-110 flex items-center justify-center ${
                          formData.icon === opt.name 
                              ? 'border-red-500 bg-gradient-to-br from-red-500 to-red-600 text-white scale-110 shadow-xl' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        onClick={() => handleIconSelect(opt.name)}
                        >
                          <div className={`text-lg sm:text-xl md:text-2xl transition-colors duration-300 ${
                            formData.icon === opt.name 
                              ? 'text-white group-hover:text-white' 
                              : 'text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                          }`}>
                          {opt.icon}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                  {/* Title */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Event Title *</label>
                    <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                        className={`w-full px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-base sm:text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                        errors.title ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                        placeholder="Enter a catchy event title"
                    />
                    {errors.title && (
                        <div className="flex items-center gap-2 mt-3 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{errors.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Description *</label>
                    <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                        className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 resize-none ${
                        errors.description ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                        placeholder="Describe your event in detail..."
                    />
                    {errors.description && (
                        <div className="flex items-center gap-2 mt-3 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{errors.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Category *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      {categoryOptions.map(cat => (
                        <button
                          type="button"
                          key={cat.value}
                          className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none hover:scale-105 flex items-center gap-1 sm:gap-2 md:gap-3 ${
                            formData.category === cat.value 
                              ? `bg-gradient-to-br ${cat.color} text-white shadow-lg border-${cat.glowColor}-300 dark:border-white` 
                              : `bg-gradient-to-br ${cat.color} text-white hover:shadow-lg hover:shadow-${cat.glowColor}-500/50 hover:border-${cat.glowColor}-300 dark:hover:border-white border-transparent`
                          }`}
                          onClick={() => setFormData({ ...formData, category: cat.value })}
                        >
                          <span className="text-lg sm:text-xl md:text-2xl">{cat.icon}</span>
                          <span className="font-semibold text-xs sm:text-sm md:text-base text-white">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                    {errors.category && (
                      <div className="flex items-center gap-2 mt-3 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{errors.category}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!getStepValidation(1)}
                      className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">When & Where</h2>
                    <p className="text-gray-600 dark:text-gray-300">Set the date, time, and location</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:dark:invert ${
                            errors.date ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                        />
                      </div>
                      {errors.date && (
                        <div className="flex items-center gap-2 mt-3 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{errors.date}</span>
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Start Time *</label>
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <div className="relative flex-1">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="time"
                            value={formData.time}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9:]/g, '').slice(0, 5);
                              setFormData({ ...formData, time: val });
                            }}
                            placeholder="hh:mm"
                            className={`w-full pl-12 pr-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                              errors.time ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                            }`}
                            pattern="^(0[1-9]|1[0-2]):[0-5][0-9]$"
                            autoComplete="off"
                          />
                        </div>
                        <div className="flex gap-1">
                          {['AM', 'PM'].map(period => (
                            <button
                              type="button"
                              key={period}
                              className={`px-4 py-4 rounded-2xl font-bold border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 text-base sm:text-lg min-w-[3rem] ${
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
                        <div className="flex items-center gap-2 mt-3 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{errors.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-5 h-5" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                            errors.location ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                          placeholder="Where will this event take place?"
                        />
                      </div>
                      {errors.location && (
                        <div className="flex items-center gap-2 mt-3 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{errors.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!getStepValidation(2)}
                      className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Organizer Details */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Final Details</h2>
                    <p className="text-gray-600 dark:text-gray-300">Tell us the final details of your event</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organizer */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Organizer Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="organizer"
                          value={formData.organizer}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                            errors.organizer ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                          placeholder="Your name"
                        />
                      </div>
                      {errors.organizer && (
                        <div className="flex items-center gap-2 mt-3 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{errors.organizer}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 ${
                            errors.email ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      {errors.email && (
                        <div className="flex items-center gap-2 mt-3 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{errors.email}</span>
                        </div>
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
                      <option value="Grade 8 only">Grade 8 only</option>
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
                  
                  {/* Notes */}
                  <div className="md:col-span-2">
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Additional Notes</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                          className="w-full pl-12 pr-6 py-4 border-2 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-sans text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 focus:border-red-500 resize-none"
                          placeholder="Any additional information about your event..."
                        />
                  </div>
                </div>
              </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      Previous
                    </button>
                <button
                  type="submit"
                      disabled={isSubmitting || !getStepValidation(3)}
                      className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                          Submit Event
                        </>
                  )}
                </button>
              </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitEventPage;