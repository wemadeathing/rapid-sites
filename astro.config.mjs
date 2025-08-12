// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import alpine from '@astrojs/alpinejs';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://rapidsites.co.za',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [alpine(), sitemap()]
});