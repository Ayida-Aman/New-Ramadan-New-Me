-- ============================================================================
-- SEED DATA — New Ramadan New Me
-- ============================================================================

-- Weekly Themes
-- ============================================================================
insert into public.weekly_themes (week_number, title, title_ar, subtitle, description, gradient_from, gradient_to, icon) values
(1, 'Discipline & Renewal', 'الانضباط والتجديد', 'Building your foundation', 'The first week is about establishing strong habits, purifying your intentions, and committing to your Ramadan goals with full sincerity.', '#0A2540', '#1a4a6c', 'sunrise'),
(2, 'Spiritual Depth', 'العمق الروحي', 'Going deeper within', 'Deepen your connection with the Quran, increase your night prayers, and explore the layers of meaning in your worship.', '#1a3a5c', '#2d5a7b', 'heart'),
(3, 'Community & Service', 'المجتمع والخدمة', 'Extending your light', 'Turn your spiritual energy outward. Serve others, strengthen community bonds, and multiply your good deeds through collective action.', '#0A2540', '#10B981', 'users'),
(4, 'Gratitude & Growth', 'الامتنان والنمو', 'Harvesting your transformation', 'Reflect on how far you have come. Solidify the habits you want to keep beyond Ramadan and express deep gratitude for this blessed month.', '#D4AF37', '#0A2540', 'sparkles');

-- Daily Challenges (30 days, themed by week)
-- ============================================================================

-- Week 1: Discipline & Renewal (Days 1-7)
insert into public.daily_challenges (day_number, week_number, title, title_ar, description, category, icon, points) values
(1,  1, 'Set Your Niyyah',           'حدد نيتك',           'Write down your top 3 intentions for this Ramadan. Be specific and sincere.', 'worship', 'target', 15),
(2,  1, 'Digital Detox Hour',         'ساعة بدون شاشات',     'Spend one full hour without any screens. Use it for prayer, reflection, or nature.', 'self-improvement', 'smartphone-off', 10),
(3,  1, 'Gratitude Sunrise',          'شروق الامتنان',       'Write 3 things you are grateful for right now, before checking your phone.', 'gratitude', 'sun', 10),
(4,  1, 'Forgiveness Letter',         'رسالة المسامحة',      'Think of someone you need to forgive. Write them a letter (you do not have to send it).', 'self-improvement', 'mail', 15),
(5,  1, 'Early Fajr Challenge',       'تحدي الفجر المبكر',   'Wake up 15 minutes before Fajr for tahajjud or quiet dua.', 'worship', 'alarm-clock', 15),
(6,  1, 'Mindful Iftar',              'إفطار واعٍ',         'Eat your iftar slowly and mindfully. Appreciate every bite as a blessing.', 'gratitude', 'utensils', 10),
(7,  1, 'Week 1 Reflection',          'تأمل الأسبوع الأول',  'Journal about your first week. What worked? What needs adjustment?', 'self-improvement', 'notebook-pen', 20),

-- Week 2: Spiritual Depth (Days 8-14)
(8,  2, 'Memorize a New Ayah',        'احفظ آية جديدة',      'Choose one ayah that speaks to you and commit it to memory today.', 'worship', 'book-open', 15),
(9,  2, 'Night Prayer Journey',       'رحلة قيام الليل',     'Pray at least 2 extra rakaat of qiyam al-layl tonight.', 'worship', 'moon', 15),
(10, 2, 'Learn a Name of Allah',      'تعلم اسمًا من أسماء الله', 'Study one of the 99 Names of Allah. Reflect on its meaning in your life.', 'worship', 'sparkle', 10),
(11, 2, 'Silent Hour',                'ساعة الصمت',         'Spend one hour in complete silence. Listen to your inner voice.', 'self-improvement', 'volume-x', 10),
(12, 2, 'Dua for Someone Else',       'دعاء لغيرك',         'Make a heartfelt dua for someone who is struggling. Do not tell them.', 'kindness', 'heart-handshake', 10),
(13, 2, 'Quran Tafsir Deep Dive',     'تعمق في التفسير',     'Read the tafsir (explanation) of a surah you love. Discover new layers of meaning.', 'worship', 'search', 15),
(14, 2, 'Week 2 Reflection',          'تأمل الأسبوع الثاني', 'How has your spiritual connection deepened? Write about a moment of closeness to Allah.', 'self-improvement', 'notebook-pen', 20),

-- Week 3: Community & Service (Days 15-21)
(15, 3, 'Feed Someone',               'أطعم شخصًا',         'Provide iftar for someone — a neighbor, a colleague, or someone in need.', 'charity', 'hand-heart', 20),
(16, 3, 'Smile at 3 Strangers',       'ابتسم لثلاثة غرباء',  'The Prophet ﷺ said smiling is charity. Spread warmth to 3 people you do not know.', 'kindness', 'smile', 10),
(17, 3, 'Give Sadaqah',               'تصدّق',              'Give sadaqah today — even if it is just $1. Every amount counts.', 'charity', 'hand-coins', 15),
(18, 3, 'Reconnect with Family',      'تواصل مع العائلة',    'Call or visit a family member you have not spoken to in a while.', 'community', 'phone', 10),
(19, 3, 'Volunteer Your Time',        'تطوع بوقتك',         'Offer your time to help someone — at a masjid, food bank, or for a neighbor.', 'community', 'helping-hand', 20),
(20, 3, 'Teach Something',            'علّم شيئًا',          'Share knowledge with someone today. A Quran verse, a hadith, or a life lesson.', 'community', 'graduation-cap', 15),
(21, 3, 'Week 3 Reflection',          'تأمل الأسبوع الثالث', 'How did serving others change your Ramadan experience? Write about it.', 'self-improvement', 'notebook-pen', 20),

