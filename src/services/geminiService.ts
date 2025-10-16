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

export interface GeneratedPrayer {
  title: string;
  prayer: string;
  category: 'praise' | 'thanksgiving' | 'confession' | 'supplication' | 'intercession';
  suggestedVerses: string[];
}

export interface VerseExplanation {
  reference: string;
  historicalContext: string;
  spiritualMeaning: string;
  practicalApplication: string;
  relatedVerses: string[];
  keyThemes: string[];
}

export interface BibleStudyQuestion {
  question: string;
  type: 'reflection' | 'analysis' | 'application' | 'memory';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PrayerInsight {
  totalPrayers: number;
  answeredPrayers: number;
  commonThemes: string[];
  encouragement: string;
  suggestedFocus: string;
  growthAreas: string[];
}

export interface SpiritualGrowthReport {
  readingStreak: number;
  versesLearned: number;
  prayersOffered: number;
  growthScore: number;
  strengths: string[];
  areasToGrow: string[];
  personalizedTip: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  private cleanJsonString(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Remove control characters (U+0000 through U+001F except tab, newline, carriage return)
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    // Normalize line breaks
    cleaned = cleaned.replace(/\r\n/g, '\n');

    return cleaned;
  }

  async findRelevantVerses(userInput: string): Promise<BibleVerse[]> {
    try {
      const prompt = `You are a compassionate Bible study assistant. A person is going through something and needs spiritual guidance.

User's situation: "${userInput}"

Please provide 3-5 relevant Bible verses that would offer comfort, guidance, or wisdom for this situation.

Respond ONLY with a valid JSON array in this exact format (NO markdown, NO code blocks, JUST the JSON):
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
- Return ONLY valid JSON, no markdown formatting`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      // Clean the JSON string
      const jsonString = this.cleanJsonString(jsonMatch[0]);

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

Respond ONLY with a valid JSON object in this exact format (NO markdown, NO code blocks, JUST the JSON):
{
  "title": "A meaningful title for the devotional (4-6 words)",
  "reference": "Book Chapter:Verse",
  "text": "The actual verse text",
  "reflection": "A 2-3 paragraph reflection that helps readers apply this verse to their lives today. Make it personal, encouraging, and practical."
}

Important:
- Choose verses that are uplifting and relevant to daily life
- The reflection should be warm, encouraging, and actionable
- Return ONLY valid JSON, no markdown formatting`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      // Clean the JSON string
      const jsonString = this.cleanJsonString(jsonMatch[0]);

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

  async generatePrayer(situation: string, prayerType?: string): Promise<GeneratedPrayer> {
    try {
      const typeInstruction = prayerType ? `Focus on ${prayerType} prayer.` : '';
      const prompt = `You are a compassionate prayer assistant. Generate a heartfelt prayer for someone in this situation: "${situation}"

${typeInstruction}

Respond ONLY with valid JSON (NO markdown, NO code blocks):
{
  "title": "Prayer title (3-5 words)",
  "prayer": "The full prayer text (2-3 paragraphs, personal and heartfelt)",
  "category": "praise" | "thanksgiving" | "confession" | "supplication" | "intercession",
  "suggestedVerses": ["Reference 1", "Reference 2"]
}

Make it personal, Biblical, and encouraging. Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = this.cleanJsonString(result.response.text());
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(this.cleanJsonString(jsonMatch[0])) as GeneratedPrayer;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating prayer:", error);
      return {
        title: "Prayer for Guidance",
        prayer: "Heavenly Father, we come before You today seeking Your wisdom and guidance. You know the situation we face, and we trust in Your perfect plan. Grant us peace that surpasses understanding, strength to face each day, and faith to believe in Your goodness. Help us to see Your hand at work in our lives and to trust in Your timing. In Jesus' name, Amen.",
        category: 'supplication',
        suggestedVerses: ["Proverbs 3:5-6", "Philippians 4:6-7"]
      };
    }
  }

