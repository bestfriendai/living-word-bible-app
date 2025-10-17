import * as SQLite from "expo-sqlite";

export interface BibleBook {
  id: number;
  name: string;
  testament: "Old" | "New";
  abbreviation: string;
  chapters: number;
}

export interface BibleVerse {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  isPremium: boolean;
}

export class BibleDatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = "bible.db";

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.dbName);
      await this.createTables();
      await this.seedInitialData();
      console.log("✅ Bible database initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Bible database:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Translations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS translations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL UNIQUE,
        language TEXT NOT NULL,
        is_premium INTEGER DEFAULT 0
      );
    `);

    // Books table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        testament TEXT NOT NULL CHECK(testament IN ('Old', 'New')),
        abbreviation TEXT NOT NULL,
        chapters INTEGER NOT NULL
      );
    `);

    // Verses table (main Bible text storage)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        translation TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id),
        FOREIGN KEY (translation) REFERENCES translations(abbreviation),
        UNIQUE(book_id, chapter, verse, translation)
      );
    `);

    // Create indexes for faster queries
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_verses_book_chapter
        ON verses(book_id, chapter, translation);
      CREATE INDEX IF NOT EXISTS idx_verses_search
        ON verses(text);
      CREATE INDEX IF NOT EXISTS idx_books_name
        ON books(name);
    `);

    console.log("📚 Database tables created successfully");
  }

  private async seedInitialData(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Check if data already exists
    const existingBooks = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM books",
    );
    if (existingBooks[0]?.count > 0) {
      console.log("📖 Bible books already seeded");
      return;
    }

    // Seed translations
    const translations = [
      {
        id: "NIV",
        name: "New International Version",
        abbreviation: "NIV",
        language: "English",
        is_premium: 0,
      },
      {
        id: "KJV",
        name: "King James Version",
        abbreviation: "KJV",
        language: "English",
        is_premium: 0,
      },
      {
        id: "ESV",
        name: "English Standard Version",
        abbreviation: "ESV",
        language: "English",
        is_premium: 1,
      },
      {
        id: "NLT",
        name: "New Living Translation",
        abbreviation: "NLT",
        language: "English",
        is_premium: 1,
      },
      {
        id: "NKJV",
        name: "New King James Version",
        abbreviation: "NKJV",
        language: "English",
        is_premium: 1,
      },
    ];

    for (const translation of translations) {
      await this.db.runAsync(
        "INSERT OR IGNORE INTO translations (id, name, abbreviation, language, is_premium) VALUES (?, ?, ?, ?, ?)",
        [
          translation.id,
          translation.name,
          translation.abbreviation,
          translation.language,
          translation.is_premium,
        ],
      );
    }

    // Seed Bible books (66 books)
    const books = this.getBibleBooks();
    for (const book of books) {
      await this.db.runAsync(
        "INSERT OR IGNORE INTO books (id, name, testament, abbreviation, chapters) VALUES (?, ?, ?, ?, ?)",
        [book.id, book.name, book.testament, book.abbreviation, book.chapters],
      );
    }

    console.log("✅ Initial Bible metadata seeded");
  }

  private getBibleBooks(): BibleBook[] {
    return [
      // Old Testament (39 books)
      {
        id: 1,
        name: "Genesis",
        testament: "Old",
        abbreviation: "Gen",
        chapters: 50,
      },
      {
        id: 2,
        name: "Exodus",
        testament: "Old",
        abbreviation: "Exod",
        chapters: 40,
      },
      {
        id: 3,
        name: "Leviticus",
        testament: "Old",
        abbreviation: "Lev",
        chapters: 27,
      },
      {
        id: 4,
        name: "Numbers",
        testament: "Old",
        abbreviation: "Num",
        chapters: 36,
      },
      {
        id: 5,
        name: "Deuteronomy",
        testament: "Old",
        abbreviation: "Deut",
        chapters: 34,
      },
      {
        id: 6,
        name: "Joshua",
        testament: "Old",
        abbreviation: "Josh",
        chapters: 24,
      },
      {
        id: 7,
        name: "Judges",
        testament: "Old",
        abbreviation: "Judg",
        chapters: 21,
      },
      {
        id: 8,
        name: "Ruth",
        testament: "Old",
        abbreviation: "Ruth",
        chapters: 4,
      },
      {
        id: 9,
        name: "1 Samuel",
        testament: "Old",
        abbreviation: "1Sam",
        chapters: 31,
      },
      {
        id: 10,
        name: "2 Samuel",
        testament: "Old",
        abbreviation: "2Sam",
        chapters: 24,
      },
      {
        id: 11,
        name: "1 Kings",
        testament: "Old",
        abbreviation: "1Kgs",
        chapters: 22,
      },
      {
        id: 12,
        name: "2 Kings",
        testament: "Old",
        abbreviation: "2Kgs",
        chapters: 25,
      },
      {
        id: 13,
        name: "1 Chronicles",
        testament: "Old",
        abbreviation: "1Chr",
        chapters: 29,
      },
      {
        id: 14,
        name: "2 Chronicles",
        testament: "Old",
        abbreviation: "2Chr",
        chapters: 36,
      },
      {
        id: 15,
        name: "Ezra",
        testament: "Old",
        abbreviation: "Ezra",
        chapters: 10,
      },
      {
        id: 16,
        name: "Nehemiah",
        testament: "Old",
        abbreviation: "Neh",
        chapters: 13,
      },
      {
        id: 17,
        name: "Esther",
        testament: "Old",
        abbreviation: "Esth",
        chapters: 10,
      },
      {
        id: 18,
        name: "Job",
        testament: "Old",
        abbreviation: "Job",
        chapters: 42,
      },
      {
        id: 19,
        name: "Psalms",
        testament: "Old",
        abbreviation: "Ps",
        chapters: 150,
      },
      {
        id: 20,
        name: "Proverbs",
        testament: "Old",
        abbreviation: "Prov",
        chapters: 31,
      },
      {
        id: 21,
        name: "Ecclesiastes",
        testament: "Old",
        abbreviation: "Eccl",
        chapters: 12,
      },
      {
        id: 22,
        name: "Song of Solomon",
        testament: "Old",
        abbreviation: "Song",
        chapters: 8,
      },
      {
        id: 23,
        name: "Isaiah",
        testament: "Old",
        abbreviation: "Isa",
        chapters: 66,
      },
      {
        id: 24,
        name: "Jeremiah",
        testament: "Old",
        abbreviation: "Jer",
        chapters: 52,
      },
      {
        id: 25,
        name: "Lamentations",
        testament: "Old",
        abbreviation: "Lam",
        chapters: 5,
      },
      {
        id: 26,
        name: "Ezekiel",
        testament: "Old",
        abbreviation: "Ezek",
        chapters: 48,
      },
      {
        id: 27,
        name: "Daniel",
        testament: "Old",
        abbreviation: "Dan",
        chapters: 12,
      },
      {
        id: 28,
        name: "Hosea",
        testament: "Old",
        abbreviation: "Hos",
        chapters: 14,
      },
      {
        id: 29,
        name: "Joel",
        testament: "Old",
        abbreviation: "Joel",
        chapters: 3,
      },
      {
        id: 30,
        name: "Amos",
        testament: "Old",
        abbreviation: "Amos",
        chapters: 9,
      },
      {
        id: 31,
        name: "Obadiah",
        testament: "Old",
        abbreviation: "Obad",
        chapters: 1,
      },
      {
        id: 32,
        name: "Jonah",
        testament: "Old",
        abbreviation: "Jonah",
        chapters: 4,
      },
      {
        id: 33,
        name: "Micah",
        testament: "Old",
        abbreviation: "Mic",
        chapters: 7,
      },
      {
        id: 34,
        name: "Nahum",
        testament: "Old",
        abbreviation: "Nah",
        chapters: 3,
      },
      {
        id: 35,
        name: "Habakkuk",
        testament: "Old",
        abbreviation: "Hab",
        chapters: 3,
      },
      {
        id: 36,
        name: "Zephaniah",
        testament: "Old",
        abbreviation: "Zeph",
        chapters: 3,
      },
      {
        id: 37,
        name: "Haggai",
        testament: "Old",
        abbreviation: "Hag",
        chapters: 2,
      },
      {
        id: 38,
        name: "Zechariah",
        testament: "Old",
        abbreviation: "Zech",
        chapters: 14,
      },
      {
        id: 39,
        name: "Malachi",
        testament: "Old",
        abbreviation: "Mal",
        chapters: 4,
      },

      // New Testament (27 books)
      {
        id: 40,
        name: "Matthew",
        testament: "New",
        abbreviation: "Matt",
        chapters: 28,
      },
      {
        id: 41,
        name: "Mark",
        testament: "New",
        abbreviation: "Mark",
        chapters: 16,
      },
      {
        id: 42,
        name: "Luke",
        testament: "New",
        abbreviation: "Luke",
        chapters: 24,
      },
      {
        id: 43,
        name: "John",
        testament: "New",
        abbreviation: "John",
        chapters: 21,
      },
      {
        id: 44,
        name: "Acts",
        testament: "New",
        abbreviation: "Acts",
        chapters: 28,
      },
      {
        id: 45,
        name: "Romans",
        testament: "New",
        abbreviation: "Rom",
        chapters: 16,
      },
      {
        id: 46,
        name: "1 Corinthians",
        testament: "New",
        abbreviation: "1Cor",
        chapters: 16,
      },
      {
        id: 47,
        name: "2 Corinthians",
        testament: "New",
        abbreviation: "2Cor",
        chapters: 13,
      },
      {
        id: 48,
        name: "Galatians",
        testament: "New",
        abbreviation: "Gal",
        chapters: 6,
      },
      {
        id: 49,
        name: "Ephesians",
        testament: "New",
        abbreviation: "Eph",
        chapters: 6,
      },
      {
        id: 50,
        name: "Philippians",
        testament: "New",
        abbreviation: "Phil",
        chapters: 4,
      },
      {
        id: 51,
        name: "Colossians",
        testament: "New",
        abbreviation: "Col",
        chapters: 4,
      },
      {
        id: 52,
        name: "1 Thessalonians",
        testament: "New",
        abbreviation: "1Thess",
        chapters: 5,
      },
      {
        id: 53,
        name: "2 Thessalonians",
        testament: "New",
        abbreviation: "2Thess",
        chapters: 3,
      },
      {
        id: 54,
        name: "1 Timothy",
        testament: "New",
        abbreviation: "1Tim",
        chapters: 6,
      },
      {
        id: 55,
        name: "2 Timothy",
        testament: "New",
        abbreviation: "2Tim",
        chapters: 4,
      },
      {
        id: 56,
        name: "Titus",
        testament: "New",
        abbreviation: "Titus",
        chapters: 3,
      },
      {
        id: 57,
        name: "Philemon",
        testament: "New",
        abbreviation: "Phlm",
        chapters: 1,
      },
      {
        id: 58,
        name: "Hebrews",
        testament: "New",
        abbreviation: "Heb",
        chapters: 13,
      },
      {
        id: 59,
        name: "James",
        testament: "New",
        abbreviation: "Jas",
        chapters: 5,
      },
      {
        id: 60,
        name: "1 Peter",
        testament: "New",
        abbreviation: "1Pet",
        chapters: 5,
      },
      {
        id: 61,
        name: "2 Peter",
        testament: "New",
        abbreviation: "2Pet",
        chapters: 3,
      },
      {
        id: 62,
        name: "1 John",
        testament: "New",
        abbreviation: "1John",
        chapters: 5,
      },
      {
        id: 63,
        name: "2 John",
        testament: "New",
        abbreviation: "2John",
        chapters: 1,
      },
      {
        id: 64,
        name: "3 John",
        testament: "New",
        abbreviation: "3John",
        chapters: 1,
      },
      {
        id: 65,
        name: "Jude",
        testament: "New",
        abbreviation: "Jude",
        chapters: 1,
      },
      {
        id: 66,
        name: "Revelation",
        testament: "New",
        abbreviation: "Rev",
        chapters: 22,
      },
    ];
  }

  // Query methods
  async getTranslations(): Promise<BibleTranslation[]> {
    if (!this.db) throw new Error("Database not initialized");
    const result = await this.db.getAllAsync<BibleTranslation>(`
      SELECT id, name, abbreviation, language, is_premium as isPremium
      FROM translations
      ORDER BY is_premium ASC, name ASC
    `);
    return result;
  }

  async getBooks(testament?: "Old" | "New"): Promise<BibleBook[]> {
    if (!this.db) throw new Error("Database not initialized");
    const query = testament
      ? "SELECT * FROM books WHERE testament = ? ORDER BY id"
      : "SELECT * FROM books ORDER BY id";

    const result = testament
      ? await this.db.getAllAsync<BibleBook>(query, [testament])
      : await this.db.getAllAsync<BibleBook>(query);

    return result;
  }

  async getChapter(
    bookId: number,
    chapter: number,
    translation: string = "NIV",
  ): Promise<BibleVerse[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync<any>(
      `
      SELECT v.*, b.name as bookName
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE v.book_id = ? AND v.chapter = ? AND v.translation = ?
      ORDER BY v.verse ASC
    `,
      [bookId, chapter, translation],
    );

    return result.map((row) => ({
      id: row.id,
      bookId: row.book_id,
      bookName: row.bookName,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation,
    }));
  }

  async getVerse(
    bookId: number,
    chapter: number,
    verse: number,
    translation: string = "NIV",
  ): Promise<BibleVerse | null> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync<any>(
      `
      SELECT v.*, b.name as bookName
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE v.book_id = ? AND v.chapter = ? AND v.verse = ? AND v.translation = ?
      LIMIT 1
    `,
      [bookId, chapter, verse, translation],
    );

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      bookId: row.book_id,
      bookName: row.bookName,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation,
    };
  }

  async searchVerses(
    query: string,
    translation: string = "NIV",
    limit: number = 50,
  ): Promise<BibleVerse[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync<any>(
      `
      SELECT v.*, b.name as bookName
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE v.text LIKE ? AND v.translation = ?
      ORDER BY v.book_id, v.chapter, v.verse
      LIMIT ?
    `,
      [`%${query}%`, translation, limit],
    );

    return result.map((row) => ({
      id: row.id,
      bookId: row.book_id,
      bookName: row.bookName,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation,
    }));
  }

  // Admin methods for seeding verses
  async insertVerse(
    bookId: number,
    chapter: number,
    verse: number,
    text: string,
    translation: string,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      "INSERT OR REPLACE INTO verses (book_id, chapter, verse, text, translation) VALUES (?, ?, ?, ?, ?)",
      [bookId, chapter, verse, text, translation],
    );
  }

  async bulkInsertVerses(
    verses: {
      bookId: number;
      chapter: number;
      verse: number;
      text: string;
      translation: string;
    }[],
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.withTransactionAsync(async () => {
      for (const verse of verses) {
        await this.db!.runAsync(
          "INSERT OR REPLACE INTO verses (book_id, chapter, verse, text, translation) VALUES (?, ?, ?, ?, ?)",
          [
            verse.bookId,
            verse.chapter,
            verse.verse,
            verse.text,
            verse.translation,
          ],
        );
      }
    });
  }

  async getVerseCount(translation: string = "NIV"): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync<{ count: number }>(
      `
      SELECT COUNT(*) as count FROM verses WHERE translation = ?
    `,
      [translation],
    );

    return result[0]?.count || 0;
  }

  // Close database connection
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Singleton instance
export const bibleDatabase = new BibleDatabaseService();
