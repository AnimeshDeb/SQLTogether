import { create } from 'zustand';
import { supabase } from '../supabase';

export interface Homework {
  id: number;
  title: string;
  week: number;
  difficulty: string;
  topics: string[];
  prompt: string;
  table_schemas: Record<string, Record<string, string>>;
  setup_sql: string;
  expected_output: Record<string, unknown>[];
  test_setup_sql_1: string;
  test_expected_output_1: Record<string, unknown>[];
  test_setup_sql_2: string;
  test_expected_output_2: Record<string, unknown>[];
  test_setup_sql_3: string;
  test_expected_output_3: Record<string, unknown>[];
}
interface HomeworkStore {
  homework: Homework[];
  isLoaded: boolean;
  isLoading: boolean;
  fetchHomework: () => Promise<void>;
}

export const useHomeworkStore = create<HomeworkStore>((set, get) => ({
  homework: [],
  isLoaded: false,
  isLoading: false,

  fetchHomework: async () => {
    // If it's already loaded or currently loading, don't fetch again
    if (get().isLoaded || get().isLoading) return;

    set({ isLoading: true });

    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .order('week', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching homework:', error);
      set({ isLoading: false });
      return;
    }

    set({ homework: data as Homework[], isLoaded: true, isLoading: false });
  },
}));