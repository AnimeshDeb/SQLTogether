import { create } from 'zustand';
import { supabase } from '../supabase';
import { PGlite } from '@electric-sql/pglite';

export interface Quest {
  id: string;
  category: string;
  title: string;
  prompt: string;
  setup_sql: string;
  expected_output: string | Record<string, unknown>[];
}

interface QuestStore {
  quests: Quest[];
  completedQuestIds: Set<string>;
  completedLessons: Set<string>;
  isLoaded: boolean;
  isLoading: boolean;
  
  // 🌟 The Live Database Engine
  dbInstance: PGlite | null;
  isDbBooting: boolean;

  fetchData: (userId: string) => Promise<void>;
  initEngine: () => Promise<void>;
  markQuestCompleted: (questId: string) => void;
  markLessonCompleted: (category: string) => void;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: [],
  completedQuestIds: new Set(),
  completedLessons: new Set(),
  isLoaded: false,
  isLoading: false,
  dbInstance: null,
  isDbBooting: false,

  initEngine: async () => {
    // Skip if already booted or booting
    if (get().dbInstance || get().isDbBooting) return;

    set({ isDbBooting: true });
    try {
      // Boot a fresh, in-memory PGlite instance
      const pg = new PGlite();
      set({ dbInstance: pg, isDbBooting: false });
    } catch (err) {
      console.error("Failed to boot PGlite:", err);
      set({ isDbBooting: false });
    }
  },

  fetchData: async (userId: string) => {
    if (get().isLoaded) return;
    set({ isLoading: true });

    try {
      // Fetch Quests
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('*'); // We need all columns now, including setup_sql and expected_output
      if (questError) throw questError;

      // Fetch Completed Quests
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('quest_id')
        .eq('user_id', userId)
        .eq('is_completed', true);
      if (progressError) throw progressError;

      const completedIds = new Set(progressData?.map((p) => p.quest_id) || []);

      // Fetch Completed Lessons (Local Storage)
      const localLessons = new Set<string>();
      const dbCategories = [...new Set((questData as Quest[]).map((q) => q.category))];
      const allCategoriesToCheck = [...dbCategories, 'CORE CONCEPTS'];

      allCategoriesToCheck.forEach((cat) => {
        if (localStorage.getItem(`lesson_completed_${cat.toUpperCase()}`) === 'true') {
          localLessons.add(cat.toUpperCase());
        }
      });

      set({
        quests: questData as Quest[],
        completedQuestIds: completedIds,
        completedLessons: localLessons,
        isLoaded: true,
      });
    } catch (err) {
      console.error('Error fetching global data:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  markQuestCompleted: (questId: string) => {
    set((state) => {
      const newSet = new Set(state.completedQuestIds);
      newSet.add(questId);
      return { completedQuestIds: newSet };
    });
  },

  markLessonCompleted: (category: string) => {
    const catUpper = category.toUpperCase();
    localStorage.setItem(`lesson_completed_${catUpper}`, 'true');
    set((state) => {
      const newSet = new Set(state.completedLessons);
      newSet.add(catUpper);
      return { completedLessons: newSet };
    });
  },
}));