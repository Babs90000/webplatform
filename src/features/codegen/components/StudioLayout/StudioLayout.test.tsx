import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { StudioLayout } from "./StudioLayout";

describe("StudioLayout mobile drawers", () => {
  it("ouvre le drawer fichiers au clic sur la barre mobile", async () => {
    const user = userEvent.setup();

    render(
      <StudioLayout
        toolbar={<div data-testid="toolbar">Toolbar</div>}
        fileTree={<div>Fichiers mock</div>}
        codeView={<div>Code mock</div>}
        preview={<div>Aperçu mock</div>}
        chat={<div>Chat mock</div>}
      />,
    );

    const layout = screen.getByTestId("studio-layout");
    expect(layout).toHaveAttribute("data-mobile-drawer", "none");

    await user.click(screen.getByTestId("studio-mobile-files-btn"));
    expect(layout).toHaveAttribute("data-mobile-drawer", "files");

    await user.click(screen.getByTestId("studio-drawer-backdrop"));
    expect(layout).toHaveAttribute("data-mobile-drawer", "none");
  });

  it("ferme le drawer avec Escape", async () => {
    const user = userEvent.setup();

    render(
      <StudioLayout
        toolbar={<div>Toolbar</div>}
        fileTree={<div>Fichiers</div>}
        codeView={<div>Code</div>}
        preview={<div>Preview</div>}
        chat={<div>Chat</div>}
      />,
    );

    await user.click(screen.getByTestId("studio-mobile-chat-btn"));
    expect(screen.getByTestId("studio-layout")).toHaveAttribute("data-mobile-drawer", "chat");

    await user.keyboard("{Escape}");
    expect(screen.getByTestId("studio-layout")).toHaveAttribute("data-mobile-drawer", "none");
  });

  it("masque la barre mobile en mode preview focus", () => {
    render(
      <StudioLayout
        previewFocus
        toolbar={<div>Toolbar</div>}
        fileTree={<div>Fichiers</div>}
        codeView={<div>Code</div>}
        preview={<div>Preview</div>}
        chat={<div>Chat</div>}
      />,
    );

    expect(screen.queryByTestId("studio-mobile-bar")).not.toBeInTheDocument();
  });
});
