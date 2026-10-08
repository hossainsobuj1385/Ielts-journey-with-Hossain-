import { Router, Response } from 'express';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validateTelegramInitData, isTelegramIdAdmin } from '../utils/telegramAuth';
import * as service from '../services/appService';

export const apiRouter = Router();

// ==================== AUTHENTICATION ====================

apiRouter.post('/auth/telegram', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { initData, mockUser } = req.body;
    const botToken = process.env.BOT_TOKEN || '';

    if (initData) {
      const validation = validateTelegramInitData(initData, botToken);
      if (!validation.isValid || !validation.user) {
        return res.status(401).json({ error: validation.error || 'Invalid Telegram authentication' });
      }

      const user = await service.findOrCreateUser({
        telegram_id: validation.user.id,
        first_name: validation.user.first_name,
        last_name: validation.user.last_name,
        username: validation.user.username,
        photo_url: validation.user.photo_url,
        language: validation.user.language_code
      });

      return res.json({ success: true, user });
    }

    // Support dev environment switch (e.g. preview selector)
    if (mockUser && mockUser.telegram_id) {
      const user = await service.findOrCreateUser({
        telegram_id: Number(mockUser.telegram_id),
        first_name: mockUser.first_name || 'Preview Student',
        last_name: mockUser.last_name,
        username: mockUser.username,
        photo_url: mockUser.photo_url
      });
      return res.json({ success: true, user });
    }

    return res.status(400).json({ error: 'Missing initData or mock credentials' });
  } catch (err: any) {
    console.error('Error in /api/auth/telegram:', err);
    res.status(500).json({ error: 'Authentication server error', details: err.message });
  }
});

apiRouter.get('/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
    isAdmin: req.user ? isTelegramIdAdmin(req.user.telegram_id) : false
  });
});

apiRouter.put('/users/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const updated = await service.updateUserProfile(req.user.id, req.body);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
});

apiRouter.post('/users/send-verification', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { email } = req.body;
    const result = await service.sendEmailVerificationCode(req.user.id, email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send verification code' });
  }
});

apiRouter.post('/users/verify-email', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { email, code } = req.body;
    const result = await service.verifyUserEmail(req.user.id, email, code);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Verification failed' });
  }
});

// ==================== CATEGORIES ====================

apiRouter.get('/categories', async (_req, res) => {
  try {
    const categories = await service.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// ==================== LESSONS ====================

apiRouter.get('/lessons', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categoryId = req.query.category_id ? Number(req.query.category_id) : undefined;
    const level = (req.query.level as string) || undefined;
    const search = (req.query.search as string) || undefined;
    const userId = req.user?.id;

    const lessons = await service.getLessons({
      categoryId,
      level,
      search,
      status: 'published',
      userId
    });

    res.json(lessons);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch lessons', details: err.message });
  }
});

apiRouter.get('/lessons/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const lesson = await service.getLessonById(lessonId, req.user?.id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve lesson', details: err.message });
  }
});

// ==================== PROGRESS & BOOKMARKS ====================

apiRouter.post('/progress/toggle-complete', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonId = Number(req.body.lesson_id);
    if (!lessonId || !req.user) {
      return res.status(400).json({ error: 'lesson_id is required' });
    }

    const result = await service.toggleLessonComplete(req.user.id, lessonId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update progress', details: err.message });
  }
});

apiRouter.post('/bookmarks/toggle', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonId = Number(req.body.lesson_id);
    if (!lessonId || !req.user) {
      return res.status(400).json({ error: 'lesson_id is required' });
    }

    const result = await service.toggleBookmark(req.user.id, lessonId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle bookmark', details: err.message });
  }
});

apiRouter.get('/progress/my', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const stats = await service.getUserProgressStats(req.user.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get progress', details: err.message });
  }
});

apiRouter.get('/bookmarks/my', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const bookmarks = await service.getUserBookmarks(req.user.id);
    res.json(bookmarks);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch bookmarks', details: err.message });
  }
});

// ==================== PDF LIBRARY ====================

