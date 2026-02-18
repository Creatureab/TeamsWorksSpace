"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ChevronRight, Home, ImagePlus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskProps {
    user: {
        firstName?: string;
        lastName?: string;
    } | null;
    project: {
        title?: string;
        description?: string;
        createdAt?: string;
    } | null;
    currentWorkspace: {
        name?: string;
    } | null;
}

export default function Task({ project, currentWorkspace }: TaskProps) {
    const projectTitle = project?.title || "Project";
    const workspaceName = currentWorkspace?.name || "Workspace";
    const [description, setDescription] = useState(project?.description ?? "");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const previewUrl = useMemo(() => {
        if (!imageFile) {
            return "";
        }
        return URL.createObjectURL(imageFile);
    }, [imageFile]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setImageFile(null);
            return;
        }
        setImageFile(file);
    };

    return (
        <main className="min-w-0 flex-1 overflow-y-auto bg-background text-foreground">
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

            <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{projectTitle}</CardTitle>
                        <CardDescription>Plain task page for adding description and image.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                className="min-h-40 resize-y"
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Write task description..."
                                value={description}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Image</Label>
                            <Input id="image" accept="image/*" onChange={onImageChange} type="file" />
                            {previewUrl ? (
                                <div className="overflow-hidden rounded-md border">
                                    <Image
                                        alt="Task preview"
                                        className="h-auto max-h-96 w-full object-cover"
                                        height={800}
                                        src={previewUrl}
                                        unoptimized
                                        width={1200}
                                    />
                                </div>
                            ) : (
                                <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                                    <ImagePlus className="mr-2 h-4 w-4" />
                                    No image selected
                                </div>
                            )}
                        </div>

                        <Button type="button">Save</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
