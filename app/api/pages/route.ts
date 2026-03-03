// ✓ FIXED: Production API routes with Clerk authentication
import { NextRequest, NextResponse } from 'next/server';
import { pageService } from '@/lib/page-service';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const createPageSchema = z.object({
    title: z.string().min(1).max(200),
    workspaceId: z.string().min(1),
    teamSpaceId: z.string().min(1).optional(),
    parentId: z.string().min(1).optional(),
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

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // 1. Authentication with Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // 2. Input validation
        const body = await request.json();
        const validation = createPageSchema.safeParse(body);

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

        const { title, workspaceId, teamSpaceId, parentId, content, kind, databaseConfig } = validation.data;

        // 3. Authorization (add your workspace access check here)
        // const canCreate = await checkWorkspaceAccess(userId, workspaceId, teamSpaceId);
        // if (!canCreate) {
        //   return NextResponse.json(
        //     { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        //     { status: 403 }
        //   );
        // }

        // 4. Create page (transaction-safe)
        const page = await pageService.createPage({
            title,
            workspaceId,
            teamSpaceId,
            parentId,
            content,
            createdBy: userId,
            kind,
            databaseConfig,
        });

        return NextResponse.json({ success: true, page }, { status: 201 });

    } catch (error) {
        console.error('Error creating page:', error);

        // Don't leak internal errors to client
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred'
                }
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const teamSpaceId = searchParams.get('teamSpaceId');

        if (!workspaceId) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'workspaceId required' } },
                { status: 400 }
            );
        }

        // Authorization check (add your workspace access check here)
        // const canRead = await checkWorkspaceAccess(userId, workspaceId);
        // if (!canRead) {
        //   return NextResponse.json(
        //     { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        //     { status: 403 }
        //   );
        // }

        const hierarchy = await pageService.getPageHierarchy(
            workspaceId,
            teamSpaceId || undefined
        );

        return NextResponse.json({ success: true, hierarchy });

    } catch (error) {
        console.error('Error fetching pages:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch pages' } },
            { status: 500 }
        );
    }
}