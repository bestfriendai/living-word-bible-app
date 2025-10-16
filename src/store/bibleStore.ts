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
}

export interface SavedVerse {
  id: string;
  reference: string;
  text: string;
  savedAt: string;
  notes?: string;
}

type BibleState = {
  verseOfTheDay: VerseOfTheDay | null;
  lastVerseUpdate: string | null;
  searchResults: BibleVerse[];
  isSearching: boolean;
  savedVerses: SavedVerse[];
  journalEntries: JournalEntry[];

  // Actions
  fetchVerseOfTheDay: () => Promise<void>;
  searchVerses: (query: string) => Promise<void>;
  saveVerse: (verse: BibleVerse, notes?: string) => void;
  removeSavedVerse: (verseId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  clearSearchResults: () => void;
};

export const useBibleStore = create(
  persist<BibleState>(
    (set, get) => ({
      verseOfTheDay: null,
      lastVerseUpdate: null,
      searchResults: [],
      isSearching: false,
      savedVerses: [],
      journalEntries: [],

      fetchVerseOfTheDay: async () => {
        const { lastVerseUpdate } = get();
        const now = new Date();
        const today = now.toDateString();

        // Check if we already have today's verse
        if (lastVerseUpdate) {
          const lastUpdate = new Date(lastVerseUpdate);
          if (lastUpdate.toDateString() === today) {
            return; // Already have today's verse
          }
        }

        try {
          const verse = await geminiService.getVerseOfTheDay();
          set({
            verseOfTheDay: verse,
            lastVerseUpdate: now.toISOString(),
          });
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
          set({ searchResults: verses });
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

      saveVerse: (verse: BibleVerse, notes?: string) => {
        const { savedVerses } = get();
        const newVerse: SavedVerse = {
          id: `${verse.reference}-${Date.now()}`,
          reference: verse.reference,
          text: verse.text,
          savedAt: new Date().toISOString(),
          notes,
        };
        set({ savedVerses: [newVerse, ...savedVerses] });
      },

      removeSavedVerse: (verseId: string) => {
        const { savedVerses } = get();
        set({ savedVerses: savedVerses.filter((v) => v.id !== verseId) });
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
