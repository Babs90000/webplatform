import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditorStore } from "@/store/editor";

describe("useEditorStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.reset();
    });
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useEditorStore());

    expect(result.current.projectId).toBeNull();
    expect(result.current.selectedPageId).toBeNull();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it("sets project ID correctly", () => {
    const { result } = renderHook(() => useEditorStore());

    act(() => {
      result.current.setProjectId("project-1");
    });

    expect(result.current.projectId).toBe("project-1");
    expect(result.current.history).not.toBeNull();
  });

  it("tracks dirty state", () => {
    const { result } = renderHook(() => useEditorStore());

    act(() => {
      result.current.setProjectId("project-1");
      result.current.markDirty();
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.clearDirty();
    });

    expect(result.current.isDirty).toBe(false);
  });

  it("handles undo/redo", () => {
    const { result } = renderHook(() => useEditorStore());

    act(() => {
      result.current.setProjectId("project-1");
      result.current.selectBlock("block-1");
      result.current.pushHistory();
      result.current.selectBlock("block-2");
    });

    expect(result.current.selectedBlockId).toBe("block-2");

    act(() => {
      result.current.undo();
    });

    expect(result.current.selectedBlockId).toBe("block-1");

    act(() => {
      result.current.redo();
    });

    expect(result.current.selectedBlockId).toBe("block-2");
  });

  it("toggles panels", () => {
    const { result } = renderHook(() => useEditorStore());

    expect(result.current.isSidebarCollapsed).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.isSidebarCollapsed).toBe(true);
  });
});
