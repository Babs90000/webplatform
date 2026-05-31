/**
 * Export/Import utilities for pages and projects
 * Allows users to export as JSON or import from JSON
 */

import type { Block, Page } from "@/types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("exportImport");

export interface ExportedPage {
  title: string;
  slug: string;
  order_index: number;
  blocks: Block[];
}

export interface ExportedProject {
  name: string;
  description?: string;
  pages: ExportedPage[];
  exportedAt: string;
  version: "1.0";
}

/**
 * Export a page as JSON
 */
export const exportPageAsJson = (page: Page, blocks: Block[]): string => {
  const exported: ExportedPage = {
    title: page.title,
    slug: page.slug,
    order_index: page.order_index,
    blocks,
  };

  return JSON.stringify(exported, null, 2);
};

/**
 * Download JSON file
 */
export const downloadJson = (data: string, filename: string) => {
  try {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logger.info({ message: "File downloaded", filename });
  } catch (error) {
    logger.error({ error, message: "Download failed", filename });
    throw error;
  }
};

/**
 * Import JSON file
 */
export const importJsonFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        logger.info({ message: "File imported", filename: file.name });
        resolve(data);
      } catch (error) {
        logger.error({ error, message: "Import parse failed", filename: file.name });
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => {
      logger.error({ message: "File read error", filename: file.name });
      reject(new Error("Failed to read file"));
    };
    reader.readAsText(file);
  });
};

/**
 * Export entire project as JSON
 */
export const exportProjectAsJson = (
  projectName: string,
  pages: Page[],
  blocksPerPage: Record<string, Block[]>
): string => {
  const exported: ExportedProject = {
    name: projectName,
    pages: pages.map((page) => ({
      title: page.title,
      slug: page.slug,
      order_index: page.order_index,
      blocks: blocksPerPage[page.id] || [],
    })),
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };

  return JSON.stringify(exported, null, 2);
};
