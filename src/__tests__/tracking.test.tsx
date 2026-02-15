import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Test utilities / providers

describe('TrackingScreen phlebotomist visibility', () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('hides phlebotomist personal details for unauthenticated users', async () => {
    // Unauthenticated: mock useAuth before importing the component
    vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ supabaseUserId: null }) }));

    const { default: TrackingScreen } = await import('@/pages/TrackingScreen');

    render(
      <MemoryRouter initialEntries={["/tracking"]}>
        <Routes>
          <Route path="/tracking" element={<TrackingScreen />} />
        </Routes>
      </MemoryRouter>
    );

    // Ensure phlebotomist personal details are NOT exposed to unauthenticated users
    await waitFor(() => expect(screen.queryByText(/Rahul Sharma/i)).not.toBeInTheDocument());

    // Call / Chat buttons must not be present
    expect(screen.queryByRole('button', { name: /Call/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Chat/i })).toBeNull();
  });

  it('shows phlebotomist details for authenticated users after order creation', async () => {
    // Authenticated: mock useAuth to return a supabaseUserId
    vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ supabaseUserId: 'user-1' }) }));

    // Mock Supabase insert flow for orders and order_items
    vi.mock('@/integrations/supabase/client', () => ({
      supabase: {
        from: (table: string) => {
          return {
            insert: (payload: any) => ({
              select: () => ({
                single: async () => {
                  if (table === 'orders') {
                    return { data: { id: 'order-1' }, error: null };
                  }
                  return { data: null, error: null };
                }
              })
            }),
            // fallback for order_items
            then: async (cb: any) => ({ data: null, error: null }),
          };
        }
      }
    }));

    const { default: TrackingScreen } = await import('@/pages/TrackingScreen');

    const bookingState = {
      cartItems: [{ id: 'test-1', name: 'CBC', price: 300, quantity: 1 }],
      subtotal: 300,
      selectedPayment: 'cash',
      paymentVerified: true,
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/tracking', state: bookingState }]}>
        <Routes>
          <Route path="/tracking" element={<TrackingScreen />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the phlebotomist name to appear after order creation finishes
    await waitFor(() => expect(screen.queryByText(/Creating your order/i)).not.toBeInTheDocument());

    // Now the real name and actions should be visible
    expect(await screen.findByText(/Rahul Sharma/i)).toBeInTheDocument();
    const callBtn = screen.getByRole('button', { name: /Call/i });
    const chatBtn = screen.getByRole('button', { name: /Chat/i });
    expect(callBtn).toBeEnabled();
    expect(chatBtn).toBeEnabled();
  });
});
