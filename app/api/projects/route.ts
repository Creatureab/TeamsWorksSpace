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
        const { title, description, privacy, automation, workspaceId, teamSpaceId } = body;

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

        if (teamSpaceId) {
            const isGeneral = teamSpaceId === 'general';
            const hasTeamSpace = workspace.teamSpaces?.some(
                (space: { id: string; archived?: boolean }) => space.id === teamSpaceId && !space.archived
            );

            if (!isGeneral && !hasTeamSpace) {
                return new NextResponse('Invalid team space.', { status: 400 });
            }
        }

        // 4. Generate unique slug within the workspace
        let slug = slugify(title);
        const existingProject = await Project.findOne({ workspace: workspaceId, slug });

        if (existingProject) {
            // Append a small random string if slug exists
            slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        // 5. Create the project with workspaceId, createdBy, and slug
        const project = await Project.create({
            title,
            slug,
            description,
            privacy,
            automation,
            workspace: workspaceId,
            createdBy: user._id,
            teamSpaceId: teamSpaceId || null,
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
        const teamSpaceId = searchParams.get('teamSpaceId');

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

            const projectFilter: {
                workspace: string;
                $or?: Array<Record<string, unknown>>;
                teamSpaceId?: string;
            } = { workspace: workspaceId };

            if (teamSpaceId) {
                if (teamSpaceId === 'general') {
                    projectFilter.$or = [
                        { teamSpaceId: { $exists: false } },
                        { teamSpaceId: null },
                        { teamSpaceId: 'general' },
                    ];
                } else {
                    const hasTeamSpace = workspace.teamSpaces?.some(
                        (space: { id: string; archived?: boolean }) => space.id === teamSpaceId && !space.archived
                    );
                    if (!hasTeamSpace) {
                        return new NextResponse('Invalid team space.', { status: 400 });
                    }
                    projectFilter.teamSpaceId = teamSpaceId;
                }
            }

            const projects = await Project.find(projectFilter).sort({ createdAt: -1 });
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
