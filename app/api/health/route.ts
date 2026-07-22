import { apiSuccess } from '@/app/api/_lib/http'
import { hasPublicSupabaseEnvironment } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

export function GET() {
  return apiSuccess({
    database: hasPublicSupabaseEnvironment() ? 'configured' : 'not_configured',
    service: 'management-plan-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
