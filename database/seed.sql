-- ===================================================
-- IELTS Journey with Hossain
-- Database Seed Data
-- ===================================================

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `display_order`) VALUES
(1, 'Grammar', 'grammar', 'Essential English grammar structures for IELTS 7.0+ accuracy', 'book-open', 1),
(2, 'Vocabulary', 'vocabulary', 'Topic-specific academic collocations, idioms, and advanced lexical resource', 'sparkles', 2),
(3, 'Reading', 'reading', 'Skimming, scanning, True/False/Not Given, and passage speed strategies', 'file-text', 3),
(4, 'Writing', 'writing', 'Task 1 data analysis and Task 2 opinion, discussion & problem-solution essays', 'pen-tool', 4),
(5, 'Speaking', 'speaking', 'Part 1 fluency, Part 2 2-minute cue card talks, and Part 3 abstract discussion', 'mic', 5),
(6, 'Listening', 'listening', 'Form filling, multiple choice, map labeling, and accent mastery techniques', 'headphones', 6),
(7, 'IELTS Academic', 'ielts-academic', 'Specialized academic test blueprints, university entry requirements & tips', 'award', 7),
(8, 'IELTS General', 'ielts-general', 'General training letter writing, workplace reading, and immigration prep', 'briefcase', 8)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Default Admin
INSERT INTO `admins` (`id`, `telegram_id`, `name`, `role`) VALUES
(1, 123456789, 'Hossain Ahmad (Chief Instructor)', 'superadmin')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Seed Users for Community & Discussions
INSERT INTO `users` (`id`, `telegram_id`, `username`, `first_name`, `last_name`, `photo_url`, `language`, `status`) VALUES
(1, 123456789, 'hossain_ielts', 'Hossain', 'Ahmad', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'en', 'active'),
(2, 987654321, 'tanvir_study', 'Tanvir', 'Hasan', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'en', 'active'),
(3, 555123456, 'nusrat_jahan', 'Nusrat', 'Jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'en', 'active')
ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);

