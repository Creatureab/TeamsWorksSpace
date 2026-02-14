"use client";

import WorkSpaceInfo from "./components/WorkSpaceInfo";
import InvitesPage from "./components/Invites";
import { useState } from "react";
import { useRouter } from "next/navigation";

const WorkspacePage = () => {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState("personal");
  const [step, setStep] = useState<"workspace" | "invites">("workspace");

  return (
    <main>
      {step === "workspace" ? (
        <WorkSpaceInfo
          onContinue={(selectedType) => {
            setWorkspaceId(selectedType);
            setStep("invites");
          }}
        />
      ) : (
        <InvitesPage
          onClose={() => setStep("workspace")}
          onSubmit={() => router.push(`/project/${workspaceId}`)}
        />
      )}
    </main>
  );
};

export default WorkspacePage;
