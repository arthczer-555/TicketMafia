/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "files.slack.com" },
      { protocol: "https", hostname: "avatars.slack-edge.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
  },
  experimental: {
    // Keep dynamic pages in the client router cache for 60s — makes nav between
    // /, /settings, /tickets/[id], /admin instant. Mutations (server actions)
    // call revalidatePath, which busts this cache automatically.
    staleTimes: {
      dynamic: 60,
      static: 180,
    },
  },
};

module.exports = nextConfig;
