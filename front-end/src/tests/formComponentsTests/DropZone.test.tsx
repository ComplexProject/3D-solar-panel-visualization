import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StyledDropzone from "../../formComponents/DropZone";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: any) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.spyOn(localStorage, "setItem");
});



describe("StyledDropzone", () => {
  it("renders default dropzone view", () => {
    render(<StyledDropzone />);

    expect(screen.getByText(/drag & drop your file/i)).toBeInTheDocument();
    expect(screen.getByText(/browse files/i)).toBeInTheDocument();
  });

  it("uploads JSON file and updates localStorage", async () => {
    const { container } = render(<StyledDropzone />);

    const mockFile = new File(
      ['{"key":"value"}'],
      "data.json",
      { type: "application/json" }
    );

    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    await fireEvent.change(input, {
      target: { files: [mockFile] },
    });
    await waitFor(() => {
    expect(localStorage.setItem).toHaveBeenCalled();
    });
    expect(localStorage.setItem).toHaveBeenCalledWith("demandProfile",expect.stringContaining('"name":"data.json"')
    );

    const fileNameElement = await screen.findByText("data.json");
    expect(fileNameElement).toBeInTheDocument();
  });

  it("uploads CSV file and updates localStorage", async () => {
    const { container } = render(<StyledDropzone />);

    const mockFile = new File(
      ["a,b\n1,2"],
      "data.csv",
      { type: "text/csv" }
    );

    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    await fireEvent.change(input, {
      target: { files: [mockFile] },
    });
    
    await waitFor(() => {
    expect(localStorage.setItem).toHaveBeenCalled();

    });
    expect(localStorage.setItem).toHaveBeenCalledWith("demandProfile", 
      expect.stringContaining('"name":"data.csv"')
    );

    const fileNameElement = await screen.findByText("data.csv");
    expect(fileNameElement).toBeInTheDocument();
  });

  it("changes button text after uploading file", async () => {
    const { container } = render(<StyledDropzone />);

    const file = new File(["x"], "file.csv", { type: "text/csv" });

    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    await fireEvent.change(input, {
      target: { files: [file] },
    });

    const fileNameElement = await screen.findByText("file.csv");
    expect(fileNameElement).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Choose a different file/i })).toBeInTheDocument();
  });
});