-- Week 4: Gratitude & Growth (Days 22-30)
(22, 4, 'Laylatul Qadr Preparation',  'التحضير لليلة القدر', 'Prepare your heart and plan for the last 10 nights. Write your special duas.', 'worship', 'star', 20),
(23, 4, 'Gratitude Flood',            'فيض الامتنان',        'Write 10 things you are deeply grateful for. Feel each one fully.', 'gratitude', 'list', 15),
(24, 4, 'Forgive Everyone',           'سامح الجميع',        'Make a conscious decision to release all grudges. Forgive for your own freedom.', 'self-improvement', 'heart', 15),
(25, 4, 'Plan Beyond Ramadan',        'خطط لما بعد رمضان',  'Which 3 habits from Ramadan will you keep? Write your post-Ramadan plan.', 'self-improvement', 'calendar', 15),
(26, 4, 'Last 10 Nights Worship',     'عبادة العشر الأواخر', 'Increase your worship tonight. Extra prayers, Quran, dhikr, and dua.', 'worship', 'moon-star', 20),
(27, 4, 'Write a Thank You Note',     'اكتب رسالة شكر',     'Write a heartfelt thank you to someone who has positively impacted your Ramadan.', 'gratitude', 'pen-line', 10),
(28, 4, 'Random Act of Kindness',     'عمل خير عشوائي',     'Do something unexpectedly kind for a stranger. Pay it forward.', 'kindness', 'gift', 15),
(29, 4, 'Full Quran Celebration',     'احتفال ختم القرآن',   'If you have completed the Quran, celebrate! If not, appreciate every page you read.', 'worship', 'party-popper', 20),
(30, 4, 'Final Ramadan Reflection',   'التأمل الأخير',      'Write your final reflection. How have you transformed? What legacy does this Ramadan leave?', 'self-improvement', 'notebook-pen', 25);

-- Badges
-- ============================================================================
insert into public.badges (slug, title, title_ar, description, icon, category, requirement) values
-- Quran badges
('first-page',        'First Page',           'الصفحة الأولى',       'Read your first page of Quran this Ramadan',              'book-open',     'quran',     '{"pages_read": 1}'),
('juz-complete',      'Juz Complete',         'جزء كامل',           'Complete one full juz (20 pages)',                         'bookmark',      'quran',     '{"pages_read": 20}'),
('halfway-there',     'Halfway There',        'نصف الطريق',         'Read half of the Quran (302 pages)',                       'flag',          'quran',     '{"pages_read": 302}'),
('khatm-quran',       'Khatm al-Quran',       'ختم القرآن',         'Complete the entire Quran — MashaAllah!',                  'crown',         'quran',     '{"pages_read": 604}'),
('double-khatm',      'Double Khatm',         'ختمتان',             'Complete the Quran twice in one Ramadan',                  'trophy',        'quran',     '{"pages_read": 1208}'),

-- Streak badges
('3-day-streak',      '3 Day Streak',         'سلسلة 3 أيام',       'Read Quran for 3 consecutive days',                       'flame',         'streak',    '{"streak": 3}'),
('7-day-streak',      'Weekly Warrior',       'محارب الأسبوع',       'Read Quran for 7 consecutive days',                       'flame',         'streak',    '{"streak": 7}'),
('14-day-streak',     'Fortnight Focus',      'تركيز أسبوعين',      'Read Quran for 14 consecutive days',                      'flame',         'streak',    '{"streak": 14}'),
('30-day-streak',     'Ramadan Champion',     'بطل رمضان',          'Read Quran every single day of Ramadan',                  'medal',         'streak',    '{"streak": 30}'),

-- Challenge badges
('first-challenge',   'Challenge Accepted',   'التحدي مقبول',       'Complete your first daily challenge',                     'check-circle',  'challenge', '{"challenges_completed": 1}'),
('week-challenger',   'Week Challenger',      'متحدي الأسبوع',      'Complete 7 daily challenges',                             'shield',        'challenge', '{"challenges_completed": 7}'),
('challenge-master',  'Challenge Master',     'سيد التحديات',       'Complete 20 daily challenges',                            'award',         'challenge', '{"challenges_completed": 20}'),
('all-challenges',    'Unstoppable',          'لا يمكن إيقافه',     'Complete all 30 daily challenges',                        'zap',           'challenge', '{"challenges_completed": 30}'),

-- Community badges
('first-post',        'Voice of Ummah',       'صوت الأمة',          'Share your first community post',                         'message-circle','community', '{"posts_created": 1}'),
('peer-connected',    'Better Together',      'معًا أفضل',          'Connect with an accountability peer',                     'users',         'community', '{"peers_connected": 1}');
