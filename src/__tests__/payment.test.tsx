import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Mock useCart to provide subtotal
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({ subtotal: 500 }) }));

import PaymentScreen from '@/pages/PaymentScreen';

function TrackingSpy() {
  const location = useLocation();
  const state: any = location.state || {};
  return (
    <div data-testid="tracking-spy">
      patientName: {state.patientName ?? 'none'} | patientAge: {String(state.patientAge ?? 'none')}
    </div>
  );
}

describe('PaymentScreen — patient details required', () => {
  it('requires patient name & age before enabling Pay Now and forwards them to /tracking', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[{ pathname: '/payment', state: { subtotal: 500 } }]}>
        <Routes>
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/tracking" element={<TrackingSpy />} />
        </Routes>
      </MemoryRouter>
    );

    const payBtn = await screen.findByRole('button', { name: /Pay Now/i });
    expect(payBtn).toBeDisabled();

    const nameInput = screen.getByLabelText(/Patient name/i);
    const ageInput = screen.getByLabelText(/Patient age/i);

    await user.type(nameInput, 'John Doe');
    await user.type(ageInput, '35');

    expect(payBtn).toBeEnabled();

    await user.click(payBtn);

    const spy = await screen.findByTestId('tracking-spy');
    expect(spy).toHaveTextContent('patientName: John Doe');
    expect(spy).toHaveTextContent('patientAge: 35');
  });
});
