import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  geminiService,
  BibleVerse,
  VerseOfTheDay,
} from "@/services/geminiService";
import { achievementsData, Achievement } from "@/data/achievements";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  category?: "prayer" | "praise" | "reflection" | "request" | "answered";
  isAnswered?: boolean;
  answeredAt?: string;
}

export interface SavedVerse {
  id: string;
  reference: string;
  text: string;
  savedAt: string;
  notes?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface VerseHighlight {
  id: string;
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  color: "yellow" | "blue" | "green" | "red" | "purple" | "orange";
  note?: string;
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  searchedAt: string;
  resultCount: number;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  totalDaysRead: number;
}

export interface UserAchievement extends Achievement {
  unlockedAt: string;
  progress: number;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  currentDay: number;
  startedAt: string;
  isCompleted: boolean;
  readings: ReadingDay[];
}

export interface ReadingDay {
  day: number;
  reference: string;
  title?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface VerseHistory {
  id: string;
  verse: VerseOfTheDay;
  date: string;
}

type BibleState = {
  verseOfTheDay: VerseOfTheDay | null;
  lastVerseUpdate: string | null;
  verseHistory: VerseHistory[];
  searchResults: BibleVerse[];
  isSearching: boolean;
  savedVerses: SavedVerse[];
  journalEntries: JournalEntry[];
  searchHistory: SearchHistory[];
  readingStreak: ReadingStreak;
  highlights: VerseHighlight[];
  readingPlans: ReadingPlan[];
  activeReadingPlan: string | null;
  preferredTranslation: string;
  achievements: UserAchievement[];
  totalPoints: number;

  // Actions
  fetchVerseOfTheDay: () => Promise<void>;
  searchVerses: (query: string) => Promise<void>;
  saveVerse: (verse: BibleVerse, notes?: string, tags?: string[]) => void;
  removeSavedVerse: (verseId: string) => void;
  toggleVerseFavorite: (verseId: string) => void;
  updateVerseNotes: (verseId: string, notes: string) => void;
  addJournalEntry: (
    entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  markPrayerAnswered: (id: string) => void;
  clearSearchResults: () => void;
  clearSearchHistory: () => void;
  updateReadingStreak: () => void;
  createReadingPlan: (
    name: string,
    description: string,
    readings: Omit<ReadingDay, "isCompleted" | "completedAt">[],
  ) => string;
  markReadingComplete: (planId: string, day: number) => void;
  deleteReadingPlan: (planId: string) => void;
  setActiveReadingPlan: (planId: string | null) => void;
  addHighlight: (highlight: Omit<VerseHighlight, "id" | "createdAt">) => void;
  removeHighlight: (highlightId: string) => void;
  getHighlightByVerse: (verseId: string) => VerseHighlight | undefined;
  getHighlightsByBook: (book: string) => VerseHighlight[];
  setPreferredTranslation: (translation: string) => void;

  // Achievement actions
  checkAndUnlockAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  getAchievementProgress: (achievementId: string) => number;
  getTotalPoints: () => number;
};

export const useBibleStore = create(
  persist<BibleState>(
    (set, get) => ({
      verseOfTheDay: null,
      lastVerseUpdate: null,
      verseHistory: [],
      searchResults: [],
      isSearching: false,
      savedVerses: [],
      journalEntries: [],
      searchHistory: [],
      readingStreak: {
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: "",
        totalDaysRead: 0,
      },
      highlights: [],
      readingPlans: [],
      activeReadingPlan: null,
      preferredTranslation: "NIV",
      achievements: [],
      totalPoints: 0,

      fetchVerseOfTheDay: async () => {
        const { lastVerseUpdate, verseHistory } = get();
        const now = new Date();
        const today = now.toDateString();

        // Check if we already have today's verse
        if (lastVerseUpdate) {
          const lastUpdate = new Date(lastVerseUpdate);
          if (lastUpdate.toDateString() === today) {
            return;
          }
        }

        try {
          const verse = await geminiService.getVerseOfTheDay();

          // Add to history
          const historyEntry: VerseHistory = {
            id: `history-${Date.now()}`,
            verse,
            date: today,
          };

          set({
            verseOfTheDay: verse,
            lastVerseUpdate: now.toISOString(),
            verseHistory: [historyEntry, ...verseHistory.slice(0, 29)], // Keep last 30 days
          });

          // Update reading streak
          get().updateReadingStreak();
          get().checkAndUnlockAchievements();
        } catch (error) {
          console.error("Error fetching verse of the day:", error);
        }
      },

      searchVerses: async (query: string) => {
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }

        set({ isSearching: true });
        try {
          const verses = await geminiService.findRelevantVerses(query);

          // Add to search history
          const { searchHistory } = get();
          const historyEntry: SearchHistory = {
            id: `search-${Date.now()}`,
            query: query.trim(),
            searchedAt: new Date().toISOString(),
            resultCount: verses.length,
          };

          set({
            searchResults: verses,
            searchHistory: [historyEntry, ...searchHistory.slice(0, 19)], // Keep last 20 searches
          });
        } catch (error) {
          console.error("Error searching verses:", error);
          set({ searchResults: [] });
        } finally {
          set({ isSearching: false });
        }
      },

      clearSearchResults: () => {
        set({ searchResults: [] });
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      saveVerse: (verse: BibleVerse, notes?: string, tags?: string[]) => {
        const { savedVerses } = get();
        const newVerse: SavedVerse = {
          id: `${verse.reference}-${Date.now()}`,
          reference: verse.reference,
          text: verse.text,
          savedAt: new Date().toISOString(),
          notes,
          isFavorite: false,
          tags,
        };
        set({ savedVerses: [newVerse, ...savedVerses] });
        get().checkAndUnlockAchievements();
      },

      removeSavedVerse: (verseId: string) => {
        const { savedVerses } = get();
        set({ savedVerses: savedVerses.filter((v) => v.id !== verseId) });
      },

      toggleVerseFavorite: (verseId: string) => {
        const { savedVerses } = get();
        set({
          savedVerses: savedVerses.map((v) =>
            v.id === verseId ? { ...v, isFavorite: !v.isFavorite } : v,
          ),
        });
      },

      updateVerseNotes: (verseId: string, notes: string) => {
        const { savedVerses } = get();
        set({
          savedVerses: savedVerses.map((v) =>
            v.id === verseId ? { ...v, notes } : v,
          ),
        });
      },

      addJournalEntry: (entry) => {
        const { journalEntries } = get();
        const newEntry: JournalEntry = {
          ...entry,
          id: `journal-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ journalEntries: [newEntry, ...journalEntries] });
        get().checkAndUnlockAchievements();
      },

      updateJournalEntry: (id, updates) => {
        const { journalEntries } = get();
        set({
          journalEntries: journalEntries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
              : entry,
          ),
        });
      },

      deleteJournalEntry: (id) => {
        const { journalEntries } = get();
        set({ journalEntries: journalEntries.filter((e) => e.id !== id) });
      },

      markPrayerAnswered: (id) => {
        const { journalEntries } = get();
        set({
          journalEntries: journalEntries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  isAnswered: true,
                  answeredAt: new Date().toISOString(),
                  category: "answered" as const,
                  updatedAt: new Date().toISOString(),
                }
              : entry,
          ),
        });
      },

      updateReadingStreak: () => {
        const { readingStreak } = get();
        const today = new Date().toDateString();
        const lastRead = readingStreak.lastReadDate;

        if (!lastRead) {
          // First time reading
          set({
            readingStreak: {
              currentStreak: 1,
              longestStreak: 1,
              lastReadDate: today,
              totalDaysRead: 1,
            },
          });
          return;
        }

        const lastReadDate = new Date(lastRead).toDateString();

        if (lastReadDate === today) {
          // Already read today
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastReadDate === yesterdayStr) {
          // Continuing streak
          const newStreak = readingStreak.currentStreak + 1;
          set({
            readingStreak: {
              ...readingStreak,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, readingStreak.longestStreak),
              lastReadDate: today,
              totalDaysRead: readingStreak.totalDaysRead + 1,
            },
          });
        } else {
          // Streak broken, start new
          set({
            readingStreak: {
              ...readingStreak,
              currentStreak: 1,
              lastReadDate: today,
              totalDaysRead: readingStreak.totalDaysRead + 1,
            },
          });
        }
      },

      createReadingPlan: (name, description, readings) => {
        const { readingPlans } = get();
        const newPlan: ReadingPlan = {
          id: `plan-${Date.now()}`,
          name,
          description,
          duration: readings.length,
          currentDay: 1,
          startedAt: new Date().toISOString(),
          isCompleted: false,
          readings: readings.map((r) => ({
            ...r,
            isCompleted: false,
          })),
        };
        set({ readingPlans: [newPlan, ...readingPlans] });
        return newPlan.id;
      },

      markReadingComplete: (planId, day) => {
        const { readingPlans } = get();
        set({
          readingPlans: readingPlans.map((plan) => {
            if (plan.id !== planId) return plan;

            const updatedReadings = plan.readings.map((reading) =>
              reading.day === day
                ? {
                    ...reading,
                    isCompleted: true,
                    completedAt: new Date().toISOString(),
                  }
                : reading,
            );

            const allCompleted = updatedReadings.every((r) => r.isCompleted);

            return {
              ...plan,
              readings: updatedReadings,
              currentDay: Math.min(day + 1, plan.duration),
              isCompleted: allCompleted,
            };
          }),
        });
        get().checkAndUnlockAchievements();
      },

      deleteReadingPlan: (planId) => {
        const { readingPlans, activeReadingPlan } = get();
        set({
          readingPlans: readingPlans.filter((p) => p.id !== planId),
          activeReadingPlan:
            activeReadingPlan === planId ? null : activeReadingPlan,
        });
      },

      setActiveReadingPlan: (planId) => {
        set({ activeReadingPlan: planId });
      },

      addHighlight: (highlight) => {
        const { highlights } = get();
        const existingIndex = highlights.findIndex(
          (h) => h.verseId === highlight.verseId,
        );

        if (existingIndex >= 0) {
          // Update existing highlight
          const newHighlights = [...highlights];
          newHighlights[existingIndex] = {
            ...highlight,
            id: highlights[existingIndex].id,
            createdAt: highlights[existingIndex].createdAt,
          };
          set({ highlights: newHighlights });
        } else {
          // Add new highlight
          const newHighlight: VerseHighlight = {
            ...highlight,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
          set({ highlights: [...highlights, newHighlight] });
          get().checkAndUnlockAchievements();
        }
      },

      removeHighlight: (highlightId) => {
        const { highlights } = get();
        set({ highlights: highlights.filter((h) => h.id !== highlightId) });
      },

      getHighlightByVerse: (verseId) => {
        const { highlights } = get();
        return highlights.find((h) => h.verseId === verseId);
      },

      getHighlightsByBook: (book) => {
        const { highlights } = get();
        return highlights.filter((h) => h.book === book);
      },

      setPreferredTranslation: (translation) => {
        set({ preferredTranslation: translation });
      },

      // Achievement actions
      checkAndUnlockAchievements: () => {
        const state = get();
        const {
          achievements,
          savedVerses,
          journalEntries,
          readingStreak,
          highlights,
          readingPlans,
        } = state;

        achievementsData.forEach((achievement) => {
          const existingAchievement = achievements.find(
            (a) => a.id === achievement.id,
          );
          if (existingAchievement) return; // Already unlocked

          let shouldUnlock = false;

          switch (achievement.id) {
            case "first_verse":
              shouldUnlock = savedVerses.length >= 1;
              break;

            case "verse_collector_10":
              shouldUnlock = savedVerses.length >= 10;
              break;

            case "verse_collector_50":
              shouldUnlock = savedVerses.length >= 50;
              break;

            case "first_journal":
              shouldUnlock = journalEntries.length >= 1;
              break;

            case "journal_writer_10":
              shouldUnlock = journalEntries.length >= 10;
              break;

            case "prayer_warrior":
              const prayerEntries = journalEntries.filter(
                (e) => e.category === "prayer",
              );
              shouldUnlock = prayerEntries.length >= 25;
              break;

            case "streak_3":
              shouldUnlock = readingStreak.currentStreak >= 3;
              break;

            case "streak_7":
              shouldUnlock = readingStreak.currentStreak >= 7;
              break;

            case "streak_30":
              shouldUnlock = readingStreak.currentStreak >= 30;
              break;

            case "streak_100":
              shouldUnlock = readingStreak.currentStreak >= 100;
              break;

            case "first_highlight":
              shouldUnlock = highlights.length >= 1;
              break;

            case "highlighter_25":
              shouldUnlock = highlights.length >= 25;
              break;

            case "first_plan":
              shouldUnlock = readingPlans.length >= 1;
              break;

            case "plan_completer":
              const completedPlans = readingPlans.filter((p) => p.isCompleted);
              shouldUnlock = completedPlans.length >= 1;
              break;

            case "bible_explorer":
              const uniqueBooks = new Set(
                savedVerses.map((v) => v.reference.split(" ")[0]),
              ).size;
              shouldUnlock = uniqueBooks >= 10;
              break;

            case "answered_prayers":
              const answeredPrayers = journalEntries.filter(
                (e) => e.isAnswered,
              );
              shouldUnlock = answeredPrayers.length >= 5;
              break;

            case "faithful_reader":
              shouldUnlock = readingStreak.totalDaysRead >= 100;
              break;

            case "scripture_memorizer":
              const favoriteVerses = savedVerses.filter((v) => v.isFavorite);
              shouldUnlock = favoriteVerses.length >= 10;
              break;

            case "daily_devotion":
              shouldUnlock = readingStreak.currentStreak >= 7;
              break;

            case "word_seeker":
              shouldUnlock = state.searchHistory.length >= 50;
              break;

            case "light_of_the_world":
              shouldUnlock = savedVerses.length >= 100;
              break;

            case "walking_with_christ":
              shouldUnlock = readingStreak.totalDaysRead >= 365;
              break;
          }

          if (shouldUnlock && !existingAchievement) {
            get().unlockAchievement(achievement.id);
          }
        });
      },

      unlockAchievement: (achievementId) => {
        const { achievements } = get();
        const achievement = achievementsData.find(
          (a) => a.id === achievementId,
        );
        if (!achievement) return;

        const existingAchievement = achievements.find(
          (a) => a.id === achievementId,
        );
        if (existingAchievement) return; // Already unlocked

        const newAchievement: UserAchievement = {
          ...achievement,
          unlockedAt: new Date().toISOString(),
          progress: 1,
        };

        const newTotalPoints = get().getTotalPoints() + achievement.points;

        set({
          achievements: [...achievements, newAchievement],
          totalPoints: newTotalPoints,
        });
      },

      getAchievementProgress: (achievementId) => {
        const state = get();
        const {
          achievements,
          savedVerses,
          journalEntries,
          readingStreak,
          highlights,
          readingPlans,
        } = state;

        const existingAchievement = achievements.find(
          (a) => a.id === achievementId,
        );
        if (existingAchievement) return 1;

        const achievement = achievementsData.find(
          (a) => a.id === achievementId,
        );
        if (!achievement) return 0;

        switch (achievementId) {
          case "first_verse":
            return Math.min(savedVerses.length, 1);
          case "verse_collector_10":
            return Math.min(savedVerses.length / 10, 1);
          case "verse_collector_50":
            return Math.min(savedVerses.length / 50, 1);
          case "first_journal":
            return Math.min(journalEntries.length, 1);
          case "journal_writer_10":
            return Math.min(journalEntries.length / 10, 1);
          case "prayer_warrior":
            const prayerEntries = journalEntries.filter(
              (e) => e.category === "prayer",
            );
            return Math.min(prayerEntries.length / 25, 1);
          case "streak_3":
            return Math.min(readingStreak.currentStreak / 3, 1);
          case "streak_7":
            return Math.min(readingStreak.currentStreak / 7, 1);
          case "streak_30":
            return Math.min(readingStreak.currentStreak / 30, 1);
          case "streak_100":
            return Math.min(readingStreak.currentStreak / 100, 1);
          case "first_highlight":
            return Math.min(highlights.length, 1);
          case "highlighter_25":
            return Math.min(highlights.length / 25, 1);
          case "first_plan":
            return Math.min(readingPlans.length, 1);
          case "plan_completer":
            const completedPlans = readingPlans.filter((p) => p.isCompleted);
            return Math.min(completedPlans.length, 1);
          case "bible_explorer":
            const uniqueBooks = new Set(
              savedVerses.map((v) => v.reference.split(" ")[0]),
            ).size;
            return Math.min(uniqueBooks / 10, 1);
          case "answered_prayers":
            const answeredPrayers = journalEntries.filter((e) => e.isAnswered);
            return Math.min(answeredPrayers.length / 5, 1);
          case "faithful_reader":
            return Math.min(readingStreak.totalDaysRead / 100, 1);
          case "scripture_memorizer":
            const favoriteVerses = savedVerses.filter((v) => v.isFavorite);
            return Math.min(favoriteVerses.length / 10, 1);
          case "daily_devotion":
            return Math.min(readingStreak.currentStreak / 7, 1);
          case "word_seeker":
            return Math.min(state.searchHistory.length / 50, 1);
          case "light_of_the_world":
            return Math.min(savedVerses.length / 100, 1);
          case "walking_with_christ":
            return Math.min(readingStreak.totalDaysRead / 365, 1);
          default:
            return 0;
        }
      },

      getTotalPoints: () => {
        const { achievements } = get();
        return achievements.reduce(
          (total, achievement) => total + achievement.points,
          0,
        );
      },
    }),
    {
      name: "living-word-bible-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
