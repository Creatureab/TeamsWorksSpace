// ✓ FIXED: Individual page operations with Clerk authentication
import { NextRequest, NextResponse } from 'next/server';
import { pageService } from '@/lib/page-service';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const updatePageSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.array(z.any()).optional(),
    kind: z.enum(['doc', 'database', 'project']).optional(),
    databaseConfig: z
        .object({
            table: z.enum(['projects', 'tasks', 'custom']),
            viewType: z.enum(['table', 'board', 'calendar']).optional(),
            filters: z.record(z.any()).optional(),
            sorts: z.record(z.enum(['asc', 'desc'])).optional(),
        })
        .nullable()
        .optional(),
});

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ pageId: string }> }
): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const { pageId } = await context.params;
        const page = await pageService.getPageById(pageId);
        if (!page) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Page not found' } },
                { status: 404 }
            );
        }

        // Authorization check (add your access control here)
        // const canRead = await checkPageAccess(userId, page);
        // if (!canRead) {
        //   return NextResponse.json(
        //     { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        //     { status: 403 }
        //   );
        // }

        return NextResponse.json({ success: true, page });

    } catch (error) {
        console.error('Error fetching page:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch page' } },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ pageId: string }> }
): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = updatePageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input',
                        details: validation.error.flatten()
                    }
                },
                { status: 400 }
            );
        }

        const { pageId } = await context.params;
        const page = await pageService.getPageById(pageId);
        if (!page) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Page not found' } },
                { status: 404 }
            );
        }

        // Authorization check (add your access control here)
        // const canEdit = await checkPageEditAccess(userId, page);
        // if (!canEdit) {
        //   return NextResponse.json(
        //     { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        //     { status: 403 }
        //   );
        // }

        const updatedPage = await pageService.updatePage(pageId, validation.data);
        return NextResponse.json({ success: true, page: updatedPage });

    } catch (error) {
        console.error('Error updating page:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update page' } },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ pageId: string }> }
): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const { pageId } = await context.params;
        const page = await pageService.getPageById(pageId);
        if (!page) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Page not found' } },
                { status: 404 }
            );
        }

        // Authorization check (add your access control here)
        // const canDelete = await checkPageDeleteAccess(userId, page);
        // if (!canDelete) {
        //   return NextResponse.json(
        //     { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        //     { status: 403 }
        //   );
        // }

        // This uses transaction-safe bulk delete
        await pageService.deletePage(pageId);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting page:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete page' } },
            { status: 500 }
        );
    }
}