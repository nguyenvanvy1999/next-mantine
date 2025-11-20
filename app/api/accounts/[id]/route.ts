import { type NextRequest, NextResponse } from 'next/server';
import { accountService } from '@/lib/services/account.service';
import { handleApiError } from '@/lib/utils/api-response.util';
import { requireAuth } from '@/lib/utils/auth.util';

// GET /api/accounts/[id] - Get account by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const result = await accountService.getAccount(user.id, id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error getting account:',
    });
  }
}
