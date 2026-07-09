import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // --- Scope boundaries (which domain may import which) ---
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:board',
              onlyDependOnLibsWithTags: ['scope:board', 'scope:shared'],
            },
            {
              sourceTag: 'scope:workflow',
              onlyDependOnLibsWithTags: ['scope:workflow', 'scope:shared'],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                'scope:app',
                'scope:board',
                'scope:workflow',
                'scope:shared',
              ],
            },
            // --- Type boundaries (allowed layering, most to least composed) ---
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:core',
                'type:util',
                'type:model',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:core',
                'type:util',
                'type:model',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: [
                'type:ui',
                'type:core',
                'type:util',
                'type:model',
              ],
            },
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:util',
                'type:model',
              ],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:model',
              onlyDependOnLibsWithTags: ['type:model'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
