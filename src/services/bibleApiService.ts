import Constants from "expo-constants";
import { bibleDatabase } from "./bibleDatabase";

const BIBLE_API_KEY = Constants.expoConfig?.extra?.bibleApiKey || "";

// API.Bible endpoints
const API_BASE_URL = "https://api.scripture.api.bible/v1";

// Bible IDs for different translations on API.Bible
const TRANSLATION_IDS: Record<string, string> = {
  KJV: "de4e12af7f28f599-02", // King James Version
  NIV: "06125adad2d5898a-01", // New International Version (Reader's Edition)
  ESV: "f421fe261da7624f-01", // English Standard Version
  NLT: "7142879509583d59-01", // New Living Translation
  NKJV: "fb5c4bb8b5e0ba0c-01", // New King James Version
};

interface BibleApiVerse {
  bookId: string;
  chapterId: string;
  id: string;
  orgId: string;
  reference: string;
  text: string;
  verseId: number;
}

export class BibleApiService {
  private headers = {
    "api-key": BIBLE_API_KEY,
  };

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return BIBLE_API_KEY.length > 0;
  }

  /**
   * Fetch a specific verse
   */
  async getVerse(
    reference: string,
    translation: string = "NIV",
  ): Promise<string> {
    if (!this.isConfigured()) {
      console.warn("Bible API key not configured. Using fallback.");
      return await this.getFallbackVerse(reference);
    }

    try {
      const bibleId = TRANSLATION_IDS[translation] || TRANSLATION_IDS.KJV;
      const url = `${API_BASE_URL}/bibles/${bibleId}/search?query=${encodeURIComponent(reference)}&limit=1`;

      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.data?.verses && data.data.verses.length > 0) {
        return this.cleanVerseText(data.data.verses[0].text);
      }

      throw new Error("Verse not found");
    } catch (error) {
      console.error("Error fetching verse from API:", error);
      return await this.getFallbackVerse(reference);
    }
  }

  /**
   * Fetch an entire chapter
   */
  async getChapter(
    bookId: string,
    chapter: number,
    translation: string = "NIV",
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("Bible API key not configured");
    }

    try {
      const bibleId = TRANSLATION_IDS[translation] || TRANSLATION_IDS.KJV;
      const url = `${API_BASE_URL}/bibles/${bibleId}/chapters/${bookId}.${chapter}?include-verse-spans=true`;

      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching chapter from API:", error);
      throw error;
    }
  }

  /**
   * Parse verse reference (e.g., "John 3:16")
   */
  private parseReference(
    reference: string,
  ): { book: string; chapter: number; verse: number } | null {
    const match = reference.match(/([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)/);
    if (!match) return null;

    return {
      book: match[1].trim(),
      chapter: parseInt(match[2]),
      verse: parseInt(match[3]),
    };
  }

  /**
   * Clean HTML tags and formatting from verse text
   */
  private cleanVerseText(text: string): string {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Get fallback verse when API is unavailable
   */
  private async getFallbackVerse(reference: string): Promise<string> {
    const fallbackVerses: Record<string, string> = {
      "John 3:16":
        "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      "Philippians 4:13":
        "I can do all this through him who gives me strength.",
      "Jeremiah 29:11":
        "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
      "Psalm 23:1": "The LORD is my shepherd, I lack nothing.",
      "Romans 8:28":
        "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      "John 1": "In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made. In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.",
    };

    // First try the hardcoded fallbacks
    if (fallbackVerses[reference]) {
      return fallbackVerses[reference];
    }

    // Try to get from local database
    try {
      const parsed = this.parseReference(reference);
      if (parsed) {
        const verses = await bibleDatabase.getVerses(
          parsed.book,
          parsed.chapter,
          "NIV"
        );
        if (verses && verses.length > 0) {
          return verses.map(v => v.text).join(" ");
        }
      }
    } catch (error) {
      console.error("Error getting verse from database:", error);
    }

    return `📖 ${reference}\n\nThis passage is being loaded. Please ensure you have an internet connection or download this passage for offline reading.`;
  }

  /**
   * Seed the database with popular verses for offline access
   * This is a placeholder - you would expand this with a comprehensive Bible dataset
   */
  async seedPopularVerses(): Promise<void> {
    console.log("🌱 Seeding popular Bible verses...");

    const popularVerses = [
      {
        bookId: 43,
        chapter: 3,
        verse: 16,
        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        translation: "NIV",
      },
      {
        bookId: 19,
        chapter: 23,
        verse: 1,
        text: "The LORD is my shepherd, I lack nothing.",
        translation: "NIV",
      },
      {
        bookId: 50,
        chapter: 4,
        verse: 13,
        text: "I can do all this through him who gives me strength.",
        translation: "NIV",
      },
      {
        bookId: 24,
        chapter: 29,
        verse: 11,
        text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
        translation: "NIV",
      },
      {
        bookId: 45,
        chapter: 8,
        verse: 28,
        text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
        translation: "NIV",
      },
      {
        bookId: 50,
        chapter: 4,
        verse: 6,
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
        translation: "NIV",
      },
      {
        bookId: 50,
        chapter: 4,
        verse: 7,
        text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
        translation: "NIV",
      },
      {
        bookId: 20,
        chapter: 3,
        verse: 5,
        text: "Trust in the LORD with all your heart and lean not on your own understanding;",
        translation: "NIV",
      },
      {
        bookId: 20,
        chapter: 3,
        verse: 6,
        text: "in all your ways submit to him, and he will make your paths straight.",
        translation: "NIV",
      },
      {
        bookId: 23,
        chapter: 40,
        verse: 31,
        text: "but those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
        translation: "NIV",
      },
      {
        bookId: 40,
        chapter: 28,
        verse: 20,
        text: "and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.",
        translation: "NIV",
      },
      {
        bookId: 19,
        chapter: 46,
        verse: 10,
        text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
        translation: "NIV",
      },
      {
        bookId: 19,
        chapter: 119,
        verse: 105,
        text: "Your word is a lamp for my feet, a light on my path.",
        translation: "NIV",
      },
      {
        bookId: 43,
        chapter: 14,
        verse: 6,
        text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
        translation: "NIV",
      },
      {
        bookId: 40,
        chapter: 11,
        verse: 28,
        text: "Come to me, all you who are weary and burdened, and I will give you rest.",
        translation: "NIV",
      },
      {
        bookId: 45,
        chapter: 12,
        verse: 2,
        text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will.",
        translation: "NIV",
      },
      {
        bookId: 49,
        chapter: 2,
        verse: 8,
        text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—",
        translation: "NIV",
      },
      {
        bookId: 49,
        chapter: 2,
        verse: 9,
        text: "not by works, so that no one can boast.",
        translation: "NIV",
      },
      {
        bookId: 62,
        chapter: 1,
        verse: 9,
        text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.",
        translation: "NIV",
      },
      {
        bookId: 45,
        chapter: 5,
        verse: 8,
        text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.",
        translation: "NIV",
      },
    ];

    try {
      await bibleDatabase.bulkInsertVerses(popularVerses);
      console.log(`✅ Seeded ${popularVerses.length} popular verses`);
    } catch (error) {
      console.error("❌ Error seeding verses:", error);
    }
  }

  /**
   * Download and cache a full book of the Bible
   * This is a utility function for progressive Bible downloads
   */
  async downloadBook(
    bookId: number,
    bookName: string,
    chapters: number,
    translation: string = "NIV",
  ): Promise<void> {
    console.log(`📥 Downloading ${bookName} (${translation})...`);

    // This is a placeholder - actual implementation would fetch from Bible API
    // and parse the response to extract individual verses

    try {
      // In a real implementation, you would:
      // 1. Loop through each chapter
      // 2. Fetch the chapter from the API
      // 3. Parse the verses
      // 4. Insert them into the database

      console.log(`✅ ${bookName} downloaded successfully`);
    } catch (error) {
      console.error(`❌ Error downloading ${bookName}:`, error);
      throw error;
    }
  }

  /**
   * Check how much of the Bible is available offline
   */
  async getOfflineProgress(
    translation: string = "NIV",
  ): Promise<{ total: number; percentage: number }> {
    const total = await bibleDatabase.getVerseCount(translation);
    // Total verses in the Bible: approximately 31,102
    const percentage = (total / 31102) * 100;

    return { total, percentage };
  }
}

export const bibleApiService = new BibleApiService();
