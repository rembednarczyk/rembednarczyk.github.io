import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useScrollToSection } from "./useScrollToSection";

describe("useScrollToSection", () => {
  it("should scroll to element if it exists", () => {
    const mockScrollIntoView = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "test-section";
    mockElement.scrollIntoView = mockScrollIntoView;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useScrollToSection());
    result.current("test-section");

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    document.body.removeChild(mockElement);
  });

  it("should call callback after scrolling", () => {
    const mockScrollIntoView = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "test-section-2";
    mockElement.scrollIntoView = mockScrollIntoView;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useScrollToSection());
    const callback = vi.fn();
    result.current("test-section-2", callback);

    expect(mockScrollIntoView).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();

    document.body.removeChild(mockElement);
  });
});
