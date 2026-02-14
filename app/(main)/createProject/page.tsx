"use client";

import { useState } from "react";
import CreateProject from "./components/CreateProject";
import { useRouter } from "next/navigation";

const CreateProjectPage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleCreate = (data: {
    title: string;
    description: string;
    privacy: string;
    automation: boolean;
  }) => {
    console.log("Create project:", data);
    // TODO: Implement project creation logic
    setIsOpen(false);
  };

  return (
    <main>
      {isOpen && (
        <CreateProject
          isOpen={isOpen}
          onClose={handleClose}
          onCreate={handleCreate}
        />
      )}
    </main>
  );
};

export default CreateProjectPage;
