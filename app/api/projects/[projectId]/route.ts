import { NextResponse } from 'next/server';
import { syncUser } from '@/lib/sync-user';
import dbConnect from '@/lib/mongodb';
import { Project } from '@/lib/model/project';
import { Workspace } from '@/lib/model/workspace';
import mongoose from 'mongoose';
import { slugify } from '@/lib/utils';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await syncUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { projectId } = await params;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return new NextResponse('Invalid project', { status: 400 });
    }

    await dbConnect();

    const project = await Project.findById(projectId);
    if (!project) return new NextResponse('Not found', { status: 404 });

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) return new NextResponse('Workspace not found', { status: 404 });

    const isMember =
      workspace.owner.toString() === user._id.toString() ||
      workspace.members?.some((m: { user: { toString: () => string } }) => m.user.toString() === user._id.toString());
    if (!isMember) return new NextResponse('Forbidden', { status: 403 });

    const body = await req.json();
    const { title, parentId, order, spaceId, spaceType, icon } = body;

    if (typeof title === 'string' && title.trim()) {
      project.title = title.trim();
      let slug = slugify(title);
      const existing = await Project.findOne({ workspace: project.workspace, slug, _id: { $ne: projectId } });
      if (existing) slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      project.slug = slug;
    }

    if (icon !== undefined) project.icon = icon || null;
    if (typeof order === 'number') project.order = order;
    if (spaceId != null) project.spaceId = spaceId;
    if (spaceType && ['my-space', 'team-space', 'company-space'].includes(spaceType)) project.spaceType = spaceType;

    if (parentId !== undefined) {
      if (parentId === null || parentId === '') {
        project.parentId = null;
      } else if (mongoose.Types.ObjectId.isValid(parentId)) {
        const parent = await Project.findOne({ _id: parentId, workspace: project.workspace });
        if (!parent) return new NextResponse('Invalid parent', { status: 400 });
        if (parent._id.toString() === projectId) return new NextResponse('Cannot be own parent', { status: 400 });
        project.parentId = new mongoose.Types.ObjectId(parentId);
      }
    }

    project.updatedAt = new Date();
    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await syncUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { projectId } = await params;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return new NextResponse('Invalid project', { status: 400 });
    }

    await dbConnect();

    const project = await Project.findById(projectId);
    if (!project) return new NextResponse('Not found', { status: 404 });

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) return new NextResponse('Workspace not found', { status: 404 });

    const isMember =
      workspace.owner.toString() === user._id.toString() ||
      workspace.members?.some((m: { user: { toString: () => string } }) => m.user.toString() === user._id.toString());
    if (!isMember) return new NextResponse('Forbidden', { status: 403 });

    await Project.findByIdAndDelete(projectId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PROJECT_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
