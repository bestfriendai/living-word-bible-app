import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { geminiService, BibleVerse, VerseOfTheDay } from "@/services/geminiService";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  category?: 'prayer' | 'praise' | 'reflection' | 'request' | 'answered';
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
  readingPlans: ReadingPlan[];
  activeReadingPlan: string | null;

  // Actions
  fetchVerseOfTheDay: () => Promise<void>;
  searchVerses: (query: string) => Promise<void>;
  saveVerse: (verse: BibleVerse, notes?: string, tags?: string[]) => void;
  removeSavedVerse: (verseId: string) => void;
  toggleVerseFavorite: (verseId: string) => void;
  updateVerseNotes: (verseId: string, notes: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  markPrayerAnswered: (id: string) => void;
  clearSearchResults: () => void;
  clearSearchHistory: () => void;
  updateReadingStreak: () => void;
  createReadingPlan: (name: string, description: string, readings: Omit<ReadingDay, "isCompleted" | "completedAt">[]) => void;
  markReadingComplete: (planId: string, day: number) => void;
  deleteReadingPlan: (planId: string) => void;
  setActiveReadingPlan: (planId: string | null) => void;
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
        lastReadDate: '',
        totalDaysRead: 0,
      },
      readingPlans: [],
      activeReadingPlan: null,

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
      },

      removeSavedVerse: (verseId: string) => {
        const { savedVerses } = get();
        set({ savedVerses: savedVerses.filter((v) => v.id !== verseId) });
      },

      toggleVerseFavorite: (verseId: string) => {
        const { savedVerses } = get();
        set({
          savedVerses: savedVerses.map((v) =>
            v.id === verseId ? { ...v, isFavorite: !v.isFavorite } : v
          ),
        });
      },

      updateVerseNotes: (verseId: string, notes: string) => {
        const { savedVerses } = get();
        set({
          savedVerses: savedVerses.map((v) =>
            v.id === verseId ? { ...v, notes } : v
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
      },

      updateJournalEntry: (id, updates) => {
        const { journalEntries } = get();
        set({
          journalEntries: journalEntries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
              : entry
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
                  category: 'answered' as const,
                  updatedAt: new Date().toISOString(),
                }
              : entry
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
      },

      markReadingComplete: (planId, day) => {
        const { readingPlans } = get();
        set({
          readingPlans: readingPlans.map((plan) => {
            if (plan.id !== planId) return plan;

            const updatedReadings = plan.readings.map((reading) =>
              reading.day === day
                ? { ...reading, isCompleted: true, completedAt: new Date().toISOString() }
                : reading
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
      },

      deleteReadingPlan: (planId) => {
        const { readingPlans, activeReadingPlan } = get();
        set({
          readingPlans: readingPlans.filter((p) => p.id !== planId),
          activeReadingPlan: activeReadingPlan === planId ? null : activeReadingPlan,
        });
      },

      setActiveReadingPlan: (planId) => {
        set({ activeReadingPlan: planId });
      },
    }),
    {
      name: "living-word-bible-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { isSearching: _, ...dataToPersist } = state;
        return dataToPersist;
      },
    }
  )
);
