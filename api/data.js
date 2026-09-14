import { getSqlClient, getDatabaseUrl } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const sql = getSqlClient();
  if (!sql) {
    return res.status(200).json({
      success: false,
      status: 'unconfigured',
      message: 'DATABASE_URL veya POSTGRES_URL bulunamadı.'
    });
  }

  // GET: Tüm verileri Neon PostgreSQL'den çek
  if (req.method === 'GET') {
    try {
      // Tabloların varlığını kontrol et
      const tableCheck = await sql`
        SELECT count(*)::int as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'customers'
      `;

      if (tableCheck[0]?.count === 0) {
        return res.status(200).json({
          success: false,
          status: 'empty_needs_init',
          message: 'Tablolar henüz oluşturulmamış.'
        });
      }

      // content_posts tablosunun varlığını kontrol et / oluştur
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS content_posts (
            id TEXT PRIMARY KEY,
            "customerId" TEXT NOT NULL,
            "customerName" TEXT,
            title TEXT NOT NULL,
            caption TEXT,
            "mediaUrl" TEXT,
            "mediaType" TEXT DEFAULT 'image',
            platform TEXT DEFAULT 'instagram',
            "scheduledDate" TIMESTAMPTZ,
            status TEXT DEFAULT 'onay_bekliyor',
            "clientFeedback" TEXT,
            "createdAt" TIMESTAMPTZ DEFAULT NOW()
          );
        `;
      } catch (tableErr) {
        console.warn('content_posts tablosu oluşturulamadı/zaten var:', tableErr.message);
      }

      const [
        users,
        customers,
        categories,
        tasks,
        credentials,
        notes,
        files,
        comments,
        activities,
        notifications,
        templates,
        onboardingRequests,
        contentPosts
      ] = await Promise.all([
        sql`SELECT * FROM users`.catch(e => { console.error('users fetch error:', e.message); return []; }),
        sql`SELECT * FROM customers ORDER BY "createdAt" DESC`.catch(e => { console.error('customers fetch error:', e.message); return []; }),
        sql`SELECT * FROM categories`.catch(e => { console.error('categories fetch error:', e.message); return []; }),
        sql`SELECT * FROM tasks ORDER BY "createdAt" DESC`.catch(e => { console.error('tasks fetch error:', e.message); return []; }),
        sql`SELECT * FROM credentials ORDER BY "createdAt" DESC`.catch(e => { console.error('credentials fetch error:', e.message); return []; }),
        sql`SELECT * FROM notes ORDER BY "createdAt" DESC`.catch(e => { console.error('notes fetch error:', e.message); return []; }),
        sql`SELECT * FROM files ORDER BY "uploadedAt" DESC`.catch(e => { console.error('files fetch error:', e.message); return []; }),
        sql`SELECT * FROM comments ORDER BY "createdAt" DESC`.catch(e => { console.error('comments fetch error:', e.message); return []; }),
        sql`SELECT * FROM activities ORDER BY "createdAt" DESC`.catch(e => { console.error('activities fetch error:', e.message); return []; }),
        sql`SELECT * FROM notifications ORDER BY "createdAt" DESC`.catch(e => { console.error('notifications fetch error:', e.message); return []; }),
        sql`SELECT * FROM templates`.catch(e => { console.error('templates fetch error:', e.message); return []; }),
        sql`SELECT * FROM onboarding_requests ORDER BY "createdAt" DESC`.catch(e => { console.error('onboarding_requests fetch error:', e.message); return []; }),
        sql`SELECT * FROM content_posts ORDER BY "scheduledDate" ASC, "createdAt" DESC`.catch(e => { console.error('content_posts fetch error:', e.message); return []; })
      ]);

      return res.status(200).json({
        success: true,
        status: 'connected',
        data: {
          users: users || [],
          customers: customers || [],
          categories: categories || [],
          tasks: tasks || [],
          credentials: credentials || [],
          notes: notes || [],
          files: files || [],
          comments: comments || [],
          activities: activities || [],
          notifications: notifications || [],
          templates: templates || [],
          onboardingRequests: onboardingRequests || [],
          contentPosts: contentPosts || []
        }
      });
    } catch (err) {
      console.error('Fetch data error:', err);
      return res.status(500).json({
        success: false,
        status: 'error',
        error: err.message
      });
    }
  }

  // POST: Veri Mutasyonları (Ekleme / Güncelleme / Silme)
  if (req.method === 'POST') {
    const { action, payload } = req.body || {};

    try {
      switch (action) {
        // --- Görevler ---
        case 'insertTask': {
          const t = payload;
          await sql`
            INSERT INTO tasks (id, "customerId", "categoryId", title, description, "assignedTo", "assignedRole", "startDate", "dueDate", priority, status, "isCompleted", "completedAt", "completedBy", "waitingForClient", "waitingReason")
            VALUES (${t.id}, ${t.customerId}, ${t.categoryId || null}, ${t.title}, ${t.description || ''}, ${t.assignedTo || null}, ${t.assignedRole || null}, ${t.startDate || null}, ${t.dueDate || null}, ${t.priority || 'normal'}, ${t.status || 'yapilacak'}, ${Boolean(t.isCompleted)}, ${t.completedAt || null}, ${t.completedBy || null}, ${Boolean(t.waitingForClient)}, ${t.waitingReason || ''})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              "categoryId" = EXCLUDED."categoryId",
              status = EXCLUDED.status,
              "isCompleted" = EXCLUDED."isCompleted",
              priority = EXCLUDED.priority,
              "startDate" = EXCLUDED."startDate",
              "dueDate" = EXCLUDED."dueDate",
              "assignedTo" = EXCLUDED."assignedTo",
              "waitingForClient" = EXCLUDED."waitingForClient",
              "waitingReason" = EXCLUDED."waitingReason";
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateTask': {
          const { id, updates } = payload;
          if (updates.isCompleted !== undefined) {
            await sql`
              UPDATE tasks SET
                "isCompleted" = ${Boolean(updates.isCompleted)},
                status = ${updates.status || (updates.isCompleted ? 'tamamlandi' : 'devam_ediyor')},
                "completedAt" = ${updates.completedAt || null},
                "completedBy" = ${updates.completedBy || null}
              WHERE id = ${id};
            `;
          }
          if (updates.title) {
            await sql`UPDATE tasks SET title = ${updates.title} WHERE id = ${id};`;
          }
          if (updates.description !== undefined) {
            await sql`UPDATE tasks SET description = ${updates.description} WHERE id = ${id};`;
          }
          if (updates.priority) {
            await sql`UPDATE tasks SET priority = ${updates.priority} WHERE id = ${id};`;
          }
          if (updates.dueDate) {
            await sql`UPDATE tasks SET "dueDate" = ${updates.dueDate} WHERE id = ${id};`;
          }
          if (updates.assignedTo) {
            await sql`UPDATE tasks SET "assignedTo" = ${updates.assignedTo} WHERE id = ${id};`;
          }
          if (updates.waitingForClient !== undefined) {
            await sql`UPDATE tasks SET "waitingForClient" = ${Boolean(updates.waitingForClient)}, "waitingReason" = ${updates.waitingReason || ''} WHERE id = ${id};`;
          }
          return res.status(200).json({ success: true });
        }

        case 'deleteTask': {
          await sql`DELETE FROM tasks WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        // --- Müşteriler ---
        case 'insertCustomer': {
          const c = payload;
          await sql`
            INSERT INTO customers (id, "companyName", "contactPerson", phone, whatsapp, email, website, instagram, facebook, "partnerId", "partnerName", status, "projectTitle", "startDate", description)
            VALUES (${c.id}, ${c.companyName}, ${c.contactPerson || null}, ${c.phone || null}, ${c.whatsapp || null}, ${c.email || null}, ${c.website || null}, ${c.instagram || null}, ${c.facebook || null}, ${c.partnerId || null}, ${c.partnerName || null}, ${c.status || 'aktif'}, ${c.projectTitle || null}, ${c.startDate || null}, ${c.description || null})
            ON CONFLICT (id) DO NOTHING;
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateCustomer': {
          const { id, updates } = payload;
          if (updates.companyName) await sql`UPDATE customers SET "companyName" = ${updates.companyName} WHERE id = ${id};`;
          if (updates.contactPerson !== undefined) await sql`UPDATE customers SET "contactPerson" = ${updates.contactPerson} WHERE id = ${id};`;
          if (updates.phone !== undefined) await sql`UPDATE customers SET phone = ${updates.phone} WHERE id = ${id};`;
          if (updates.whatsapp !== undefined) await sql`UPDATE customers SET whatsapp = ${updates.whatsapp} WHERE id = ${id};`;
          if (updates.email !== undefined) await sql`UPDATE customers SET email = ${updates.email} WHERE id = ${id};`;
          if (updates.website !== undefined) await sql`UPDATE customers SET website = ${updates.website} WHERE id = ${id};`;
          if (updates.instagram !== undefined) await sql`UPDATE customers SET instagram = ${updates.instagram} WHERE id = ${id};`;
          if (updates.facebook !== undefined) await sql`UPDATE customers SET facebook = ${updates.facebook} WHERE id = ${id};`;
          if (updates.status) await sql`UPDATE customers SET status = ${updates.status} WHERE id = ${id};`;
          if (updates.projectTitle !== undefined) await sql`UPDATE customers SET "projectTitle" = ${updates.projectTitle} WHERE id = ${id};`;
          if (updates.startDate !== undefined) await sql`UPDATE customers SET "startDate" = ${updates.startDate} WHERE id = ${id};`;
          if (updates.description !== undefined) await sql`UPDATE customers SET description = ${updates.description} WHERE id = ${id};`;
          if (updates.partnerId !== undefined) await sql`UPDATE customers SET "partnerId" = ${updates.partnerId}, "partnerName" = ${updates.partnerName || 'Atanmamış'} WHERE id = ${id};`;
          return res.status(200).json({ success: true });
        }

        case 'deleteCustomer': {
          const customerId = payload.id;
          await sql`DELETE FROM tasks WHERE "customerId" = ${customerId};`;
          await sql`DELETE FROM notes WHERE "customerId" = ${customerId};`;
          await sql`DELETE FROM credentials WHERE "customerId" = ${customerId};`;
          await sql`DELETE FROM files WHERE "customerId" = ${customerId};`;
          await sql`DELETE FROM comments WHERE "customerId" = ${customerId};`;
          await sql`DELETE FROM content_posts WHERE "customerId" = ${customerId};`;
          await sql`DELETE FROM customers WHERE id = ${customerId};`;
          return res.status(200).json({ success: true });
        }

        // --- Notlar ---
        case 'insertNote': {
          const n = payload;
          await sql`
            INSERT INTO notes (id, "customerId", "authorName", "authorRole", "authorAvatar", content, color)
            VALUES (${n.id}, ${n.customerId}, ${n.authorName}, ${n.authorRole || null}, ${n.authorAvatar || null}, ${n.content}, ${n.color || 'blue'});
          `;
          return res.status(200).json({ success: true });
        }

        case 'deleteNote': {
          await sql`DELETE FROM notes WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        // --- Şifre Kasası ---
        case 'insertCredential': {
          const cr = payload;
          await sql`
            INSERT INTO credentials (id, "customerId", "serviceType", "serviceName", icon, color, "clientVisible", fields, "updatedAt")
            VALUES (${cr.id}, ${cr.customerId}, ${cr.serviceType}, ${cr.serviceName}, ${cr.icon || 'Key'}, ${cr.color || '#3B82F6'}, ${Boolean(cr.clientVisible)}, ${JSON.stringify(cr.fields || [])}::jsonb, ${cr.updatedAt || null})
            ON CONFLICT (id) DO NOTHING;
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateCredential': {
          const { id, updates } = payload;
          await sql`
            UPDATE credentials SET
              fields = ${JSON.stringify(updates.fields || [])}::jsonb,
              "serviceType" = COALESCE(${updates.serviceType || null}, "serviceType"),
              "serviceName" = COALESCE(${updates.serviceName || null}, "serviceName"),
              "clientVisible" = COALESCE(${updates.clientVisible !== undefined ? Boolean(updates.clientVisible) : null}, "clientVisible"),
              "updatedAt" = ${updates.updatedAt || null}
            WHERE id = ${id};
          `;
          return res.status(200).json({ success: true });
        }

        case 'deleteCredential': {
          await sql`DELETE FROM credentials WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        // --- Dosyalar ---
        case 'insertFile': {
          const f = payload;
          await sql`
            INSERT INTO files (id, "customerId", name, category, size, type, description, "uploadedBy", "fileUrl")
            VALUES (${f.id}, ${f.customerId}, ${f.name}, ${f.category || 'Belge'}, ${f.size || '1.5 MB'}, ${f.type || 'file'}, ${f.description || ''}, ${f.uploadedBy || 'Kullanıcı'}, ${f.fileUrl || null});
          `;
          return res.status(200).json({ success: true });
        }

        case 'deleteFile': {
          await sql`DELETE FROM files WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        // --- Yorumlar ---
        case 'insertComment': {
          const co = payload;
          await sql`
            INSERT INTO comments (id, "customerId", "userName", "userRole", "userAvatar", message, reply)
            VALUES (${co.id}, ${co.customerId}, ${co.userName}, ${co.userRole || null}, ${co.userAvatar || null}, ${co.message}, ${co.reply ? JSON.stringify(co.reply) : null}::jsonb);
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateComment': {
          const { id, updates } = payload;
          if (updates.reply) {
            await sql`UPDATE comments SET reply = ${JSON.stringify(updates.reply)}::jsonb WHERE id = ${id};`;
          }
          return res.status(200).json({ success: true });
        }

        // --- Bildirimler & Aktiviteler ---
        case 'insertActivity': {
          const a = payload;
          await sql`
            INSERT INTO activities (id, "customerId", "customerName", "userName", "actionText", type)
            VALUES (${a.id}, ${a.customerId || null}, ${a.customerName || 'Sistem'}, ${a.userName}, ${a.actionText}, ${a.type || 'general'});
          `;
          return res.status(200).json({ success: true });
        }

        case 'insertNotification': {
          const notif = payload;
          await sql`
            INSERT INTO notifications (id, title, message, read, "linkCustomerId")
            VALUES (${notif.id}, ${notif.title}, ${notif.message}, false, ${notif.linkCustomerId || null});
          `;
          return res.status(200).json({ success: true });
        }

        case 'markNotificationRead': {
          await sql`UPDATE notifications SET read = true WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        case 'markAllNotificationsRead': {
          await sql`UPDATE notifications SET read = true WHERE read = false;`;
          return res.status(200).json({ success: true });
        }

        // --- Şablonlar & Profil & Onboarding ---
        case 'insertTemplate': {
          const tm = payload;
          await sql`
            INSERT INTO templates (id, name, description, "taskItems")
            VALUES (${tm.id}, ${tm.name}, ${tm.description || ''}, ${JSON.stringify(tm.taskItems || [])}::jsonb);
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateTemplate': {
          const { id, updates } = payload;
          await sql`
            UPDATE templates SET
              name = COALESCE(${updates.name || null}, name),
              description = COALESCE(${updates.description || null}, description),
              "taskItems" = COALESCE(${updates.taskItems ? JSON.stringify(updates.taskItems) : null}::jsonb, "taskItems")
            WHERE id = ${id};
          `;
          return res.status(200).json({ success: true });
        }

        case 'deleteTemplate': {
          await sql`DELETE FROM templates WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        case 'insertUser': {
          const u = payload;
          const trimmedEmail = String(u.email || '').toLowerCase().trim();
          const existing = await sql`SELECT id FROM users WHERE LOWER(TRIM(email)) = ${trimmedEmail}`;
          if (existing && existing.length > 0) {
            const existingId = existing[0].id;
            await sql`
              UPDATE users SET
                name = ${u.name},
                password = ${u.password},
                role = ${u.role || 'musteri'},
                avatar = COALESCE(${u.avatar || null}, avatar),
                title = COALESCE(${u.title || null}, title),
                phone = COALESCE(${u.phone || null}, phone),
                company = COALESCE(${u.company || null}, company),
                "customerId" = COALESCE(${u.customerId || null}, "customerId")
              WHERE id = ${existingId};
            `;
          } else {
            await sql`
              INSERT INTO users (id, name, email, password, role, avatar, title, phone, company, "customerId")
              VALUES (${u.id}, ${u.name}, ${trimmedEmail}, ${u.password}, ${u.role || 'araci'}, ${u.avatar || null}, ${u.title || null}, ${u.phone || null}, ${u.company || null}, ${u.customerId || null})
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                password = EXCLUDED.password,
                role = EXCLUDED.role,
                avatar = EXCLUDED.avatar,
                title = EXCLUDED.title,
                phone = EXCLUDED.phone,
                company = EXCLUDED.company,
                "customerId" = EXCLUDED."customerId";
            `;
          }
          return res.status(200).json({ success: true });
        }

        case 'updateUser': {
          const { id, updates } = payload;
          try {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`;
          } catch (e) {}

          if (updates.name) await sql`UPDATE users SET name = ${updates.name} WHERE id = ${id};`;
          if (updates.email) await sql`UPDATE users SET email = ${updates.email} WHERE id = ${id};`;
          if (updates.password) await sql`UPDATE users SET password = ${updates.password} WHERE id = ${id};`;
          if (updates.role) await sql`UPDATE users SET role = ${updates.role} WHERE id = ${id};`;
          if (updates.phone !== undefined) await sql`UPDATE users SET phone = ${updates.phone} WHERE id = ${id};`;
          if (updates.avatar !== undefined) await sql`UPDATE users SET avatar = ${updates.avatar} WHERE id = ${id};`;
          if (updates.title !== undefined) await sql`UPDATE users SET title = ${updates.title} WHERE id = ${id};`;
          if (updates.company !== undefined) await sql`UPDATE users SET company = ${updates.company} WHERE id = ${id};`;
          if (updates.customerId !== undefined) await sql`UPDATE users SET "customerId" = ${updates.customerId} WHERE id = ${id};`;
          return res.status(200).json({ success: true });
        }

        case 'deleteUser': {
          const userId = payload.id;
          await sql`UPDATE customers SET "partnerId" = NULL, "partnerName" = 'Atanmamış' WHERE "partnerId" = ${userId};`;
          await sql`DELETE FROM users WHERE id = ${userId};`;
          return res.status(200).json({ success: true });
        }

        // --- Kategoriler ---
        case 'insertCategory': {
          const cat = payload;
          await sql`
            INSERT INTO categories (id, name, color, icon)
            VALUES (${cat.id}, ${cat.name}, ${cat.color || '#3B82F6'}, ${cat.icon || 'Folder'})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              color = EXCLUDED.color,
              icon = EXCLUDED.icon;
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateCategory': {
          const { id, updates } = payload;
          if (updates.name) await sql`UPDATE categories SET name = ${updates.name} WHERE id = ${id};`;
          if (updates.color) await sql`UPDATE categories SET color = ${updates.color} WHERE id = ${id};`;
          if (updates.icon) await sql`UPDATE categories SET icon = ${updates.icon} WHERE id = ${id};`;
          return res.status(200).json({ success: true });
        }

        case 'deleteCategory': {
          await sql`DELETE FROM categories WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        // --- Onboarding Talepleri ---
        case 'insertOnboardingRequest': {
          const reqItem = payload;
          await sql`
            INSERT INTO onboarding_requests (id, "customerId", "customerName", title, description, status, items, "completedAt")
            VALUES (${reqItem.id}, ${reqItem.customerId}, ${reqItem.customerName || 'Müşteri'}, ${reqItem.title}, ${reqItem.description || ''}, ${reqItem.status || 'pending'}, ${JSON.stringify(reqItem.items || [])}::jsonb, ${reqItem.completedAt || null})
            ON CONFLICT (id) DO NOTHING;
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateOnboardingRequest': {
          const { id, updates } = payload;
          await sql`
            UPDATE onboarding_requests SET
              status = COALESCE(${updates.status || null}, status),
              "completedAt" = COALESCE(${updates.completedAt || null}, "completedAt"),
              items = COALESCE(${updates.items ? JSON.stringify(updates.items) : null}::jsonb, items)
            WHERE id = ${id};
          `;
          return res.status(200).json({ success: true });
        }

        // --- Sosyal Medya İçerik Takvimi ---
        case 'insertContentPost': {
          const post = payload;
          await sql`
            INSERT INTO content_posts (
              id, "customerId", "customerName", title, caption, "mediaUrl", "mediaType", platform, "scheduledDate", status, "clientFeedback"
            )
            VALUES (
              ${post.id}, ${post.customerId}, ${post.customerName || ''}, ${post.title}, ${post.caption || ''}, 
              ${post.mediaUrl || ''}, ${post.mediaType || 'image'}, ${post.platform || 'instagram'}, 
              ${post.scheduledDate || null}, ${post.status || 'onay_bekliyor'}, ${post.clientFeedback || ''}
            )
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              caption = EXCLUDED.caption,
              "mediaUrl" = EXCLUDED."mediaUrl",
              "mediaType" = EXCLUDED."mediaType",
              platform = EXCLUDED.platform,
              "scheduledDate" = EXCLUDED."scheduledDate",
              status = EXCLUDED.status,
              "clientFeedback" = EXCLUDED."clientFeedback";
          `;
          return res.status(200).json({ success: true });
        }

        case 'updateContentPost': {
          const { id, updates } = payload;
          if (updates.title) await sql`UPDATE content_posts SET title = ${updates.title} WHERE id = ${id};`;
          if (updates.caption !== undefined) await sql`UPDATE content_posts SET caption = ${updates.caption} WHERE id = ${id};`;
          if (updates.mediaUrl !== undefined) await sql`UPDATE content_posts SET "mediaUrl" = ${updates.mediaUrl} WHERE id = ${id};`;
          if (updates.mediaType) await sql`UPDATE content_posts SET "mediaType" = ${updates.mediaType} WHERE id = ${id};`;
          if (updates.platform) await sql`UPDATE content_posts SET platform = ${updates.platform} WHERE id = ${id};`;
          if (updates.scheduledDate !== undefined) await sql`UPDATE content_posts SET "scheduledDate" = ${updates.scheduledDate} WHERE id = ${id};`;
          if (updates.status) await sql`UPDATE content_posts SET status = ${updates.status} WHERE id = ${id};`;
          if (updates.clientFeedback !== undefined) await sql`UPDATE content_posts SET "clientFeedback" = ${updates.clientFeedback} WHERE id = ${id};`;
          return res.status(200).json({ success: true });
        }

        case 'deleteContentPost': {
          await sql`DELETE FROM content_posts WHERE id = ${payload.id};`;
          return res.status(200).json({ success: true });
        }

        case 'clearAllData': {
          await sql`DELETE FROM tasks;`;
          await sql`DELETE FROM customers;`;
          await sql`DELETE FROM credentials;`;
          await sql`DELETE FROM notes;`;
          await sql`DELETE FROM files;`;
          await sql`DELETE FROM comments;`;
          await sql`DELETE FROM onboarding_requests;`;
          await sql`DELETE FROM content_posts;`;
          await sql`DELETE FROM activities;`;
          await sql`DELETE FROM notifications;`;
          await sql`DELETE FROM users WHERE role = 'musteri';`;
          return res.status(200).json({ success: true });
        }

        default:
          return res.status(400).json({ success: false, error: 'Bilinmeyen işlem eylemi: ' + action });
      }
    } catch (err) {
      console.error('Mutation error:', action, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
