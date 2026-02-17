import { NextResponse } from 'next/server';
import { syncUser } from '@/lib/sync-user';
import dbConnect from '@/lib/mongodb';
import { Project } from '@/lib/model/project';
import { Workspace } from '@/lib/model/workspace';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    try {
        const user = await syncUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { title, description, privacy, automation, workspaceId } = body;

        // Relation Rules Check: Every project must store workspaceId and createdBy
        if (!title || !workspaceId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return new NextResponse('Unauthorized or invalid workspace.', { status: 403 });
        }

        await dbConnect();

        // 1. Verify the workspaceId exists and the user belongs to that workspace
        const workspace = await Workspace.findOne({
            _id: new mongoose.Types.ObjectId(workspaceId),
            $or: [
                { owner: user._id },
                { "members.user": user._id }
            ]
        });

        // 3. Reject if validation fails with specific message
        if (!workspace) {
            return new NextResponse('Unauthorized or invalid workspace.', { status: 403 });
        }

        // 4. Create the project with workspaceId and createdBy
        const project = await Project.create({
            title,
            description,
            privacy,
            automation,
            workspace: workspaceId,
            createdBy: user._id, // Attach createdBy (userId)
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

export async function GET(req: Request) {
    try {
        const user = await syncUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        await dbConnect();

        // Visibility Rule: Only return projects where workspaceId matches user membership
        if (workspaceId) {
            if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
                return new NextResponse('Unauthorized or invalid workspace.', { status: 403 });
            }

            const workspace = await Workspace.findOne({
                _id: new mongoose.Types.ObjectId(workspaceId),
                $or: [
                    { owner: user._id },
                    { "members.user": user._id }
                ]
            });

            if (!workspace) {
                return new NextResponse('Unauthorized or invalid workspace.', { status: 403 });
            }

            const projects = await Project.find({ workspace: workspaceId }).sort({ createdAt: -1 });
            return NextResponse.json(projects);
        }

        // Fetch projects for all workspaces the user belongs to
        const userWorkspaces = await Workspace.find({
            $or: [
                { owner: user._id },
                { "members.user": user._id }
            ]
        }).select('_id');

        const workspaceIds = userWorkspaces.map(w => w._id);

        const projects = await Project.find({
            workspace: { $in: workspaceIds }
        }).sort({ createdAt: -1 });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('[PROJECTS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
