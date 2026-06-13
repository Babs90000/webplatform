"use client";

import React, { use } from "react";
import { isStudioEnabled } from "@/lib/features";
import { CodegenPreview } from "@/features/codegen/components/CodegenPreview";
import { BlockPreviewPage } from "@/features/blocks/components/BlockPreviewPage";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  if (isStudioEnabled()) {
    return <CodegenPreview projectId={projectId} />;
  }

  return <BlockPreviewPage projectId={projectId} />;
};

export default PreviewPage;
