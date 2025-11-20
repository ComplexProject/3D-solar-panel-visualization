import { render, screen } from '@testing-library/react'
import { it, expect, describe, beforeEach } from 'vitest'
import AdvancedSettings from '../../formComponents/AdvancedSettings';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: any) {
      store[key] = JSON.stringify(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });


describe('Advanced Settings', () => {
    beforeEach(() => {
  localStorage.clear();
});

    it('should render form with saved values from localStorage', () => {
        localStorage.setItem("latitude", JSON.stringify(45.0));
        localStorage.setItem("longitude", JSON.stringify(-93));
        localStorage.setItem("year", JSON.stringify(2023));

        render(<AdvancedSettings />);

        expect(screen.getByDisplayValue('45')).toBeInTheDocument();
        expect(screen.getByDisplayValue('-93')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
    });

    // it('Should save form values to localStorage on submit', () => {
    //     render(<AdvancedSettings />);

    //     fireEvent.change(screen.getByLabelText(/latitude/i), { target: { value: "42" } });
    //     fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: "4" } });
    //     fireEvent.change(screen.getByLabelText(/year/i), { target: { value: "2024" } });
    //     fireEvent.change(screen.getByLabelText(/azimuth increment/i), { target: { value: "2" } });
    //     fireEvent.change(screen.getByLabelText(/slope increment/i), { target: { value: "1" } });

    //     const form = screen.getByTestId('advanced-settings-form');
    //     fireEvent.submit(form);

    //     to avoid JSON.parse repetition
    //     const getLS = (key: string) => {
    //     const item = localStorage.getItem(key);
    //     return item !== null ? JSON.parse(item) : null;
    // };

    //     expect(JSON.parse(localStorage.getItem("latitude")!)).toBe(42);
    //     expect(JSON.parse(localStorage.getItem("longitude")!)).toBe(4);
    //     expect(JSON.parse(localStorage.getItem("year")!)).toBe(2024);
    //     expect(JSON.parse(localStorage.getItem("azimuthIncrement")!)).toBe(2);
    //     expect(JSON.parse(localStorage.getItem("slopeIncrement")!)).toBe(1);
    // });

    it("should render form with default values when localStorage is empty", () => {
        render(<AdvancedSettings />);
        expect(screen.getByLabelText(/latitude/i)).toHaveValue("0");
        expect(screen.getByLabelText(/longitude/i)).toHaveValue("0");
        expect(screen.getByLabelText(/year/i)).toHaveValue(2024);
    });
});

