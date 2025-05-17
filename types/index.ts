// User types
export interface User {
  id: string; // Supabase auth.users.id
  email: string | null;
  phone?: string | null;
  created_at?: string;
  // Add other fields from Supabase auth.users if needed
}

// Profile types
export interface Profile {
  prof_id: string;
  username: string;
  name: string;
  address: string | null;
  photo: string | null;
  bio: string | null;
  user_id: string;
  user?: User; // For joined queries
}

// Friend types
export interface Friend {
  friend_id: string;
  created_at: string;
  prof_id: string;
  friend_prof_id: string;
  profile?: Profile; // For joined queries - the friend's profile
  friend_profile?: Profile; // For joined queries - the friend's profile
}

// Friend Request types
export interface FriendRequest {
  friend_req_id: string;
  created_at: string;
  requester_id: string;
  requested_id: string;
  requester?: Profile; // For joined queries
  requested?: Profile; // For joined queries
}

// Event types
export interface Event {
  event_id: string;
  name: string;
  description: string;
  date_start: string | number; // Timestamp (ISO string or Unix)
  date_end: string | number;   // Timestamp (ISO string or Unix)
  time: string;
  address: string;
  picture: string | null;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  rating: number | null;
  hoster_id: string;
  hoster?: Profile; // For joined queries
}

// Attend types
export interface Attend {
  prof_id: string;
  event_id: string;
  date_joined: string;
  status: 'going' | 'maybe' | 'not_going';
  profile?: Profile; // For joined queries
  event?: Event; // For joined queries
}

// Notification types
export interface Notification {
  notif_id: string;
  title: string;
  date: string;
  content: string;
  event_id: string | null;
  prof_id: string;
  type: string;
  read: boolean; // <-- Add this line
  event?: Event; // For joined queries
  profile?: Profile; // For joined queries
}

// Message types
export interface Message {
  message_id: string;
  message: string;
  created_at: string;
  sender_id: string;
  friend_id: string;
  event_id: string | null;
  sender?: Profile; // For joined queries
  event?: Event; // For joined queries
}

// Poll types
export interface Poll {
  poll_id: string;
  question: string;
  date_joined: string;
  status: 'active' | 'closed';
  final: boolean;
  event_id: string;
  event?: Event; // For joined queries
  answers?: Answer[]; // For joined queries
}

// Answer types
export interface Answer {
  answer_id: string;
  answer: string;
  poll_id: string;
  poll?: Poll; // For joined queries
  voters?: Voter[]; // For joined queries
  vote_count?: number; // For aggregated queries
}

// Voter types
export interface Voter {
  voter_id: string;
  answer_id: string;
  profile_id?: string; // This might be needed to track who voted
  answer?: Answer; // For joined queries
  profile?: Profile; // For joined queries
}

// Expense types
export interface Expense {
  exp_id: string;
  title: string;
  price: number;
  description: string | null;
  event_id: string;
  event?: Event; // For joined queries
}

// Response types for controllers
export interface ApiResponse<T> {
  data: T | null;
  error: any;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard data type
export interface DashboardData {
  upcomingEvents: Event[];
  friendCount: number;
  notifications: Notification[];
  profile: Profile | null;
}

// Search results type
export interface SearchResults {
  profiles: Profile[];
  events: Event[];
  messages: Message[];
}

// Auth state type
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

// Real-time subscription callbacks
export interface RealtimeCallbacks {
  onNotification?: (notification: Notification) => void;
  onFriendRequest?: (request: FriendRequest) => void;
  onEventUpdate?: (event: Event) => void;
  onMessage?: (message: Message) => void;
}