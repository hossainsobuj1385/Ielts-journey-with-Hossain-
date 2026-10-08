import { getLocalStore, persistStore, isDbUsingFallback, query, execute } from '../database/db';
import { isTelegramIdAdmin } from '../utils/telegramAuth';

export interface UserRecord {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  language: string;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  last_active: string;
  email?: string | null;
  is_verified?: boolean;
  whatsapp?: string | null;
  facebook?: string | null;
  bio?: string;
  target_band?: string;
  experience_level?: string;
  is_mentor?: boolean;
  isAdmin?: boolean;
}

export interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  display_order: number;
  lessons_count?: number;
  pdfs_count?: number;
}

export interface LessonRecord {
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

export interface PdfRecord {
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

export interface CommentRecord {
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
  replies?: CommentRecord[];
}

export interface SupportRequestRecord {
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

export interface SupportMessageRecord {
  id: number;
  request_id: number;
  sender_id: number;
  sender_role: 'user' | 'admin';
  message: string;
  created_at: string;
  sender_name?: string;
  sender_photo?: string;
}

export interface NotificationRecord {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

// ==================== USER SERVICE ====================

export async function findOrCreateUser(userData: {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language?: string;
}): Promise<UserRecord> {
  const store = getLocalStore();
  const existingIndex = store.users.findIndex(u => u.telegram_id === userData.telegram_id);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = store.users[existingIndex];
    existing.first_name = userData.first_name || existing.first_name;
    existing.last_name = userData.last_name !== undefined ? userData.last_name : existing.last_name;
    existing.username = userData.username !== undefined ? userData.username : existing.username;
    existing.photo_url = userData.photo_url || existing.photo_url;
    existing.last_active = now;
    persistStore();
    return {
      ...existing,
      isAdmin: isTelegramIdAdmin(existing.telegram_id)
    };
  }

  // Create new user
  store.counters.users = (store.counters.users || 0) + 1;
  const newUser: UserRecord = {
    id: store.counters.users,
    telegram_id: userData.telegram_id,
    username: userData.username || null,
    first_name: userData.first_name,
    last_name: userData.last_name || null,
    photo_url: userData.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    language: userData.language || 'en',
    status: 'active',
    created_at: now,
    last_active: now
  };

  store.users.push(newUser);

  // Send a welcome notification
  store.counters.notifications = (store.counters.notifications || 0) + 1;
  store.notifications.push({
    id: store.counters.notifications,
    user_id: newUser.id,
    title: 'Welcome to IELTS Journey with Hossain! 🎯',
    message: 'Start learning by checking out our core grammar and vocabulary lessons, or download Cambridge practice materials from the PDF library.',
    type: 'Admin Announcement',
    is_read: 0,
    link_url: '/lessons',
    created_at: now
  });

  persistStore();

