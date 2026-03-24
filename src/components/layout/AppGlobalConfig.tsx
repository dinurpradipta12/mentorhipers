"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const AppGlobalConfig = () => {
  useEffect(() => {
    const applyConfig = async () => {
      const [settingsRes, mentorRes] = await Promise.all([
        supabase.from('app_settings').select('app_name, app_logo, app_favicon').eq('id', 1).single(),
        supabase.from('mentor_profile').select('name, avatar').eq('id', 1).single()
      ]);

      if (settingsRes.data) {
        const data = settingsRes.data;
        if (data.app_name) {
          document.title = data.app_name;
          localStorage.setItem('app_name', data.app_name);
        }
        if (data.app_logo) localStorage.setItem('app_logo', data.app_logo);
        if (data.app_favicon) {
          localStorage.setItem('app_favicon', data.app_favicon);
          const updateFavicon = (url: string) => {
            const icons = document.querySelectorAll("link[rel*='icon']");
            if (icons.length > 0) {
              icons.forEach(icon => (icon as HTMLLinkElement).href = url);
            } else {
              const link = document.createElement('link');
              link.rel = 'icon';
              link.href = url;
              document.head.appendChild(link);
            }
          };
          updateFavicon(data.app_favicon);
        }
        // TABLET ZOOM SYNC
        const storedZoom = localStorage.getItem('tablet_zoom') || (data as any).tablet_zoom || "0.7";
        document.documentElement.style.setProperty('--tablet-zoom', storedZoom);
        localStorage.setItem('tablet_zoom', storedZoom);
      }

      if (mentorRes.data) {
        localStorage.setItem('mentor_name', mentorRes.data.name || "");
        localStorage.setItem('mentor_avatar', mentorRes.data.avatar || "");
      }
    };

    applyConfig();

    const channel = supabase.channel('global_config_sync')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'app_settings' 
      }, (payload: { new: { app_name?: string, app_logo?: string, app_favicon?: string, tablet_zoom?: string } }) => {
        if (payload.new.app_name) {
          document.title = payload.new.app_name;
          localStorage.setItem('app_name', payload.new.app_name);
        }
        if (payload.new.app_logo) localStorage.setItem('app_logo', payload.new.app_logo);
        if (payload.new.tablet_zoom) {
          document.documentElement.style.setProperty('--tablet-zoom', payload.new.tablet_zoom);
          localStorage.setItem('tablet_zoom', payload.new.tablet_zoom);
        }
        if (payload.new.app_favicon) {
          localStorage.setItem('app_favicon', payload.new.app_favicon);
          const icons = document.querySelectorAll("link[rel*='icon']");
          if (icons.length > 0) {
            icons.forEach(icon => (icon as HTMLLinkElement).href = payload.new.app_favicon as string);
          } else {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = payload.new.app_favicon;
            document.head.appendChild(link);
          }
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'mentor_profile' 
      }, (payload: { new: { name?: string, avatar?: string } }) => {
        if (payload.new.name) localStorage.setItem('mentor_name', payload.new.name);
        if (payload.new.avatar) localStorage.setItem('mentor_avatar', payload.new.avatar);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return null;
}
