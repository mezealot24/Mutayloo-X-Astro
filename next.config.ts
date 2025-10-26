import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

// Enable MDX support for app/learn docs pages
const withMDX = createMDX({
  options: {
    // Remark/Rehype plugins are optional but helpful for docs UX
    // They are conditionally required to avoid hard failures when not installed
    remarkPlugins: [require('remark-gfm')],
    rehypePlugins: [require('rehype-slug'), require('rehype-autolink-headings')],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

export default withMDX(nextConfig);
