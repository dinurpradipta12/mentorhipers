import { useState, useEffect } from "react";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface PortalTheme {
    id: string;
    theme_name: string;
    is_active: boolean;
    primary_color: string;
    secondary_color: string;
    background_css: string;
    background_base_color: string;
    hero_title: string;
    hero_subtitle: string;
    footer_text: string;
    logo_url: string | null;
    config: any;
}

export function usePortalTheme() {
    const [theme, setTheme] = useState<PortalTheme | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                // Fetch the active theme
                // If there are multiple active, we pick the most recently updated one or use scheduling logic
                const { data, error } = await supabase
                    .from('v2_portal_themes')
                    .select('*')
                    .eq('is_active', true)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setTheme(data);
                }
            } catch (err) {
                console.error("Error fetching portal theme:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTheme();

        // Optional: Real-time update for the login page theme (admin changes and it reflects immediately)
        const channel = supabase.channel('portal_theme_changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'v2_portal_themes',
                filter: 'is_active=eq.true'
            }, (payload: RealtimePostgresChangesPayload<PortalTheme>) => {
                if (payload.new) {
                    setTheme(payload.new as PortalTheme);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { theme, loading };
}
