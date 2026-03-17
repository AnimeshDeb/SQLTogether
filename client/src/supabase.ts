import { createClient } from "@supabase/supabase-js";

const supabaseurl=import.meta.env.VITE_SB_PROJECT_URL;
const supabasekey=import.meta.env.VITE_SB_CLIENT_KEY;

export const supabase=createClient(supabaseurl,supabasekey)