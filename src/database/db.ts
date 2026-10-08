import mysql, { Pool } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export interface DbQueryResult<T = any> {
  rows: T[];
  insertId?: number;
  affectedRows?: number;
}

let mysqlPool: Pool | null = null;
let isUsingFallback = false;

// Fallback in-memory and persistent file-based store for dev environment
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'dev_database.json');

interface FallbackStore {
  users: any[];
  admins: any[];
  categories: any[];
  lessons: any[];
  pdfs: any[];
  user_progress: any[];
  bookmarks: any[];
  comments: any[];
  comment_likes: any[];
  reports: any[];
  support_requests: any[];
  support_messages: any[];
  notifications: any[];
  learning_roadmaps: any[];
  practice_submissions: any[];
  user_follows: any[];
  chat_requests: any[];
  direct_messages: any[];
  user_blocks: any[];
  verification_codes: any[];
  settings: Record<string, string>;
  counters: Record<string, number>;
}

let localStore: FallbackStore | null = null;

function getInitialStore(): FallbackStore {
  return {
    users: [
      {
        id: 1,
        telegram_id: 123456789,
        username: 'hossain_ielts',
        first_name: 'Hossain',
        last_name: 'Ahmad',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        language: 'en',
        status: 'active',
        bio: 'Chief Instructor at IELTS Journey with Hossain. Band 8.5 Master.',
        target_band: 'Band 8.5+ Mentor',
        experience_level: 'Band 8.5+ Mentor',
        is_mentor: true,
        whatsapp: '+8801700000000',
        facebook: 'https://facebook.com/hossain.ielts',
        email: 'hossain@ieltsjourney.com',
        is_verified: true,
        created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
        last_active: new Date().toISOString()
      },
      {
        id: 2,
        telegram_id: 987654321,
        username: 'tanvir_study',
        first_name: 'Tanvir',
        last_name: 'Hasan',
        photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        language: 'en',
        status: 'active',
        bio: 'IELTS Academic Candidate. Focusing on Writing Task 2 & Reading.',
        target_band: 'Target Band 7.5',
        experience_level: 'Band 7.5+',
        is_mentor: false,
        whatsapp: '+8801811111111',
        facebook: 'https://facebook.com/tanvir.ielts',
        email: 'tanvir@student.com',
        is_verified: true,
        created_at: new Date('2026-01-10T00:00:00Z').toISOString(),
        last_active: new Date().toISOString()
      },
      {
        id: 3,
        telegram_id: 555123456,
        username: 'nusrat_jahan',
        first_name: 'Nusrat',
        last_name: 'Jahan',
        photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        language: 'en',
        status: 'active',
        bio: 'Speaking Part 2 enthusiast. Looking for serious English speaking study partners!',
        target_band: 'Target Band 7.0',
        experience_level: 'Intermediate',
        is_mentor: false,
        whatsapp: null,
        facebook: null,
        email: 'nusrat@student.com',
        is_verified: false,
        created_at: new Date('2026-02-01T00:00:00Z').toISOString(),
        last_active: new Date().toISOString()
      }
    ],
    admins: [
      {
        id: 1,
        telegram_id: 123456789,
        name: 'Hossain Ahmad (Chief Instructor)',
        role: 'superadmin',
        created_at: new Date('2026-01-01T00:00:00Z').toISOString()
      }
    ],
    categories: [
      { id: 1, name: 'Grammar', slug: 'grammar', description: 'Essential English grammar structures for IELTS 7.0+ accuracy', icon: 'book-open', display_order: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Vocabulary', slug: 'vocabulary', description: 'Topic-specific academic collocations, idioms, and advanced lexical resource', icon: 'sparkles', display_order: 2, created_at: new Date().toISOString() },
      { id: 3, name: 'Reading', slug: 'reading', description: 'Skimming, scanning, True/False/Not Given, and passage speed strategies', icon: 'file-text', display_order: 3, created_at: new Date().toISOString() },
      { id: 4, name: 'Writing', slug: 'writing', description: 'Task 1 data analysis and Task 2 opinion, discussion & problem-solution essays', icon: 'pen-tool', display_order: 4, created_at: new Date().toISOString() },
      { id: 5, name: 'Speaking', slug: 'speaking', description: 'Part 1 fluency, Part 2 2-minute cue card talks, and Part 3 abstract discussion', icon: 'mic', display_order: 5, created_at: new Date().toISOString() },
      { id: 6, name: 'Listening', slug: 'listening', description: 'Form filling, multiple choice, map labeling, and accent mastery techniques', icon: 'headphones', display_order: 6, created_at: new Date().toISOString() },
      { id: 7, name: 'IELTS Academic', slug: 'ielts-academic', description: 'Specialized academic test blueprints, university entry requirements & tips', icon: 'award', display_order: 7, created_at: new Date().toISOString() },
      { id: 8, name: 'IELTS General', slug: 'ielts-general', description: 'General training letter writing, workplace reading, and immigration prep', icon: 'briefcase', display_order: 8, created_at: new Date().toISOString() }
    ],
    lessons: [
      {
        id: 1,
        title: 'ধাপ ১: Basic Sentence Structure & Subject-Verb Agreement',
        slug: 'basic-sentence-structure-subject-verb-agreement',
        category_id: 1,
        order_index: 1,
        prerequisite_text: 'শুরু করার প্রাথমিক ধাপ',
        description: 'সঠিক ইংরেজি বাক্য গঠনের মৌলিক নিয়ম ও Subject-Verb Agreement এর সাধারণ ভুল সংশোধন।',
        content: `### Subject-Verb Agreement Fundamentals\n\nIELTS এবং সাধারণ ইংরেজি লেখায় ৮০% ব্যাকরণগত ভুল হয় সাবজেক্ট ও ভার্বের গরমিলের কারণে।\n\n#### মূল সূত্রসমূহ:\n1. **Singular Subject -> Singular Verb**:\n   - *Incorrect*: The group of students were studying.\n   - *Correct*: **The group of students was studying.**\n\n2. **Compound Subjects with 'And'**:\n   - *Example*: Both environmental sustainability and economic growth **are** critical.\n\n3. **Neither... Nor / Either... Or**:\n   - Verb aligns with the closest subject: *Neither the teacher nor the students were present.*`,
        level: 'Beginner',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        status: 'published',
        views_count: 420,
        created_at: new Date('2026-01-10T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'ধাপ ২: Mastering Complex Sentences for IELTS Writing Band 7+',
        slug: 'mastering-complex-sentences-ielts-writing',
        category_id: 1,
        order_index: 2,
        prerequisite_text: 'ধাপ ১ সম্পন্ন করার পর পড়ুন',
        description: 'Learn how to construct compound-complex sentences, subordinate clauses, and conditional patterns to boost your Grammatical Range score.',
        content: `### Why Complex Sentences Matter in IELTS Writing\n\nIn the official IELTS Writing Band Descriptors, Band 7 requires the candidate to use a variety of complex structures with frequent error-free sentences. Writing only short, simple sentences will cap your score at Band 5.5 or 6.0.\n\n#### Key Sentence Patterns to Master:\n\n1. **Adverbial Clauses of Contrast**:\n   - *Band 8.0*: **Although municipal authorities have introduced stringent environmental regulations, industrial emissions continue to escalate at an alarming rate.**\n\n2. **Conditional Structures (Inversion)**:\n   - *Advanced*: **Had public awareness campaigns been implemented sooner, municipal waste production would have reduced significantly.**`,
        level: 'Band 7-9',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        status: 'published',
        views_count: 512,
        created_at: new Date('2026-01-15T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'ধাপ ৩: Conditional Structures & Inversion Patterns',
        slug: 'conditional-structures-inversion-patterns',
        category_id: 1,
        order_index: 3,
        prerequisite_text: 'ধাপ ২ সম্পন্ন করার পর পড়ুন',
        description: 'হাই-ব্যান্ড কন্ডিশনাল ও ইনভার্সন কৌশল (Had I known, Were it to happen) দিয়ে ব্যাকরণিক উৎকর্ষতা অর্জন।',
        content: `### Advanced Inversion Conditionals\n\nBand 8.0+ গ্রামার দেখানোর অন্যতম সেরা উপায় হলো Inversion ব্যবহার করা।\n\n- Type 3 Inversion: *Had governments invested heavily in solar power, carbon output would have dropped.*`,
        level: 'Advanced',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        status: 'published',
        views_count: 295,
        created_at: new Date('2026-01-18T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        title: 'ধাপ ১: Academic Word List (AWL) Core 100 Words',
        slug: 'academic-word-list-awl-core-100',
        category_id: 2,
        order_index: 1,
        prerequisite_text: 'ভোকাবুলারি মডিউলের প্রথম ধাপ',
        description: 'আইইএলটিএস রিডিং ও রাইটিং-এ সর্বাধিক ব্যবহৃত ১০০টি একাডেমিক শব্দের সঠিক ব্যবহার।',
        content: `### Academic Word List Mastery\n\nপ্রতিটি একাডেমিক টাস্কে এই শব্দগুলো বারবার আসে: *Analyze, Significant, Approach, Concept, Establish, Identify, Require, Research, Factor, Policy*.`,
        level: 'Beginner',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
        status: 'published',
        views_count: 380,
        created_at: new Date('2026-01-20T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        title: 'ধাপ ২: Top 50 Academic Collocations for Task 2 Essays',
        slug: 'top-50-academic-collocations-task-2',
        category_id: 2,
        order_index: 2,
        prerequisite_text: 'ধাপ ১ সম্পন্ন করার পর পড়ুন',
        description: 'Replace simplistic words like good, bad, and big with high-yield collocations that IELTS examiners look for.',
        content: `### Lexical Resource Strategy\n\nUsing advanced vocabulary is about natural collocation: *Pervasive phenomenon, Exert undue pressure on, Precipitate unprecedented challenges, Bridge socioeconomic disparities*.`,
        level: 'Intermediate',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800',
        status: 'published',
        views_count: 460,
        created_at: new Date('2026-01-22T12:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        title: 'ধাপ ১: Skimming, Scanning & Paragraph Mapping',
        slug: 'skimming-scanning-paragraph-mapping',
        category_id: 3,
        order_index: 1,
        prerequisite_text: 'রিডিং মডিউলের প্রথম ধাপ',
        description: '২০ মিনিটে একটি বড় রিডিং প্যাসেজ দ্রুত পড়ার ও মূল ভাব বের করার পরীক্ষিত টেকনিক।',
        content: `### The 3-Step Reading Method\n\n1. Skim Title and First Sentence of each paragraph (60 seconds)\n2. Underline Keywords in Questions\n3. Scan for Synonyms in the text.`,
        level: 'Intermediate',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
        status: 'published',
        views_count: 310,
        created_at: new Date('2026-02-01T09:30:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 7,
        title: 'ধাপ ২: Tackling True / False / Not Given in Academic Reading',
        slug: 'tackling-true-false-not-given-reading',
        category_id: 3,
        order_index: 2,
        prerequisite_text: 'ধাপ ১ সম্পন্ন করার পর পড়ুন',
        description: 'Demystifying the difference between FALSE and NOT GIVEN with concrete passage examples.',
        content: `### The Golden Rule of T/F/NG\n\n- **TRUE**: The text conveys the *exact same meaning*.\n- **FALSE**: The text conveys the *opposite*.\n- **NOT GIVEN**: The text does not confirm or deny the statement.`,
        level: 'Beginner',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
        status: 'published',
        views_count: 510,
        created_at: new Date('2026-02-05T09:30:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 8,
        title: 'ধাপ ১: Task 1 Academic Overview & Key Trend Vocabulary',
        slug: 'task-1-academic-overview-trend-vocabulary',
        category_id: 4,
        order_index: 1,
        prerequisite_text: 'রাইটিং মডিউলের প্রথম ধাপ',
        description: 'Line graph, Bar chart এবং Pie chart-এর ট্রেন্ড ও তুলনা লেখার সুনির্দিষ্ট কাঠামো।',
        content: `### Task 1 4-Step Formula\n1. Paraphrase Question\n2. Overview (Key trends without data)\n3. Body 1 (Highest values and major changes)\n4. Body 2 (Remaining details and comparisons)`,
        level: 'Intermediate',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        status: 'published',
        views_count: 430,
        created_at: new Date('2026-02-08T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 9,
        title: 'ধাপ ২: Task 2 4-Paragraph Essay Structure & Cohesion',
        slug: 'task-2-4-paragraph-essay-structure',
        category_id: 4,
        order_index: 2,
        prerequisite_text: 'ধাপ ১ সম্পন্ন করার পর পড়ুন',
        description: '২৫০ শব্দের ব্যালান্সড এসে ২০ মিনিটে লেখার পূর্ণাঙ্গ ব্লুপ্রিন্ট ও টেমপ্লেট।',
        content: `### Task 2 Structure\n- Introduction: Paraphrase + Clear Thesis\n- Body 1: First Main Argument + Evidence + Explanation\n- Body 2: Second Main Argument + Example\n- Conclusion: Summary of stance.`,
        level: 'Band 7-9',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        status: 'published',
        views_count: 590,
        created_at: new Date('2026-02-10T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 10,
        title: 'ধাপ ১: Speaking Part 1 Fluency & Natural Fillers',
        slug: 'speaking-part-1-fluency-natural-fillers',
        category_id: 5,
        order_index: 1,
        prerequisite_text: 'স্পিকিং মডিউলের প্রথম ধাপ',
        description: 'প্রথম মিনিটেই এক্সামিনারকে ইম্প্রেস করার মতো স্বাভাবিক উচ্চারণ ও ফ্লুয়েন্সি তৈরি।',
        content: `### Natural Fillers for Part 1\n\nAvoid silence with: *Well, to be perfectly honest...*, *As far as I can recall...*, *That is an intriguing question...*`,
        level: 'Beginner',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        status: 'published',
        views_count: 360,
        created_at: new Date('2026-02-12T11:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 11,
        title: 'ধাপ ২: IELTS Speaking Part 2: The 2-Minute Fluency Framework',
        slug: 'ielts-speaking-part-2-fluency-framework',
        category_id: 5,
        order_index: 2,
        prerequisite_text: 'ধাপ ১ সম্পন্ন করার পর পড়ুন',
        description: 'How to prepare notes in 1 minute and speak uninterrupted for 2 full minutes without running out of ideas.',
        content: `### The PPFE Structure for Cue Cards\n\n1. **P - Past Context (30 seconds)**\n2. **P - Present Details (45 seconds)**\n3. **F - Feelings & Reflection (30 seconds)**\n4. **E - Extended Future Projection (15 seconds)**`,
        level: 'Intermediate',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        status: 'published',
        views_count: 412,
        created_at: new Date('2026-02-14T15:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 12,
        title: 'ধাপ ১: Listening Section 1 Form Completion & Spelling Drills',
        slug: 'listening-section-1-form-completion-spelling',
        category_id: 6,
        order_index: 1,
        prerequisite_text: 'লিসেনিং মডিউলের প্রথম ধাপ',
        description: 'নাম, ঠিকানা, ফোন নম্বর এবং বানান ভুলের কারণে নম্বর কাটা পড়া প্রতিরোধ করার কৌশল।',
        content: `### Listening Accuracy Strategies\n\n- Capitalization of Proper Nouns\n- Singular vs Plural (-s endings)\n- Numbers: Double vs Single digits.`,
        level: 'Beginner',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
        status: 'published',
        views_count: 320,
        created_at: new Date('2026-02-15T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 13,
        title: 'ধাপ ১: Understanding Band 7.5+ Official Examiner Descriptors',
        slug: 'understanding-band-descriptors-academic',
        category_id: 7,
        order_index: 1,
        prerequisite_text: 'একাডেমিক মডিউলের প্রথম ধাপ',
        description: 'আইইএলটিএস এক্সামিনাররা কোন ৪টি ক্রাইটেরিয়ায় নম্বর দেন এবং কীভাবে ব্যান্ড স্কোর বাড়ানো যায়।',
        content: `### The 4 Assessment Pillars\n\n1. Task Achievement / Response (25%)\n2. Coherence and Cohesion (25%)\n3. Lexical Resource (25%)\n4. Grammatical Range and Accuracy (25%)`,
        level: 'Band 7-9',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
        status: 'published',
        views_count: 410,
        created_at: new Date('2026-02-16T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 14,
        title: 'ধাপ ১: General Training Letter Writing (Formal & Informal)',
        slug: 'general-training-letter-writing-formal-informal',
        category_id: 8,
        order_index: 1,
        prerequisite_text: 'জেনারেল ট্রেনিং মডিউলের প্রথম ধাপ',
        description: 'কমপ্লেইন লেটার, রিকুয়েস্ট লেটার এবং ফ্রেন্ডলি লেটারের জন্য ওপেনিং ও সাইন-অফ টেমপ্লেট।',
        content: `### GT Task 1 Letter Guidelines\n\n- Formal: *Dear Sir/Madam, I am writing to express my dissatisfaction regarding... Yours faithfully.*\n- Semi-formal: *Dear Mr. Davis... Yours sincerely.*\n- Informal: *Dear Alex... Warm regards.*`,
        level: 'Intermediate',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        status: 'published',
        views_count: 280,
        created_at: new Date('2026-02-17T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    pdfs: [
      {
        id: 1,
        title: 'ধাপ ১ গাইড: IELTS Grammar Mastery - 50 High-Band Structural Templates',
        description: 'ক্যাটাগরি ১ (Grammar) এর সম্পূর্ণ ধারাবাহিক হ্যান্ডনোট। কমপ্লেক্স বাক্য, ক্লজ ও ইনভার্সন ফর্মুলা সহ প্র্যাকটিস ফাইল।',
        category_id: 1,
        google_drive_url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
        file_size_text: '3.8 MB PDF',
        status: 'published',
        downloads_count: 740,
        created_at: new Date('2026-01-12T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'ধাপ ১ গাইড: Mastering 1200 Academic Collocations & Phrasal Verbs',
        description: 'ক্যাটাগরি ২ (Vocabulary) এর আলফাবেটিক্যাল ইনডেক্স। উচ্চমানের শব্দবন্ধ ও প্র্যাকটিস শিট।',
        category_id: 2,
        google_drive_url: 'https://drive.google.com/file/d/1mN_collocations_ielts_guide_drive/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
        file_size_text: '6.8 MB PDF',
        status: 'published',
        downloads_count: 540,
        created_at: new Date('2026-02-05T14:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'ধাপ ১ গাইড: IELTS Academic Reading Strategy Handbook & Speed Drills',
        description: 'ক্যাটাগরি ৩ (Reading) এর স্পিড রিডিং ও T/F/NG ট্র্যাপ এড়ানোর সমাধান সম্বলিত মাস্টার ফাইল।',
        category_id: 3,
        google_drive_url: 'https://drive.google.com/file/d/1c2Z7x9k0YF1w4v8b1e4_sample_reading/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
        file_size_text: '5.4 MB PDF',
        status: 'published',
        downloads_count: 610,
        created_at: new Date('2026-02-06T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        title: 'ধাপ ১ গাইড: IELTS Academic Writing Task 2 - Band 8 Essay Templates',
        description: 'ক্যাটাগরি ৪ (Writing) এর ১৫টি উচ্চমানের এসে স্কেলেটন ও মডেল উত্তর সংকলন।',
        category_id: 4,
        google_drive_url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
        file_size_text: '4.2 MB PDF',
        status: 'published',
        downloads_count: 820,
        created_at: new Date('2026-01-18T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        title: 'ধাপ ১ গাইড: Speaking Part 2 & 3 Predicted Cue Cards (2026 Edition)',
        description: 'ক্যাটাগরি ৫ (Speaking) এর লেটেস্ট কিউ কার্ড এবং ব্যান্ড ৮.৫ মডেল উত্তর ও ইডিয়াম সংকলন।',
        category_id: 5,
        google_drive_url: 'https://drive.google.com/file/d/1sP_speaking_cuecards_2026_drive/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
        file_size_text: '5.1 MB PDF',
        status: 'published',
        downloads_count: 730,
        created_at: new Date('2026-02-12T16:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        title: 'ধাপ ১ গাইড: IELTS Listening Accent Guide & 500 Word Pairs Audioscripts',
        description: 'ক্যাটাগরি ৬ (Listening) এর ব্রিটিশ ও অস্ট্রেলিয়ান অ্যাকসেন্ট চেনার নিয়ম ও অডিও স্ক্রিপ্ট।',
        category_id: 6,
        google_drive_url: 'https://drive.google.com/file/d/1L_listening_scripts_guide_drive/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
        file_size_text: '8.2 MB PDF',
        status: 'published',
        downloads_count: 490,
        created_at: new Date('2026-02-13T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 7,
        title: 'ধাপ ১ গাইড: Cambridge IELTS Academic 19 - Full Answer Key & Explanations',
        description: 'ক্যাটাগরি ৭ (Academic) এর কেমব্রিজ টেস্ট ১৯ পূর্ণাঙ্গ বিশ্লেষণ ও ব্যান্ড ৭+ ভোকাবুলারি হাইলাইটস।',
        category_id: 7,
        google_drive_url: 'https://drive.google.com/file/d/1c2Z7x9k0YF1w4v8b1e4_sample_cambridge19/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
        file_size_text: '18.5 MB PDF',
        status: 'published',
        downloads_count: 890,
        created_at: new Date('2026-01-25T11:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 8,
        title: 'ধাপ ১ গাইড: General Training Writing Task 1 - 30 Model Band 9 Letters',
        description: 'ক্যাটাগরি ৮ (General) এর ৩০টি মডেল লেটার, চেকলিস্ট ও স্ট্যান্ডার্ড ফরম্যাট।',
        category_id: 8,
        google_drive_url: 'https://drive.google.com/file/d/1G_general_training_letters_drive/view?usp=sharing',
        thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
        file_size_text: '4.9 MB PDF',
        status: 'published',
        downloads_count: 430,
        created_at: new Date('2026-02-16T12:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    user_progress: [
      { id: 1, user_id: 1, lesson_id: 1, is_completed: 1, last_opened_at: new Date().toISOString(), completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: 2, user_id: 1, lesson_id: 2, is_completed: 0, last_opened_at: new Date().toISOString(), completed_at: null, created_at: new Date().toISOString() }
    ],
    bookmarks: [
      { id: 1, user_id: 1, lesson_id: 1, created_at: new Date().toISOString() },
      { id: 2, user_id: 1, lesson_id: 3, created_at: new Date().toISOString() }
    ],
    comments: [
      {
        id: 1,
        lesson_id: 1,
        user_id: 1,
        parent_id: null,
        content: 'Welcome students! Practice writing your own compound-complex sentences in the replies below. I will personally review and provide band feedback on your syntax!',
        is_pinned: 1,
        is_hidden: 0,
        likes_count: 14,
        created_at: new Date('2026-01-16T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        lesson_id: 1,
        user_id: 2,
        parent_id: 1,
        content: 'Sir Hossain, could you clarify whether "Whereas" can be placed in both initial and middle positions of the clause without changing punctuation?',
        is_pinned: 0,
        is_hidden: 0,
        likes_count: 4,
        created_at: new Date('2026-01-16T11:30:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        lesson_id: 1,
        user_id: 1,
        parent_id: 2,
        content: 'Great question Tanvir! Yes, when placed initially: "Whereas pollution levels rise, mitigation funds are dwindling." When mid-sentence, use a preceding comma: "Mitigation funds are dwindling, whereas pollution levels continue to rise."',
        is_pinned: 0,
        is_hidden: 0,
        likes_count: 8,
        created_at: new Date('2026-01-16T12:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        lesson_id: 2,
        user_id: 3,
        parent_id: null,
        content: 'The collocation "pervasive phenomenon" worked wonders in my mock exam yesterday! My tutor praised the lexical naturalness.',
        is_pinned: 0,
        is_hidden: 0,
        likes_count: 5,
        created_at: new Date('2026-01-21T08:20:00Z').toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    comment_likes: [
      { id: 1, comment_id: 1, user_id: 1, created_at: new Date().toISOString() },
      { id: 2, comment_id: 1, user_id: 2, created_at: new Date().toISOString() },
      { id: 3, comment_id: 3, user_id: 2, created_at: new Date().toISOString() }
    ],
    reports: [],
    support_requests: [
      {
        id: 1,
        user_id: 2,
        subject: 'Clarification regarding Writing Task 1 Bar Chart comparison',
        status: 'Answered',
        priority: 'Normal',
        created_at: new Date('2026-02-14T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    support_messages: [
      {
        id: 1,
        request_id: 1,
        sender_id: 2,
        sender_role: 'user',
        message: 'Hello Brother Hossain, when comparing 5 categories across two years in Task 1, should I group by year or by category? Which structure is preferred for Band 7+?',
        created_at: new Date('2026-02-14T10:00:00Z').toISOString()
      },
      {
        id: 2,
        request_id: 1,
        sender_id: 1,
        sender_role: 'admin',
        message: 'Hello Tanvir! Generally, grouping by dynamic change or significant patterns delivers higher coherence and cohesion than listing mechanical bullet points. Check our Task 1 guide in the PDF library!',
        created_at: new Date('2026-02-14T11:45:00Z').toISOString()
      }
    ],
    notifications: [
      {
        id: 1,
        user_id: 1,
        title: 'Welcome to IELTS Journey with Hossain',
        message: 'Explore our comprehensive lessons, download authentic Cambridge PDFs, and start tracking your preparation progress today!',
        type: 'Admin Announcement',
        is_read: 0,
        link_url: '/lessons',
        created_at: new Date('2026-02-01T00:00:00Z').toISOString()
      },
      {
        id: 2,
        user_id: 1,
        title: 'New Cambridge IELTS 19 Guide Added',
        message: 'Check out the newly uploaded Cambridge IELTS 19 Explanatory PDF in the PDF library.',
        type: 'New PDF',
        is_read: 0,
        link_url: '/pdfs',
        created_at: new Date('2026-02-15T00:00:00Z').toISOString()
      }
    ],
    learning_roadmaps: [
      {
        id: 1,
        step_number: 1,
        title_bn: 'লেভেল ০: ধ্বনি উচ্চারণ ও ইংরেজি বর্ণমালার সাউন্ডস',
        title_en: 'Level 0: Phonetics, Letter Sounds & Basic Pronunciation',
        level_tag: 'Level 0 (শুরু)',
        description_bn: 'একদম শূন্য থেকে ইংরেজি শুরু করতে সবার আগে লেটার সাউন্ডস (Phonetic Sounds), ভাওয়েল ও কনসোনেন্ট-এর সঠিক উচ্চারণ শেখা আবশ্যক। এতে মুখের জড়তা দূর হবে।',
        key_points: [
          'A to Z অক্ষরের খাঁটি ইংরেজি সাউন্ড (Short / Long Vowels)',
          'P, T, K ধ্বনির এস্পিরেশন (Aspiration Rule: P/প না বলে ফ্-এর মতো মৃদু বাতাস)',
          'Daily Greeting Expressions: "Good morning", "How are you doing?", "Nice to meet you"'
        ],
        exercises: [
          {
            id: 101,
            question: 'Which word has the long "ee" sound like "see"?',
            question_bn: 'নিচের কোন শব্দে "see"-এর মতো দীর্ঘ "ee" সাউন্ড আছে?',
            type: 'mcq',
            options: ['Ship', 'Sheep', 'Sit', 'Hit'],
            correct_answer: 'Sheep',
            explanation_bn: '"Sheep" শব্দে দীর্ঘ /iː/ সাউন্ড উচ্চারিত হয়, আর "Ship" শব্দে শর্ট /ɪ/ সাউন্ড হয়।',
            hint_bn: 'দীর্ঘ স্বরধ্বনি চেনার চেষ্টা করুন।'
          },
          {
            id: 102,
            question: 'How do you greet someone politely in the morning?',
            question_bn: 'সকালে কাউকে বিনয়ের সাথে অভিবাদন জানাতে কোনটি ব্যবহার করবেন?',
            type: 'mcq',
            options: ['Good night', 'Good morning, how are you?', 'Goodbye', 'See you yesterday'],
            correct_answer: 'Good morning, how are you?',
            explanation_bn: 'সকালে আদর্শ সম্ভাষণ হলো "Good morning, how are you?"।',
            hint_bn: 'সকালের গ্রীটিংস মনে করুন।'
          }
        ]
      },
      {
        id: 2,
        step_number: 2,
        title_bn: 'লেভেল ১: দৈনন্দিন অতিপ্রয়োজনীয় শব্দ ও সহজ প্রশ্ন তৈরি',
        title_en: 'Level 1: Everyday High-Frequency Words & Asking Simple Questions',
        level_tag: 'Level 1 (বেসিক)',
        description_bn: 'প্রতিদিনের ব্যবহার্য ৫০টি মূল ক্রিয়াপদ (Eat, Sleep, Go, Come, Work) এবং "Wh-Question" (What, Where, When, Why, How) তৈরি করার নিয়মিত অনুশীলন।',
        key_points: [
          'Top 50 Daily Action Verbs (Regular & Irregular)',
          'Wh-Question Formula: Wh-word + do/does + Subject + Verb?',
          'Self-Introduction Template: নাম, বাসস্থান, পেশা ও শখ বলার প্যাটার্ন'
        ],
        exercises: [
          {
            id: 201,
            question: 'Correct question for: "I live in Dhaka."',
            question_bn: '"আমি ঢাকায় থাকি" - এর সঠিক ইংরেজি প্রশ্ন কোনটি?',
            type: 'mcq',
            options: ['Where do you live?', 'What do you live?', 'When do you live?', 'Who do you live?'],
            correct_answer: 'Where do you live?',
            explanation_bn: 'স্থানের ক্ষেত্রে সর্বদা "Where" দিয়ে প্রশ্ন শুরু করতে হয়: Where + do + you + live?',
            hint_bn: 'স্থান বোঝাতে কোন Wh-word ব্যবহৃত হয়?'
          },
          {
            id: 202,
            question: 'She ___ to college every day by bus.',
            question_bn: 'শূন্যস্থানে সঠিক ভার্ব ফর্মটি নির্বাচন করুন:',
            type: 'mcq',
            options: ['go', 'goes', 'went', 'gone'],
            correct_answer: 'goes',
            explanation_bn: 'Third person singular (She/He/It) হলে প্রেজেন্ট ইনডিফিনিট টেন্সে ভার্বের সাথে s/es যুক্ত হয়ে "goes" হয়।',
            hint_bn: 'Third person singular নিয়ম।'
          }
        ]
      },
      {
        id: 3,
        step_number: 3,
        title_bn: 'লেভেল ২: বাক্য গঠন ফর্মুলা ও টেন্সের নির্ভুল প্রয়োগ',
        title_en: 'Level 2: Sentence Structure (SVO) & Clear Tense Application',
        level_tag: 'Level 2 (বাক্য গঠন)',
        description_bn: 'Subject + Verb + Object কাঠামোর মাধ্যমে অর্থপূর্ণ বাক্য তৈরি এবং ৩টি মূল টেন্স (Past, Present, Future) ভুল ছাড়া ব্যবহারের অনুশীলন।',
        key_points: [
          'Basic Word Order: Subject + Auxiliary Verb + Main Verb + Object + Manner + Place + Time',
          'Past Simple vs Present Perfect (I went vs I have gone)',
          'Negation Formula: do not / does not / did not + Base Verb'
        ],
        exercises: [
          {
            id: 301,
            question: 'Identify the grammatically correct past tense sentence:',
            question_bn: 'নিচের কোন বাক্যটি ব্যাকরণগতভাবে সঠিক অতীতকাল নির্দেশ করে?',
            type: 'mcq',
            options: ['I didn\'t saw him yesterday.', 'I didn\'t see him yesterday.', 'I not saw him yesterday.', 'I don\'t saw him yesterday.'],
            correct_answer: 'I didn\'t see him yesterday.',
            explanation_bn: '"did not"-এর পর সর্বদা ভার্বের বেইজ ফর্ম (V1: see) বসে, পাস্ট ফর্ম (saw) বসে না।',
            hint_bn: 'did not + V1 নিয়ম মনে রাখুন।'
          },
          {
            id: 302,
            question: 'I have known him ___ three years.',
            question_bn: 'শূন্যস্থানে সঠিক প্রিপজিশনটি কী হবে?',
            type: 'mcq',
            options: ['since', 'for', 'at', 'during'],
            correct_answer: 'for',
            explanation_bn: 'সময়ের পরিধি (Period of time: three years) বোঝাতে "for" বসে; নির্দিষ্ট শুরুর সময় (Point of time) বোঝাতে "since" বসে।',
            hint_bn: 'Period of time vs Point of time।'
          }
        ]
      },
      {
        id: 4,
        step_number: 4,
        title_bn: 'লেভেল ৩: ফ্লুয়েন্সি ও স্পিকিং পার্টনার ড্রিলস',
        title_en: 'Level 3: Conversational Linking & Speaking Partner Drills',
        level_tag: 'Level 3 (ফ্লুয়েন্সি)',
        description_bn: 'কথা বলার সময় চিন্তা করতে সময় নেওয়া কমানো, ফিলারস পরিহার করা, এবং সহপাঠী বা মেন্টরের সাথে সরাসরি প্রশ্ন-উত্তরের মাধ্যমে জড়তা ভাঙা।',
        key_points: [
          'Connecting discourse markers: "Furthermore", "On the other hand", "As a matter of fact"',
          '2-Minute Non-stop Speaking Technique (PPFE: Past, Present, Feelings, Future)',
          'Finding & Practicing with a Study Partner inside IELTS Journey'
        ],
        exercises: [
          {
            id: 401,
            question: 'Which connector indicates a contrast between two ideas?',
            question_bn: 'কোন কানেক্টরটি দুটি বিপরীত চিন্তাভাবনাকে যুক্ত করতে ব্যবহৃত হয়?',
            type: 'mcq',
            options: ['Moreover', 'Consequently', 'However', 'Similarly'],
            correct_answer: 'However',
            explanation_bn: '"However" ব্যবহৃত হয় বৈসাদৃশ্য বা Contrast বোঝাতে।',
            hint_bn: 'বিপরীত অর্থ প্রকাশ করে এমন শব্দ।'
          }
        ]
      },
      {
        id: 5,
        step_number: 5,
        title_bn: 'লেভেল ৪: ব্যান্ড ৭+ কমপ্লেক্স সেন্টেন্স ও মক ড্রিলস',
        title_en: 'Level 4: Advanced Collocations, Complex Syntax & IELTS Band 7+',
        level_tag: 'Level 4 (IELTS 7+)',
        description_bn: 'আইইএলটিএস ব্যান্ড ৭.০ থেকে ৮.৫ অর্জনের জন্য একাডেমিক রাইটিং টাস্ক ২ ও স্পিকিং পার্ট ৩-এর উচ্চমানের সিনট্যাক্স ও লেক্সিক্যাল রিসোর্স আয়ত্ত করা।',
        key_points: [
          'Subordinate & Concession Clauses: Although, Whereas, In spite of',
          'Inversion Patterns: "Not only... but also", "Had I known..."',
          'Academic Collocations: "Pervasive phenomenon", "Viable alternative", "Fiscal allocation"'
        ],
        exercises: [
          {
            id: 501,
            question: 'Choose the Band 8.0 inverted sentence:',
            question_bn: 'ব্যান্ড ৮.০ মানের ইনভারশন বাক্যটি নির্বাচন করুন:',
            type: 'mcq',
            options: [
              'If governments invest more, emissions will fall.',
              'Should municipal authorities allocate additional funds, industrial emissions will significantly decrease.',
              'Governments must invest more money so emissions decrease.',
              'When funds are allocated, emissions drops.'
            ],
            correct_answer: 'Should municipal authorities allocate additional funds, industrial emissions will significantly decrease.',
            explanation_bn: '"Should municipal authorities allocate..." হলো কন্ডিশনাল ইনভারশন যা আইইএলটিএস রাইটিং-এ সর্বোচ্চ ব্যাকরণিক বৈচিত্র্য প্রমাণ করে।',
            hint_bn: 'Inversion conditional pattern।'
          }
        ]
      }
    ],
    practice_submissions: [
      { id: 1, user_id: 1, roadmap_id: 1, is_completed: 1, completed_at: new Date().toISOString() },
      { id: 2, user_id: 1, roadmap_id: 2, is_completed: 1, completed_at: new Date().toISOString() },
      { id: 3, user_id: 2, roadmap_id: 1, is_completed: 1, completed_at: new Date().toISOString() }
    ],
    user_follows: [
      { id: 1, follower_id: 2, following_id: 1, created_at: new Date().toISOString() },
      { id: 2, follower_id: 3, following_id: 1, created_at: new Date().toISOString() }
    ],
    chat_requests: [
      {
        id: 1,
        sender_id: 2,
        receiver_id: 1,
        initial_message: 'আসসালামু আলাইকুম স্যার, আমি স্পিকিং পার্ট ২ এর ফ্লুয়েন্সি নিয়ে কিছু গাইডলাইন চাচ্ছিলাম। আপনার সাথে কি নিয়মিত প্র্যাকটিস করা সম্ভব?',
        status: 'accepted',
        created_at: new Date('2026-02-16T10:00:00Z').toISOString(),
        updated_at: new Date('2026-02-16T11:00:00Z').toISOString()
      },
      {
        id: 2,
        sender_id: 3,
        receiver_id: 2,
        initial_message: 'Hi Tanvir! I saw your essay writing drill. Would you like to be speaking practice partners for 15 mins daily?',
        status: 'pending',
        created_at: new Date('2026-02-18T14:30:00Z').toISOString(),
        updated_at: new Date('2026-02-18T14:30:00Z').toISOString()
      }
    ],
    direct_messages: [
      {
        id: 1,
        chat_request_id: 1,
        sender_id: 2,
        message: 'Hello Sir Hossain, thank you for accepting my chat request! Which topic should I practice for Speaking Cue Card today?',
        created_at: new Date('2026-02-16T11:05:00Z').toISOString()
      },
      {
        id: 2,
        chat_request_id: 1,
        sender_id: 1,
        message: 'Welcome Tanvir! Start with "Describe an environmental problem in your city". Focus on the PPFE structure we covered in Level 3.',
        created_at: new Date('2026-02-16T11:15:00Z').toISOString()
      }
    ],
    user_blocks: [],
    verification_codes: [],
    settings: {
      site_title: 'IELTS Journey with Hossain',
      support_telegram_username: '@HossainIELTS_Official',
      announcement_banner: 'New 2026 IELTS Speaking Predictions now available in PDF Library! Check out Part 2 and Part 3 templates.',
      telegram_channel_url: 'https://t.me/ielts_journey_hossain'
    },
    counters: {
      users: 3,
      admins: 1,
      categories: 8,
      lessons: 14,
      pdfs: 8,
      user_progress: 2,
      bookmarks: 2,
      comments: 4,
      comment_likes: 3,
      reports: 0,
      support_requests: 1,
      support_messages: 2,
      notifications: 2,
      learning_roadmaps: 5,
      practice_submissions: 3,
      user_follows: 2,
      chat_requests: 2,
      direct_messages: 2,
      user_blocks: 0
    }
  };
}

function loadLocalStore(): FallbackStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      const initial = getInitialStore();
      // Ensure all arrays are populated even if older JSON was saved
      parsed.learning_roadmaps = parsed.learning_roadmaps || initial.learning_roadmaps;
      parsed.practice_submissions = parsed.practice_submissions || initial.practice_submissions;
      parsed.user_follows = parsed.user_follows || initial.user_follows;
      parsed.chat_requests = parsed.chat_requests || initial.chat_requests;
      parsed.direct_messages = parsed.direct_messages || initial.direct_messages;
      parsed.user_blocks = parsed.user_blocks || [];
      parsed.verification_codes = parsed.verification_codes || [];
      if (!parsed.lessons || parsed.lessons.length < 10) {
        parsed.lessons = initial.lessons;
      }
      if (!parsed.pdfs || parsed.pdfs.length < 8) {
        parsed.pdfs = initial.pdfs;
      }
      parsed.counters = { ...initial.counters, ...(parsed.counters || {}) };
      return parsed;
    }
  } catch (err) {
    console.warn('[DB] Failed reading dev_database.json, generating default store:', err);
  }
  const initial = getInitialStore();
  saveLocalStore(initial);
  return initial;
}

function saveLocalStore(store: FallbackStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed saving dev_database.json:', err);
  }
}

export async function initDatabase(): Promise<void> {
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'ielts_journey';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

  if (dbHost && dbUser) {
    try {
      console.log(`[DB] Attempting MySQL connection to ${dbUser}@${dbHost}:${dbPort}/${dbName}...`);
      const pool = mysql.createPool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_CA ? { ca: process.env.DB_CA } : undefined
      });

      // Test connection
      const connection = await pool.getConnection();
      console.log('[DB] Successfully connected to MySQL / MariaDB database!');
      connection.release();

      mysqlPool = pool;
      isUsingFallback = false;
      return;
    } catch (err: any) {
      console.warn(`[DB] Could not connect to MySQL server (${err.message}). Using persistent dev database engine.`);
    }
  } else {
    console.log('[DB] DB_HOST / DB_USER not specified in environment. Starting persistent relational store for dev/preview.');
  }

  isUsingFallback = true;
  localStore = loadLocalStore();
  console.log('[DB] Dev relational database initialized with seed data.');
}

export function isDbUsingFallback(): boolean {
  return isUsingFallback;
}

export function getLocalStore(): FallbackStore {
  if (!localStore) {
    localStore = loadLocalStore();
  }
  return localStore;
}

export function persistStore(): void {
  if (localStore) {
    saveLocalStore(localStore);
  }
}

/**
 * Execute a query with parameters against MySQL pool or fallback engine
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (mysqlPool && !isUsingFallback) {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows as T[];
  }
  // Fallback executed in service layer
  return [];
}

/**
 * Execute an INSERT / UPDATE / DELETE query returning insertId and affectedRows
 */
export async function execute(sql: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
  if (mysqlPool && !isUsingFallback) {
    const [result] = await mysqlPool.execute(sql, params);
    const r = result as any;
    return { insertId: r.insertId || 0, affectedRows: r.affectedRows || 0 };
  }
  return { insertId: 0, affectedRows: 0 };
}

export async function closeDatabase(): Promise<void> {
  if (mysqlPool) {
    await mysqlPool.end();
    mysqlPool = null;
    console.log('[DB] MySQL pool closed.');
  }
}
