import { createClient, SupabaseClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL || "";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
let _client: SupabaseClient | null = null;
export function getSupabaseBrowser(): SupabaseClient | null {
    if (!url || !anon)
        return null;
    if (!_client) {
        _client = createClient(url, anon, {
            auth: {
                flowType: "pkce",
                detectSessionInUrl: false,
            },
        });
    }
    return _client;
}
