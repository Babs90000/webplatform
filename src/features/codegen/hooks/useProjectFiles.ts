import { useQuery } from "@tanstack/react-query";
import { fetchProjectFiles } from "../services/codegenApi";

export const useProjectFiles = (projectId: string) =>
  useQuery({
    queryKey: ["project-files", projectId],
    queryFn: () => fetchProjectFiles(projectId),
    enabled: Boolean(projectId),
  });
