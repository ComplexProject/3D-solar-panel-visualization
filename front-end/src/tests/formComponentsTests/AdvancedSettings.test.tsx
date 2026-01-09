import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { it, expect, describe, beforeEach, vi } from 'vitest';
import AdvancedSettings from '../../formComponents/AdvancedSettings';
import * as api from '../../utils/GeocodingAPI';

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

vi.mock('../../utils/GeocodingAPI', () => ({
  GetCityName: vi.fn(),
  findClosestSavedCoordinate: vi.fn(),
}));

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
describe('Advanced Settings', () => {
    beforeEach(() => {
  localStorage.clear();
});

  it('renders form with saved values from localStorage', () => {
    localStorage.setItem("latitude", "45");
    localStorage.setItem("longitude", "-93");
    localStorage.setItem("year", "2019");

    render(<AdvancedSettings />);

    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    expect(screen.getByDisplayValue("-93")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2019")).toBeInTheDocument();  
  });

  it('renders default values when localStorage is empty', () => {
    render(<AdvancedSettings />);

    expect(screen.getByLabelText(/latitude/i)).toHaveValue(0);
    expect(screen.getByLabelText(/longitude/i)).toHaveValue(0);
    expect(screen.getByLabelText(/year/i)).toHaveValue(2019);
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
    expect(screen.getByLabelText(/year/i)).toHaveValue(2019);
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
describe('Advanced Settings – integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('updates latitude and longitude on coordinatesUpdated event', async () => {
    render(<AdvancedSettings />);

    window.dispatchEvent(
      new CustomEvent('coordinatesUpdated', {
        detail: { lat: 52, lon: 21 },
      })
    );

    expect(await screen.findByDisplayValue('52')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('21')).toBeInTheDocument();
  });

  it('submits form, saves values to localStorage and resolves city name', async () => {
    vi.mocked(api.GetCityName).mockResolvedValue({
      name: 'Warsaw',
      country: 'PL',
      state: '',
    });

    render(<AdvancedSettings />);

    fireEvent.change(screen.getByLabelText(/latitude/i), {
      target: { value: '52' },
    });
    fireEvent.change(screen.getByLabelText(/longitude/i), {
      target: { value: '21' },
    });
    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: '2022' },
    });

    fireEvent.submit(
      screen.getByTestId('advanced-settings-form')
    );

    await waitFor(() => {
      expect(api.GetCityName).toHaveBeenCalledWith(52, 21);
    });

    expect(localStorage.getItem('city')).toBe(JSON.stringify('"\Warsaw\"'));
    expect(localStorage.getItem('latitude')).toBe(JSON.stringify("52"));
    expect(localStorage.getItem('longitude')).toBe(JSON.stringify("21"));
    expect(localStorage.getItem('year')).toBe(JSON.stringify("2022"));
  });

  it('always calls findClosestSavedCoordinate on submit', async () => {
    render(<AdvancedSettings />);

    fireEvent.change(screen.getByLabelText(/latitude/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/longitude/i), {
      target: { value: '20' },
    });
    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: '2019' },
    });

    fireEvent.submit(
      screen.getByTestId('advanced-settings-form')
    );

    await waitFor(() => {
      expect(api.findClosestSavedCoordinate)
        .toHaveBeenCalledWith(10, 20, 2019);
    });
  });
});