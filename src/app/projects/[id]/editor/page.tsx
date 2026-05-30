"use client";

import React, { use, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { EditorLayout } from "@/features/editor/components/EditorLayout";
import { EditorToolbar } from "@/features/editor/components/EditorToolbar";
import { PageTree } from "@/features/pages/components/PageTree";
import { BlockCanvas } from "@/features/blocks/components/BlockCanvas";
import { BlockPropertiesPanel } from "@/features/blocks/components/BlockPropertiesPanel";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useEditorStore } from "@/store/editor";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

const EditorContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  const searchParams = useSearchParams();
  const { data: project } = useProject(projectId);
  const { selectedPageId, switchRightPanel } = useEditorStore();

  useEffect(() => {
    if (searchParams.get("hermes") === "1") {
      switchRightPanel("hermes");
    }
  }, [searchParams, switchRightPanel]);

  return (
    <EditorLayout
      projectId={projectId}
      toolbar={<EditorToolbar projectId={projectId} projectName={project?.name} />}
      pageTree={<PageTree projectId={projectId} />}
      canvas={<BlockCanvas pageId={selectedPageId} />}
      propertiesPanel={<BlockPropertiesPanel pageId={selectedPageId} />}
    />
  );
};

const EditorPage: React.FC<EditorPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <EditorContent projectId={projectId} />
      </Suspense>
    </AuthGuard>
  );
};

export default EditorPage;
