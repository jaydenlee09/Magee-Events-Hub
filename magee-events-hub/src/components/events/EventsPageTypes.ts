// Event and Club related types

export interface EventData {
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
  // Added fields used in EventModal but not previously defined
  contactEmail?: string;
  audience?: string;  // Alternative to targetAudience
  additionalInfo?: string; // For extra information about the event
  email?: string;      // From submission form
  notes?: string;      // From submission form, can be used as additionalInfo
}

export interface ClubData {
  id: string;
  name: string;
  description: string;
  category: string;
  meetingDays?: string;
  meetingTime?: string;
  location?: string;
  sponsor?: string;
  icon?: string;
  members?: number;
  leaderEmail?: string;
  imageUrl?: string;
}

export type ViewType = 'events' | 'clubs';
