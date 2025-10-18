import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MemorizedVerse {
  id: string;
  reference: string;
  text: string;
  addedAt: string;
  lastReviewed: string;
  reviewCount: number;
  easeFactor: number; // SuperMemo algorithm ease factor (1.3-2.5)
  interval: number; // Days until next review
  nextReviewDate: string;
  mastered: boolean;
  level: "Learning" | "Young" | "Mature" | "Mastered";
  category?: string;
  accuracy?: number; // Percentage of correct reviews
  totalReviews?: number;
  perfectReviews?: number;
  hintsUsed?: number;
  timeSpent?: number; // Milliseconds spent reviewing
}

export interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=Complete blackout, 5=Perfect recall
}

/**
 * Spaced Repetition System for Bible Verse Memorization
 * Based on the SuperMemo SM-2 algorithm
 */
export class MemorizationService {
  private storageKey = "memorized-verses";
  private verses: MemorizedVerse[] = [];

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        this.verses = JSON.parse(stored);
      }
      console.log("📝 Memorization service initialized");
    } catch (error) {
      console.error("❌ Error initializing memorization service:", error);
    }
  }

  /**
   * Add a new verse to memorization list
   */
  async addVerse(reference: string, text: string): Promise<MemorizedVerse> {
    const now = new Date().toISOString();
    const verse: MemorizedVerse = {
      id: `memo-${Date.now()}`,
      reference,
      text,
      addedAt: now,
      lastReviewed: now,
      reviewCount: 0,
      easeFactor: 2.5, // Starting ease factor
      interval: 1, // First review in 1 day
      nextReviewDate: this.addDays(new Date(), 1).toISOString(),
      mastered: false,
      level: "Learning",
    };

    this.verses.push(verse);
    await this.save();

    console.log(`📝 Added verse to memorization: ${reference}`);
    return verse;
  }

  /**
   * Get all memorized verses
   */
  async getAll(): Promise<MemorizedVerse[]> {
    return this.verses;
  }

  /**
   * Get verses due for review today
   */
  async getDueForReview(): Promise<MemorizedVerse[]> {
    const now = new Date();
    return this.verses.filter((verse) => {
      const dueDate = new Date(verse.nextReviewDate);
      return dueDate <= now && !verse.mastered;
    });
  }

  /**
   * Get verses by level
   */
  async getByLevel(level: MemorizedVerse["level"]): Promise<MemorizedVerse[]> {
    return this.verses.filter((verse) => verse.level === level);
  }

  /**
   * Review a verse and update its spaced repetition schedule
   * Based on SuperMemo SM-2 algorithm
   */
  async reviewVerse(
    verseId: string,
    quality: ReviewResult["quality"],
    options?: {
      hintsUsed?: number;
      timeSpent?: number;
    },
  ): Promise<MemorizedVerse> {
    const verse = this.verses.find((v) => v.id === verseId);
    if (!verse) throw new Error("Verse not found");

    const now = new Date();
    verse.lastReviewed = now.toISOString();
    verse.reviewCount++;

    // Initialize tracking fields if not present
    verse.totalReviews = (verse.totalReviews || 0) + 1;
    if (quality === 5) {
      verse.perfectReviews = (verse.perfectReviews || 0) + 1;
    }
    if (options?.hintsUsed) {
      verse.hintsUsed = (verse.hintsUsed || 0) + options.hintsUsed;
    }
    if (options?.timeSpent) {
      verse.timeSpent = (verse.timeSpent || 0) + options.timeSpent;
    }

    // Calculate accuracy
    if (verse.totalReviews > 0) {
      verse.accuracy = Math.round(
        ((verse.totalReviews - (verse.totalReviews - verse.reviewCount)) /
          verse.totalReviews) *
          100,
      );
    }

    // SuperMemo SM-2 algorithm
    if (quality >= 3) {
      // Correct response
      if (verse.reviewCount === 1) {
        verse.interval = 1;
      } else if (verse.reviewCount === 2) {
        verse.interval = 6;
      } else {
        verse.interval = Math.round(verse.interval * verse.easeFactor);
      }

      verse.easeFactor =
        verse.easeFactor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      // Incorrect response - reset interval
      verse.reviewCount = 0;
      verse.interval = 1;
      verse.easeFactor = Math.max(1.3, verse.easeFactor - 0.2);
    }

    // Ensure ease factor stays within bounds
    if (verse.easeFactor < 1.3) verse.easeFactor = 1.3;

    // Calculate next review date
    verse.nextReviewDate = this.addDays(now, verse.interval).toISOString();

    // Update level based on interval
    verse.level = this.calculateLevel(verse.interval, verse.reviewCount);

    // Mark as mastered if interval is over 90 days
    if (verse.interval >= 90) {
      verse.mastered = true;
      verse.level = "Mastered";
    }

    await this.save();
    console.log(
      `✅ Reviewed: ${verse.reference}, Next review in ${verse.interval} days`,
    );

    return verse;
  }

  /**
   * Calculate verse level based on interval
   */
  private calculateLevel(
    interval: number,
    reviewCount: number,
  ): MemorizedVerse["level"] {
    if (interval >= 90) return "Mastered";
    if (interval >= 21) return "Mature";
    if (interval >= 7) return "Young";
    return "Learning";
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    learning: number;
    young: number;
    mature: number;
    mastered: number;
    dueToday: number;
    averageEaseFactor: number;
  }> {
    const dueToday = await this.getDueForReview();

    return {
      total: this.verses.length,
      learning: this.verses.filter((v) => v.level === "Learning").length,
      young: this.verses.filter((v) => v.level === "Young").length,
      mature: this.verses.filter((v) => v.level === "Mature").length,
      mastered: this.verses.filter((v) => v.level === "Mastered").length,
      dueToday: dueToday.length,
      averageEaseFactor:
        this.verses.reduce((sum, v) => sum + v.easeFactor, 0) /
          this.verses.length || 0,
    };
  }

  /**
   * Remove a verse from memorization
   */
  async removeVerse(verseId: string): Promise<void> {
    this.verses = this.verses.filter((v) => v.id !== verseId);
    await this.save();
    console.log("🗑️ Verse removed from memorization");
  }

  /**
   * Reset a verse (start memorization over)
   */
  async resetVerse(verseId: string): Promise<MemorizedVerse> {
    const verse = this.verses.find((v) => v.id === verseId);
    if (!verse) throw new Error("Verse not found");

    const now = new Date();
    verse.lastReviewed = now.toISOString();
    verse.reviewCount = 0;
    verse.easeFactor = 2.5;
    verse.interval = 1;
    verse.nextReviewDate = this.addDays(now, 1).toISOString();
    verse.mastered = false;
    verse.level = "Learning";

    await this.save();
    return verse;
  }

  /**
   * Get random verse for practice
   */
  async getRandomVerse(): Promise<MemorizedVerse | null> {
    if (this.verses.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.verses.length);
    return this.verses[randomIndex];
  }

  /**
   * Generate fill-in-the-blank exercise
   */
  generateFillInBlank(
    verse: MemorizedVerse,
    numBlanks: number = 3,
  ): {
    text: string;
    blanks: string[];
  } {
    const words = verse.text.split(" ");
    const blankIndices: number[] = [];
    const blanks: string[] = [];

    // Select random words to blank out
    while (blankIndices.length < Math.min(numBlanks, words.length)) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (
        !blankIndices.includes(randomIndex) &&
        words[randomIndex].length > 3
      ) {
        blankIndices.push(randomIndex);
        blanks.push(words[randomIndex]);
      }
    }

    // Replace selected words with blanks
    const blankedText = words
      .map((word, index) => (blankIndices.includes(index) ? "______" : word))
      .join(" ");

    return { text: blankedText, blanks };
  }

  /**
   * Generate first-letter exercise
   */
  generateFirstLetterExercise(verse: MemorizedVerse): {
    text: string;
    answer: string;
  } {
    const words = verse.text.split(" ");
    const firstLetters = words
      .map((word) => {
        // Get the first alphabetic character
        const match = word.match(/[a-zA-Z]/);
        return match ? match[0] : "";
      })
      .filter((letter) => letter !== "")
      .join(" ");

    return {
      text: firstLetters,
      answer: verse.text,
    };
  }

  /**
   * Generate word scramble exercise
   */
  generateWordScrambleExercise(verse: MemorizedVerse): {
    scrambledWords: string[];
    correctOrder: string[];
  } {
    const words = verse.text.split(" ");
    const scrambled = [...words].sort(() => Math.random() - 0.5);

    return {
      scrambledWords: scrambled,
      correctOrder: words,
    };
  }

  /**
   * Generate progressive reveal exercise
   */
  generateProgressiveRevealExercise(verse: MemorizedVerse): {
    stages: string[];
  } {
    const words = verse.text.split(" ");
    const stages: string[] = [];

    // Create stages revealing more words gradually
    for (let i = 1; i <= words.length; i++) {
      const revealed = words.slice(0, i).join(" ");
      const hidden = words.slice(i).map(() => "___").join(" ");
      stages.push(
        i < words.length ? `${revealed} ${hidden}` : words.join(" "),
      );
    }

    return { stages };
  }

  /**
   * Generate typing exercise
   */
  generateTypingExercise(verse: MemorizedVerse): {
    prompt: string;
    answer: string;
  } {
    return {
      prompt: `Type the full verse for ${verse.reference}:`,
      answer: verse.text,
    };
  }

  /**
   * Get memorization tips for a verse
   */
  getMemorizationTips(verse: MemorizedVerse): string[] {
    return [
      `Break it into phrases: "${this.breakIntoChunks(verse.text).join(" | ")}"`,
      "Read it out loud 3 times",
      "Write it by hand on paper",
      "Create a melody or rhythm with the words",
      "Visualize the scene or meaning",
      "Practice right before bed and right after waking up",
      "Connect it to a personal experience",
      "Use the first letter of each word as an acronym",
    ];
  }

  /**
   * Break text into manageable chunks
   */
  private breakIntoChunks(text: string, chunkSize: number = 5): string[] {
    const words = text.split(" ");
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(" "));
    }

    return chunks;
  }

  /**
   * Get current streak (consecutive days of reviewing)
   */
  async getStreak(): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastReviewDate: string | null;
  }> {
    if (this.verses.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastReviewDate: null };
    }

    // Sort verses by last reviewed date
    const sortedVerses = [...this.verses].sort(
      (a, b) =>
        new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime(),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let checkDate = new Date(today);

    // Calculate current streak
    for (let i = 0; i < 365; i++) {
      const hasReview = sortedVerses.some((verse) => {
        const reviewDate = new Date(verse.lastReviewed);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === checkDate.getTime();
      });

      if (hasReview) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      currentStreak,
      longestStreak,
      lastReviewDate: sortedVerses[0]?.lastReviewed || null,
    };
  }

  /**
   * Get achievements
   */
  async getAchievements(): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      unlocked: boolean;
      progress: number;
      icon: string;
    }>
  > {
    const stats = await this.getStats();
    const { currentStreak } = await this.getStreak();

    const achievements = [
      {
        id: "first_verse",
        title: "First Steps",
        description: "Memorize your first verse",
        unlocked: stats.total >= 1,
        progress: Math.min(stats.total, 1),
        icon: "🌱",
      },
      {
        id: "five_verses",
        title: "Building Foundation",
        description: "Memorize 5 verses",
        unlocked: stats.total >= 5,
        progress: Math.min(stats.total / 5, 1),
        icon: "📚",
      },
      {
        id: "ten_verses",
        title: "Dedicated Scholar",
        description: "Memorize 10 verses",
        unlocked: stats.total >= 10,
        progress: Math.min(stats.total / 10, 1),
        icon: "⭐",
      },
      {
        id: "first_mastered",
        title: "Master of Memory",
        description: "Master your first verse",
        unlocked: stats.mastered >= 1,
        progress: Math.min(stats.mastered, 1),
        icon: "👑",
      },
      {
        id: "week_streak",
        title: "Weekly Warrior",
        description: "Maintain a 7-day streak",
        unlocked: currentStreak >= 7,
        progress: Math.min(currentStreak / 7, 1),
        icon: "🔥",
      },
      {
        id: "month_streak",
        title: "Monthly Master",
        description: "Maintain a 30-day streak",
        unlocked: currentStreak >= 30,
        progress: Math.min(currentStreak / 30, 1),
        icon: "💪",
      },
      {
        id: "perfect_week",
        title: "Perfection Seeker",
        description: "Get 7 perfect reviews in a row",
        unlocked: (this.verses[0]?.perfectReviews || 0) >= 7,
        progress: Math.min((this.verses[0]?.perfectReviews || 0) / 7, 1),
        icon: "✨",
      },
    ];

    return achievements;
  }

  /**
   * Get detailed progress analytics
   */
  async getProgressAnalytics(): Promise<{
    totalTimeSpent: number; // in minutes
    averageAccuracy: number;
    versesReviewedToday: number;
    weeklyProgress: Array<{ date: string; reviewCount: number }>;
    categoryBreakdown: Array<{ category: string; count: number }>;
  }> {
    const totalTimeSpent = this.verses.reduce(
      (sum, v) => sum + (v.timeSpent || 0),
      0,
    );

    const accuracies = this.verses
      .map((v) => v.accuracy || 0)
      .filter((a) => a > 0);
    const averageAccuracy =
      accuracies.length > 0
        ? accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length
        : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const versesReviewedToday = this.verses.filter((v) => {
      const reviewDate = new Date(v.lastReviewed);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.getTime() === today.getTime();
    }).length;

    // Weekly progress (last 7 days)
    const weeklyProgress: Array<{ date: string; reviewCount: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const reviewCount = this.verses.filter((v) => {
        const reviewDate = new Date(v.lastReviewed);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === date.getTime();
      }).length;

      weeklyProgress.push({ date: dateStr, reviewCount });
    }

    // Category breakdown
    const categoryMap = new Map<string, number>();
    this.verses.forEach((v) => {
      const category = v.category || "Uncategorized";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, count]) => ({ category, count }),
    );

    return {
      totalTimeSpent: Math.round(totalTimeSpent / 60000), // Convert to minutes
      averageAccuracy: Math.round(averageAccuracy),
      versesReviewedToday,
      weeklyProgress,
      categoryBreakdown,
    };
  }

  /**
   * Add category to a verse
   */
  async setVerseCategory(
    verseId: string,
    category: string,
  ): Promise<MemorizedVerse> {
    const verse = this.verses.find((v) => v.id === verseId);
    if (!verse) throw new Error("Verse not found");

    verse.category = category;
    await this.save();
    return verse;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    this.verses.forEach((v) => {
      if (v.category) categories.add(v.category);
    });
    return Array.from(categories).sort();
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Save verses to storage
   */
  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.verses));
    } catch (error) {
      console.error("❌ Error saving memorized verses:", error);
    }
  }
}

// Singleton instance
export const memorizationService = new MemorizationService();
