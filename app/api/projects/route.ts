import { NextResponse } from 'next/server';
import { syncUser } from '@/lib/sync-user';
import dbConnect from '@/lib/mongodb';
import { Project } from '@/lib/model/project';

export async function POST(req: Request) {
    try {
        const user = await syncUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { title, description, privacy, automation, workspaceId } = body;

        if (!title || !workspaceId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        await dbConnect();

        const project = await Project.create({
            title,
            description,
            privacy,
            automation,
            workspace: workspaceId,
            owner: user._id,
            sheets: [{
                name: 'Tasks',
                tasks: []
            }]
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('[PROJECTS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
