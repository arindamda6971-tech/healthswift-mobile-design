import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Mock useAuth to simulate a logged-in user
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, loading: false, supabaseUserId: 'user-1' })
}));

import ConsultationBookingScreen from '@/pages/ConsultationBookingScreen';

function PaymentSpy() {
  const location = useLocation();
  const state: any = location.state || {};
  return <div data-testid="payment-spy">Subtotal: ₹{state.subtotal ?? 'none'}</div>;
}

const PROFESSIONAL = {
  id: 42,
  name: 'Dr. Test User',
  specialty: 'Testology',
  image: 'https://example.com/doc.jpg',
  videoCallFee: 350,
  audioCallFee: 250,
};

describe('ConsultationBooking -> Payment navigation', () => {
  it('navigates to /payment with consultation subtotal when Book Appointment is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/consultation-booking', state: { type: 'video', professional: PROFESSIONAL, professionalType: 'doctor' } }]}
      >
        <Routes>
          <Route path="/consultation-booking" element={<ConsultationBookingScreen />} />
          <Route path="/payment" element={<PaymentSpy />} />
        </Routes>
      </MemoryRouter>
    );

    const btn = await screen.findByRole('button', { name: /Book Appointment/i });
    await user.click(btn);

    // PaymentSpy should be rendered with subtotal = videoCallFee
    const payment = await screen.findByTestId('payment-spy');
    expect(payment).toHaveTextContent('Subtotal: ₹350');
  });

  it('shows physiotherapist copy and still navigates using physiotherapist professionalType', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/consultation-booking', state: { type: 'audio', professional: PROFESSIONAL, professionalType: 'physiotherapist' } }]}
      >
        <Routes>
          <Route path="/consultation-booking" element={<ConsultationBookingScreen />} />
          <Route path="/payment" element={<PaymentSpy />} />
        </Routes>
      </MemoryRouter>
    );

    // Physiotherapist-specific help text should be visible
    expect(await screen.findByText(/Physiotherapist will call you shortly/i)).toBeInTheDocument();
    expect(screen.getByText(/Physiotherapist will call this number/i)).toBeInTheDocument();

    // Enter a valid phone number for audio consultations
    const phoneInput = await screen.findByPlaceholderText(/Enter phone number/i);
    await user.type(phoneInput, '9876543210');

    const btn = await screen.findByRole('button', { name: /Book Appointment/i });
    await user.click(btn);

    const payment = await screen.findByTestId('payment-spy');
    expect(payment).toHaveTextContent('Subtotal: ₹250');
  });
});
