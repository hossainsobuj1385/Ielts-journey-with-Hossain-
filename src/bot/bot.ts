import { Telegraf, Markup } from 'telegraf';
import { getLessons, getPdfs } from '../services/appService';

let botInstance: Telegraf | null = null;

export function setupTelegramBot(): Telegraf | null {
  const token = process.env.BOT_TOKEN;
  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.APP_URL || 'https://botkeep.cloud';

  if (!token || token === 'your_telegram_bot_token_from_botfather') {
    console.log('[Telegram Bot] BOT_TOKEN is not configured or using placeholder. Bot polling is paused.');
    console.log('[Telegram Bot] To activate the bot, add your BOT_TOKEN in .env file.');
    return null;
  }

  try {
    const bot = new Telegraf(token);

    // /start command
    bot.start(async (ctx) => {
      const userFirstName = ctx.from?.first_name || 'Learner';
      const welcomeMessage = `*IELTS Journey with Hossain*\n\nWelcome ${userFirstName} to your premium IELTS learning platform!\n\nMaster Grammar, expand high-yield Academic Vocabulary, and access Cambridge PDFs with structured guidance directly in our Telegram Mini App.`;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.webApp('🚀 Open App', webAppUrl)
        ],
        [
          Markup.button.callback('📚 Lessons', 'cmd_lessons'),
          Markup.button.callback('🌱 Roadmap', 'cmd_roadmap')
        ],
        [
          Markup.button.callback('🤝 Study Partners', 'cmd_peers'),
          Markup.button.callback('📄 PDF Library', 'cmd_pdfs')
        ],
        [
          Markup.button.callback('💬 Support', 'cmd_support'),
          Markup.button.callback('👤 Profile', 'cmd_profile')
        ]
      ]);

      await ctx.replyWithMarkdown(welcomeMessage, keyboard);
    });

    // /roadmap command
    bot.command('roadmap', async (ctx) => {
      await ctx.replyWithMarkdown(
        `🌱 *শুরু থেকে ইংরেজি শেখার অনুশীলন রোডম্যাপ*\n\nলেভেল ০ (ধ্বনি ও উচ্চারণ) থেকে শুরু করে বাক্য গঠন ও আইইএলটিএস ব্যান্ড ৮.০ পর্যন্ত অনুশীলনীগুলো প্র্যাকটিস করুন।`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Practice Roadmap', `${webAppUrl}#roadmap`)]
        ])
      );
    });

    // /peers command
    bot.command('peers', async (ctx) => {
      await ctx.replyWithMarkdown(
        `🤝 *স্টাডি পার্টনার ও মেন্টর ফলো সিস্টেম*\n\nঅভিজ্ঞ শিক্ষার্থীদের ফলো করুন, চ্যাট রিকুয়েষ্ট পাঠান এবং স্পিকিং পার্টনার হিসেবে প্র্যাকটিস করুন।`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('👥 Find Study Partners', `${webAppUrl}#peers`)]
        ])
      );
    });

    // /app command
    bot.command('app', async (ctx) => {
      await ctx.reply(
        'Tap the button below to launch IELTS Journey with Hossain inside Telegram:',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Mini App', webAppUrl)]
        ])
      );
    });

    // /home command
    bot.command('home', async (ctx) => {
      await ctx.replyWithMarkdown(
        `🏛 *IELTS Journey with Hossain - Home*\n\nExplore our latest lessons, Cambridge tests, and community discussions.`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Launch Mini App', webAppUrl)]
        ])
      );
    });

    // /lessons command
    bot.command('lessons', async (ctx) => {
      try {
        const lessons = await getLessons({ status: 'published' });
        let text = `📚 *Latest IELTS Lessons*\n\n`;
        lessons.slice(0, 5).forEach((l, index) => {
          text += `${index + 1}. *${l.title}*\n   Level: ${l.level} | ${l.category_name || 'General'}\n\n`;
        });
        text += `Open the Mini App to study, watch explanations, and complete quizzes!`;

        await ctx.replyWithMarkdown(
          text,
          Markup.inlineKeyboard([
            [Markup.button.webApp('📖 View All Lessons', `${webAppUrl}#lessons`)]
          ])
        );
      } catch (err: any) {
        await ctx.reply('Could not load lessons. Please try again.');
      }
    });

    // /pdfs command
    bot.command('pdfs', async (ctx) => {
      try {
        const pdfs = await getPdfs({ status: 'published' });
        let text = `📄 *Google Drive IELTS PDF Library*\n\n`;
        pdfs.slice(0, 5).forEach((p, index) => {
          text += `${index + 1}. *${p.title}*\n   📁 ${p.file_size_text} | ${p.category_name}\n\n`;
        });
        text += `All authentic study materials and Cambridge answer keys are available in the app.`;

        await ctx.replyWithMarkdown(
          text,
          Markup.inlineKeyboard([
            [Markup.button.webApp('📥 Open PDF Library', `${webAppUrl}#pdfs`)]
          ])
        );
      } catch (err: any) {
        await ctx.reply('Could not load PDF library. Please try again.');
      }
    });

    // /profile command
    bot.command('profile', async (ctx) => {
      const telegramId = ctx.from?.id;
      const firstName = ctx.from?.first_name || 'Learner';
      await ctx.replyWithMarkdown(
        `👤 *Student Profile*\n\n*Name:* ${firstName}\n*Telegram ID:* \`${telegramId}\`\n\nTrack your completed lessons, saved bookmarks, and support requests in the Mini App:`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('📊 View My Progress', `${webAppUrl}#profile`)]
        ])
      );
    });

    // /support command
    bot.command('support', async (ctx) => {
      await ctx.replyWithMarkdown(
        `💬 *Student Support Desk*\n\nNeed assistance with a specific IELTS grammar rule, Task 2 essay structure, or reading strategy?\n\nSubmit your question in the app and get direct feedback from Instructor Hossain.`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('📝 Ask Hossain', `${webAppUrl}#support`)]
        ])
      );
    });

    // /help command
    bot.command('help', async (ctx) => {
      const helpText = `📖 *IELTS Journey with Hossain - Commands*\n\n` +
        `/start - Welcome message and quick navigation\n` +
        `/app - Open the Telegram Mini App\n` +
        `/home - Home overview\n` +
        `/lessons - Browse featured IELTS lessons\n` +
        `/pdfs - Google Drive study material library\n` +
        `/profile - Your learning statistics & progress\n` +
        `/support - Ask questions to instructor Hossain\n` +
        `/help - Show this guide`;

      await ctx.replyWithMarkdown(
        helpText,
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Mini App', webAppUrl)]
        ])
      );
    });

    // Callback queries for inline buttons
    bot.action('cmd_lessons', async (ctx) => {
      await ctx.answerCbQuery();
      const lessons = await getLessons({ status: 'published' });
      let text = `📚 *Featured Lessons:*\n\n`;
      lessons.slice(0, 4).forEach((l, i) => {
        text += `${i + 1}. *${l.title}* (${l.level})\n`;
      });
      await ctx.replyWithMarkdown(text, Markup.inlineKeyboard([
        [Markup.button.webApp('Open All Lessons', `${webAppUrl}#lessons`)]
      ]));
    });

    bot.action('cmd_roadmap', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.replyWithMarkdown(
        `🌱 *ইংরেজি শেখার ধারাবাহিক অনুশীলন রোডম্যাপ*\n\nলেভেল ০ থেকে শুরু করে কুইজ ড্রিল অনুশীলন করতে অ্যাপে প্রবেশ করুন:`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Roadmap Drills', `${webAppUrl}#roadmap`)]
        ])
      );
    });

    bot.action('cmd_peers', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.replyWithMarkdown(
        `🤝 *স্টাডি পার্টনার ও মেন্টর ফলো সিস্টেম*\n\nঅভিজ্ঞ শিক্ষার্থীদের সাথে চ্যাট রিকুয়েষ্ট ও স্পিকিং পার্টনার হতে অ্যাপে প্রবেশ করুন:`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('👥 Study Partners', `${webAppUrl}#peers`)]
        ])
      );
    });

    bot.action('cmd_pdfs', async (ctx) => {
      await ctx.answerCbQuery();
      const pdfs = await getPdfs({ status: 'published' });
      let text = `📄 *Cambridge & IELTS PDF Library:*\n\n`;
      pdfs.slice(0, 4).forEach((p, i) => {
        text += `${i + 1}. *${p.title}*\n`;
      });
      await ctx.replyWithMarkdown(text, Markup.inlineKeyboard([
        [Markup.button.webApp('Access PDFs', `${webAppUrl}#pdfs`)]
      ]));
    });

    bot.action('cmd_support', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.replyWithMarkdown(
        `💬 Open the support ticket system to communicate directly with Hossain:`,
        Markup.inlineKeyboard([[Markup.button.webApp('Go to Support', `${webAppUrl}#support`)]])
      );
    });

    bot.action('cmd_profile', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.replyWithMarkdown(
        `👤 View your lesson completion certificate, saved bookmarks, and activity:`,
        Markup.inlineKeyboard([[Markup.button.webApp('View Profile', `${webAppUrl}#profile`)]])
      );
    });

    // Launch Telegraf polling in background with error handling
    bot.launch()
      .then(() => {
        console.log('[Telegram Bot] Telegraf bot successfully connected and polling!');
      })
      .catch((err) => {
        console.warn('[Telegram Bot] Could not launch bot polling (check bot token):', err.message);
      });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    botInstance = bot;
    return bot;
  } catch (err: any) {
    console.error('[Telegram Bot] Error initializing Telegraf:', err.message);
    return null;
  }
}
