export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  email?: string | null;
  is_verified?: boolean;
  whatsapp?: string | null;
  facebook?: string | null;
  photo_url: string | null;
  language: string;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  last_active: string;
  isAdmin?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  display_order: number;
  lessons_count?: number;
  pdfs_count?: number;
}

export interface Lesson {
  id: number;
  title: string;
  slug: string;
  category_id: number;
  category_name?: string;
  order_index?: number;
  prerequisite_text?: string | null;
  pdf_url?: string | null;
  description: string;
  content: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Band 7-9';
  video_url: string | null;
  thumbnail_url: string | null;
  status: 'published' | 'draft' | 'archived';
  views_count: number;
  created_at: string;
  updated_at: string;
  is_completed?: boolean;
  is_bookmarked?: boolean;
}

export interface PdfItem {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  google_drive_url: string;
  thumbnail_url: string | null;
  file_size_text: string;
  status: 'published' | 'draft';
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentItem {
  id: number;
  lesson_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  is_pinned: boolean;
  is_hidden: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_admin_author?: boolean;
  is_liked_by_me?: boolean;
  replies?: CommentItem[];
}

export interface SupportRequest {
  id: number;
  user_id: number;
  subject: string;
  status: 'Waiting' | 'Answered' | 'Closed';
  priority: 'Normal' | 'High';
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_telegram_id?: number;
  message_count?: number;
  last_message?: string;
}

export interface SupportMessage {
  id: number;
  request_id: number;
  sender_id: number;
  sender_role: 'user' | 'admin';
  message: string;
  created_at: string;
  sender_name?: string;
  sender_photo?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface ProgressStats {
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  bookmarks_count: number;
}

export interface PracticeExercise {
  id: number;
  question: string;
  question_bn?: string;
  type: 'mcq' | 'fill' | 'translation';
  options?: string[];
  correct_answer: string;
  explanation_bn: string;
  hint_bn?: string;
}

export interface RoadmapStep {
  id: number;
  step_number: number;
  title_bn: string;
  title_en: string;
  sequence_tag: string;
  level_tag: string;
  description_bn: string;
  video_url?: string | null;
  prerequisite_text?: string;
  key_points: string[];
  exercises: PracticeExercise[];
  is_completed?: boolean;
}

export interface PeerUser {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name?: string | null;
  username?: string | null;
  photo_url?: string | null;
  email?: string | null;
  is_verified?: boolean;
  whatsapp?: string | null;
  facebook?: string | null;
  bio?: string;
  target_band?: string;
  experience_level?: 'Beginner' | 'Intermediate' | 'Band 7.5+' | 'Band 8.5+ Mentor';
  is_mentor?: boolean;
  followers_count: number;
  is_followed_by_me: boolean;
  is_blocked_by_me?: boolean;
  chat_request_status?: 'none' | 'pending' | 'accepted' | 'rejected';
  chat_request_id?: number | null;
}

export interface ChatRequestItem {
  id: number;
  sender_id: number;
  receiver_id: number;
  initial_message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  other_user: {
    id: number;
    name: string;
    username?: string | null;
    photo_url?: string | null;
    level?: string;
  };
  is_incoming: boolean;
  last_message?: string;
}

export interface DirectChatMessage {
  id: number;
  chat_request_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_photo?: string;
}

