import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    const flyers = await sql`
      SELECT
        f.id,
        f.store_name,
        f.flyer_date,
        f.image_urls,
        f.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', fi.id,
              'name', fi.name,
              'price', fi.price,
              'isDiscounted', fi.is_discounted
            )
          ) FILTER (WHERE fi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM flyers f
      LEFT JOIN flyer_items fi ON fi.flyer_id = f.id
      GROUP BY f.id
      ORDER BY f.created_at DESC
      LIMIT 50
    `;

    return new Response(JSON.stringify({ flyers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('get-flyers error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch flyers' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
