import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import navigation from './src/content/navigation.json';

export default defineConfig({
  base: '/aide',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Aide Mon Diag Artif',
      customCss: ['./src/styles/custom.css'],
      locales: {
        root: { label: 'Fran\u00e7ais', lang: 'fr' },
      },
      sidebar: [
        { label: 'Accueil', slug: '' },
        ...navigation,
      ],
    }),
  ],
});