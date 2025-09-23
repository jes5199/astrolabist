export const prerender = true;
import { BASE_URL } from '../consts';

export async function GET() {
    return new Response(
        `User-agent: *
        Disallow:
        Sitemap: ${BASE_URL}/sitemap.xml`,
        {
            headers: {
                "Content-Type": "text/plain",
            },
        }
    );
}