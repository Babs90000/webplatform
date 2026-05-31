import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/shared/components/Button";

describe("Button Component", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies correct variant class", () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("danger");
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("disables when isLoading is true", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("uses custom ariaLabel", () => {
    render(<Button ariaLabel="Submit form">Send</Button>);
    expect(screen.getByLabelText("Submit form")).toBeInTheDocument();
  });

  it("respects disabled prop", async () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    await userEvent.click(screen.getByText("Disabled"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
