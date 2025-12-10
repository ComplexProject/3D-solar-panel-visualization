import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, describe, beforeEach } from 'vitest';
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

  it('renders form with saved values from localStorage', () => {
    localStorage.setItem("latitude", "45");
    localStorage.setItem("longitude", "-93");
    localStorage.setItem("year", "2023");

    render(<AdvancedSettings />);

    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    expect(screen.getByDisplayValue("-93")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2023")).toBeInTheDocument();  
  });

  it('renders default values when localStorage is empty', () => {
    render(<AdvancedSettings />);

    expect(screen.getByLabelText(/latitude/i)).toHaveValue(0);
    expect(screen.getByLabelText(/longitude/i)).toHaveValue(0);
    expect(screen.getByLabelText(/year/i)).toHaveValue(2023);
  });

  it('disables latitude & longitude when predefined city exists', () => {
    localStorage.setItem("city", JSON.stringify("Nijmegen"));

    render(<AdvancedSettings />);

    expect(screen.getByLabelText(/latitude/i)).toBeDisabled();
    expect(screen.getByLabelText(/longitude/i)).toBeDisabled();
  });

  it("should render form with default values when localStorage is empty", () => {
    render(<AdvancedSettings />);
    expect(screen.getByLabelText(/latitude/i)).toHaveValue(0);
    expect(screen.getByLabelText(/longitude/i)).toHaveValue(0);
    expect(screen.getByLabelText(/year/i)).toHaveValue(2023);
    });

  it('useEffect sets form values correctly based on state', () => {
    localStorage.setItem("latitude", "11");
    localStorage.setItem("longitude", "22");
    localStorage.setItem("year", "2033");

    render(<AdvancedSettings />);

    expect(screen.getByDisplayValue("11")).toBeInTheDocument();
    expect(screen.getByDisplayValue("22")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2033")).toBeInTheDocument();
  });
});
