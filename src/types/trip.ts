export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  image: string;
  costIndex: 'Budget' | 'Mid-Range' | 'Luxury';
}

export interface TripStop {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  days: number;
  orderIndex: number;
}

export interface Activity {
  id: string;
  cityName: string;
  name: string;
  description: string;
  category: 'Sightseeing' | 'Food' | 'Adventure' | 'Culture' | 'Shopping' | 'Nature' | 'Entertainment' | 'History' | 'Transport';
  durationHours: number;
  estimatedCost: number;
  image?: string;
  timeSlot?: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  estimatedCost: number;
  coverImage: string;
  status: 'Upcoming' | 'Completed' | 'Draft';
  stops: TripStop[];
  activities: Activity[];
}

export interface Expense {
  id: string;
  category: 'Transport' | 'Accommodation' | 'Activities' | 'Food' | 'Miscellaneous';
  amount: number;
  description: string;
  date: string;
  status: 'Verified' | 'Estimated';
}