apiRouter.get('/pdfs', async (req, res) => {
  try {
    const categoryId = req.query.category_id ? Number(req.query.category_id) : undefined;
    const search = (req.query.search as string) || undefined;

    const pdfs = await service.getPdfs({
      categoryId,
      search,
      status: 'published'
    });

    res.json(pdfs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch PDFs', details: err.message });
  }
});

apiRouter.post('/pdfs/:id/download-click', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await service.recordPdfDownload(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to track download', details: err.message });
  }
});

// ==================== COMMENTS ====================

apiRouter.get('/comments/lesson/:lessonId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const comments = await service.getLessonComments(lessonId, req.user?.id);
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch comments', details: err.message });
  }
});

apiRouter.post('/comments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lesson_id, parent_id, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }
    if (!lesson_id || !req.user) {
      return res.status(400).json({ error: 'lesson_id is required' });
    }

    const comment = await service.addComment({
      lesson_id: Number(lesson_id),
      user_id: req.user.id,
      parent_id: parent_id ? Number(parent_id) : null,
      content
    });

    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to post comment', details: err.message });
  }
});

apiRouter.put('/comments/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const commentId = Number(req.params.id);
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const success = await service.editComment(commentId, req.user.id, content);
    if (!success) {
      return res.status(403).json({ error: 'Unable to edit comment (not found or not author)' });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to edit comment', details: err.message });
  }
});

apiRouter.delete('/comments/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const commentId = Number(req.params.id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const isAdmin = isTelegramIdAdmin(req.user.telegram_id);
    const success = await service.deleteComment(commentId, req.user.id, isAdmin);

    if (!success) {
      return res.status(403).json({ error: 'Unable to delete comment' });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete comment', details: err.message });
  }
});

apiRouter.post('/comments/:id/like', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const commentId = Number(req.params.id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await service.toggleCommentLike(commentId, req.user.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to like comment', details: err.message });
  }
});

apiRouter.post('/comments/:id/report', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const commentId = Number(req.params.id);
    const { reason } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const success = await service.reportComment(commentId, req.user.id, reason || 'Inappropriate content');
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to report comment', details: err.message });
  }
});

apiRouter.get('/community', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feed = await service.getCommunityFeed(req.user?.id);
    res.json(feed);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch community discussions', details: err.message });
  }
});

// ==================== SUPPORT REQUESTS ====================

apiRouter.get('/support', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const requests = await service.getUserSupportRequests(req.user.id);
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch support requests', details: err.message });
  }
});

apiRouter.post('/support', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message || !subject.trim() || !message.trim()) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const newRequest = await service.createSupportRequest(req.user.id, subject, message);
    res.status(201).json(newRequest);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create support ticket', details: err.message });
  }
});

apiRouter.get('/support/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const isAdmin = isTelegramIdAdmin(req.user.telegram_id);
    const details = await service.getSupportRequestDetails(requestId, req.user.id, isAdmin);

    if (!details) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    res.json(details);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get support ticket details', details: err.message });
  }
});

apiRouter.post('/support/:id/message', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const isAdmin = isTelegramIdAdmin(req.user.telegram_id);
    const role = isAdmin ? 'admin' : 'user';

    const sent = await service.addSupportMessage(requestId, req.user.id, role, message);
    if (!sent) {
      return res.status(404).json({ error: 'Support request not found' });
    }

    res.status(201).json(sent);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// ==================== NOTIFICATIONS ====================

apiRouter.get('/notifications', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const notifs = await service.getUserNotifications(req.user.id);
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

apiRouter.put('/notifications/:id/read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifId = Number(req.params.id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    await service.markNotificationRead(notifId, req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification', details: err.message });
  }
});

apiRouter.put('/notifications/read-all', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    await service.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark all as read', details: err.message });
  }
});

apiRouter.get('/settings', async (_req, res) => {
  try {
    const settings = await service.getPlatformSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get settings', details: err.message });
  }
});

// ==================== ADMIN PANEL ROUTES ====================

apiRouter.get('/admin/dashboard', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const stats = await service.getAdminDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: err.message });
  }
});

apiRouter.get('/admin/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const search = req.query.search as string;
    const users = await service.getAdminUsersList(search);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

apiRouter.put('/admin/users/:id/status', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const success = await service.toggleUserStatus(id, status);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change user status', details: err.message });
  }
});

