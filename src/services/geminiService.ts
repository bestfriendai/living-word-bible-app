import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDCMEoUoBAd0TUiCWiyO9JBDYCe_mD5wpc";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface BibleVerse {
  reference: string;
  text: string;
  context: string;
  relevance: string;
}

export interface VerseOfTheDay {
  reference: string;
  text: string;
  reflection: string;
  title: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  async findRelevantVerses(userInput: string): Promise<BibleVerse[]> {
    try {
      const prompt = `You are a compassionate Bible study assistant. A person is going through something and needs spiritual guidance.

User's situation: "${userInput}"

Please provide 3-5 relevant Bible verses that would offer comfort, guidance, or wisdom for this situation.

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "reference": "Book Chapter:Verse",
    "text": "The actual verse text",
    "context": "Brief 1-sentence context about this passage",
    "relevance": "1-2 sentences explaining why this verse is relevant to their situation"
  }
]

Important:
- Use accurate Bible verse references and text
- Be compassionate and understanding
- Focus on hope, comfort, and practical wisdom
- Return ONLY the JSON array, no other text`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      // Clean the JSON string by removing markdown code blocks and fixing control characters
      let jsonString = jsonMatch[0];
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const verses = JSON.parse(jsonString) as BibleVerse[];
      return verses;
    } catch (error) {
      console.error("Error finding verses:", error);
      // Return fallback verses
      return [
        {
          reference: "Philippians 4:6-7",
          text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
          context: "Paul's letter encouraging believers to trust God with their worries",
          relevance: "This verse reminds us that God cares about what we're going through and offers peace beyond understanding."
        }
      ];
    }
  }

  async getVerseOfTheDay(): Promise<VerseOfTheDay> {
    try {
      const today = new Date().toLocaleDateString();
      const prompt = `Generate a meaningful verse of the day for ${today}.

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "A meaningful title for the devotional (4-6 words)",
  "reference": "Book Chapter:Verse",
  "text": "The actual verse text",
  "reflection": "A 2-3 paragraph reflection that helps readers apply this verse to their lives today. Make it personal, encouraging, and practical."
}

Important:
- Choose verses that are uplifting and relevant to daily life
- The reflection should be warm, encouraging, and actionable
- Return ONLY the JSON object, no other text`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      // Clean the JSON string by removing markdown code blocks
      let jsonString = jsonMatch[0];
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const verseOfDay = JSON.parse(jsonString) as VerseOfTheDay;
      return verseOfDay;
    } catch (error) {
      console.error("Error getting verse of the day:", error);
      // Return fallback verse
      return {
        title: "Strength in the Midst of Trials",
        reference: "James 1:2-3",
        text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.",
        reflection: "Every day comes with its own set of challenges, and sometimes it can feel overwhelming. This verse from James reminds us that these trials are not in vain; they serve a greater purpose in our spiritual journey. They build perseverance, which is essential for a mature and complete faith. When life's difficulties arise, it is natural to feel frustration or discouragement. However, James encourages us to shift our perspective and view these moments as opportunities for growth.\n\nIn moments of trial, consider what you can learn about yourself and your faith. It might be patience, reliance on God, or a deeper understanding of His word. Embracing these lessons can transform your outlook and strengthen your relationship with God. This doesn't mean you have to be joyful about the trial itself, but rather in the assurance that God is with you and working through these experiences for your spiritual benefit."
      };
    }
  }
}

export const geminiService = new GeminiService();
