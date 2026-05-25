/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TypeScript: allowJs = true so .js files coexist during migration.
  // Flip strict: true in tsconfig once all files are .tsx/.ts
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
