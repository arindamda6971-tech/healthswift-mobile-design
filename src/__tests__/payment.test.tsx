import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Mock useCart for CartScreen
vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    items: [{ id: 'test-1', name: 'CBC', price: 300, quantity: 1 }],
    subtotal: 300,
    currentLabId: 'lab-1',
    isLoading: false,
  })
}));

// Mock useAuth to avoid address fetch
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ supabaseUserId: null }) }));

import CartScreen from '@/pages/CartScreen';

function PaymentSpy() {
  const location = useLocation();
  const state: any = location.state || {};
  return (
    <div data-testid="payment-spy">
      patientName: {state.patientName ?? 'none'} | patientAge: {String(state.patientAge ?? 'none')}
    </div>
  );
}

describe('CartScreen — patient details in cart', () => {
  it('requires patient name & age in cart and forwards them to /payment', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/payment" element={<PaymentSpy />} />
        </Routes>
      </MemoryRouter>
    );

    const proceedBtn = await screen.findByRole('button', { name: /Proceed to Pay/i });
    expect(proceedBtn).toBeDisabled();

    const nameInput = screen.getByLabelText(/Patient name/i);
    const ageInput = screen.getByLabelText(/Patient age/i);

    await user.type(nameInput, 'John Doe');
    await user.type(ageInput, '35');

    expect(proceedBtn).toBeEnabled();

    await user.click(proceedBtn);

    const spy = await screen.findByTestId('payment-spy');
    expect(spy).toHaveTextContent('patientName: John Doe');
    expect(spy).toHaveTextContent('patientAge: 35');
  });
});
