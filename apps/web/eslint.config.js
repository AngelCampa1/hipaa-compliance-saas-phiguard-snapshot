import config from '@phiguard/config/eslint'
export default [
  ...config,
  {
    ignores: ['src/routeTree.gen.ts'],
  },
]