apiRouter.get('/admin/lessons', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const lessons = await service.getLessons({ status: (req.query.status as string) || undefined });
    res.json(lessons);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin lessons', details: err.message });
  }
});

apiRouter.post('/admin/lessons', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, category_id, description, content, level, video_url, thumbnail_url, status, order_index, prerequisite_text, pdf_url } = req.body;
    if (!title || !category_id || !content) {
      return res.status(400).json({ error: 'Title, category, and content are required' });
    }

    const lesson = await service.createLesson({
      title,
      category_id: Number(category_id),
      description: description || '',
      content,
      level: level || 'Intermediate',
      order_index: order_index !== undefined ? Number(order_index) : undefined,
      prerequisite_text: prerequisite_text || null,
      pdf_url: pdf_url || null,
      video_url,
      thumbnail_url,
      status: status || 'published'
    });

    res.status(201).json(lesson);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create lesson', details: err.message });
  }
});

apiRouter.post('/admin/lessons/reorder', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { category_id, lesson_ids } = req.body;
    if (!category_id || !Array.isArray(lesson_ids)) {
      return res.status(400).json({ error: 'category_id and lesson_ids array required' });
    }
    const updated = await service.reorderCategoryLessons(Number(category_id), lesson_ids);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reorder lessons', details: err.message });
  }
});

apiRouter.put('/admin/lessons/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.updateLesson(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lesson not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update lesson', details: err.message });
  }
});

apiRouter.delete('/admin/lessons/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await service.deleteLesson(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete lesson', details: err.message });
  }
});

apiRouter.post('/admin/categories', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, icon, display_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const cat = await service.createCategory({ name, slug, description, icon, display_order });
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
});

apiRouter.put('/admin/categories/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.updateCategory(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
});

apiRouter.delete('/admin/categories/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await service.deleteCategory(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
});

// Admin PDFs
apiRouter.get('/admin/pdfs', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const pdfs = await service.getPdfs({ status: (req.query.status as string) || undefined });
    res.json(pdfs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin PDFs', details: err.message });
  }
});

apiRouter.post('/admin/pdfs', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, description, category_id, google_drive_url, thumbnail_url, file_size_text, status } = req.body;
    if (!title || !category_id || !google_drive_url) {
      return res.status(400).json({ error: 'Title, category, and Google Drive URL are required' });
    }

    // Google Drive URL format validation
    const driveRegex = /^https:\/\/(drive\.google\.com|docs\.google\.com)/;
    const isDriveLink = driveRegex.test(google_drive_url.trim());
    if (!isDriveLink) {
      return res.status(400).json({
        error: 'Invalid URL. Please enter a valid Google Drive sharing URL (e.g., https://drive.google.com/file/d/...)'
      });
    }

    const pdf = await service.createPdf({
      title,
      description: description || '',
      category_id: Number(category_id),
      google_drive_url: google_drive_url.trim(),
      thumbnail_url,
      file_size_text,
      status: status || 'published'
    });

    res.status(201).json(pdf);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create PDF', details: err.message });
  }
});

apiRouter.put('/admin/pdfs/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.updatePdf(id, req.body);
    if (!updated) return res.status(404).json({ error: 'PDF not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update PDF', details: err.message });
  }
});

apiRouter.delete('/admin/pdfs/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await service.deletePdf(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete PDF', details: err.message });
  }
});

// Admin Comments Moderation
apiRouter.get('/admin/comments', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const comments = await service.getAdminCommentsList();
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch comments for moderation', details: err.message });
  }
});

apiRouter.post('/admin/comments/:id/moderate', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { action } = req.body;
    if (!['pin', 'hide', 'unhide', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid moderation action' });
    }
    const success = await service.adminModerateComment(id, action);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to moderate comment', details: err.message });
  }
});

// Admin Support Desk
apiRouter.get('/admin/support', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const filter = req.query.filter as string;
    const requests = await service.getAdminSupportList(filter);
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch support requests', details: err.message });
  }
});

apiRouter.put('/admin/support/:id/status', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, priority } = req.body;
    const success = await service.updateSupportStatus(id, status, priority);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update support status', details: err.message });
  }
});

