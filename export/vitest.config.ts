import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Depuis vitest 4, dist/ n'est plus exclu par défaut : sans cela les tests compilés par tsc sont relancés.
        exclude: [...configDefaults.exclude, '**/dist/**'],
    },
});
