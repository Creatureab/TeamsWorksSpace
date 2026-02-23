"use client";

import WorkspaceInfo from "./_components/WorkspaceInfo";
import InvitesPage from "./_components/Invites";
import { useState } from "react";
import { useRouter } from "next/navigation";

const WorkspacePage = () => {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState("");
  const [step, setStep] = useState<"workspace" | "invites">("workspace");

  return (
    <main>
      {step === "workspace" ? (
        <WorkspaceInfo
          onContinue={(id) => {
            setWorkspaceId(id);
            setStep("invites");
          }}
        />
      ) : (
        <InvitesPage
          workspaceId={workspaceId}
          onClose={() => setStep("workspace")}
          onSubmit={() => router.push(`/project/${workspaceId}`)}
        />
      )}
    </main>
  );
};

export default WorkspacePage;
