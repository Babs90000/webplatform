import { useQuery } from "@tanstack/react-query";
import { fetchProjectFiles } from "../services/codegenApi";

export const useProjectFiles = (projectId: string) =>
  useQuery({
    queryKey: ["project-files", projectId],
    queryFn: () => fetchProjectFiles(projectId),
    enabled: Boolean(projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });
