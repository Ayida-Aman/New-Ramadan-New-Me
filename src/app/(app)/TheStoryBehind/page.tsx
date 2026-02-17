"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StoryBehindPage() {
  return (
    <div className="space-y-8 overflow-x-hidden">
      <div className="flex items-center gap-2 justify-center">
        <Sparkles className="h-6 w-6 text-gold" />
        <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
          The Story Behind
        </h1>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6 animate-fade-in-up">
        <p className="text-muted text-sm  flex justify-center">
          <span className="font-semibold">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
        </p>

        <p className="text-foreground leading-relaxed">
          The last three Ramadans passed with regrets. Between health struggles,
          family issues, and the whispers of <em>waswās al-khannās</em>, I couldn’t
          live them as I intended. Yet Allah, in His mercy, has given me another
          chance. This Ramadan, I don’t want to disappoint my Rabb.
        </p>

        <p className="text-foreground leading-relaxed">
          People often say <span className="italic">“New Year, New Me”</span> because
          they want to leave behind the version of themselves they didn’t like.
          For me, Ramadan is that golden chance to change, to renew my soul, my
          habits, and my connection with Allah.
        </p>

        <p className="text-foreground leading-relaxed">
          This website is built to help me and you stay accountable, to grow, and to
          strive to be a better servant of Allah, <span className="italic">in shā’ Allāh</span>.
          It is a companion for anyone who wants to make the most of this blessed month.
        </p>

        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="text-foreground text-sm leading-relaxed">
            <span className="block font-arabic text-lg mb-2">
              قُلْ يَا عِبَادِيَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ
            </span>
            <span className="italic">
              “Say, ‘O My servants who have transgressed against themselves [by sinning],
              do not despair of the mercy of Allah. Indeed, Allah forgives all sins.
              Indeed, it is He who is the Forgiving, the Merciful.’”
            </span>{" "}
            <span className="text-muted">(Surah Az-Zumar 39:53)</span>
          </p>
        </div>

        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="text-foreground text-sm leading-relaxed">
            <span className="block font-arabic text-lg mb-2">
              يَا أَيُّهَا ٱلَّذِينَ آمَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ
            </span>
            <span className="italic">
              “O you who have believed, decreed upon you is fasting as it was decreed
              upon those before you, that you may attain taqwa (God-consciousness).”
            </span>{" "}
            <span className="text-muted">(Surah Al-Baqarah 2:183)</span>
          </p>
        </div>

        <p className="text-foreground leading-relaxed">
          Ramadan is not just about fasting. it’s about returning to Allah with sincerity.
          This is my reminder to myself and to you: never lose hope in Allah’s mercy.
        </p>
      </div>
    </div>
  );
}
