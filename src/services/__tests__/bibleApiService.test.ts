import { BibleApiService } from "../bibleApiService";

// Mock fetch globally
global.fetch = jest.fn();

// Mock the bible database
jest.mock("../bibleDatabase", () => ({
  bibleDatabase: {
    getBookByName: jest.fn(async () => ({ id: 43, name: "John" })),
    getChapter: jest.fn(async () => [{ text: "Test verse" }]),
    bulkInsertVerses: jest.fn(async () => {}),
    getVerseCount: jest.fn(async () => 1000),
  },
}));

describe("BibleApiService", () => {
  let service: BibleApiService;

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new BibleApiService();
    await service.initialize();
  });

  describe("initialize", () => {
    it("should initialize with API key from environment", async () => {
      expect(service.isConfigured()).toBe(true);
    });
  });

  describe("getVerse", () => {
    it("should fetch verse successfully from API", async () => {
      const mockResponse = {
        data: {
          passages: [
            {
              content: "<p>For God so loved the world</p>",
            },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.getVerse("John 3:16", "NIV");

      expect(result).toBe("For God so loved the world");
    });

    it("should handle verses format when passages not available", async () => {
      const mockResponse = {
        data: {
          verses: [
            {
              text: "The LORD is my shepherd",
            },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.getVerse("Psalm 23:1", "KJV");

      expect(result).toBe("The LORD is my shepherd");
    });

    it("should fall back to hardcoded verses when API fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const result = await service.getVerse("John 3:16", "NIV");

      expect(result).toContain("For God so loved the world");
    });

    it("should handle API error responses gracefully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      const result = await service.getVerse("John 3:16", "NIV");

      // Should fall back to hardcoded verse
      expect(result).toContain("For God so loved the world");
    });

    it("should clean HTML tags from verse text", async () => {
      const mockResponse = {
        data: {
          passages: [
            {
              content:
                "<p><strong>For</strong> God <em>so loved</em> the world</p>",
            },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.getVerse("John 3:16", "NIV");

      expect(result).not.toContain("<p>");
      expect(result).not.toContain("<strong>");
      expect(result).not.toContain("<em>");
      expect(result).toBe("For God so loved the world");
    });
  });

  describe("getChapter", () => {
    it("should fetch chapter successfully", async () => {
      const mockResponse = {
        data: {
          id: "JHN.1",
          bibleId: "test-bible",
          number: "1",
          bookId: "JHN",
          content: "Chapter content here",
          reference: "John 1",
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.getChapter("JHN", 1, "NIV");

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when API key not configured", async () => {
      const uninitializedService = new BibleApiService();

      await expect(
        uninitializedService.getChapter("JHN", 1, "NIV"),
      ).rejects.toThrow("Bible API key not configured");
    });
  });

  describe("Translation IDs", () => {
    it("should use correct translation IDs for different versions", async () => {
      const translations = ["KJV", "NIV", "ESV", "NLT", "NKJV"];

      for (const translation of translations) {
        (global.fetch as jest.Mock).mockClear();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { passages: [{ content: "Test verse" }] },
          }),
        });

        await service.getVerse("John 3:16", translation);

        expect(global.fetch).toHaveBeenCalled();
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchCall).toContain("/bibles/");
      }
    });
  });

  describe("Offline functionality", () => {
    it("should return fallback or database verse when network fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const result = await service.getVerse("Unknown 99:99", "NIV");

      // Should return either fallback message or database result
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("seedPopularVerses", () => {
    it("should seed popular verses without errors", async () => {
      await expect(service.seedPopularVerses()).resolves.not.toThrow();
    });
  });

  describe("getOfflineProgress", () => {
    it("should return progress statistics", async () => {
      const progress = await service.getOfflineProgress("NIV");

      expect(progress).toHaveProperty("total");
      expect(progress).toHaveProperty("percentage");
      expect(typeof progress.total).toBe("number");
      expect(typeof progress.percentage).toBe("number");
    });
  });

  describe("advancedSearch", () => {
    it("should perform advanced search with options", async () => {
      const mockResponse = {
        data: {
          query: "love",
          limit: 10,
          offset: 0,
          total: 100,
          passages: [{ content: "For God so loved the world" }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.advancedSearch("love", {
        translation: "NIV",
        limit: 10,
      });

      expect(result.query).toBe("love");
      expect(result.passages).toHaveLength(1);
    });
  });

  describe("getAvailableBibles", () => {
    it("should return list of available translations", async () => {
      const result = await service.getAvailableBibles();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("abbreviation");
    });
  });
});
