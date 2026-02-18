import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { syncUser } from "@/lib/sync-user";
import dbConnect from "@/lib/mongodb";
import { Project } from "@/lib/model/project";
import { Workspace } from "@/lib/model/workspace";

interface CreateTaskBody {
    title?: string;
    description?: string;
    imageUrl?: string;
    status?: string;
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const user = await syncUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { projectId } = await params;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return new NextResponse("Invalid project id.", { status: 400 });
        }

        const body = (await req.json()) as CreateTaskBody;
        const description = (body.description || "").trim();
        const imageUrl = (body.imageUrl || "").trim();
        const status = (body.status || "todo").trim();

        if (!description && !imageUrl) {
            return new NextResponse("Description or image is required.", { status: 400 });
        }

        await dbConnect();

        const project = await Project.findById(projectId);
        if (!project) {
            return new NextResponse("Project not found.", { status: 404 });
        }

        const workspace = await Workspace.findOne({
            _id: project.workspace,
            $or: [{ owner: user._id }, { "members.user": user._id }],
        }).select("_id");

        if (!workspace) {
            return new NextResponse("Unauthorized for this project.", { status: 403 });
        }

        const fallbackTitle = description ? description.slice(0, 48) : "Untitled task";
        const title = (body.title || fallbackTitle).trim() || "Untitled task";

        if (!project.sheets || project.sheets.length === 0) {
            project.sheets = [{ name: "Tasks", tasks: [] }];
        }

        project.sheets[0].tasks.push({
            title,
            description,
            imageUrl: imageUrl || undefined,
            status,
            assignee: user._id,
        });
        project.updatedAt = new Date();

        await project.save();

        const createdTask = project.sheets[0].tasks[project.sheets[0].tasks.length - 1];
        return NextResponse.json({ task: createdTask });
    } catch (error) {
        console.error("[PROJECT_TASKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
