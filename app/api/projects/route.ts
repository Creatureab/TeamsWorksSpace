import { NextResponse } from 'next/server';
import { syncUser } from '@/lib/sync-user';
import dbConnect from '@/lib/mongodb';
import { Project } from '@/lib/model/project';
import { Workspace } from '@/lib/model/workspace';
import mongoose from 'mongoose';
import { slugify } from '@/lib/utils';

export async function POST(req: Request) {
    try {
        const user = await syncUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { title, description, privacy, automation, workspaceId, parentId, spaceId, spaceType } = body;

        if (!workspaceId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return new NextResponse('Unauthorized or invalid workspace.', { status: 403 });
        }

        await dbConnect();

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

        let order = 0;
        let parentIdValid = null;
        if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
            const parent = await Project.findOne({ _id: parentId, workspace: workspaceId });
            if (!parent) {
                return new NextResponse('Invalid parent project.', { status: 400 });
            }
            parentIdValid = new mongoose.Types.ObjectId(parentId);
            const siblingCount = await Project.countDocuments({ parentId: parentIdValid });
            order = siblingCount;
        }

        const resolvedSpaceId = spaceId ?? `company-space-${workspaceId}`;
        const resolvedSpaceType = (spaceType && ['my-space', 'team-space', 'company-space'].includes(spaceType))
            ? spaceType
            : 'company-space';

        let slug = slugify(title || 'Untitled');
        const existingProject = await Project.findOne({ workspace: workspaceId, slug });
        if (existingProject) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        const project = await Project.create({
            title: title || 'Untitled',
            slug,
            description,
            privacy,
            automation,
            workspace: workspaceId,
            parentId: parentIdValid,
            order,
            spaceId: resolvedSpaceId,
            spaceType: resolvedSpaceType,
            createdBy: user._id,
            sheets: [{ name: 'Tasks', tasks: [] }],
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

            const projects = await Project.find({ workspace: workspaceId })
                .sort({ order: 1, createdAt: 1 })
                .lean();
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
        })
            .sort({ order: 1, createdAt: 1 })
            .lean();

        return NextResponse.json(projects);
    } catch (error) {
        console.error('[PROJECTS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
