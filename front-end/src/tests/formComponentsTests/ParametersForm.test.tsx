import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ParameterForm from '../../formComponents/ParametersForm';
import userEvent from '@testing-library/user-event';
import * as api from '../../utils/GeocodingAPI';

describe('ParameterForm Component', () => {

beforeEach(() => {
  localStorage.clear();
});

it('renders form inputs and dropzone', () => {
  render(<ParameterForm />);
  expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Maximum PV power/i)).toBeInTheDocument();
  expect(screen.getByText(/Upload demand profile/i)).toBeInTheDocument();
});

it('updates localStorage when city is blurred', async () => {
  render(<ParameterForm />);

  const cityInput = screen.getByLabelText(/City/i) as HTMLInputElement;
  await userEvent.type(cityInput, 'Warsaw');
  await userEvent.tab();

  await waitFor(() => {
  const storedCity = localStorage.getItem('city');
  expect(storedCity).toBe(JSON.stringify('Warsaw'));
    });
});

it('updates localStorage when power is changed', async () => {
  render(<ParameterForm />);
  const powerInput = screen.getByLabelText(/Maximum PV power/i) as HTMLInputElement;
  await userEvent.clear(powerInput);
  await userEvent.type(powerInput, '5.5');

  await waitFor(() => {
    const storedPower = localStorage.getItem('power');
    expect(storedPower).toBe(JSON.stringify(5.5));
  });
});

it('calls GetCoordinates on city blur and updates latitude/longitude in localStorage', async () => {
  const mockGetCoordinates = vi.spyOn(api, 'GetCoordinates').mockResolvedValue({name: 'Middelburg', country: 'NL',latitude: 10, longitude: 20 });
    render(<ParameterForm />);

    const cityInput = screen.getByLabelText(/City/i) as HTMLInputElement;
    await userEvent.type(cityInput, 'Middelburg');
    await userEvent.tab();

    await waitFor(() => {
      expect(mockGetCoordinates).toHaveBeenCalledWith('Middelburg');
      const storedLatitude = localStorage.getItem('latitude');
      const storedLongitude = localStorage.getItem('longitude');
      expect(storedLatitude).toBe(JSON.stringify(10));
      expect(storedLongitude).toBe(JSON.stringify(20));
    });
});

});