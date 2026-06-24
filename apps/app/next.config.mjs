/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@eufraat/ui", "@eufraat/firebase", "@eufraat/schemas"],
};

export default nextConfig;
