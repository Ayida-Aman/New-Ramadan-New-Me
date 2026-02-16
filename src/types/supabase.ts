export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuranGoalType = "1x" | "2x" | "3x" | "custom";
export type PeerStatus = "pending" | "accepted" | "declined";
export type MoodType =
  | "grateful"
  | "peaceful"
  | "hopeful"
  | "determined"
  | "struggling"
  | "reflective";
export type PostType = "progress" | "encouragement" | "kindness";
export type NotificationType =
  | "peer_request"
  | "peer_accepted"
  | "peer_encouragement"
  | "badge_earned"
  | "streak_reminder"
  | "community_like"
  | "community_comment"
  | "system";
export type ChallengeCategory =
  | "gratitude"
  | "charity"
  | "kindness"
  | "worship"
  | "community"
  | "self-improvement"
  | "general";
export type BadgeCategory =
  | "quran"
  | "challenge"
  | "streak"
  | "community"
  | "general";
export type EncouragementType =
  | "mashaallah"
  | "dua"
  | "keep_going"
  | "custom";

export interface PrayerDistribution {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface PrayersCompleted {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          display_name: string;
          avatar_url: string | null;
          bio: string;
          timezone: string;
          preferred_lang: "en" | "ar";
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string;
          timezone?: string;
          preferred_lang?: "en" | "ar";
          onboarded?: boolean;
        };
        Update: {
          full_name?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string;
          timezone?: string;
          preferred_lang?: "en" | "ar";
          onboarded?: boolean;
        };
        Relationships: [];
      };
      weekly_themes: {
        Row: {
          id: string;
          week_number: number;
          title: string;
          title_ar: string;
          subtitle: string;
          description: string;
          gradient_from: string;
          gradient_to: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          week_number: number;
          title: string;
          title_ar?: string;
          subtitle?: string;
          description?: string;
          gradient_from?: string;
          gradient_to?: string;
          icon?: string;
        };
        Update: {
          title?: string;
          title_ar?: string;
          subtitle?: string;
          description?: string;
          gradient_from?: string;
          gradient_to?: string;
          icon?: string;
        };
        Relationships: [];
      };
      daily_challenges: {
        Row: {
          id: string;
          day_number: number;
          week_number: number;
          title: string;
          title_ar: string;
          description: string;
          category: ChallengeCategory;
          icon: string;
          points: number;
          created_at: string;
        };
        Insert: {
          day_number: number;
          week_number: number;
          title: string;
          title_ar?: string;
          description?: string;
          category?: ChallengeCategory;
          icon?: string;
          points?: number;
        };
        Update: {
          title?: string;
          title_ar?: string;
          description?: string;
          category?: ChallengeCategory;
          icon?: string;
          points?: number;
        };
        Relationships: [];
      };
      quran_goals: {
        Row: {
          id: string;
          user_id: string;
          goal_type: QuranGoalType;
          total_pages: number;
          ramadan_days: number;
          daily_target: number;
          prayer_distribution: PrayerDistribution;
          ramadan_year: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goal_type?: QuranGoalType;
          total_pages?: number;
          ramadan_days?: number;
          prayer_distribution?: PrayerDistribution;
          ramadan_year?: number;
          is_active?: boolean;
        };
        Update: {
          goal_type?: QuranGoalType;
          total_pages?: number;
          ramadan_days?: number;
          prayer_distribution?: PrayerDistribution;
          is_active?: boolean;
        };
        Relationships: [];
      };
      reading_logs: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          log_date: string;
          pages_read: number;
          prayers_completed: PrayersCompleted;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goal_id: string;
          log_date?: string;
          pages_read?: number;
          prayers_completed?: PrayersCompleted;
          notes?: string;
        };
        Update: {
          pages_read?: number;
          prayers_completed?: PrayersCompleted;
          notes?: string;
        };
        Relationships: [];
      };
      peer_connections: {
        Row: {
          id: string;
          user_id: string;
          peer_id: string;
          status: PeerStatus;
          message: string;
          ramadan_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          peer_id: string;
          status?: PeerStatus;
          message?: string;
          ramadan_year?: number;
        };
        Update: {
          status?: PeerStatus;
          message?: string;
        };
        Relationships: [];
      };
      user_challenge_completions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          completed_at: string;
          notes: string;
          ramadan_year: number;
        };
        Insert: {
          user_id: string;
          challenge_id: string;
          notes?: string;
          ramadan_year?: number;
        };
        Update: {
          notes?: string;
        };
        Relationships: [];
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          reflection_date: string;
          prompt: string;
          content: string;
          mood: MoodType | null;
          is_private: boolean;
          ramadan_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          reflection_date?: string;
          prompt?: string;
          content?: string;
          mood?: MoodType | null;
          is_private?: boolean;
          ramadan_year?: number;
        };
        Update: {
          prompt?: string;
          content?: string;
          mood?: MoodType | null;
          is_private?: boolean;
        };
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          post_type: PostType;
          content: string;
          likes_count: number;
          comments_count: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          post_type?: PostType;
          content: string;
        };
        Update: {
          content?: string;
          post_type?: PostType;
          is_featured?: boolean;
        };
        Relationships: [];
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
        Update: never;
        Relationships: [];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          slug: string;
          title: string;
          title_ar: string;
          description: string;
          icon: string;
          category: BadgeCategory;
          requirement: Json;
          created_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          title_ar?: string;
          description?: string;
          icon?: string;
          category?: BadgeCategory;
          requirement?: Json;
        };
        Update: {
          title?: string;
          title_ar?: string;
          description?: string;
          icon?: string;
          category?: BadgeCategory;
          requirement?: Json;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
        };
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string;
          data?: Json;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
      peer_encouragements: {
        Row: {
          id: string;
          connection_id: string;
          sender_id: string;
          receiver_id: string;
          message_type: EncouragementType;
          custom_message: string;
          created_at: string;
        };
        Insert: {
          connection_id: string;
          sender_id: string;
          receiver_id: string;
          message_type?: EncouragementType;
          custom_message?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      get_user_reading_stats: {
        Args: { p_user_id: string; p_year?: number };
        Returns: {
          total_pages_read: number;
          days_logged: number;
          current_streak: number;
          longest_streak: number;
        }[];
      };
    };
    Enums: {
      quran_goal_type: QuranGoalType;
      peer_status: PeerStatus;
      mood_type: MoodType;
      post_type: PostType;
      notification_type: NotificationType;
    };
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type WeeklyTheme = Database["public"]["Tables"]["weekly_themes"]["Row"];
export type DailyChallenge =
  Database["public"]["Tables"]["daily_challenges"]["Row"];
export type QuranGoal = Database["public"]["Tables"]["quran_goals"]["Row"];
export type ReadingLog = Database["public"]["Tables"]["reading_logs"]["Row"];
export type PeerConnection =
  Database["public"]["Tables"]["peer_connections"]["Row"];
export type UserChallengeCompletion =
  Database["public"]["Tables"]["user_challenge_completions"]["Row"];
export type Reflection = Database["public"]["Tables"]["reflections"]["Row"];
export type CommunityPost =
  Database["public"]["Tables"]["community_posts"]["Row"];
export type PostLike = Database["public"]["Tables"]["post_likes"]["Row"];
export type PostComment = Database["public"]["Tables"]["post_comments"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type PeerEncouragement =
  Database["public"]["Tables"]["peer_encouragements"]["Row"];

export type ReadingStats =
  Database["public"]["Functions"]["get_user_reading_stats"]["Returns"][0];
