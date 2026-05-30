import { projectsApi } from "./projectsApi";
import { pagesApi } from "@/features/pages/services/pagesApi";
import type { Project } from "@/types";

/** Creates a project with a default "Accueil" page — ready for Hermes chat editing. */
export const setupBlankProject = async (
  name: string,
  subdomain: string,
): Promise<{ project: Project; homePageId: string }> => {
  const project = await projectsApi.create({ name, subdomain });
  const page = await pagesApi.create(project.id, {
    title: "Accueil",
    slug: "accueil",
    order_index: 0,
  });
  return { project, homePageId: page.id };
};