// Admin Broadcast Notifications
apiRouter.post('/admin/notifications', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, message, type, link_url, target_user_id } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    await service.broadcastNotification({ title, message, type, link_url, target_user_id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to broadcast notification', details: err.message });
  }
});

// Admin Settings
apiRouter.get('/admin/settings', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const settings = await service.getPlatformSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get settings', details: err.message });
  }
});

apiRouter.put('/admin/settings', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const updated = await service.updatePlatformSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// ==================== LEARNING ROADMAPS & PRACTICE EXERCISES ====================

apiRouter.get('/roadmaps', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roadmaps = await service.getLearningRoadmaps(req.user?.id);
    res.json(roadmaps);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load roadmaps', details: err.message });
  }
});

apiRouter.post('/roadmaps/:id/submit', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roadmapId = Number(req.params.id);
    const { exercise_id, answer } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await service.submitRoadmapExercise(req.user.id, roadmapId, Number(exercise_id), answer);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit answer', details: err.message });
  }
});

// ==================== PEERS, FOLLOW & STUDY CHAT REQUESTS ====================

apiRouter.get('/peers', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const peers = await service.getPeersList(req.user?.id);
    res.json(peers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load peers', details: err.message });
  }
});

apiRouter.post('/peers/:id/follow', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Number(req.params.id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await service.toggleFollowUser(req.user.id, targetUserId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to toggle follow' });
  }
});

apiRouter.post('/peers/:id/block', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Number(req.params.id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await service.toggleBlockUser(req.user.id, targetUserId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to toggle block' });
  }
});

apiRouter.get('/peers/blocked', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const blockedList = await service.getBlockedUsers(req.user.id);
    res.json(blockedList);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});

apiRouter.post('/peers/:id/chat-request', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Number(req.params.id);
    const { initial_message } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!initial_message || !initial_message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const request = await service.sendChatRequest(req.user.id, targetUserId, initial_message);
    res.status(201).json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send chat request' });
  }
});

apiRouter.get('/chat-requests', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const requests = await service.getUserChatRequests(req.user.id);
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch chat requests', details: err.message });
  }
});

apiRouter.put('/chat-requests/:id/respond', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { action } = req.body;
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accepted or rejected' });
    }
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await service.respondToChatRequest(requestId, req.user.id, action);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to respond to request' });
  }
});

apiRouter.get('/chat-requests/:id/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const thread = await service.getDirectChatMessages(requestId, req.user.id);
    res.json(thread);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to load messages' });
  }
});

apiRouter.post('/chat-requests/:id/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { message } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMsg = await service.sendDirectChatMessage(requestId, req.user.id, message);
    res.status(201).json(newMsg);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send message' });
  }
});

// Admin view of all chat requests
apiRouter.get('/admin/chat-requests', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const store = (await import('../database/db')).getLocalStore();
    res.json(store.chat_requests || []);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin chat requests' });
  }
});

// Backup Export Endpoint (সব ডাটাবেজ ব্যাকআপ ডাউনলোড)
apiRouter.get('/export-backup', async (_req, res) => {
  try {
    const backup = await service.getFullSystemBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=ielts_journey_backup_${Date.now()}.json`);
    res.json(backup);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate backup export', details: err.message });
  }
});

// Full Project Code ZIP Download Endpoint (সমস্ত প্রজেক্ট সোর্স কোড ডাউনলোড)
apiRouter.get('/export/download-zip', async (_req, res) => {
  try {
    const JSZip = (await import('jszip')).default;
    const fs = await import('fs');
    const path = await import('path');
    const zip = new JSZip();

    const rootDir = process.cwd();
    const ignoreDirs = new Set(['node_modules', '.git', 'dist', '.cache']);

    function addDirToZip(currentDir: string, zipFolder: any) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoreDirs.has(entry.name)) continue;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          const subFolder = zipFolder.folder(entry.name);
          addDirToZip(fullPath, subFolder);
        } else if (entry.isFile()) {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(entry.name, content);
        }
      }
    }

    addDirToZip(rootDir, zip);

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=ielts-journey-with-hossain-source-${Date.now()}.zip`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate code zip', details: err.message });
  }
});

