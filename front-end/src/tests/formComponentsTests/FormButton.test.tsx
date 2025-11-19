import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormButton from '../../formComponents/FormButton';


describe('FormButton Component', () => {
it('renders button with correct text', () => {
  render(<FormButton buttonText="Click me" />);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

it('applies closing button styles when isClosingButton is true', () => {
  render(<FormButton buttonText="Close" isClosingButton={true} />);
  const button = screen.getByText('Close');
  expect(button).toHaveClass('bg-white text-[#006FAA]');
});

it('applies default styles when isClosingButton is false', () => {
  render(<FormButton buttonText="Submit" isClosingButton={false} />);
  const button = screen.getByText('Submit');
  expect(button).toHaveClass('bg-[#006FAA] text-white');
});
});
