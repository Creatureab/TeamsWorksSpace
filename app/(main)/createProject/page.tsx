"use client";

import { useState, Suspense } from "react";
import CreateProject from "./components/CreateProject";
import { useRouter, useSearchParams } from "next/navigation";

const CreateProjectContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceName = searchParams.get("name") || "Workspace";
  const workspaceId = searchParams.get("workspaceId");
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleCreate = (project: { _id?: string } | null) => {
    setIsOpen(false);
    if (project?._id) {
      router.push(`/project/${project._id}`);
    } else {
      router.back();
    }
  };

  return (
    <CreateProject
      isOpen={isOpen}
      onClose={handleClose}
      onCreate={handleCreate}
      workspaceName={workspaceName}
      workspaceId={workspaceId}
    />
  );
};

const CreateProjectPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">Loading...</div>}>
        <CreateProjectContent />
      </Suspense>
    </main>
  );
};

export default CreateProjectPage;
