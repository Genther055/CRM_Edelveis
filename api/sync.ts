import { neon } from '@neondatabase/serverless';

declare const process: any;

const FALLBACK_DB_URL = 'postgresql://neondb_owner:npg_XgHe9KjuD2EZ@ep-curly-butterfly-b1otmqqq-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require';

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || FALLBACK_DB_URL;
  return neon(url);
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();

  try {
    // --- 1. GET: FETCH COMPLETE SYNC STATE ---
    if (req.method === 'GET') {
      const [
        clientsRaw,
        ordersRaw,
        materialsRaw,
        employeesRaw,
        deliveriesRaw,
        settingsRaw
      ] = await Promise.all([
        sql`SELECT * FROM clients ORDER BY name ASC`,
        sql`SELECT * FROM orders ORDER BY created_at DESC`,
        sql`SELECT * FROM materials ORDER BY name ASC`,
        sql`SELECT * FROM employees ORDER BY id ASC`,
        sql`SELECT * FROM deliveries ORDER BY date DESC`,
        sql`SELECT * FROM system_settings`
      ]);

      const clients = clientsRaw.map((c: any) => ({
        id: c.id,
        name: c.name,
        contact: c.contact || '',
        phone: c.phone || '',
        email: c.email || '',
        discount: Number(c.discount || 0),
        city: c.city || 'Вінниця',
        tags: c.tags || [],
        files: c.files || [],
        type: c.type || 'client',
        sectionId: c.section_id,
        sectionStatus: c.section_status,
        sectionFieldValues: c.section_field_values || {}
      }));

      const orders = ordersRaw.map((o: any) => ({
        id: o.id,
        name: o.name,
        clientId: o.client_id || '',
        category: o.category || '',
        quantity: Number(o.quantity || 0),
        packingCount: Number(o.packing_count || 100),
        paperType: o.paper_type || 'offset',
        paperName: o.paper_name || '',
        sheetSize: o.sheet_size || '',
        turnTypeLabel: o.turn_type_label || '',
        colors: o.colors || '1+0',
        isSamNaSebe: Boolean(o.is_sam_na_sebe),
        designCost: Number(o.design_cost || 0),
        margin: Number(o.margin || 0),
        machine: o.machine || '',
        format: o.format || 'A4',
        physicalSheets: Number(o.physical_sheets || 0),
        itemsPerSheet: Number(o.items_per_sheet || 1),
        subtotal: Number(o.subtotal || 0),
        marginAmount: Number(o.margin_amount || 0),
        finalPrice: Number(o.final_price || 0),
        unitPrice: Number(o.unit_price || 0),
        status: o.status || 'design',
        paymentStatus: o.payment_status || 'unpaid',
        prepayment: Number(o.prepayment || 0),
        createdAt: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
        createdBy: o.created_by || 'Користувач',
        notes: o.notes || '',
        priladkaSheets: Number(o.priladka_sheets || 0),
        techWasteSheets: Number(o.tech_waste_sheets || 0),
        totalGrossSheets: Number(o.total_gross_sheets || 0),
        platesCount: Number(o.plates_count || 0),
        postpressOps: o.postpress_ops || [],
        packingInfo: o.packing_info || '',
        deadline: o.deadline || '',
        ttnNumber: o.ttn_number || '',
        ttnStatus: o.ttn_status || '',
        customFieldValues: o.custom_field_values || {},
        stageChangedAt: o.stage_changed_at || {},
        totalMarkupPercent: Number(o.total_markup_percent || 0),
        isImportant: Boolean(o.is_important)
      }));

      const materials = materialsRaw.map((m: any) => ({
        id: m.id,
        name: m.name,
        type: m.type || 'offset',
        quantity: Number(m.quantity || 0),
        reserved: Number(m.reserved || 0),
        unit: m.unit || 'арк.',
        price: Number(m.price || 0),
        supplier: m.supplier || '',
        minStock: Number(m.min_stock || 0),
        location: m.location || '',
        salesLog: m.sales_log || []
      }));

      const employees = employeesRaw.map((e: any) => ({
        id: e.id,
        name: e.name,
        username: e.username,
        role: e.username === 'admin' ? 'admin' : (e.username === 'manager' || e.username === 'technolog' ? 'manager' : (['admin', 'manager', 'operator', 'client'].includes(e.role) ? e.role : 'operator')),
        phone: e.phone || '',
        email: e.email || '',
        birthday: e.birthday || '',
        hireDate: e.hire_date || '',
        status: e.status || 'Активний',
        activeDealsCount: Number(e.active_deals_count || 0),
        activeClientsCount: Number(e.active_clients_count || 0)
      }));

      const deliveries = deliveriesRaw.map((d: any) => ({
        id: d.id,
        dealId: d.deal_id,
        clientName: d.client_name,
        address: d.address,
        ttnNumber: d.ttn_number,
        status: d.status || 'created',
        date: d.date || '',
        deliveryType: d.delivery_type || 'nova_poshta',
        npAccountId: d.np_account_id || '',
        courierName: d.courier_name || '',
        deliveryTime: d.delivery_time || '',
        notes: d.notes || ''
      }));

      let norms = null;
      const settingsMap: Record<string, any> = {};
      for (const s of settingsRaw) {
        if (s.key === 'norms') norms = s.data;
        else settingsMap[s.key] = s.data;
      }

      return res.status(200).json({
        ok: true,
        clients,
        orders,
        materials,
        employees,
        deliveries,
        norms,
        settings: settingsMap,
        timestamp: Date.now()
      });
    }

    // --- 2. POST: MUTATIONS & UPDATES ---
    if (req.method === 'POST') {
      const body = req.body || {};
      const { action, payload } = body;

      // 2.1 Order Upsert / Update
      if (action === 'save_order' || action === 'add_order') {
        const o = payload;
        await sql`
          INSERT INTO orders (
            id, name, client_id, category, quantity, packing_count, paper_type, paper_name,
            sheet_size, turn_type_label, colors, is_sam_na_sebe, design_cost, margin,
            machine, format, physical_sheets, items_per_sheet, priladka_sheets, tech_waste_sheets,
            total_gross_sheets, plates_count, postpress_ops, packing_info, deadline, notes,
            unit_price, subtotal, margin_amount, final_price, status, payment_status, prepayment,
            created_by, ttn_number, ttn_status, custom_field_values, stage_changed_at,
            total_markup_percent, is_important, updated_at
          ) VALUES (
            ${o.id}, ${o.name}, ${o.clientId || ''}, ${o.category || ''}, ${o.quantity || 1}, ${o.packingCount || 100},
            ${o.paperType || 'offset'}, ${o.paperName || ''}, ${o.sheetSize || ''}, ${o.turnTypeLabel || ''},
            ${o.colors || '1+0'}, ${Boolean(o.isSamNaSebe)}, ${o.designCost || 0}, ${o.margin || 0},
            ${o.machine || ''}, ${o.format || 'A4'}, ${o.physicalSheets || 0}, ${o.itemsPerSheet || 1},
            ${o.priladkaSheets || 0}, ${o.techWasteSheets || 0}, ${o.totalGrossSheets || 0}, ${o.platesCount || 0},
            ${JSON.stringify(o.postpressOps || [])}::jsonb, ${o.packingInfo || ''}, ${o.deadline || ''}, ${o.notes || ''},
            ${o.unitPrice || 0}, ${o.subtotal || 0}, ${o.marginAmount || 0}, ${o.finalPrice || 0},
            ${o.status || 'design'}, ${o.paymentStatus || 'unpaid'}, ${o.prepayment || 0}, ${o.createdBy || 'Користувач'},
            ${o.ttnNumber || ''}, ${o.ttnStatus || ''}, ${JSON.stringify(o.customFieldValues || {})}::jsonb,
            ${JSON.stringify(o.stageChangedAt || {})}::jsonb, ${o.totalMarkupPercent || 0}, ${Boolean(o.isImportant)},
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            client_id = EXCLUDED.client_id,
            category = EXCLUDED.category,
            quantity = EXCLUDED.quantity,
            packing_count = EXCLUDED.packing_count,
            paper_type = EXCLUDED.paper_type,
            paper_name = EXCLUDED.paper_name,
            sheet_size = EXCLUDED.sheet_size,
            turn_type_label = EXCLUDED.turn_type_label,
            colors = EXCLUDED.colors,
            is_sam_na_sebe = EXCLUDED.is_sam_na_sebe,
            design_cost = EXCLUDED.design_cost,
            margin = EXCLUDED.margin,
            machine = EXCLUDED.machine,
            format = EXCLUDED.format,
            physical_sheets = EXCLUDED.physical_sheets,
            items_per_sheet = EXCLUDED.items_per_sheet,
            priladka_sheets = EXCLUDED.priladka_sheets,
            tech_waste_sheets = EXCLUDED.tech_waste_sheets,
            total_gross_sheets = EXCLUDED.total_gross_sheets,
            plates_count = EXCLUDED.plates_count,
            postpress_ops = EXCLUDED.postpress_ops,
            packing_info = EXCLUDED.packing_info,
            deadline = EXCLUDED.deadline,
            notes = EXCLUDED.notes,
            unit_price = EXCLUDED.unit_price,
            subtotal = EXCLUDED.subtotal,
            margin_amount = EXCLUDED.margin_amount,
            final_price = EXCLUDED.final_price,
            status = EXCLUDED.status,
            payment_status = EXCLUDED.payment_status,
            prepayment = EXCLUDED.prepayment,
            ttn_number = EXCLUDED.ttn_number,
            ttn_status = EXCLUDED.ttn_status,
            custom_field_values = EXCLUDED.custom_field_values,
            stage_changed_at = EXCLUDED.stage_changed_at,
            total_markup_percent = EXCLUDED.total_markup_percent,
            is_important = EXCLUDED.is_important,
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ ok: true, message: 'Order saved' });
      }

      // 2.2 Client Upsert / Update
      if (action === 'save_client' || action === 'add_client') {
        const c = payload;
        await sql`
          INSERT INTO clients (
            id, name, contact, phone, email, discount, city, tags, files, type,
            section_id, section_status, section_field_values, updated_at
          ) VALUES (
            ${c.id}, ${c.name}, ${c.contact || ''}, ${c.phone || ''}, ${c.email || ''},
            ${c.discount || 0}, ${c.city || 'Вінниця'}, ${JSON.stringify(c.tags || [])}::jsonb,
            ${JSON.stringify(c.files || [])}::jsonb, ${c.type || 'client'}, ${c.sectionId || null},
            ${c.sectionStatus || null}, ${JSON.stringify(c.sectionFieldValues || {})}::jsonb,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            contact = EXCLUDED.contact,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            discount = EXCLUDED.discount,
            city = EXCLUDED.city,
            tags = EXCLUDED.tags,
            files = EXCLUDED.files,
            type = EXCLUDED.type,
            section_id = EXCLUDED.section_id,
            section_status = EXCLUDED.section_status,
            section_field_values = EXCLUDED.section_field_values,
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ ok: true, message: 'Client saved' });
      }

      // 2.3 Material Stock Update / Upsert
      if (action === 'update_material_stock') {
        const { materialId, quantity } = payload;
        await sql`
          UPDATE materials 
          SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${materialId};
        `;
        return res.status(200).json({ ok: true, message: 'Stock updated' });
      }

      if (action === 'save_material') {
        const m = payload;
        await sql`
          INSERT INTO materials (id, name, type, quantity, reserved, unit, price, supplier, min_stock, location, sales_log, updated_at)
          VALUES (${m.id}, ${m.name}, ${m.type || 'offset'}, ${m.quantity || 0}, ${m.reserved || 0}, ${m.unit || 'арк.'}, ${m.price || 0}, ${m.supplier || ''}, ${m.minStock || 0}, ${m.location || ''}, ${JSON.stringify(m.salesLog || [])}::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            quantity = EXCLUDED.quantity,
            reserved = EXCLUDED.reserved,
            unit = EXCLUDED.unit,
            price = EXCLUDED.price,
            supplier = EXCLUDED.supplier,
            min_stock = EXCLUDED.min_stock,
            location = EXCLUDED.location,
            sales_log = EXCLUDED.sales_log,
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ ok: true, message: 'Material saved' });
      }

      // 2.4 Norms & System Settings Update
      if (action === 'update_norms') {
        await sql`
          INSERT INTO system_settings (key, data, updated_at)
          VALUES ('norms', ${JSON.stringify(payload)}::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ ok: true, message: 'Norms updated' });
      }

      // 2.5 Seed Initial Data Batch
      if (action === 'seed_initial_data') {
        const { clients, orders, materials, employees, norms } = payload;
        
        if (clients && clients.length > 0) {
          for (const c of clients) {
            await sql`
              INSERT INTO clients (id, name, contact, phone, email, discount, city, tags, files, type, updated_at)
              VALUES (${c.id}, ${c.name}, ${c.contact || ''}, ${c.phone || ''}, ${c.email || ''}, ${c.discount || 0}, ${c.city || 'Вінниця'}, ${JSON.stringify(c.tags || [])}::jsonb, ${JSON.stringify(c.files || [])}::jsonb, ${c.type || 'client'}, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO NOTHING;
            `;
          }
        }

        if (materials && materials.length > 0) {
          for (const m of materials) {
            await sql`
              INSERT INTO materials (id, name, type, quantity, reserved, unit, sales_log, updated_at)
              VALUES (${m.id}, ${m.name}, ${m.type || 'offset'}, ${m.quantity || 0}, ${m.reserved || 0}, ${m.unit || 'арк.'}, ${JSON.stringify(m.salesLog || [])}::jsonb, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO NOTHING;
            `;
          }
        }

        if (employees && employees.length > 0) {
          for (const e of employees) {
            await sql`
              INSERT INTO employees (id, name, username, role, phone, email, birthday, hire_date, status, active_deals_count, active_clients_count, updated_at)
              VALUES (${e.id}, ${e.name}, ${e.username}, ${e.role}, ${e.phone || ''}, ${e.email || ''}, ${e.birthday || ''}, ${e.hireDate || ''}, ${e.status || 'Активний'}, ${e.activeDealsCount || 0}, ${e.activeClientsCount || 0}, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO NOTHING;
            `;
          }
        }

        if (orders && orders.length > 0) {
          for (const o of orders) {
            await sql`
              INSERT INTO orders (id, name, client_id, category, quantity, packing_count, paper_type, colors, is_sam_na_sebe, design_cost, margin, machine, format, physical_sheets, items_per_sheet, subtotal, margin_amount, final_price, unit_price, status, payment_status, prepayment, created_by, ttn_number, ttn_status, is_important, updated_at)
              VALUES (${o.id}, ${o.name}, ${o.clientId || ''}, ${o.category || ''}, ${o.quantity || 1}, ${o.packingCount || 100}, ${o.paperType || 'offset'}, ${o.colors || '1+0'}, ${Boolean(o.isSamNaSebe)}, ${o.designCost || 0}, ${o.margin || 0}, ${o.machine || ''}, ${o.format || 'A4'}, ${o.physicalSheets || 0}, ${o.itemsPerSheet || 1}, ${o.subtotal || 0}, ${o.marginAmount || 0}, ${o.finalPrice || 0}, ${o.unitPrice || 0}, ${o.status || 'design'}, ${o.paymentStatus || 'unpaid'}, ${o.prepayment || 0}, ${o.createdBy || 'Користувач'}, ${o.ttnNumber || ''}, ${o.ttnStatus || ''}, ${Boolean(o.isImportant)}, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO NOTHING;
            `;
          }
        }

        if (norms) {
          await sql`
            INSERT INTO system_settings (key, data, updated_at)
            VALUES ('norms', ${JSON.stringify(norms)}::jsonb, CURRENT_TIMESTAMP)
            ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;
          `;
        }

        return res.status(200).json({ ok: true, message: 'Initial data seeded into Neon PostgreSQL' });
      }

      return res.status(400).json({ ok: false, error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Database Sync API Error:', err);
    return res.status(500).json({
      ok: false,
      error: err.message || 'Internal Database Error'
    });
  }
}
