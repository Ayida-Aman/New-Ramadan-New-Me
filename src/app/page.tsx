import Link from "next/link";
import {
  BookOpen,
  Target,
  Users,
  Flame,
  Star,
  Heart,
  Moon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Quran Reading Planner",
    description:
      "Set your goal — 1x, 2x, or 3x completion. Track pages across all 5 daily prayers with beautiful progress rings.",
  },
  {
    icon: Target,
    title: "Daily Micro-Challenges",
    description:
      "30 curated challenges themed by week. From gratitude journaling to acts of kindness, grow every single day.",
  },
  {
    icon: Users,
    title: "Peer Accountability",
    description:
      "Connect with a partner for shared motivation. See each other's progress and send encouragement in real-time.",
  },
  {
    icon: Heart,
    title: "Reflection Journal",
    description:
      "Daily prompts that change with each weekly theme. Record your mood, thoughts, and spiritual breakthroughs.",
  },
  {
    icon: Flame,
    title: "Streaks & Badges",
    description:
      "Build momentum with reading streaks and earn beautiful badges for milestones from first page to full Khatm.",
  },
  {
    icon: Star,
    title: "Community Wall",
    description:
      "Share progress, duas, and acts of kindness. Uplift and be uplifted by your community.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-6 w-6 text-gold" />
            <span className="text-lg font-semibold text-navy dark:text-gold">
              New Ramadan New Me
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium bg-navy dark:bg-gold text-cream-light dark:text-navy px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark dark:text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            Ramadan 2026 is here
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy dark:text-cream-light leading-tight tracking-tight">
            Transform Your
            <span className="block text-gold mt-1">Ramadan Experience</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            A beautiful, peaceful digital sanctuary to track your Quran reading,
            complete daily challenges, reflect deeply, and grow alongside an
            accountability partner.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-navy dark:bg-gold text-cream-light dark:text-navy px-8 py-3.5 rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-lg shadow-navy/20 dark:shadow-gold/20"
            >
              Begin Your Journey
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border bg-card text-foreground px-8 py-3.5 rounded-xl text-base font-medium hover:bg-secondary transition-colors"
            >
              See Features
            </Link>
          </div>

          {/* Stats preview */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "604", label: "Pages to complete" },
              { value: "30", label: "Daily challenges" },
              { value: "15", label: "Badges to earn" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-navy dark:text-gold">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy dark:text-cream-light">
              Everything You Need
            </h2>
            <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
              Carefully crafted features to support your spiritual growth
              throughout Ramadan and beyond.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-navy dark:text-cream-light mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Themes Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy/[0.03] dark:bg-card/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy dark:text-cream-light">
              4 Weeks of Growth
            </h2>
            <p className="mt-4 text-muted text-lg">
              Each week brings a new theme to guide your transformation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                week: 1,
                title: "Discipline & Renewal",
                subtitle: "Building your foundation",
                gradient: "from-[#0A2540] to-[#1a4a6c]",
              },
              {
                week: 2,
                title: "Spiritual Depth",
                subtitle: "Going deeper within",
                gradient: "from-[#1a3a5c] to-[#2d5a7b]",
              },
              {
                week: 3,
                title: "Community & Service",
                subtitle: "Extending your light",
                gradient: "from-[#0A2540] to-emerald",
              },
              {
                week: 4,
                title: "Gratitude & Growth",
                subtitle: "Harvesting your transformation",
                gradient: "from-gold to-[#0A2540]",
              },
            ].map((theme) => (
              <div
                key={theme.week}
                className={`bg-gradient-to-br ${theme.gradient} rounded-2xl p-6 text-white`}
              >
                <div className="text-sm font-medium text-white/60">
                  Week {theme.week}
                </div>
                <div className="text-xl font-bold mt-1">{theme.title}</div>
                <div className="text-sm text-white/80 mt-1">
                  {theme.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Moon className="h-12 w-12 text-gold mx-auto mb-6 animate-float" />
          <h2 className="text-3xl sm:text-4xl font-bold text-navy dark:text-cream-light">
            Your Best Ramadan Awaits
          </h2>
          <p className="mt-4 text-muted text-lg">
            Join a community committed to spiritual growth. Free to use,
            beautiful by design, built with love.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Track Quran reading across all 5 prayers",
              "30 unique daily challenges",
              "Peer accountability with real-time updates",
              "Beautiful reflection journal",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-left max-w-sm mx-auto"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/auth/signup"
            className="mt-10 inline-flex items-center gap-2 bg-gold text-navy px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gold-dark transition-colors shadow-lg shadow-gold/20"
          >
            Start Now — It&apos;s Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted text-sm">
            <Moon className="h-4 w-4 text-gold" />
            New Ramadan New Me
          </div>
          <p className="text-sm text-muted">
            Built with love for the Ummah
          </p>
        </div>
      </footer>
    </div>
  );
}
