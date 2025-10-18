import { GeminiService } from "../geminiService";

// Mock the Google Generative AI
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

describe("GeminiService", () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService();
    jest.clearAllMocks();
  });

  describe("findRelevantVerses", () => {
    it("should return relevant verses for user input", async () => {
      const mockResponse = JSON.stringify([
        {
          reference: "Philippians 4:6-7",
          text: "Do not be anxious about anything...",
          context: "Paul's letter to Philippians",
          relevance: "Addresses anxiety and worry",
        },
      ]);

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.findRelevantVerses("I'm feeling anxious");

      expect(result).toHaveLength(1);
      expect(result[0].reference).toBe("Philippians 4:6-7");
      expect(result[0].relevance).toContain("anxiety");
    });

    it("should return fallback verses when API fails", async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error("API Error")),
      };

      (service as any).model = mockModel;

      const result = await service.findRelevantVerses("I'm feeling anxious");

      expect(result).toHaveLength(1);
      expect(result[0].reference).toBe("Philippians 4:6-7");
    });

    it("should handle malformed JSON responses", async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => "Invalid JSON response",
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.findRelevantVerses("test");

      // Should return fallback verses
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("reference");
    });
  });

  describe("getVerseOfTheDay", () => {
    it("should return verse of the day", async () => {
      const mockResponse = JSON.stringify({
        title: "Walking in Faith",
        reference: "Proverbs 3:5-6",
        text: "Trust in the LORD with all your heart...",
        reflection: "This verse reminds us to trust God completely...",
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.getVerseOfTheDay();

      expect(result.title).toBe("Walking in Faith");
      expect(result.reference).toBe("Proverbs 3:5-6");
      expect(result.reflection).toContain("trust God");
    });

    it("should return fallback verse when API fails", async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error("API Error")),
      };

      (service as any).model = mockModel;

      const result = await service.getVerseOfTheDay();

      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("reference");
      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("reflection");
    });
  });

  describe("generatePrayer", () => {
    it("should generate prayer for situation", async () => {
      const mockResponse = JSON.stringify({
        title: "Prayer for Healing",
        prayer: "Heavenly Father, we ask for Your healing touch...",
        category: "supplication",
        suggestedVerses: ["Psalm 23:1", "James 5:14-15"],
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.generatePrayer("health issues");

      expect(result.title).toBe("Prayer for Healing");
      expect(result.category).toBe("supplication");
      expect(result.suggestedVerses).toHaveLength(2);
    });

    it("should handle prayer type specification", async () => {
      const mockResponse = JSON.stringify({
        title: "Prayer of Thanksgiving",
        prayer: "Thank You, Lord...",
        category: "thanksgiving",
        suggestedVerses: ["Psalm 100:4"],
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.generatePrayer("gratitude", "thanksgiving");

      expect(result.category).toBe("thanksgiving");
    });
  });

  describe("explainVerse", () => {
    it("should provide detailed verse explanation", async () => {
      const mockResponse = JSON.stringify({
        reference: "John 3:16",
        historicalContext: "Written during the ministry of Jesus...",
        spiritualMeaning: "God's love for humanity...",
        practicalApplication: "We should share this love...",
        relatedVerses: ["Romans 5:8", "1 John 4:9"],
        keyThemes: ["Love", "Salvation", "Faith"],
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.explainVerse(
        "John 3:16",
        "For God so loved the world...",
      );

      expect(result.reference).toBe("John 3:16");
      expect(result.keyThemes).toContain("Love");
      expect(result.relatedVerses).toHaveLength(2);
    });
  });

  describe("chatWithPrayerBuddy", () => {
    it("should respond to user messages", async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () =>
              "I'm here to support you. Let's pray together about this.",
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.chatWithPrayerBuddy("I need guidance");

      expect(result).toContain("support");
    });

    it("should maintain chat history context", async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => "That's wonderful to hear!",
          },
        }),
      };

      (service as any).model = mockModel;

      const chatHistory = [
        {
          role: "user" as const,
          content: "I'm struggling",
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant" as const,
          content: "I'm here for you",
          timestamp: new Date().toISOString(),
        },
      ];

      await service.chatWithPrayerBuddy("Things are better now", chatHistory);

      expect(mockModel.generateContent).toHaveBeenCalled();
      const callArg = mockModel.generateContent.mock.calls[0][0];
      expect(callArg).toContain("I'm struggling");
    });
  });

  describe("generateBibleStudyQuestions", () => {
    it("should generate study questions for verse", async () => {
      const mockResponse = JSON.stringify([
        {
          question: "What does this verse teach about faith?",
          type: "reflection",
          difficulty: "medium",
        },
        {
          question: "How can you apply this verse today?",
          type: "application",
          difficulty: "easy",
        },
      ]);

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.generateBibleStudyQuestions("John 3:16", 2);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("reflection");
      expect(result[1].type).toBe("application");
    });
  });

  describe("analyzePrayerJournal", () => {
    it("should analyze prayer patterns and provide insights", async () => {
      const mockPrayers = [
        {
          title: "Prayer for healing",
          category: "supplication",
          isAnswered: false,
        },
        {
          title: "Thank you prayer",
          category: "thanksgiving",
          isAnswered: true,
        },
      ];

      const mockResponse = JSON.stringify({
        totalPrayers: 2,
        answeredPrayers: 1,
        commonThemes: ["Healing", "Gratitude"],
        encouragement: "Your prayer life is growing!",
        suggestedFocus: "Continue in thanksgiving",
        growthAreas: ["Consistency", "Faith"],
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.analyzePrayerJournal(mockPrayers);

      expect(result.totalPrayers).toBe(2);
      expect(result.answeredPrayers).toBe(1);
      expect(result.commonThemes).toContain("Healing");
    });
  });

  describe("Multilingual features", () => {
    it("should set and get language", () => {
      service.setLanguage("Spanish");
      expect(service.getLanguage()).toBe("Spanish");
    });

    it("should generate prayer in specified language", async () => {
      const mockResponse = JSON.stringify({
        title: "Oración de Paz",
        prayer: "Padre Celestial...",
        category: "supplication",
        suggestedVerses: ["Filipenses 4:6-7"],
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockResponse,
          },
        }),
      };

      (service as any).model = mockModel;

      const result = await service.generateMultilingualPrayer("paz", "Spanish");

      expect(result.title).toContain("Oración");
    });
  });

  describe("cleanJsonString", () => {
    it("should remove markdown code blocks", () => {
      const input = '```json\n{"key": "value"}\n```';
      const result = (service as any).cleanJsonString(input);
      expect(result.trim()).toBe('{"key": "value"}');
    });

    it("should remove control characters", () => {
      const input = '{"key": "val\x00ue"}';
      const result = (service as any).cleanJsonString(input);
      expect(result).toBe('{"key": "value"}');
    });
  });
});
