"use client";

import React, { use } from "react";
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

const EditorPage: React.FC<EditorPageProps> = ({ params }) => {
  // Next.js 15 requires unwrapping params with React.use()
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  
  const { data: project } = useProject(projectId);
  const { selectedPageId } = useEditorStore();

  return (
    <AuthGuard>
      <EditorLayout
        projectId={projectId}
        toolbar={
          <EditorToolbar 
            projectId={projectId}
            projectName={project?.name} 
          />
        }
        pageTree={
          <PageTree projectId={projectId} />
        }
        canvas={
          <BlockCanvas pageId={selectedPageId} />
        }
        propertiesPanel={
          <BlockPropertiesPanel pageId={selectedPageId} />
        }
      />
    </AuthGuard>
  );
};

export default EditorPage;
