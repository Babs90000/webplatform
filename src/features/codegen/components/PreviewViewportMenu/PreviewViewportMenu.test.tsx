import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PreviewViewportMenu } from "@/features/codegen/components/PreviewViewportMenu";

describe("PreviewViewportMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens menu and selects a preset", () => {
    const onChange = vi.fn();
    render(
      <PreviewViewportMenu value="full" onChange={onChange} disabled={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ouvrir le menu/i }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: /mobile 375px/i }));

    expect(onChange).toHaveBeenCalledWith("mobile");
  });

  it("shows active preset in trigger label", () => {
    render(
      <PreviewViewportMenu
        value="tablet"
        onChange={vi.fn()}
        disabled={false}
      />,
    );

    expect(screen.getByText(/tablette 768px/i)).toBeInTheDocument();
  });
});
