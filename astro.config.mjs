import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { BASE_URL } from './src/consts';

// https://astro.build/config
export default defineConfig({
	site: BASE_URL,
	integrations: [
		mdx(),
		react(),
		// /treatise/ is live but unannounced: keep it out of the sitemap until Jes says to announce it.
		sitemap({ filter: (page) => !page.includes('/treatise/') }),
	],
});
