import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { accountService } from '@/lib/services/account.service';
import { handleApiError } from '@/lib/utils/api-response.util';
import { requireAuth } from '@/lib/utils/auth.util';

const DeleteManySchema = z.object({
  ids: z.array(z.string()).min(1),
});

// POST /api/accounts/delete-many - Delete multiple accounts
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { ids } = DeleteManySchema.parse(body);
    const result = await accountService.deleteManyAccounts(user.id, ids);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error deleting accounts:',
    });
  }
}
