module.exports = {
  env: {
    NEXT_PUBLIC_COMMIT: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'local',
  },
}; 