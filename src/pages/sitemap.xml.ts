import { getAllPosts } from "../lib/postUtils.astro";
import { BASE_URL } from "../consts";

export const prerender = true;

export async function GET() {
    const staticPages = [
        {
            loc: BASE_URL,
            lastmod: new Date().toISOString(),
            priority: 1,
        },
        {
            loc: `${BASE_URL}/about`,
            lastmod: new Date().toISOString(),
            priority: 0.8,
        },
        {
            loc: `${BASE_URL}/gallery`,
            lastmod: new Date().toISOString(),
            priority: 0.8,
        },
        {
            loc: `${BASE_URL}/artwork`,
            lastmod: new Date().toISOString(),
            priority: 0.8,
        },
        {
            loc: `${BASE_URL}/all-posts`,
            lastmod: new Date().toISOString(),
            priority: 0.8,
        },
    ];
    const posts = await getAllPosts();
    const dynamicPages = posts.map((post: any) => {
        const updatedDate = post.data.pubDate;
        return {
            loc: `${BASE_URL}/${post.collection}/${post.slug}`,
            lastmod: new Date(updatedDate).toISOString(),
            priority: 0.5,
        };
    });

    const allPages = [...staticPages, ...dynamicPages];

    const urls = allPages.map((page) => {
        return `
        <url>
            <loc>${page.loc}</loc>
            <lastmod>${page.lastmod}</lastmod>
            <priority>${page.priority}</priority>
        </url>`;
    });

    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join("")}
        </urlset>`,
        {
            headers: {
                "Content-Type": "application/xml",
            },
        }
    );
}
