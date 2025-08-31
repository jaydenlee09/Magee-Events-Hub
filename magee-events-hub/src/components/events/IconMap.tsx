import React from "react";
import { 
  Calendar, 
  PartyPopper, 
  Trophy, 
  BookOpen, 
  Users, 
  Music, 
  Palette, 
  Pizza, 
  GraduationCap, 
  Building2 
} from "lucide-react";

/**
 * Icon mapping for club and event categories
 */
export const iconMap: Record<string, React.ReactNode> = {
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

/**
 * Gets an icon component based on the provided icon name
 * @param iconName The name of the icon to retrieve
 * @returns The corresponding icon component or Users icon as fallback
 */
export const getIconByName = (iconName?: string): React.ReactNode => {
  if (!iconName || !iconMap[iconName]) {
    return <Users />; // Default icon
  }
  return iconMap[iconName];
};
