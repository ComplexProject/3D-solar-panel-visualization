import { fireEvent, render, screen } from '@testing-library/react'
import { it, expect, describe, vi, beforeEach } from 'vitest'
import DropzoneComponent from '../../formComponents/DropZone';
import StyledDropzone from '../../formComponents/DropZone';


beforeEach(() => {
  vi.spyOn(Storage.prototype, "setItem");
  localStorage.clear();
});

describe('DropzoneComponent', () => {


   it('renders default dropzone view', () => {
        render(<DropzoneComponent {...({ file: null, open: vi.fn() } as any)} />);
        expect(screen.getByText(/Drag & Drop your file/i)).toBeInTheDocument();
        expect(screen.getByText(/Browse files/i)).toBeInTheDocument();
});

//   it("uploads file via Browse files button and updates UI + localStorage", async () => {
//   const { container } = render(<StyledDropzone />);

//   const browseButton = screen.getByRole("button", { name: /Browse files/i });
//   expect(browseButton).toBeInTheDocument();

//   await fireEvent.click(browseButton);

//   const input = container.querySelector('input[type="file"]') as HTMLInputElement;
//   expect(input).toBeTruthy();

//   const mockFile = new File(["dummy"], "test-image.png", { type: "image/png" });

//   // const mockFile = new File(["dummy"], "test-image.jpg", { type: "image/jpeg" });

//   await fireEvent.change(input, {
//     target: { files: [mockFile] },
//   });
//   // Uploaded file name does not appear
//   expect(screen.getByText("test-image.jpg")).toBeInTheDocument();

//   expect(localStorage.setItem).toHaveBeenCalledWith(
//     "demandProfile",
//     expect.stringContaining('"name":"test-image.png"')
//   );
//   expect(localStorage.setItem).toHaveBeenCalledWith(
//     "demandProfile",
//     expect.stringContaining('"type":"image/png"')
//   );
// });

it("uploads JSON file via Browse files button and updates localStorage", async () => {
  const { container } = render(<StyledDropzone />);

  const browseButton = screen.getByRole("button", { name: /Browse files/i });
  expect(browseButton).toBeInTheDocument();

  await fireEvent.click(browseButton);

  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  expect(input).toBeTruthy();

  const mockFile = new File(['{"key":"value"}'], "data.json", { type: "application/json" });

  await fireEvent.change(input, {
    target: { files: [mockFile] },
  });

  expect(localStorage.setItem).toHaveBeenCalledWith(
    "demandProfile",
    expect.stringContaining('"name":"data.json"')
  );
  expect(localStorage.setItem).toHaveBeenCalledWith(
    "demandProfile",
    expect.stringContaining('"type":"application/json"')
  );
});

it("uploads CSV file via Browse files button and updates localStorage", async () => {
  const { container } = render(<StyledDropzone />);

  const browseButton = screen.getByRole("button", { name: /Browse files/i });
  expect(browseButton).toBeInTheDocument();

  await fireEvent.click(browseButton);

  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  expect(input).toBeTruthy();

  const mockFile = new File(
    ["column1,column2\nvalue1,value2"], 
    "data.csv", 
    { type: "text/csv" }
  );

  await fireEvent.change(input, {
    target: { files: [mockFile] },
  });

  expect(localStorage.setItem).toHaveBeenCalledWith(
    "demandProfile",
    expect.stringContaining('"name":"data.csv"')
  );
  expect(localStorage.setItem).toHaveBeenCalledWith(
    "demandProfile",
    expect.stringContaining('"type":"text/csv"')
  );
});
});