"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import {
    CalendarDays,
    ChevronRight,
    CircleDot,
    Home,
    ImagePlus,
    MessageSquareText,
    Sparkles,
    UserRound,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TaskProps {
    user: {
        firstName?: string;
        lastName?: string;
    } | null;
    project: {
        _id?: string;
        title?: string;
        description?: string;
        createdAt?: string;
    } | null;
    currentWorkspace: {
        name?: string;
    } | null;
}

export default function Task({ user, project, currentWorkspace }: TaskProps) {
    const projectTitle = project?.title || "Project";
    const projectId = project?._id;
    const workspaceName = currentWorkspace?.name || "Workspace";
    const assigneeName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Workspace Member";
    const assigneeInitial = assigneeName.charAt(0).toUpperCase();
    const [description, setDescription] = useState(project?.description || "");
    const [status, setStatus] = useState("in-progress");
    const [imageName, setImageName] = useState("");
    const [imageDataUrl, setImageDataUrl] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<string>("");
    const [saveError, setSaveError] = useState<string>("");

    const onImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSaveError("");
        setFeedback("");

        if (!file) {
            setImageName("");
            setImageDataUrl("");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setImageName("");
            setImageDataUrl("");
            setSaveError("Image must be under 2MB.");
            return;
        }

        setImageName(file.name);
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
            reader.onerror = () => reject(new Error("Unable to read image"));
            reader.readAsDataURL(file);
        }).catch(() => "");

        if (!dataUrl) {
            setSaveError("Failed to load image.");
            return;
        }

        setImageDataUrl(dataUrl);
    };

    const onSaveTask = async () => {
        setSaveError("");
        setFeedback("");

        if (!projectId) {
            setSaveError("Project ID is missing.");
            return;
        }

        if (!description.trim() && !imageDataUrl) {
            setSaveError("Add a description or image before saving.");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: description.trim(),
                    imageUrl: imageDataUrl || undefined,
                    status,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to save task");
            }

            setFeedback("Task saved to database.");
            setDescription("");
            setImageName("");
            setImageDataUrl("");
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Failed to save task");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="min-w-0 flex-1 overflow-y-auto bg-muted/30 text-foreground">
            <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-8">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium">{workspaceName}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-semibold text-foreground">{projectTitle}</span>
                    </div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CircleDot className="h-5 w-5" />
                    </div>
                    <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">{projectTitle}</h1>
                    {project?.description ? <p className="mt-3 max-w-3xl text-muted-foreground">{project.description}</p> : null}
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="gap-1 pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <UserRound className="h-4 w-4" />
                                Assignee
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 font-medium">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback>{assigneeInitial}</AvatarFallback>
                                </Avatar>
                                <span>{assigneeName}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="gap-1 pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select onValueChange={setStatus} value={status}>
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="gap-1 pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Due
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium text-muted-foreground">Empty</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="gap-1 pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <CircleDot className="h-4 w-4" />
                                Project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{projectTitle}</p>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                            <CardDescription>Add a description and an optional image.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="task-description">Description</Label>
                                <Textarea
                                    id="task-description"
                                    className="min-h-36 resize-y"
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Write a short description..."
                                    value={description}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="task-image">Image (optional)</Label>
                                <Input id="task-image" accept="image/*" onChange={onImageChange} type="file" />
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ImagePlus className="h-4 w-4" />
                                    {imageName || "No image selected"}
                                </p>
                                {imageDataUrl ? (
                                    <div className="overflow-hidden rounded-md border">
                                        <Image
                                            alt="Selected task image"
                                            className="h-auto max-h-72 w-full object-cover"
                                            height={700}
                                            src={imageDataUrl}
                                            unoptimized
                                            width={1100}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
                            {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}

                            <Button disabled={isSaving} onClick={onSaveTask} type="button">
                                {isSaving ? "Saving..." : "Save Task"}
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>

            <Button
                aria-label="Project assistant"
                className="fixed bottom-5 right-5 rounded-full shadow-md"
                size="icon"
                type="button"
                variant="outline"
            >
                <MessageSquareText className="h-5 w-5" />
            </Button>
        </section>
    );
}
