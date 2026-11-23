import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const suiteId = searchParams.get('suiteId');

    if (suiteId) {
      const suite = db.prepare('SELECT * FROM private_api_suites WHERE id = ?').get(suiteId);
      if (!suite) {
        return NextResponse.json({ success: false, error: 'Suite not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, suite });
    }

    let suites = [];
    if (email) {
      suites = db.prepare('SELECT * FROM private_api_suites WHERE LOWER(user_email) = LOWER(?) ORDER BY created_at DESC').all(email);
    } else {
      suites = db.prepare('SELECT * FROM private_api_suites ORDER BY created_at DESC').all();
    }

    return NextResponse.json({ success: true, suites });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const {
      userEmail,
      name,
      suiteType = 'cloud_aws',
      cspProvider = 'Private Microservices',
      serviceCategory = 'Private API Test Suite',
      endpoints = [],
    } = body;

    if (!userEmail || !name) {
      return NextResponse.json({ success: false, error: 'User email and suite name are required' }, { status: 400 });
    }

    const id = `suite_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO private_api_suites (
        id, user_email, name, suite_type, csp_provider, service_category, endpoints_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(
      id,
      userEmail.toLowerCase().trim(),
      name,
      suiteType,
      cspProvider,
      serviceCategory,
      JSON.stringify(endpoints),
      now
    );

    // Also register endpoints in monitored_services under target_type = 'private_api'
    const insertMonitored = db.prepare(`
      INSERT INTO monitored_services (
        id, name, target_type, target_url, check_interval_seconds,
        current_status, latest_response_time_ms, uptime_percentage,
        total_checks, failed_checks, last_checked_at, user_email, metric_type, service_category
      ) VALUES (?, ?, 'private_api', ?, ?, 'HEALTHY', 45.0, 100.0, 1, 0, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        target_url = excluded.target_url,
        check_interval_seconds = excluded.check_interval_seconds,
        last_checked_at = excluded.last_checked_at,
        service_category = excluded.service_category
    `);

    for (const ep of endpoints) {
      if (ep.endpoint && typeof ep.endpoint === 'string' && ep.endpoint.trim()) {
        const serviceId = `priv_${id}_${ep.id || Math.random().toString(36).substring(2, 8)}`;
        try {
          insertMonitored.run(
            serviceId,
            ep.name || 'Private Probe',
            ep.endpoint.trim(),
            ep.intervalSeconds || 15,
            now,
            userEmail.toLowerCase().trim(),
            ep.id || 'latency',
            id
          );
        } catch (insertErr) {
          console.error('Failed to insert private monitored service:', insertErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      suiteId: id,
      message: 'Private API suite created and monitoring initialized.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const {
      suiteId,
      userEmail,
      name,
      suiteType,
      cspProvider,
      serviceCategory,
      endpoints = [],
    } = body;

    if (!suiteId || !name) {
      return NextResponse.json({ success: false, error: 'Suite ID and name are required for update' }, { status: 400 });
    }

    const existing: any = db.prepare('SELECT * FROM private_api_suites WHERE id = ?').get(suiteId);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Suite not found' }, { status: 404 });
    }

    if (userEmail && existing.user_email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized to modify this suite' }, { status: 403 });
    }

    db.prepare(`
      UPDATE private_api_suites
      SET name = ?,
          suite_type = COALESCE(?, suite_type),
          csp_provider = COALESCE(?, csp_provider),
          service_category = COALESCE(?, service_category),
          endpoints_json = ?
      WHERE id = ?
    `).run(
      name,
      suiteType || existing.suite_type,
      cspProvider || existing.csp_provider,
      serviceCategory || existing.service_category,
      JSON.stringify(endpoints),
      suiteId
    );

    // Update or insert endpoints in monitored_services using in-place conflict updates
    const now = new Date().toISOString();
    const activeServiceIds = new Set<string>();

    const upsertMonitored = db.prepare(`
      INSERT INTO monitored_services (
        id, name, target_type, target_url, check_interval_seconds,
        current_status, latest_response_time_ms, uptime_percentage,
        total_checks, failed_checks, last_checked_at, user_email, metric_type, service_category
      ) VALUES (?, ?, 'private_api', ?, ?, 'HEALTHY', 45.0, 100.0, 1, 0, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        target_url = excluded.target_url,
        check_interval_seconds = excluded.check_interval_seconds,
        last_checked_at = excluded.last_checked_at,
        service_category = excluded.service_category
    `);

    for (const ep of endpoints) {
      if (ep.endpoint && typeof ep.endpoint === 'string' && ep.endpoint.trim()) {
        const serviceId = `priv_${suiteId}_${ep.id || Math.random().toString(36).substring(2, 8)}`;
        activeServiceIds.add(serviceId);
        try {
          upsertMonitored.run(
            serviceId,
            ep.name || 'Private Probe',
            ep.endpoint.trim(),
            ep.intervalSeconds || 15,
            now,
            userEmail?.toLowerCase()?.trim() || existing.user_email,
            ep.id || 'latency',
            suiteId
          );
        } catch (insertErr) {
          console.error('Failed to update private monitored service:', insertErr);
        }
      }
    }

    // Safely prune any services that were removed from this suite
    try {
      const oldServices: any[] = db.prepare(
        "SELECT id FROM monitored_services WHERE service_category = ? OR id LIKE 'priv_' || ? || '%'"
      ).all(suiteId, suiteId);

      for (const oldS of oldServices) {
        if (!activeServiceIds.has(oldS.id)) {
          // Delete child records in exact foreign-key dependency order
          try { db.prepare('DELETE FROM service_notification_logs WHERE service_id = ?').run(oldS.id); } catch (_) {}
          try { db.prepare('DELETE FROM service_state_transitions WHERE service_id = ?').run(oldS.id); } catch (_) {}
          try { db.prepare('DELETE FROM service_probe_history WHERE service_id = ?').run(oldS.id); } catch (_) {}
          try { db.prepare('DELETE FROM incident_alerts WHERE service_id = ?').run(oldS.id); } catch (_) {}
          try { db.prepare('DELETE FROM metric_samples WHERE service_id = ?').run(oldS.id); } catch (_) {}
          try { db.prepare('DELETE FROM monitored_services WHERE id = ?').run(oldS.id); } catch (_) {}
        }
      }
    } catch (cleanErr) {
      console.warn('Prune error in PUT:', cleanErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Private API suite successfully updated.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const suiteId = searchParams.get('suiteId');
    const userEmail = searchParams.get('email');

    if (!suiteId) {
      return NextResponse.json({ success: false, error: 'Suite ID is required' }, { status: 400 });
    }

    const existing: any = db.prepare('SELECT * FROM private_api_suites WHERE id = ?').get(suiteId);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Suite not found' }, { status: 404 });
    }

    if (userEmail && existing.user_email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete this suite' }, { status: 403 });
    }

    // Delete associated child records and monitored services in exact dependency order
    try {
      const suiteServices: any[] = db.prepare(
        "SELECT id FROM monitored_services WHERE service_category = ? OR id LIKE 'priv_' || ? || '%'"
      ).all(suiteId, suiteId);

      for (const s of suiteServices) {
        try { db.prepare('DELETE FROM service_notification_logs WHERE service_id = ?').run(s.id); } catch (_) {}
        try { db.prepare('DELETE FROM service_state_transitions WHERE service_id = ?').run(s.id); } catch (_) {}
        try { db.prepare('DELETE FROM service_probe_history WHERE service_id = ?').run(s.id); } catch (_) {}
        try { db.prepare('DELETE FROM incident_alerts WHERE service_id = ?').run(s.id); } catch (_) {}
        try { db.prepare('DELETE FROM metric_samples WHERE service_id = ?').run(s.id); } catch (_) {}
        try { db.prepare('DELETE FROM monitored_services WHERE id = ?').run(s.id); } catch (_) {}
      }
      db.prepare('DELETE FROM private_api_suites WHERE id = ?').run(suiteId);
    } catch (dbErr) {
      console.error('Error during cascade delete:', dbErr);
      db.prepare('DELETE FROM private_api_suites WHERE id = ?').run(suiteId);
    }

    return NextResponse.json({
      success: true,
      message: 'Private API suite and all associated targets removed.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