  async explainVerse(reference: string, verseText: string): Promise<VerseExplanation> {
    try {
      const prompt = `Provide a deep explanation of this Bible verse:
Reference: ${reference}
Text: "${verseText}"

Respond ONLY with valid JSON (NO markdown):
{
  "reference": "${reference}",
  "historicalContext": "2-3 sentences about when/why this was written",
  "spiritualMeaning": "2-3 sentences about the spiritual truth",
  "practicalApplication": "2-3 sentences on how to apply today",
  "relatedVerses": ["Ref 1", "Ref 2", "Ref 3"],
  "keyThemes": ["theme1", "theme2", "theme3"]
}

Be scholarly yet accessible. Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(this.cleanJsonString(jsonMatch[0])) as VerseExplanation;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error explaining verse:", error);
      return {
        reference,
        historicalContext: "This verse was written to encourage believers in their faith journey.",
        spiritualMeaning: "It reminds us of God's faithfulness and love for His people.",
        practicalApplication: "We can apply this by trusting God in our daily lives and seeking His guidance.",
        relatedVerses: ["Psalm 23:1", "John 14:6", "Romans 8:28"],
        keyThemes: ["Faith", "Trust", "God's Love"]
      };
    }
  }

  async generateBibleStudyQuestions(verseReference: string, count: number = 5): Promise<BibleStudyQuestion[]> {
    try {
      const prompt = `Generate ${count} Bible study questions for: ${verseReference}

Mix of reflection, analysis, application, and memory questions.
Vary difficulty from easy to hard.

Respond ONLY with valid JSON array (NO markdown):
[
  {
    "question": "Question text here?",
    "type": "reflection" | "analysis" | "application" | "memory",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return JSON.parse(this.cleanJsonString(jsonMatch[0])) as BibleStudyQuestion[];
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating study questions:", error);
      return [
        { question: "What is the main message of this verse?", type: 'analysis', difficulty: 'easy' },
        { question: "How can you apply this verse to your life today?", type: 'application', difficulty: 'medium' }
      ];
    }
  }

  async analyzePrayerJournal(prayers: any[]): Promise<PrayerInsight> {
    try {
      const prayerSummary = prayers.slice(0, 20).map(p => ({
        title: p.title,
        category: p.category,
        isAnswered: p.isAnswered
      }));

      const prompt = `Analyze this prayer journal and provide insights:
${JSON.stringify(prayerSummary)}

Respond ONLY with valid JSON (NO markdown):
{
  "totalPrayers": ${prayers.length},
  "answeredPrayers": ${prayers.filter(p => p.isAnswered).length},
  "commonThemes": ["theme1", "theme2", "theme3"],
  "encouragement": "Personalized encouraging message (2-3 sentences)",
  "suggestedFocus": "What to focus prayers on (1-2 sentences)",
  "growthAreas": ["area1", "area2"]
}

Be encouraging and insightful. Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(this.cleanJsonString(jsonMatch[0])) as PrayerInsight;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error analyzing prayers:", error);
      return {
        totalPrayers: prayers.length,
        answeredPrayers: prayers.filter(p => p.isAnswered).length,
        commonThemes: ["Faith", "Guidance", "Strength"],
        encouragement: "Your faithfulness in prayer is beautiful. God hears every prayer and works in His perfect timing.",
        suggestedFocus: "Continue seeking God's wisdom in your daily decisions.",
        growthAreas: ["Consistency", "Thanksgiving"]
      };
    }
  }

  async generateGrowthReport(stats: any): Promise<SpiritualGrowthReport> {
    try {
      const prompt = `Generate a spiritual growth report based on these stats:
Reading Streak: ${stats.readingStreak} days
Verses Saved: ${stats.versesSaved}
Prayers: ${stats.totalPrayers}

Respond ONLY with valid JSON (NO markdown):
{
  "readingStreak": ${stats.readingStreak},
  "versesLearned": ${stats.versesSaved},
  "prayersOffered": ${stats.totalPrayers},
  "growthScore": 0-100,
  "strengths": ["strength1", "strength2"],
  "areasToGrow": ["area1", "area2"],
  "personalizedTip": "Personalized encouragement and tip (2-3 sentences)"
}

Be encouraging and specific. Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(this.cleanJsonString(jsonMatch[0])) as SpiritualGrowthReport;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating growth report:", error);
      return {
        readingStreak: stats.readingStreak,
        versesLearned: stats.versesSaved,
        prayersOffered: stats.totalPrayers,
        growthScore: 75,
        strengths: ["Consistent Reading", "Active Prayer Life"],
        areasToGrow: ["Scripture Memorization", "Community Engagement"],
        personalizedTip: "Your dedication to daily reading is inspiring! Consider starting a verse memorization practice to deepen your faith."
      };
    }
  }

  async chatWithPrayerBuddy(message: string, chatHistory: ChatMessage[] = []): Promise<string> {
    try {
      const historyContext = chatHistory.slice(-6).map(msg =>
        `${msg.role === 'user' ? 'User' : 'Prayer Buddy'}: ${msg.content}`
      ).join('\n');

      const prompt = `You are a compassionate Prayer Buddy assistant helping someone with their spiritual journey.

Previous conversation:
${historyContext}

User's message: "${message}"

Respond with encouragement, Biblical wisdom, and practical guidance. Be warm, supportive, and Christ-like. Keep responses concise (2-3 sentences) unless detailed explanation is needed.

Your response:`;

      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Error in prayer buddy chat:", error);
      return "I'm here to support you in prayer. How can I help you today?";
    }
  }

  async generateMemorizationTips(verse: string): Promise<string[]> {
    try {
      const prompt = `Provide 5 creative tips for memorizing this verse:
"${verse}"

Respond with ONLY a JSON array of strings (NO markdown):
["tip1", "tip2", "tip3", "tip4", "tip5"]

Make tips practical and creative. Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return JSON.parse(this.cleanJsonString(jsonMatch[0])) as string[];
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating memorization tips:", error);
      return [
        "Break the verse into small phrases and learn one at a time",
        "Write it out by hand multiple times",
        "Create a song or rhythm with the words",
        "Use visual imagery to remember key words",
        "Recite it before bed and when you wake up"
      ];
    }
  }
}

export const geminiService = new GeminiService();