  return {
    ...newUser,
    isAdmin: isTelegramIdAdmin(newUser.telegram_id)
  };
}

export async function getUserById(userId: number): Promise<UserRecord | null> {
  const store = getLocalStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) return null;
  return {
    ...user,
    isAdmin: isTelegramIdAdmin(user.telegram_id)
  };
}

export async function getUserByTelegramId(telegramId: number): Promise<UserRecord | null> {
  const store = getLocalStore();
  const user = store.users.find(u => u.telegram_id === telegramId);
  if (!user) return null;
  return {
    ...user,
    isAdmin: isTelegramIdAdmin(user.telegram_id)
  };
}

// ==================== CATEGORIES SERVICE ====================

export async function getCategories(): Promise<CategoryRecord[]> {
  const store = getLocalStore();
  return store.categories
    .sort((a, b) => a.display_order - b.display_order)
    .map(c => {
      const lessonsCount = store.lessons.filter(l => l.category_id === c.id && l.status === 'published').length;
      const pdfsCount = store.pdfs.filter(p => p.category_id === c.id && p.status === 'published').length;
      return {
        ...c,
        lessons_count: lessonsCount,
        pdfs_count: pdfsCount
      };
    });
}

export async function createCategory(data: { name: string; slug: string; description?: string; icon?: string; display_order?: number }): Promise<CategoryRecord> {
  const store = getLocalStore();
  store.counters.categories = (store.counters.categories || 0) + 1;
  const newCat: CategoryRecord = {
    id: store.counters.categories,
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description || '',
    icon: data.icon || 'book-open',
    display_order: data.display_order ?? (store.categories.length + 1)
  };
  store.categories.push(newCat);
  persistStore();
  return newCat;
}

export async function updateCategory(id: number, data: Partial<CategoryRecord>): Promise<CategoryRecord | null> {
  const store = getLocalStore();
  const cat = store.categories.find(c => c.id === id);
  if (!cat) return null;
  Object.assign(cat, data);
  persistStore();
  return cat;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const store = getLocalStore();
  const initialLength = store.categories.length;
  store.categories = store.categories.filter(c => c.id !== id);
  if (store.categories.length !== initialLength) {
    persistStore();
    return true;
  }
  return false;
}

// ==================== LESSONS SERVICE ====================

export async function getLessons(options: {
  categoryId?: number;
  level?: string;
  search?: string;
  status?: string;
  userId?: number;
}): Promise<LessonRecord[]> {
  const store = getLocalStore();
  let filtered = store.lessons.filter(l => {
    if (options.status && l.status !== options.status) return false;
    if (!options.status && l.status !== 'published') return false;
    if (options.categoryId && l.category_id !== options.categoryId) return false;
    if (options.level && options.level !== 'all' && l.level !== options.level) return false;
    if (options.search) {
      const q = options.search.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchDesc = l.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  filtered.sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));

  return filtered.map(l => {
    const category = store.categories.find(c => c.id === l.category_id);
    const isCompleted = options.userId
      ? !!store.user_progress.find(p => p.user_id === options.userId && p.lesson_id === l.id && p.is_completed)
      : false;
    const isBookmarked = options.userId
      ? !!store.bookmarks.find(b => b.user_id === options.userId && b.lesson_id === l.id)
      : false;

    return {
      ...l,
      category_name: category ? category.name : 'General',
      is_completed: isCompleted,
      is_bookmarked: isBookmarked
    };
  });
}

export async function getLessonById(id: number, userId?: number): Promise<LessonRecord | null> {
  const store = getLocalStore();
  const lesson = store.lessons.find(l => l.id === id);
  if (!lesson) return null;

  // Increment views
  lesson.views_count = (lesson.views_count || 0) + 1;

  // Track progress (last opened)
  if (userId) {
    const existingProgress = store.user_progress.find(p => p.user_id === userId && p.lesson_id === id);
    const now = new Date().toISOString();
    if (existingProgress) {
      existingProgress.last_opened_at = now;
    } else {
      store.counters.user_progress = (store.counters.user_progress || 0) + 1;
      store.user_progress.push({
        id: store.counters.user_progress,
        user_id: userId,
        lesson_id: id,
        is_completed: 0,
        last_opened_at: now,
        completed_at: null,
        created_at: now
      });
    }
  }

  persistStore();

  const category = store.categories.find(c => c.id === lesson.category_id);
  const isCompleted = userId
    ? !!store.user_progress.find(p => p.user_id === userId && p.lesson_id === lesson.id && p.is_completed)
    : false;
  const isBookmarked = userId
    ? !!store.bookmarks.find(b => b.user_id === userId && b.lesson_id === lesson.id)
    : false;

  return {
    ...lesson,
    category_name: category ? category.name : 'General',
    is_completed: isCompleted,
    is_bookmarked: isBookmarked
  };
}

export async function createLesson(data: {
  title: string;
  category_id: number;
  description: string;
  content: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Band 7-9';
  order_index?: number;
  prerequisite_text?: string | null;
  pdf_url?: string | null;
  video_url?: string;
  thumbnail_url?: string;
  status?: 'published' | 'draft' | 'archived';
}): Promise<LessonRecord> {
  const store = getLocalStore();
  store.counters.lessons = (store.counters.lessons || 0) + 1;
  const now = new Date().toISOString();
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

  const catLessons = store.lessons.filter(l => l.category_id === Number(data.category_id));
  const maxOrder = catLessons.reduce((max, l) => Math.max(max, l.order_index || 0), 0);
  const orderIndex = (data.order_index !== undefined && !isNaN(Number(data.order_index)))
    ? Number(data.order_index)
    : maxOrder + 1;

  const newLesson: LessonRecord = {
    id: store.counters.lessons,
    title: data.title,
    slug,
    category_id: Number(data.category_id),
    order_index: orderIndex,
    prerequisite_text: data.prerequisite_text || null,
    pdf_url: data.pdf_url || null,
    description: data.description,
    content: data.content,
    level: data.level,
    video_url: data.video_url || null,
    thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    status: data.status || 'published',
    views_count: 0,
    created_at: now,
    updated_at: now
  };

  store.lessons.push(newLesson);

  // If published, notify users
  if (newLesson.status === 'published') {
    for (const u of store.users) {
      store.counters.notifications = (store.counters.notifications || 0) + 1;
      store.notifications.push({
        id: store.counters.notifications,
        user_id: u.id,
        title: `New Lesson: ${newLesson.title}`,
        message: `Instructor Hossain has just published a new sequential lesson for Step ${orderIndex}. Check it out now!`,
        type: 'New Lesson',
        is_read: 0,
        link_url: `/lessons/${newLesson.id}`,
        created_at: now
      });
    }
  }

  persistStore();
  return newLesson;
}

export async function reorderCategoryLessons(categoryId: number, lessonIds: number[]): Promise<LessonRecord[]> {
  const store = getLocalStore();
  lessonIds.forEach((id, idx) => {
    const l = store.lessons.find(lesson => lesson.id === id && lesson.category_id === categoryId);
    if (l) {
      l.order_index = idx + 1;
      l.updated_at = new Date().toISOString();
    }
  });
  persistStore();
  return store.lessons.filter(l => l.category_id === categoryId).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
}

export async function updateLesson(id: number, data: Partial<LessonRecord>): Promise<LessonRecord | null> {
  const store = getLocalStore();
  const lesson = store.lessons.find(l => l.id === id);
  if (!lesson) return null;
  Object.assign(lesson, data, { updated_at: new Date().toISOString() });
  persistStore();
  return lesson;
}

export async function deleteLesson(id: number): Promise<boolean> {
  const store = getLocalStore();
  const prevLen = store.lessons.length;
  store.lessons = store.lessons.filter(l => l.id !== id);
  if (store.lessons.length !== prevLen) {
    store.comments = store.comments.filter(c => c.lesson_id !== id);
    store.user_progress = store.user_progress.filter(p => p.lesson_id !== id);
    store.bookmarks = store.bookmarks.filter(b => b.lesson_id !== id);
    persistStore();
    return true;
  }
  return false;
}

// ==================== PROGRESS & BOOKMARKS ====================

export async function toggleLessonComplete(userId: number, lessonId: number): Promise<{ is_completed: boolean }> {
  const store = getLocalStore();
  let progress = store.user_progress.find(p => p.user_id === userId && p.lesson_id === lessonId);
  const now = new Date().toISOString();

  if (!progress) {
    store.counters.user_progress = (store.counters.user_progress || 0) + 1;
    progress = {
      id: store.counters.user_progress,
      user_id: userId,
      lesson_id: lessonId,
      is_completed: 1,
      last_opened_at: now,
      completed_at: now,
      created_at: now
    };
    store.user_progress.push(progress);
    persistStore();
    return { is_completed: true };
  }

  const newStatus = progress.is_completed ? 0 : 1;
  progress.is_completed = newStatus;
  progress.completed_at = newStatus ? now : null;
  persistStore();
  return { is_completed: newStatus === 1 };
}

export async function toggleBookmark(userId: number, lessonId: number): Promise<{ is_bookmarked: boolean }> {
  const store = getLocalStore();
  const index = store.bookmarks.findIndex(b => b.user_id === userId && b.lesson_id === lessonId);

  if (index >= 0) {
    store.bookmarks.splice(index, 1);
    persistStore();
    return { is_bookmarked: false };
  }

  store.counters.bookmarks = (store.counters.bookmarks || 0) + 1;
  store.bookmarks.push({
    id: store.counters.bookmarks,
    user_id: userId,
    lesson_id: lessonId,
    created_at: new Date().toISOString()
  });
  persistStore();
  return { is_bookmarked: true };
}

export async function getUserProgressStats(userId: number) {
  const store = getLocalStore();
  const totalPublishedLessons = store.lessons.filter(l => l.status === 'published').length;
  const completedList = store.user_progress.filter(p => p.user_id === userId && p.is_completed);
  const completedCount = completedList.length;
  const percentage = totalPublishedLessons > 0 ? Math.round((completedCount / totalPublishedLessons) * 100) : 0;
  const bookmarksCount = store.bookmarks.filter(b => b.user_id === userId).length;

  return {
    total_lessons: totalPublishedLessons,
    completed_lessons: completedCount,
    progress_percentage: Math.min(percentage, 100),
    bookmarks_count: bookmarksCount
  };
}

export async function getUserBookmarks(userId: number): Promise<LessonRecord[]> {
  const store = getLocalStore();
  const bookmarkLessonIds = store.bookmarks.filter(b => b.user_id === userId).map(b => b.lesson_id);
  return getLessons({ userId }).then(all => all.filter(l => bookmarkLessonIds.includes(l.id)));
}

// ==================== PDF LIBRARY SERVICE ====================

export async function getPdfs(options: { categoryId?: number; search?: string; status?: string }): Promise<PdfRecord[]> {
  const store = getLocalStore();
  return store.pdfs
    .filter(p => {
      if (options.status && p.status !== options.status) return false;
      if (!options.status && p.status !== 'published') return false;
      if (options.categoryId && p.category_id !== options.categoryId) return false;
      if (options.search) {
        const q = options.search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    })
    .map(p => {
      const category = store.categories.find(c => c.id === p.category_id);
      return {
        ...p,
        category_name: category ? category.name : 'General'
      };
    });
}

export async function recordPdfDownload(id: number): Promise<void> {
  const store = getLocalStore();
  const pdf = store.pdfs.find(p => p.id === id);
  if (pdf) {
    pdf.downloads_count = (pdf.downloads_count || 0) + 1;
    persistStore();
  }
}

export async function createPdf(data: {
  title: string;
  description: string;
  category_id: number;
  google_drive_url: string;
  thumbnail_url?: string;
  file_size_text?: string;
  status?: 'published' | 'draft';
}): Promise<PdfRecord> {
  const store = getLocalStore();
  store.counters.pdfs = (store.counters.pdfs || 0) + 1;
  const now = new Date().toISOString();

  const newPdf: PdfRecord = {
    id: store.counters.pdfs,
    title: data.title,
    description: data.description,
    category_id: Number(data.category_id),
    google_drive_url: data.google_drive_url,
    thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    file_size_text: data.file_size_text || 'PDF Guide',
    status: data.status || 'published',
    downloads_count: 0,
    created_at: now,
    updated_at: now
  };

  store.pdfs.push(newPdf);

  // Send notification if published
  if (newPdf.status === 'published') {
    for (const u of store.users) {
      store.counters.notifications = (store.counters.notifications || 0) + 1;
      store.notifications.push({
        id: store.counters.notifications,
        user_id: u.id,
        title: `New Study Material: ${newPdf.title}`,
        message: 'A brand-new Cambridge/IELTS PDF guide has been added to the PDF library. Access it directly via Google Drive!',
        type: 'New PDF',
        is_read: 0,
        link_url: '/pdfs',
        created_at: now
      });
    }
  }

  persistStore();
  return newPdf;
}

export async function updatePdf(id: number, data: Partial<PdfRecord>): Promise<PdfRecord | null> {
  const store = getLocalStore();
  const pdf = store.pdfs.find(p => p.id === id);
  if (!pdf) return null;
  Object.assign(pdf, data, { updated_at: new Date().toISOString() });
  persistStore();
  return pdf;
}

export async function deletePdf(id: number): Promise<boolean> {
  const store = getLocalStore();
  const prevLen = store.pdfs.length;
  store.pdfs = store.pdfs.filter(p => p.id !== id);
  if (store.pdfs.length !== prevLen) {
    persistStore();
    return true;
  }
  return false;
}

// ==================== COMMENTS & COMMUNITY ====================

export async function getLessonComments(lessonId: number, currentUserId?: number): Promise<CommentRecord[]> {
  const store = getLocalStore();
  const lessonComments = store.comments.filter(c => c.lesson_id === lessonId && !c.is_hidden);

  const enriched: CommentRecord[] = lessonComments.map(c => {
    const author = store.users.find(u => u.id === c.user_id);
    const isLiked = currentUserId
      ? !!store.comment_likes.find(l => l.comment_id === c.id && l.user_id === currentUserId)
      : false;
    const isAdmin = author ? isTelegramIdAdmin(author.telegram_id) : false;

    return {
      ...c,
      first_name: author ? author.first_name : 'Student',
      last_name: author ? author.last_name || '' : '',
      username: author ? author.username || '' : '',
      photo_url: author?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      is_admin_author: isAdmin,
      is_liked_by_me: isLiked,
      replies: []
    };
  });

  // Group top-level and replies
  const topLevel: CommentRecord[] = [];
  const repliesMap = new Map<number, CommentRecord[]>();

  for (const c of enriched) {
    if (c.parent_id) {
      const existing = repliesMap.get(c.parent_id) || [];
      existing.push(c);
      repliesMap.set(c.parent_id, existing);
    } else {
      topLevel.push(c);
    }
  }

  for (const t of topLevel) {
    t.replies = repliesMap.get(t.id) || [];
  }

  // Pinned comments first, then descending
  return topLevel.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function addComment(data: {
  lesson_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
}): Promise<CommentRecord> {
  const store = getLocalStore();
  store.counters.comments = (store.counters.comments || 0) + 1;
  const now = new Date().toISOString();

  const newComment = {
    id: store.counters.comments,
    lesson_id: Number(data.lesson_id),
    user_id: Number(data.user_id),
    parent_id: data.parent_id ? Number(data.parent_id) : null,
    content: data.content.trim(),
    is_pinned: 0,
    is_hidden: 0,
    likes_count: 0,
    created_at: now,
    updated_at: now
  };

  store.comments.push(newComment);
  persistStore();

  const author = store.users.find(u => u.id === data.user_id);
  return {
    ...newComment,
    is_pinned: false,
    is_hidden: false,
    first_name: author ? author.first_name : 'Student',
    last_name: author ? author.last_name || '' : '',
    username: author ? author.username || '' : '',
    photo_url: author?.photo_url || '',
    is_admin_author: author ? isTelegramIdAdmin(author.telegram_id) : false,
    is_liked_by_me: false,
    replies: []
  };
}

export async function editComment(commentId: number, userId: number, content: string): Promise<boolean> {
  const store = getLocalStore();
  const comment = store.comments.find(c => c.id === commentId);
  if (!comment || comment.user_id !== userId) return false;
  comment.content = content.trim();
  comment.updated_at = new Date().toISOString();
  persistStore();
  return true;
}

export async function deleteComment(commentId: number, userId: number, isAdminUser: boolean = false): Promise<boolean> {
  const store = getLocalStore();
  const comment = store.comments.find(c => c.id === commentId);
  if (!comment) return false;
  if (!isAdminUser && comment.user_id !== userId) return false;

  store.comments = store.comments.filter(c => c.id !== commentId && c.parent_id !== commentId);
  store.comment_likes = store.comment_likes.filter(l => l.comment_id !== commentId);
  persistStore();
  return true;
}

export async function toggleCommentLike(commentId: number, userId: number): Promise<{ is_liked: boolean; likes_count: number }> {
  const store = getLocalStore();
  const comment = store.comments.find(c => c.id === commentId);
  if (!comment) return { is_liked: false, likes_count: 0 };

  const likeIndex = store.comment_likes.findIndex(l => l.comment_id === commentId && l.user_id === userId);
  let isLiked = false;

  if (likeIndex >= 0) {
    store.comment_likes.splice(likeIndex, 1);
    comment.likes_count = Math.max(0, (comment.likes_count || 1) - 1);
    isLiked = false;
  } else {
    store.counters.comment_likes = (store.counters.comment_likes || 0) + 1;
    store.comment_likes.push({
      id: store.counters.comment_likes,
      comment_id: commentId,
      user_id: userId,
      created_at: new Date().toISOString()
    });
    comment.likes_count = (comment.likes_count || 0) + 1;
    isLiked = true;
  }

  persistStore();
  return { is_liked: isLiked, likes_count: comment.likes_count };
}

export async function reportComment(commentId: number, userId: number, reason: string): Promise<boolean> {
  const store = getLocalStore();
  store.counters.reports = (store.counters.reports || 0) + 1;
  store.reports.push({
    id: store.counters.reports,
    comment_id: commentId,
    user_id: userId,
    reason: reason || 'Inappropriate content',
    status: 'pending',
    created_at: new Date().toISOString()
  });
  persistStore();
  return true;
}

export async function getCommunityFeed(userId?: number) {
  const store = getLocalStore();
  const recentComments = store.comments
    .filter(c => !c.is_hidden)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map(c => {
      const author = store.users.find(u => u.id === c.user_id);
      const lesson = store.lessons.find(l => l.id === c.lesson_id);
      return {
        ...c,
        author_name: author ? `${author.first_name} ${author.last_name || ''}`.trim() : 'Learner',
        author_photo: author?.photo_url || '',
        lesson_title: lesson ? lesson.title : 'IELTS Lesson',
        is_admin_author: author ? isTelegramIdAdmin(author.telegram_id) : false
      };
    });

  const myComments = userId
    ? store.comments
        .filter(c => c.user_id === userId)
        .slice(0, 15)
        .map(c => {
          const lesson = store.lessons.find(l => l.id === c.lesson_id);
          return {
            ...c,
            lesson_title: lesson ? lesson.title : 'IELTS Lesson'
          };
        })
    : [];

  return { recent: recentComments, my: myComments };
}

// ==================== SUPPORT SYSTEM ====================

export async function createSupportRequest(userId: number, subject: string, message: string): Promise<SupportRequestRecord> {
  const store = getLocalStore();
  store.counters.support_requests = (store.counters.support_requests || 0) + 1;
  const requestId = store.counters.support_requests;
  const now = new Date().toISOString();

  const newRequest: SupportRequestRecord = {
    id: requestId,
    user_id: userId,
    subject: subject.trim(),
    status: 'Waiting',
    priority: 'Normal',
    created_at: now,
    updated_at: now
  };

  store.support_requests.push(newRequest);

  // Add initial message
  store.counters.support_messages = (store.counters.support_messages || 0) + 1;
  store.support_messages.push({
    id: store.counters.support_messages,
    request_id: requestId,
    sender_id: userId,
    sender_role: 'user',
    message: message.trim(),
    created_at: now
  });

  persistStore();
  return newRequest;
}

export async function getUserSupportRequests(userId: number): Promise<SupportRequestRecord[]> {
  const store = getLocalStore();
  return store.support_requests
    .filter(r => r.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map(r => {
      const messages = store.support_messages.filter(m => m.request_id === r.id);
      const lastMsg = messages[messages.length - 1];
      return {
        ...r,
        message_count: messages.length,
        last_message: lastMsg ? lastMsg.message : ''
      };
    });
}

export async function getSupportRequestDetails(requestId: number, requestingUserId: number, isAdmin: boolean = false) {
  const store = getLocalStore();
  const request = store.support_requests.find(r => r.id === requestId);
  if (!request) return null;
  if (!isAdmin && request.user_id !== requestingUserId) return null;

  const messages = store.support_messages
    .filter(m => m.request_id === requestId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(m => {
      const sender = store.users.find(u => u.id === m.sender_id);
      return {
        ...m,
        sender_name: sender ? `${sender.first_name} ${sender.last_name || ''}`.trim() : (m.sender_role === 'admin' ? 'Hossain (Admin)' : 'User'),
        sender_photo: sender?.photo_url || ''
      };
    });

  const requester = store.users.find(u => u.id === request.user_id);

  return {
    request: {
      ...request,
      user_name: requester ? `${requester.first_name} ${requester.last_name || ''}`.trim() : 'User',
      user_telegram_id: requester?.telegram_id
    },
    messages
  };
}

export async function addSupportMessage(requestId: number, senderId: number, role: 'user' | 'admin', message: string) {
  const store = getLocalStore();
  const request = store.support_requests.find(r => r.id === requestId);
  if (!request) return null;

  const now = new Date().toISOString();
  store.counters.support_messages = (store.counters.support_messages || 0) + 1;
  const newMsg = {
    id: store.counters.support_messages,
    request_id: requestId,
    sender_id: senderId,
    sender_role: role,
    message: message.trim(),
    created_at: now
  };

  store.support_messages.push(newMsg);
  request.updated_at = now;

  if (role === 'admin') {
    request.status = 'Answered';
    // Send user a notification
    store.counters.notifications = (store.counters.notifications || 0) + 1;
    store.notifications.push({
      id: store.counters.notifications,
      user_id: request.user_id,
      title: 'Support Response from Hossain',
      message: `Instructor Hossain replied to your ticket: "${request.subject}".`,
      type: 'Support Reply',
      is_read: 0,
      link_url: `/support/${requestId}`,
      created_at: now
    });
  } else {
    request.status = 'Waiting';
  }

  persistStore();

  const sender = store.users.find(u => u.id === senderId);
  return {
    ...newMsg,
    sender_name: sender ? `${sender.first_name} ${sender.last_name || ''}`.trim() : (role === 'admin' ? 'Hossain (Admin)' : 'User'),
    sender_photo: sender?.photo_url || ''
  };
}

// ==================== NOTIFICATIONS ====================

export async function getUserNotifications(userId: number): Promise<NotificationRecord[]> {
  const store = getLocalStore();
  return store.notifications
    .filter(n => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(n => ({
      ...n,
      is_read: Boolean(n.is_read)
    }));
}

export async function markNotificationRead(notificationId: number, userId: number): Promise<boolean> {
  const store = getLocalStore();
  const notif = store.notifications.find(n => n.id === notificationId && n.user_id === userId);
  if (!notif) return false;
  notif.is_read = 1;
  persistStore();
  return true;
}

export async function markAllNotificationsRead(userId: number): Promise<boolean> {
  const store = getLocalStore();
  for (const n of store.notifications) {
    if (n.user_id === userId) {
      n.is_read = 1;
    }
  }
  persistStore();
  return true;
}

// ==================== ADMIN OPERATIONS ====================

export async function getAdminDashboardStats() {
  const store = getLocalStore();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalUsers = store.users.length;
  const activeUsers = store.users.filter(u => new Date(u.last_active) >= oneWeekAgo).length;
  const totalLessons = store.lessons.length;
  const totalPdfs = store.pdfs.length;
  const totalComments = store.comments.length;
  const openSupport = store.support_requests.filter(r => r.status === 'Waiting').length;
  const pendingReports = store.reports.filter(r => r.status === 'pending').length;

  return {
    totalUsers,
    activeUsers,
    totalLessons,
    totalPdfs,
    totalComments,
    openSupport,
    pendingReports
  };
}

export async function getAdminUsersList(search?: string) {
  const store = getLocalStore();
  let users = store.users;
  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u =>
      (u.first_name && u.first_name.toLowerCase().includes(q)) ||
      (u.last_name && u.last_name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      String(u.telegram_id).includes(q)
    );
  }
  return users.map(u => ({
    ...u,
    isAdmin: isTelegramIdAdmin(u.telegram_id),
    completed_lessons_count: store.user_progress.filter(p => p.user_id === u.id && p.is_completed).length,
    support_requests_count: store.support_requests.filter(s => s.user_id === u.id).length
  }));
}

export async function toggleUserStatus(userId: number, status: 'active' | 'inactive' | 'banned') {
  const store = getLocalStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) return false;
  user.status = status;
  persistStore();
  return true;
}

export async function getAdminCommentsList() {
  const store = getLocalStore();
  return store.comments
    .map(c => {
      const author = store.users.find(u => u.id === c.user_id);
      const lesson = store.lessons.find(l => l.id === c.lesson_id);
      const reports = store.reports.filter(r => r.comment_id === c.id);
      return {
        ...c,
        author_name: author ? `${author.first_name} ${author.last_name || ''}`.trim() : 'Student',
        author_username: author?.username,
        author_telegram_id: author?.telegram_id,
        lesson_title: lesson?.title || 'Lesson',
        reports_count: reports.length,
        reports
      };
    })
    .sort((a, b) => (b.reports_count - a.reports_count) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
}

export async function adminModerateComment(commentId: number, action: 'pin' | 'hide' | 'unhide' | 'delete') {
  const store = getLocalStore();
  const comment = store.comments.find(c => c.id === commentId);
  if (!comment && action !== 'delete') return false;

  if (action === 'pin') {
    if (comment) comment.is_pinned = comment.is_pinned ? 0 : 1;
  } else if (action === 'hide') {
    if (comment) comment.is_hidden = 1;
  } else if (action === 'unhide') {
    if (comment) comment.is_hidden = 0;
  } else if (action === 'delete') {
    store.comments = store.comments.filter(c => c.id !== commentId && c.parent_id !== commentId);
    store.reports = store.reports.filter(r => r.comment_id !== commentId);
  }

  persistStore();
  return true;
}

export async function getAdminSupportList(filter?: string) {
  const store = getLocalStore();
  let list = store.support_requests;
  if (filter && filter !== 'All') {
    if (filter === 'Priority') {
      list = list.filter(r => r.priority === 'High');
    } else {
      list = list.filter(r => r.status === filter);
    }
  }

  return list
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map(r => {
      const user = store.users.find(u => u.id === r.user_id);
      const messages = store.support_messages.filter(m => m.request_id === r.id);
      const lastMsg = messages[messages.length - 1];
      return {
        ...r,
        user_name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User',
        user_telegram_id: user?.telegram_id,
        message_count: messages.length,
        last_message: lastMsg ? lastMsg.message : ''
      };
    });
}

export async function updateSupportStatus(requestId: number, status: 'Waiting' | 'Answered' | 'Closed', priority?: 'Normal' | 'High') {
  const store = getLocalStore();
  const request = store.support_requests.find(r => r.id === requestId);
  if (!request) return false;
  request.status = status;
  if (priority) request.priority = priority;
  request.updated_at = new Date().toISOString();
  persistStore();
  return true;
}

export async function broadcastNotification(data: { title: string; message: string; type: string; link_url?: string; target_user_id?: number }) {
  const store = getLocalStore();
  const now = new Date().toISOString();

  if (data.target_user_id) {
    store.counters.notifications = (store.counters.notifications || 0) + 1;
    store.notifications.push({
      id: store.counters.notifications,
      user_id: Number(data.target_user_id),
      title: data.title,
      message: data.message,
      type: data.type || 'Admin Announcement',
      is_read: 0,
      link_url: data.link_url || '',
      created_at: now
    });
  } else {
    for (const u of store.users) {
      store.counters.notifications = (store.counters.notifications || 0) + 1;
      store.notifications.push({
        id: store.counters.notifications,
        user_id: u.id,
        title: data.title,
        message: data.message,
        type: data.type || 'Admin Announcement',
        is_read: 0,
        link_url: data.link_url || '',
        created_at: now
      });
    }
  }

  persistStore();
  return true;
}

export async function getPlatformSettings() {
  const store = getLocalStore();
  return store.settings || {};
}

export async function updatePlatformSettings(newSettings: Record<string, string>) {
  const store = getLocalStore();
  store.settings = { ...store.settings, ...newSettings };
  persistStore();
  return store.settings;
}

// ==================== LEARNING ROADMAPS (শুরু থেকে ইংরেজি শেখার অনুশীলন) ====================

export async function getLearningRoadmaps(userId?: number) {
  const store = getLocalStore();
  const roadmaps = store.learning_roadmaps || [];
  return roadmaps.map(r => {
    const isCompleted = userId
      ? !!(store.practice_submissions || []).find(s => s.user_id === userId && s.roadmap_id === r.id && s.is_completed)
      : false;
    return {
      ...r,
      is_completed: isCompleted
    };
  });
}

export async function submitRoadmapExercise(userId: number, roadmapId: number, exerciseId: number, answer: string) {
  const store = getLocalStore();
  const roadmaps = store.learning_roadmaps || [];
  const roadmap = roadmaps.find(r => r.id === roadmapId);
  if (!roadmap) throw new Error('Roadmap step not found');

  const exercise = roadmap.exercises?.find((e: any) => e.id === exerciseId);
  if (!exercise) throw new Error('Exercise not found');

  const isCorrect = String(exercise.correct_answer).trim().toLowerCase() === String(answer).trim().toLowerCase();

  if (isCorrect) {
    store.practice_submissions = store.practice_submissions || [];
    const existing = store.practice_submissions.find(s => s.user_id === userId && s.roadmap_id === roadmapId);
    if (!existing) {
      store.counters.practice_submissions = (store.counters.practice_submissions || 0) + 1;
      store.practice_submissions.push({
        id: store.counters.practice_submissions,
        user_id: userId,
        roadmap_id: roadmapId,
        is_completed: 1,
        completed_at: new Date().toISOString()
      });
      persistStore();
    }
  }

  return {
    is_correct: isCorrect,
    correct_answer: exercise.correct_answer,
    explanation_bn: exercise.explanation_bn
  };
}

// ==================== PEERS, FOLLOW & CHAT REQUEST SYSTEM (ফলো ও চ্যাট রিকুয়েষ্ট) ====================

export async function getPeersList(currentUserId?: number) {
  const store = getLocalStore();
  const follows = store.user_follows || [];
  const chatRequests = store.chat_requests || [];

  return store.users.map(u => {
    const followersCount = follows.filter(f => f.following_id === u.id).length;
    const isFollowed = currentUserId
      ? follows.some(f => f.follower_id === currentUserId && f.following_id === u.id)
      : false;

    // Check chat request status between current user and this peer
    let chatRequestStatus: 'none' | 'pending' | 'accepted' | 'rejected' = 'none';
    let chatRequestId: number | null = null;

    if (currentUserId && currentUserId !== u.id) {
      const existingReq = chatRequests.find(r =>
        (r.sender_id === currentUserId && r.receiver_id === u.id) ||
        (r.sender_id === u.id && r.receiver_id === currentUserId)
      );
      if (existingReq) {
        chatRequestStatus = existingReq.status;
        chatRequestId = existingReq.id;
      }
    }

    const isBlocked = currentUserId
      ? (store.user_blocks || []).some(b => b.blocker_id === currentUserId && b.blocked_id === u.id)
      : false;

    return {
      id: u.id,
      telegram_id: u.telegram_id,
      first_name: u.first_name,
      last_name: u.last_name,
      username: u.username,
      photo_url: u.photo_url,
      email: u.email,
      is_verified: !!u.is_verified,
      whatsapp: u.whatsapp,
      facebook: u.facebook,
      bio: u.bio || (u.id === 1 ? 'Chief Instructor & Band 8.5 Master' : 'IELTS Aspirant & Study Partner'),
      target_band: u.target_band || 'Band 7.5+',
      experience_level: u.experience_level || (u.id === 1 ? 'Band 8.5+ Mentor' : 'Intermediate'),
      is_mentor: !!u.is_mentor || u.id === 1,
      followers_count: followersCount,
      is_followed_by_me: isFollowed,
      is_blocked_by_me: isBlocked,
      chat_request_status: chatRequestStatus,
      chat_request_id: chatRequestId
    };
  });
}

export async function toggleFollowUser(followerId: number, targetUserId: number) {
  if (followerId === targetUserId) {
    throw new Error('You cannot follow yourself');
  }

  const store = getLocalStore();
  store.user_follows = store.user_follows || [];
  const index = store.user_follows.findIndex(f => f.follower_id === followerId && f.following_id === targetUserId);

  let isFollowed = false;
  if (index >= 0) {
    store.user_follows.splice(index, 1);
    isFollowed = false;
  } else {
    store.counters.user_follows = (store.counters.user_follows || 0) + 1;
    store.user_follows.push({
      id: store.counters.user_follows,
      follower_id: followerId,
      following_id: targetUserId,
      created_at: new Date().toISOString()
    });
    isFollowed = true;

    // Notify target user
    const follower = store.users.find(u => u.id === followerId);
    store.counters.notifications = (store.counters.notifications || 0) + 1;
    store.notifications.push({
      id: store.counters.notifications,
      user_id: targetUserId,
      title: `${follower?.first_name || 'A student'} started following you! 🤝`,
      message: `${follower?.first_name || 'Someone'} is following your English learning journey and practice drills.`,
      type: 'Important Update',
      is_read: 0,
      link_url: '/community',
      created_at: new Date().toISOString()
    });
  }

  persistStore();
  const followersCount = store.user_follows.filter(f => f.following_id === targetUserId).length;
  return { is_followed: isFollowed, followers_count: followersCount };
}

export async function sendChatRequest(senderId: number, receiverId: number, initialMessage: string) {
  if (senderId === receiverId) {
    throw new Error('Cannot send chat request to yourself');
  }

  const store = getLocalStore();
  store.chat_requests = store.chat_requests || [];
  store.user_blocks = store.user_blocks || [];

  const isBlocked = store.user_blocks.some(
    b => (b.blocker_id === receiverId && b.blocked_id === senderId) ||
         (b.blocker_id === senderId && b.blocked_id === receiverId)
  );
  if (isBlocked) {
    throw new Error('Cannot send chat request: this conversation is blocked.');
  }

  const existing = store.chat_requests.find(r =>
    (r.sender_id === senderId && r.receiver_id === receiverId) ||
    (r.sender_id === receiverId && r.receiver_id === senderId)
  );

  if (existing) {
    if (existing.status === 'accepted') {
      return { ...existing, already_exists: true };
    }
    // Reopen if rejected or update message
    existing.status = 'pending';
    existing.initial_message = initialMessage.trim();
    existing.updated_at = new Date().toISOString();
    persistStore();
    return existing;
  }

  store.counters.chat_requests = (store.counters.chat_requests || 0) + 1;
  const now = new Date().toISOString();
  const newReq = {
    id: store.counters.chat_requests,
    sender_id: senderId,
    receiver_id: receiverId,
    initial_message: initialMessage.trim(),
    status: 'pending' as const,
    created_at: now,
    updated_at: now
  };

  store.chat_requests.push(newReq);

  // Notify receiver
  const sender = store.users.find(u => u.id === senderId);
  store.counters.notifications = (store.counters.notifications || 0) + 1;
  store.notifications.push({
    id: store.counters.notifications,
    user_id: receiverId,
    title: `💬 New English Study Chat Request from ${sender?.first_name || 'a student'}`,
    message: `"${initialMessage.trim().substring(0, 80)}..." Tap to review and accept the chat session!`,
    type: 'Important Update',
    is_read: 0,
    link_url: '/community',
    created_at: now
  });

  persistStore();
  return newReq;
}

export async function getUserChatRequests(userId: number) {
  const store = getLocalStore();
  const requests = store.chat_requests || [];
  const userRequests = requests.filter(r => r.sender_id === userId || r.receiver_id === userId);

  return userRequests.map(r => {
    const isIncoming = r.receiver_id === userId;
    const otherUserId = isIncoming ? r.sender_id : r.receiver_id;
    const otherUser = store.users.find(u => u.id === otherUserId);
    const messages = (store.direct_messages || []).filter(m => m.chat_request_id === r.id);
    const lastMsg = messages[messages.length - 1];

    return {
      id: r.id,
      sender_id: r.sender_id,
      receiver_id: r.receiver_id,
      initial_message: r.initial_message,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      is_incoming: isIncoming,
      other_user: {
        id: otherUserId,
        name: otherUser ? `${otherUser.first_name} ${otherUser.last_name || ''}`.trim() : 'Study Partner',
        username: otherUser?.username,
        photo_url: otherUser?.photo_url,
        level: otherUser?.experience_level || 'Learner'
      },
      last_message: lastMsg ? lastMsg.message : r.initial_message
    };
  }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export async function respondToChatRequest(requestId: number, responderId: number, action: 'accepted' | 'rejected') {
  const store = getLocalStore();
  const req = (store.chat_requests || []).find(r => r.id === requestId);
  if (!req) throw new Error('Chat request not found');

  if (req.receiver_id !== responderId) {
    throw new Error('Only the recipient can respond to this chat request');
  }

  req.status = action;
  req.updated_at = new Date().toISOString();

  // If accepted, add an automatic starter direct message
  if (action === 'accepted') {
    store.direct_messages = store.direct_messages || [];
    store.counters.direct_messages = (store.counters.direct_messages || 0) + 1;
    store.direct_messages.push({
      id: store.counters.direct_messages,
      chat_request_id: requestId,
      sender_id: req.sender_id,
      message: req.initial_message,
      created_at: new Date().toISOString()
    });

    // Notify requester
    const responder = store.users.find(u => u.id === responderId);
    store.counters.notifications = (store.counters.notifications || 0) + 1;
    store.notifications.push({
      id: store.counters.notifications,
      user_id: req.sender_id,
      title: `🎉 Chat Request Accepted by ${responder?.first_name || 'Study Partner'}!`,
      message: `You are now connected! Open the chat session to practice English speaking and writing drills together.`,
      type: 'Important Update',
      is_read: 0,
      link_url: '/community',
      created_at: new Date().toISOString()
    });
  }

  persistStore();
  return req;
}

export async function getDirectChatMessages(requestId: number, userId: number) {
  const store = getLocalStore();
  const req = (store.chat_requests || []).find(r => r.id === requestId);
  if (!req) throw new Error('Chat session not found');

  if (req.sender_id !== userId && req.receiver_id !== userId) {
    throw new Error('Unauthorized access to chat messages');
  }

  const messages = (store.direct_messages || [])
    .filter(m => m.chat_request_id === requestId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(m => {
      const sender = store.users.find(u => u.id === m.sender_id);
      return {
        ...m,
        sender_name: sender ? `${sender.first_name} ${sender.last_name || ''}`.trim() : 'User',
        sender_photo: sender?.photo_url
      };
    });

  const otherUserId = req.sender_id === userId ? req.receiver_id : req.sender_id;
  const otherUser = store.users.find(u => u.id === otherUserId);
  store.user_blocks = store.user_blocks || [];
  const isBlockedByMe = store.user_blocks.some(b => b.blocker_id === userId && b.blocked_id === otherUserId);
  const isBlockedByThem = store.user_blocks.some(b => b.blocker_id === otherUserId && b.blocked_id === userId);

  return {
    request: req,
    other_user: {
      id: otherUserId,
      name: otherUser ? `${otherUser.first_name} ${otherUser.last_name || ''}`.trim() : 'Study Partner',
      username: otherUser?.username,
      photo_url: otherUser?.photo_url,
      experience_level: otherUser?.experience_level
    },
    is_blocked_by_me: isBlockedByMe,
    is_blocked_by_them: isBlockedByThem,
    messages
  };
}

export async function sendDirectChatMessage(requestId: number, senderId: number, message: string) {
  const store = getLocalStore();
  const req = (store.chat_requests || []).find(r => r.id === requestId);
  if (!req) throw new Error('Chat session not found');

  if (req.status !== 'accepted') {
    throw new Error('Chat request has not been accepted yet');
  }

  if (req.sender_id !== senderId && req.receiver_id !== senderId) {
    throw new Error('Unauthorized');
  }

  const otherUserId = req.sender_id === senderId ? req.receiver_id : req.sender_id;
  store.user_blocks = store.user_blocks || [];
  const isBlocked = store.user_blocks.some(
    b => (b.blocker_id === otherUserId && b.blocked_id === senderId) ||
         (b.blocker_id === senderId && b.blocked_id === otherUserId)
  );
  if (isBlocked) {
    throw new Error('Cannot send message: user is blocked.');
  }

  store.direct_messages = store.direct_messages || [];
  store.counters.direct_messages = (store.counters.direct_messages || 0) + 1;
  const now = new Date().toISOString();

  const newMsg = {
    id: store.counters.direct_messages,
    chat_request_id: requestId,
    sender_id: senderId,
    message: message.trim(),
    created_at: now
  };

  store.direct_messages.push(newMsg);
  req.updated_at = now;
  persistStore();

  const sender = store.users.find(u => u.id === senderId);
  return {
    ...newMsg,
    sender_name: sender ? `${sender.first_name} ${sender.last_name || ''}`.trim() : 'User',
    sender_photo: sender?.photo_url
  };
}

// ==================== USER BLOCK / UNBLOCK SYSTEM ====================

export async function toggleBlockUser(blockerId: number, targetUserId: number) {
  if (blockerId === targetUserId) {
    throw new Error('You cannot block yourself');
  }

  const store = getLocalStore();
  store.user_blocks = store.user_blocks || [];
  const index = store.user_blocks.findIndex(b => b.blocker_id === blockerId && b.blocked_id === targetUserId);

  let isBlocked = false;
  if (index >= 0) {
    store.user_blocks.splice(index, 1);
    isBlocked = false;
  } else {
    store.counters.user_blocks = (store.counters.user_blocks || 0) + 1;
    store.user_blocks.push({
      id: store.counters.user_blocks,
      blocker_id: blockerId,
      blocked_id: targetUserId,
      created_at: new Date().toISOString()
    });
    isBlocked = true;

    // If there were pending chat requests, decline them
    for (const r of (store.chat_requests || [])) {
      if ((r.sender_id === targetUserId && r.receiver_id === blockerId) && r.status === 'pending') {
        r.status = 'rejected';
      }
    }
  }

  persistStore();
  const targetUser = store.users.find(u => u.id === targetUserId);
  return {
    is_blocked: isBlocked,
    message: isBlocked
      ? `${targetUser?.first_name || 'User'} has been blocked. They can no longer send you chat requests.`
      : `${targetUser?.first_name || 'User'} has been unblocked.`
  };
}

export async function getBlockedUsers(userId: number) {
  const store = getLocalStore();
  store.user_blocks = store.user_blocks || [];
  const blockedIds = store.user_blocks.filter(b => b.blocker_id === userId).map(b => b.blocked_id);
  return store.users.filter(u => blockedIds.includes(u.id)).map(u => ({
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    username: u.username,
    photo_url: u.photo_url
  }));
}

// ==================== USER PROFILE & SOCIALS (WhatsApp & Facebook) ====================

export async function updateUserProfile(userId: number, data: {
  whatsapp?: string | null;
  facebook?: string | null;
  bio?: string | null;
  target_band?: string | null;
  email?: string | null;
}) {
  const store = getLocalStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  if (data.whatsapp !== undefined) user.whatsapp = data.whatsapp ? data.whatsapp.trim() : null;
  if (data.facebook !== undefined) user.facebook = data.facebook ? data.facebook.trim() : null;
  if (data.bio !== undefined) user.bio = data.bio ? data.bio.trim() : user.bio;
  if (data.target_band !== undefined) user.target_band = data.target_band ? data.target_band.trim() : user.target_band;
  if (data.email !== undefined) user.email = data.email ? data.email.trim() : user.email;

  user.last_active = new Date().toISOString();
  persistStore();

  return {
    ...user,
    isAdmin: isTelegramIdAdmin(user.telegram_id)
  };
}

// ==================== EMAIL VERIFICATION SYSTEM ====================

export async function sendEmailVerificationCode(userId: number, email: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required');
  }

  const store = getLocalStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date().toISOString();

  store.verification_codes = store.verification_codes || [];
  store.verification_codes = store.verification_codes.filter(v => v.user_id !== userId);
  store.verification_codes.push({
    user_id: userId,
    email: email.trim().toLowerCase(),
    code,
    created_at: now
  });

  user.email = email.trim().toLowerCase();

  // Create notification with the code for testing & free accessibility
  store.counters.notifications = (store.counters.notifications || 0) + 1;
  store.notifications.push({
    id: store.counters.notifications,
    user_id: userId,
    title: '🔐 Your Verification Code: ' + code,
    message: `Use code ${code} to verify your student email (${email}). Free verification code valid for your account.`,
    type: 'Security',
    is_read: 0,
    created_at: now
  });

  persistStore();

  return {
    success: true,
    code,
    email: email.trim().toLowerCase(),
    message: `Verification code sent to ${email}. (Test Code: ${code})`
  };
}

export async function verifyUserEmail(userId: number, email: string, code: string) {
  const store = getLocalStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  store.verification_codes = store.verification_codes || [];
  const record = store.verification_codes.find(
    v => v.user_id === userId && v.code.trim() === code.trim()
  );

  // Allow standard verification code or demo bypass 123456
  if (!record && code.trim() !== '123456') {
    throw new Error('Invalid or expired verification code');
  }

  user.email = email ? email.trim().toLowerCase() : user.email;
  user.is_verified = true;
  user.last_active = new Date().toISOString();

  // Send congratulatory badge notification
  store.counters.notifications = (store.counters.notifications || 0) + 1;
  store.notifications.push({
    id: store.counters.notifications,
    user_id: userId,
    title: '✅ Student Verification Successful!',
    message: 'Congratulations! Your student profile is now verified. You can now connect with peers and access all learning modules.',
    type: 'Security',
    is_read: 0,
    created_at: new Date().toISOString()
  });

  persistStore();

  return {
    success: true,
    user: {
      ...user,
      isAdmin: isTelegramIdAdmin(user.telegram_id)
    }
  };
}

// Full Platform Export & Backup for User Download
export async function getFullSystemBackup() {
  const store = getLocalStore();
  return {
    export_timestamp: new Date().toISOString(),
    platform: 'IELTS Journey with Hossain',
    version: '1.2.0',
    stats: {
      users_count: store.users.length,
      lessons_count: store.lessons.length,
      roadmaps_count: (store.learning_roadmaps || []).length,
      pdfs_count: store.pdfs.length,
      comments_count: store.comments.length,
      chat_requests_count: (store.chat_requests || []).length
    },
    data: store
  };
}

