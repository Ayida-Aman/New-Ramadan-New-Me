import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export const quranGoalSchema = z.object({
  goalType: z.enum(["1x", "2x", "3x", "custom"]),
  totalPages: z.number().min(1).max(10000),
  ramadanDays: z.number().min(28).max(30),
});

export const readingLogSchema = z.object({
  pagesRead: z.number().min(0).max(604),
  prayersCompleted: z.object({
    fajr: z.boolean(),
    dhuhr: z.boolean(),
    asr: z.boolean(),
    maghrib: z.boolean(),
    isha: z.boolean(),
  }),
  notes: z.string().max(500).optional(),
});

export const reflectionSchema = z.object({
  content: z.string().min(1, "Write something...").max(5000),
  mood: z.enum(["grateful", "peaceful", "hopeful", "determined", "struggling", "reflective"]).nullable(),
  isPrivate: z.boolean().default(true),
});

export const communityPostSchema = z.object({
  content: z.string().min(1).max(1000),
  postType: z.enum(["progress", "encouragement", "kindness"]),
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(50),
  fullName: z.string().min(2).max(100),
  bio: z.string().max(200).optional(),
  timezone: z.string(),
  preferredLang: z.enum(["en", "ar"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type QuranGoalInput = z.infer<typeof quranGoalSchema>;
export type ReadingLogInput = z.infer<typeof readingLogSchema>;
export type ReflectionInput = z.infer<typeof reflectionSchema>;
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
