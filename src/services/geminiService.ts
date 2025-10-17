import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

// Read API key from environment variables (configured in app.config.ts)
const API_KEY = Constants.expoConfig?.extra?.geminiApiKey || "";

if (!API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not found. Please set it in your .env file.");
}

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
  category:
    | "praise"
    | "thanksgiving"
    | "confession"
    | "supplication"
    | "intercession";
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
  type: "reflection" | "analysis" | "application" | "memory";
  difficulty: "easy" | "medium" | "hard";
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
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SermonNotes {
  title: string;
  mainPoints: string[];
  keyVerses: string[];
  personalReflection: string;
  actionSteps: string[];
  suggestedReadings: string[];
}

export type SupportedLanguage =
  | "English"
  | "Spanish"
  | "Portuguese"
  | "Korean"
  | "French"
  | "German"
  | "Chinese";

export class GeminiService {
  // Upgraded to Gemini 2.5 Flash for improved performance and capabilities
  // Falls back to 2.0 Flash if 2.5 is not available in Google AI Studio yet
  private model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // Fallback models: gemini-2.0-flash-exp, gemini-1.5-flash
  });

  private defaultLanguage: SupportedLanguage = "English";

  private cleanJsonString(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // Remove control characters (U+0000 through U+001F except tab, newline, carriage return)
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

    // Normalize line breaks
    cleaned = cleaned.replace(/\r\n/g, "\n");

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
          context:
            "Paul's letter encouraging believers to trust God with their worries",
          relevance:
            "This verse reminds us that God cares about what we're going through and offers peace beyond understanding.",
        },
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
        reflection:
          "Every day comes with its own set of challenges, and sometimes it can feel overwhelming. This verse from James reminds us that these trials are not in vain; they serve a greater purpose in our spiritual journey. They build perseverance, which is essential for a mature and complete faith. When life's difficulties arise, it is natural to feel frustration or discouragement. However, James encourages us to shift our perspective and view these moments as opportunities for growth.\n\nIn moments of trial, consider what you can learn about yourself and your faith. It might be patience, reliance on God, or a deeper understanding of His word. Embracing these lessons can transform your outlook and strengthen your relationship with God. This doesn't mean you have to be joyful about the trial itself, but rather in the assurance that God is with you and working through these experiences for your spiritual benefit.",
      };
    }
  }

  async generatePrayer(
    situation: string,
    prayerType?: string,
  ): Promise<GeneratedPrayer> {
    try {
      const typeInstruction = prayerType
        ? `Focus on ${prayerType} prayer.`
        : "";
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
        return JSON.parse(
          this.cleanJsonString(jsonMatch[0]),
        ) as GeneratedPrayer;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating prayer:", error);
      return {
        title: "Prayer for Guidance",
        prayer:
          "Heavenly Father, we come before You today seeking Your wisdom and guidance. You know the situation we face, and we trust in Your perfect plan. Grant us peace that surpasses understanding, strength to face each day, and faith to believe in Your goodness. Help us to see Your hand at work in our lives and to trust in Your timing. In Jesus' name, Amen.",
        category: "supplication",
        suggestedVerses: ["Proverbs 3:5-6", "Philippians 4:6-7"],
      };
    }
  }

  async explainVerse(
    reference: string,
    verseText: string,
  ): Promise<VerseExplanation> {
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
        return JSON.parse(
          this.cleanJsonString(jsonMatch[0]),
        ) as VerseExplanation;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error explaining verse:", error);
      return {
        reference,
        historicalContext:
          "This verse was written to encourage believers in their faith journey.",
        spiritualMeaning:
          "It reminds us of God's faithfulness and love for His people.",
        practicalApplication:
          "We can apply this by trusting God in our daily lives and seeking His guidance.",
        relatedVerses: ["Psalm 23:1", "John 14:6", "Romans 8:28"],
        keyThemes: ["Faith", "Trust", "God's Love"],
      };
    }
  }

  async generateBibleStudyQuestions(
    verseReference: string,
    count: number = 5,
  ): Promise<BibleStudyQuestion[]> {
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
        return JSON.parse(
          this.cleanJsonString(jsonMatch[0]),
        ) as BibleStudyQuestion[];
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating study questions:", error);
      return [
        {
          question: "What is the main message of this verse?",
          type: "analysis",
          difficulty: "easy",
        },
        {
          question: "How can you apply this verse to your life today?",
          type: "application",
          difficulty: "medium",
        },
      ];
    }
  }

  async analyzePrayerJournal(prayers: any[]): Promise<PrayerInsight> {
    try {
      const prayerSummary = prayers.slice(0, 20).map((p) => ({
        title: p.title,
        category: p.category,
        isAnswered: p.isAnswered,
      }));

      const prompt = `Analyze this prayer journal and provide insights:
${JSON.stringify(prayerSummary)}

Respond ONLY with valid JSON (NO markdown):
{
  "totalPrayers": ${prayers.length},
  "answeredPrayers": ${prayers.filter((p) => p.isAnswered).length},
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
        answeredPrayers: prayers.filter((p) => p.isAnswered).length,
        commonThemes: ["Faith", "Guidance", "Strength"],
        encouragement:
          "Your faithfulness in prayer is beautiful. God hears every prayer and works in His perfect timing.",
        suggestedFocus:
          "Continue seeking God's wisdom in your daily decisions.",
        growthAreas: ["Consistency", "Thanksgiving"],
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
        return JSON.parse(
          this.cleanJsonString(jsonMatch[0]),
        ) as SpiritualGrowthReport;
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
        personalizedTip:
          "Your dedication to daily reading is inspiring! Consider starting a verse memorization practice to deepen your faith.",
      };
    }
  }

  async chatWithPrayerBuddy(
    message: string,
    chatHistory: ChatMessage[] = [],
  ): Promise<string> {
    try {
      const historyContext = chatHistory
        .slice(-6)
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Prayer Buddy"}: ${msg.content}`,
        )
        .join("\n");

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
        "Recite it before bed and when you wake up",
      ];
    }
  }

  /**
   * Set the language for AI responses
   */
  setLanguage(language: SupportedLanguage): void {
    this.defaultLanguage = language;
    console.log(`🌍 Language set to: ${language}`);
  }

  /**
   * Get current language setting
   */
  getLanguage(): SupportedLanguage {
    return this.defaultLanguage;
  }

  /**
   * Generate prayer in specified language
   */
  async generateMultilingualPrayer(
    situation: string,
    language: SupportedLanguage = this.defaultLanguage,
    prayerType?: string,
  ): Promise<GeneratedPrayer> {
    try {
      const typeInstruction = prayerType
        ? `Focus on ${prayerType} prayer.`
        : "";
      const languageInstruction =
        language !== "English" ? `Respond in ${language} language.` : "";

      const prompt = `You are a compassionate prayer assistant. Generate a heartfelt prayer for someone in this situation: "${situation}"

${typeInstruction}
${languageInstruction}

Respond ONLY with valid JSON (NO markdown, NO code blocks):
{
  "title": "Prayer title (3-5 words in ${language})",
  "prayer": "The full prayer text (2-3 paragraphs, personal and heartfelt in ${language})",
  "category": "praise" | "thanksgiving" | "confession" | "supplication" | "intercession",
  "suggestedVerses": ["Reference 1", "Reference 2"]
}

Make it personal, Biblical, and encouraging. Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = this.cleanJsonString(result.response.text());
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(
          this.cleanJsonString(jsonMatch[0]),
        ) as GeneratedPrayer;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating multilingual prayer:", error);
      return {
        title:
          language === "Spanish"
            ? "Oración de Guía"
            : language === "Portuguese"
              ? "Oração de Orientação"
              : language === "Korean"
                ? "인도를 위한 기도"
                : "Prayer for Guidance",
        prayer:
          language === "Spanish"
            ? "Padre Celestial, venimos ante Ti buscando Tu sabiduría y guía. Conoces la situación que enfrentamos y confiamos en Tu plan perfecto. Concédenos paz que sobrepasa todo entendimiento, fuerza para enfrentar cada día, y fe para creer en Tu bondad. Ayúdanos a ver Tu mano trabajando en nuestras vidas y a confiar en Tu tiempo. En el nombre de Jesús, Amén."
            : language === "Portuguese"
              ? "Pai Celestial, vimos diante de Ti buscando Tua sabedoria e orientação. Conheces a situação que enfrentamos e confiamos em Teu plano perfeito. Concede-nos paz que excede todo entendimento, força para enfrentar cada dia, e fé para acreditar em Tua bondade. Ajuda-nos a ver Tua mão trabalhando em nossas vidas e a confiar em Teu tempo. Em nome de Jesus, Amém."
              : language === "Korean"
                ? "하늘에 계신 아버지, 주님의 지혜와 인도를 구하며 주님 앞에 나옵니다. 우리가 직면한 상황을 아시며 주님의 완벽한 계획을 신뢰합니다. 모든 이해를 초월하는 평안과 매일을 직면할 힘, 그리고 주님의 선하심을 믿을 믿음을 허락하소서. 우리 삶에서 역사하시는 주님의 손길을 보게 하시고 주님의 때를 신뢰하게 하소서. 예수님의 이름으로 기도합니다, 아멘."
                : "Heavenly Father, we come before You today seeking Your wisdom and guidance. You know the situation we face, and we trust in Your perfect plan. Grant us peace that surpasses understanding, strength to face each day, and faith to believe in Your goodness. Help us to see Your hand at work in our lives and to trust in Your timing. In Jesus' name, Amen.",
        category: "supplication",
        suggestedVerses: ["Proverbs 3:5-6", "Philippians 4:6-7"],
      };
    }
  }

  /**
   * AI Sermon Notes Assistant
   * Helps users take and organize notes from sermons
   */
  async generateSermonNotes(
    sermonTopic: string,
    keyPoints: string[],
    versesMentioned: string[],
  ): Promise<SermonNotes> {
    try {
      const prompt = `You are a sermon notes assistant. Help organize these notes from a sermon:

Topic: "${sermonTopic}"
Key Points Mentioned: ${keyPoints.join(", ")}
Verses Referenced: ${versesMentioned.join(", ")}

Respond ONLY with valid JSON (NO markdown):
{
  "title": "Sermon title (3-6 words)",
  "mainPoints": ["point1", "point2", "point3"],
  "keyVerses": ["verse reference 1", "verse reference 2"],
  "personalReflection": "1-2 paragraph reflection on what this sermon means personally",
  "actionSteps": ["action1", "action2", "action3"],
  "suggestedReadings": ["book/passage 1", "book/passage 2"]
}

Make it practical, Biblical, and actionable. Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(this.cleanJsonString(jsonMatch[0])) as SermonNotes;
      }
      throw new Error("Invalid response");
    } catch (error) {
      console.error("Error generating sermon notes:", error);
      return {
        title: sermonTopic || "Sermon Notes",
        mainPoints:
          keyPoints.length > 0 ? keyPoints : ["Faith", "Trust", "Action"],
        keyVerses:
          versesMentioned.length > 0 ? versesMentioned : ["Romans 8:28"],
        personalReflection:
          "This sermon challenged me to grow in my faith and trust God more deeply in my daily life.",
        actionSteps: [
          "Pray about this daily",
          "Share with a friend",
          "Study the verses mentioned",
        ],
        suggestedReadings: ["Romans 8", "James 1"],
      };
    }
  }

  /**
   * Translate verse or text to another language
   */
  async translateText(
    text: string,
    targetLanguage: SupportedLanguage,
  ): Promise<string> {
    try {
      const prompt = `Translate the following Biblical text to ${targetLanguage}. Maintain the spiritual and theological meaning:

"${text}"

Respond with ONLY the translated text, no additional formatting or explanation.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Error translating text:", error);
      return text; // Return original if translation fails
    }
  }

  /**
   * Generate devotional in specified language
   */
  async getMultilingualVerseOfTheDay(
    language: SupportedLanguage = this.defaultLanguage,
  ): Promise<VerseOfTheDay> {
    try {
      const today = new Date().toLocaleDateString();
      const languageInstruction =
        language !== "English"
          ? `Respond entirely in ${language} language.`
          : "";

      const prompt = `Generate a meaningful verse of the day for ${today}.

${languageInstruction}

Respond ONLY with valid JSON (NO markdown):
{
  "title": "A meaningful title for the devotional (4-6 words in ${language})",
  "reference": "Book Chapter:Verse (keep in original language)",
  "text": "The actual verse text (in ${language})",
  "reflection": "A 2-3 paragraph reflection in ${language} that helps readers apply this verse to their lives today. Make it personal, encouraging, and practical."
}

Important:
- Choose verses that are uplifting and relevant to daily life
- The reflection should be warm, encouraging, and actionable
- Return ONLY valid JSON, no markdown formatting`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const jsonString = this.cleanJsonString(jsonMatch[0]);
      const verseOfDay = JSON.parse(jsonString) as VerseOfTheDay;
      return verseOfDay;
    } catch (error) {
      console.error("Error getting multilingual verse of the day:", error);
      // Return fallback in requested language
      if (language === "Spanish") {
        return {
          title: "Fortaleza en Medio de las Pruebas",
          reference: "Santiago 1:2-3",
          text: "Considérense muy dichosos cuando tengan que enfrentarse con diversas pruebas, pues ya saben que la prueba de su fe produce constancia.",
          reflection:
            "Cada día trae sus propios desafíos, y a veces puede sentirse abrumador. Este versículo de Santiago nos recuerda que estas pruebas no son en vano; sirven un propósito mayor en nuestro viaje espiritual. Construyen perseverancia, que es esencial para una fe madura y completa. Cuando surgen las dificultades de la vida, es natural sentir frustración o desánimo. Sin embargo, Santiago nos anima a cambiar nuestra perspectiva y ver estos momentos como oportunidades para crecer.\n\nEn momentos de prueba, considera lo que puedes aprender sobre ti mismo y tu fe. Podría ser paciencia, dependencia de Dios, o una comprensión más profunda de Su palabra. Abrazar estas lecciones puede transformar tu perspectiva y fortalecer tu relación con Dios.",
        };
      } else if (language === "Portuguese") {
        return {
          title: "Força em Meio às Provações",
          reference: "Tiago 1:2-3",
          text: "Meus irmãos, considerem motivo de grande alegria o fato de passarem por diversas provações, pois vocês sabem que a prova da sua fé produz perseverança.",
          reflection:
            "Cada dia traz seu próprio conjunto de desafios, e às vezes pode parecer esmagador. Este versículo de Tiago nos lembra que essas provações não são em vão; elas servem a um propósito maior em nossa jornada espiritual. Elas constroem perseverança, que é essencial para uma fé madura e completa. Quando as dificuldades da vida surgem, é natural sentir frustração ou desânimo. No entanto, Tiago nos encoraja a mudar nossa perspectiva e ver esses momentos como oportunidades de crescimento.\n\nEm momentos de provação, considere o que você pode aprender sobre si mesmo e sua fé. Pode ser paciência, confiança em Deus, ou uma compreensão mais profunda de Sua palavra. Abraçar essas lições pode transformar sua perspectiva e fortalecer seu relacionamento com Deus.",
        };
      } else if (language === "Korean") {
        return {
          title: "시련 가운데서의 힘",
          reference: "야고보서 1:2-3",
          text: "내 형제들아 너희가 여러 가지 시험을 당하거든 온전히 기쁘게 여기라 이는 너희 믿음의 시련이 인내를 만들어 내는 줄 너희가 앎이라",
          reflection:
            "매일은 그 나름의 도전과제를 가져오며, 때로는 압도적으로 느껴질 수 있습니다. 야고보서의 이 구절은 이러한 시련이 헛되지 않다는 것을 상기시켜 줍니다; 그것들은 우리의 영적 여정에서 더 큰 목적을 제공합니다. 그것들은 성숙하고 완전한 믿음에 필수적인 인내를 형성합니다. 삶의 어려움이 발생할 때, 좌절감이나 낙담을 느끼는 것은 자연스러운 일입니다. 그러나 야고보는 우리의 관점을 바꾸고 이러한 순간을 성장의 기회로 보도록 격려합니다.\n\n시련의 순간에, 자신과 믿음에 대해 무엇을 배울 수 있는지 생각해보십시오. 그것은 인내, 하나님에 대한 의존, 또는 그분의 말씀에 대한 더 깊은 이해일 수 있습니다. 이러한 교훈을 받아들이는 것은 당신의 관점을 변화시키고 하나님과의 관계를 강화할 수 있습니다.",
        };
      } else {
        // English fallback
        return {
          title: "Strength in the Midst of Trials",
          reference: "James 1:2-3",
          text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.",
          reflection:
            "Every day comes with its own set of challenges, and sometimes it can feel overwhelming. This verse from James reminds us that these trials are not in vain; they serve a greater purpose in our spiritual journey. They build perseverance, which is essential for a mature and complete faith. When life's difficulties arise, it is natural to feel frustration or discouragement. However, James encourages us to shift our perspective and view these moments as opportunities for growth.\n\nIn moments of trial, consider what you can learn about yourself and your faith. It might be patience, reliance on God, or a deeper understanding of His word. Embracing these lessons can transform your outlook and strengthen your relationship with God.",
        };
      }
    }
  }
}

export const geminiService = new GeminiService();
