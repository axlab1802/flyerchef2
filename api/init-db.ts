import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS flyers (
        id SERIAL PRIMARY KEY,
        store_name TEXT NOT NULL DEFAULT '不明な店舗',
        flyer_date DATE NOT NULL,
        image_urls JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS flyer_items (
        id SERIAL PRIMARY KEY,
        flyer_id INTEGER NOT NULL REFERENCES flyers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        price INTEGER,
        is_discounted BOOLEAN NOT NULL DEFAULT false
      )
    `;

    return new Response(JSON.stringify({ success: true, message: 'Tables created' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('init-db error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
