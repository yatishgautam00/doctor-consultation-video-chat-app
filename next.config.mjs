/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ["res.cloudinary.com", "avataaars.io"],
  },
};

export default nextConfig;
