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
  ): Promise<MemorizedVerse> {
    const verse = this.verses.find((v) => v.id === verseId);
    if (!verse) throw new Error("Verse not found");

    const now = new Date();
    verse.lastReviewed = now.toISOString();
    verse.reviewCount++;

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