-- Sample Lessons
INSERT INTO `lessons` (`id`, `title`, `slug`, `category_id`, `description`, `content`, `level`, `video_url`, `thumbnail_url`, `status`, `views_count`) VALUES
(1, 'Mastering Complex Sentences for IELTS Writing Band 7+', 'mastering-complex-sentences-ielts-writing', 1, 
 'Learn how to construct compound-complex sentences, subordinate clauses, and conditional patterns to boost your Grammatical Range score.', 
 '### Why Complex Sentences Matter in IELTS Writing\n\nIn the official IELTS Writing Band Descriptors, Band 7 requires the candidate to use a variety of complex structures with frequent error-free sentences. Writing only short, simple sentences will cap your score at Band 5.5 or 6.0.\n\n#### Key Sentence Patterns to Master:\n\n1. **Adverbial Clauses of Contrast**:\n   - *Basic*: Pollution is rising. Governments are taking action.\n   - *Band 8.0*: **Although municipal authorities have introduced stringent environmental regulations, industrial emissions continue to escalate at an alarming rate.**\n\n2. **Conditional Structures (Inversion)**:\n   - *Standard*: If individuals had been more conscious, waste would have dropped.\n   - *Advanced*: **Had public awareness campaigns been implemented sooner, municipal waste production would have reduced significantly.**\n\n3. **Relative Clauses (Defining vs Non-defining)**:\n   - Use relative pronouns like *which, whereby, whose* to combine observations.\n   - Example: *Urban sprawl has accelerated, **which has subsequently triggered** unprecedented traffic congestion in metropolitan centers.*\n\n### Practical Drill\nTake your last IELTS Task 2 practice essay. Identify any 3 consecutive simple sentences and combine them using a concession clause (`While...`, `Whereas...`) or a participial clause (`Having analyzed the data,...`).', 
 'Band 7-9', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800', 'published', 342),

(2, 'Top 50 Academic Collocations for Task 2 Essays', 'top-50-academic-collocations-task-2', 2, 
 'Replace simplistic words like good, bad, and big with high-yield collocations that IELTS examiners listen and look for.', 
 '### Lexical Resource Strategy\n\nUsing advanced vocabulary is not about throwing archaic words from a thesaurus into your essay; it is about precision and natural collocation.\n\n#### Essential Collocation Categories:\n\n1. **Societal & Global Trends**:\n   - *Pervasive phenomenon* (instead of common thing)\n   - *Exert undue pressure on* (instead of give too much stress)\n   - *Precipitate unprecedented challenges* (instead of cause new problems)\n\n2. **Economic & Financial Arguments**:\n   - *Fiscal allocation* (budget spending)\n   - *Incur astronomical expenditures* (spend a lot of money)\n   - *Viable alternative* (realistic option)\n\n3. **Education & Career Development**:\n   - *Foster critical thinking* (help people think)\n   - *Bridge socioeconomic disparities* (reduce rich-poor gap)\n   - *Nurture indispensable competencies* (develop necessary skills)\n\n### Instructor Hossain''s Advice:\nLearn these in groups of 3 per day and use them in context sentences before applying them under timed examination conditions.', 
 'Intermediate', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800', 'published', 285),

(3, 'IELTS Speaking Part 2: The 2-Minute Fluency Framework', 'ielts-speaking-part-2-fluency-framework', 5, 
 'How to prepare notes in 1 minute and speak uninterrupted for 2 full minutes without running out of ideas or repeating yourself.', 
 '### The PPFE Structure for Cue Cards\n\nMost candidates run out of things to say at the 1 minute 15 seconds mark. To speak confidently for a full 2 minutes, use Hossain''s **PPFE Method**:\n\n1. **P - Past Context (30 seconds)**:\n   Set the scene. Explain when, where, and how you first encountered the person, event, or object.\n2. **P - Present Details (45 seconds)**:\n   Describe the core features, sensory details, and actions.\n3. **F - Feelings & Reflection (30 seconds)**:\n   Why was this memorable to you? How did it alter your perspective?\n4. **E - Extended Future Projection (15 seconds)**:\n   Would you recommend it? Will this trend continue in the future?\n\n### Sample Topic: Describe an interesting old person you met\n- *Past*: I would like to tell you about my grandfather''s acquaintance, Mr. Rahman, whom I encountered during our village festival back in 2021...\n- *Present*: What struck me immediately was his encyclopedic recollection of local folklore...\n- *Feelings*: Interacting with him felt like stepping into an oral historical archive...\n- *Future*: I genuinely hope younger generations take the initiative to document his stories before they fade.', 
 'Intermediate', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', 'published', 412),

(4, 'Tackling True / False / Not Given in Academic Reading', 'tackling-true-false-not-given-reading', 3, 
 'Demystifying the difference between FALSE (contradicted in text) and NOT GIVEN (unverifiable claim) with concrete passage examples.', 
 '### The Golden Rule of T/F/NG\n\n- **TRUE**: The text conveys the *exact same meaning*, usually with synonyms.\n- **FALSE**: The text conveys the *opposite* or *conflicts directly* with the statement.\n- **NOT GIVEN**: The text does not confirm or deny the statement. You cannot prove it true, nor can you prove it false without assumptions.\n\n### Common Trap: Extreme Words\nWatch out for words that modify frequency or certainty: *always, only, impossible, exclusively, majorly, frequently*.\n\nIf the passage says: *"Many scientists believe the phenomenon is recurring."*\nAnd the question says: *"Scientists have proved that the phenomenon **always** recurs."*\nAnswer: **FALSE** (because ''always'' contradicts ''many scientists believe'').\n\nIf the question says: *"The lead researcher was nominated for an award."*\nAnd the passage does not mention any awards at all:\nAnswer: **NOT GIVEN**.', 
 'Beginner', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800', 'published', 510)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Sample PDFs with Google Drive Sharing URLs
INSERT INTO `pdfs` (`id`, `title`, `description`, `category_id`, `google_drive_url`, `thumbnail_url`, `file_size_text`, `status`, `downloads_count`) VALUES
(1, 'IELTS Academic Writing Task 2 - Band 8 Essay Templates & Structure', 
 'Comprehensive collection of 15 high-scoring essay skeletons for opinion, two-sided argument, problem-cause-solution, and direct questions.', 
 4, 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing', 
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', '4.2 MB PDF', 'published', 620),

(2, 'Cambridge IELTS Academic 19 - Full Answer Key & Explanatory Audioscripts', 
 'Complete test analysis, reading passage glossaries, and listening tape scripts annotated with Band 7+ vocabulary highlights.', 
 7, 'https://drive.google.com/file/d/1c2Z7x9k0YF1w4v8b1e4_sample_cambridge19/view?usp=sharing', 
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', '18.5 MB PDF', 'published', 890),

(3, 'Mastering 1200 Academic Collocations & Phrasal Verbs', 
 'Alphabetical index of natural English word partnerships categorized by IELTS themes: Environment, Technology, Education, Health, and Culture.', 
 2, 'https://drive.google.com/file/d/1mN_collocations_ielts_guide_drive/view?usp=sharing', 
 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600', '6.8 MB PDF', 'published', 540),

(4, 'Speaking Part 2 & 3 Predicted Cue Cards (2026 Edition)', 
 'Latest confirmed speaking topics with model Band 8.5 answers, idiomatic expressions, and examiner follow-up strategies.', 
 5, 'https://drive.google.com/file/d/1sP_speaking_cuecards_2026_drive/view?usp=sharing', 
 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600', '5.1 MB PDF', 'published', 730)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Sample Comments & Replies
INSERT INTO `comments` (`id`, `lesson_id`, `user_id`, `parent_id`, `content`, `is_pinned`, `likes_count`) VALUES
(1, 1, 1, NULL, 'Welcome students! Practice writing your own compound-complex sentences in the replies below. I will personally review and provide band feedback on your syntax!', 1, 14),
(2, 1, 2, 1, 'Sir Hossain, could you clarify whether "Whereas" can be placed in both initial and middle positions of the clause without changing punctuation?', 0, 4),
(3, 1, 1, 2, 'Great question Tanvir! Yes, when placed initially: "Whereas pollution levels rise, mitigation funds are dwindling." When mid-sentence, use a preceding comma: "Mitigation funds are dwindling, whereas pollution levels continue to rise."', 0, 8),
(4, 2, 3, NULL, 'The collocation "pervasive phenomenon" worked wonders in my mock exam yesterday! My tutor praised the lexical naturalness.', 0, 5)
ON DUPLICATE KEY UPDATE `content`=VALUES(`content`);

-- Sample Support Request
INSERT INTO `support_requests` (`id`, `user_id`, `subject`, `status`, `priority`) VALUES
(1, 2, 'Clarification regarding Writing Task 1 Bar Chart comparison', 'Answered', 'Normal')
ON DUPLICATE KEY UPDATE `subject`=VALUES(`subject`);

INSERT INTO `support_messages` (`id`, `request_id`, `sender_id`, `sender_role`, `message`) VALUES
(1, 1, 2, 'user', 'Hello Brother Hossain, when comparing 5 categories across two years in Task 1, should I group by year or by category? Which structure is preferred for Band 7+?'),
(2, 1, 1, 'admin', 'Hello Tanvir! Generally, grouping by dynamic change or trend grouping delivers higher coherence and cohesion than simply listing category by category. Check our Writing Task 1 guide in the PDF library!')
ON DUPLICATE KEY UPDATE `message`=VALUES(`message`);

-- Notifications
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `link_url`) VALUES
(1, 1, 'Welcome to IELTS Journey with Hossain', 'Explore our comprehensive lessons, download authentic Cambridge PDFs, and start tracking your preparation progress today!', 'Admin Announcement', 0, '/lessons'),
(2, 2, 'New Cambridge IELTS 19 Guide Added', 'Check out the newly uploaded Cambridge IELTS 19 Explanatory PDF in the PDF library.', 'New PDF', 0, '/pdfs')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Platform Settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('site_title', 'IELTS Journey with Hossain'),
('support_telegram_username', '@HossainIELTS_Official'),
('announcement_banner', 'New 2026 IELTS Speaking Predictions now available in PDF Library! Check out Part 2 and Part 3 templates.'),
('telegram_channel_url', 'https://t.me/ielts_journey_hossain')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);
