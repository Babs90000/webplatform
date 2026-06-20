import { toast } from "@/store/toast";
import { hasSiteNavigation } from "./navPreviewOffer";
import type { PreviewViewport } from "./previewViewport";

export interface OfferNavMobilePreviewInput {
  files: Array<{ path: string; content: string }>;
  previewViewport: PreviewViewport;
  onApply: () => void;
}

/**
 * Après audit qualité : propose (sans forcer) le preset tablette 768px
 * pour tester le menu burger — uniquement si nav détectée et plein écran actif.
 */
export const offerNavMobilePreviewAfterAudit = ({
  files,
  previewViewport,
  onApply,
}: OfferNavMobilePreviewInput): void => {
  if (previewViewport !== "full") return;
  if (!hasSiteNavigation(files)) return;

  toast.prompt(
    "Navigation détectée — passez en 768px pour tester le menu burger.",
    {
      label: "Passer en 768px",
      onClick: onApply,
    },
  );
};
