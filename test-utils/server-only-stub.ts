// Vitest runs outside Next.js's webpack/turbopack server-bundle aliasing, where the real
// "server-only" package is swapped for a no-op. This stub reproduces that no-op for tests.
export {};
