import { apiSuccess } from '../_lib/http'

export const dynamic = 'force-dynamic'

export function GET() {
  return apiSuccess({
    service: 'management-plan-api',
    status: 'ok',
  })
}
