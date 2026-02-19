import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const storeName = formData.get('storeName') as string || '不明な店舗';
    const flyerDate = formData.get('flyerDate') as string || new Date().toISOString().split('T')[0];
    const itemsJson = formData.get('items') as string;
    const items: { name: string; price?: number; isDiscounted: boolean }[] = itemsJson ? JSON.parse(itemsJson) : [];

    // Upload images to Vercel Blob
    const imageUrls: string[] = [];
    for (const file of files) {
      const blob = await put(`flyers/${Date.now()}-${file.name}`, file, {
        access: 'public',
      });
      imageUrls.push(blob.url);
    }

    // Insert flyer record
    const flyerResult = await sql`
      INSERT INTO flyers (store_name, flyer_date, image_urls, created_at)
      VALUES (${storeName}, ${flyerDate}, ${JSON.stringify(imageUrls)}, NOW())
      RETURNING id
    `;
    const flyerId = flyerResult[0].id;

    // Insert items
    if (items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO flyer_items (flyer_id, name, price, is_discounted)
          VALUES (${flyerId}, ${item.name}, ${item.price ?? null}, ${item.isDiscounted})
        `;
      }
    }

    return new Response(JSON.stringify({ success: true, flyerId, imageUrls }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('save-flyer error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save flyer' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
