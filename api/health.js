import { getSqlClient, getDatabaseUrl } from './db.js';

export default async function handler(req, res) {
  // CORS başlıkları
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return res.status(200).json({
      success: false,
      status: 'unconfigured',
      message: 'DATABASE_URL veya POSTGRES_URL çevre değişkeni henüz tanımlanmamış.'
    });
  }

  try {
    const sql = getSqlClient();
    // Test sorgusu
    await sql`SELECT 1 as test`;

    // Tabloların varlığını kontrol et
    const tableCheck = await sql`
      SELECT count(*)::int as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'customers'
    `;

    const tablesExist = tableCheck[0]?.count > 0;

    return res.status(200).json({
      success: true,
      status: tablesExist ? 'connected' : 'empty_needs_init',
      tablesExist,
      message: tablesExist
        ? 'Neon PostgreSQL veritabanı başarıyla bağlandı ve hazır.'
        : 'Neon veritabanı bağlantısı başarılı! Ancak tablolar henüz oluşturulmamış. "Veritabanını Başlat" butonunu kullanabilirsiniz.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Neon veritabanı bağlantı hatası: ' + err.message
    });
  }
}
