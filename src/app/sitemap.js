import { getPaintings } from '@/lib/data';

export default async function sitemap() {
    const baseUrl = 'https://akuzie.in';

    // Get all paintings for dynamic routes
    const paintings = await getPaintings();

    const paintingUrls = paintings.map((painting) => ({
        url: `${baseUrl}/painting/${painting.id}`,
        lastModified: painting.createdAt ? new Date(painting.createdAt) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        ...paintingUrls,
    ];
}
