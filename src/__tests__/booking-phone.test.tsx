import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Prevent supabase/address fetch in booking pages by mocking useAuth
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ supabaseUserId: null }) }));

import ECGBookingScreen from '@/pages/ECGBookingScreen';
import PhysioBookingScreen from '@/pages/PhysioBookingScreen';
import * as ConsultationBookingModule from '@/pages/ConsultationBookingScreen';
const ConsultationBookingScreen = (ConsultationBookingModule as any).default as React.ComponentType<any>;

describe('Booking pages — patient phone pill', () => {
  it('ECGBookingScreen shows patient phone pill when passed in location.state', async () => {
    const doctor = {
      id: 'd-1',
      name: 'Dr. Test',
      specialization: 'Cardiology',
      experience: 10,
      rating: 4.9,
      reviews_count: 10,
      fee: 500,
      availability: 'Today',
      qualification: 'MBBS',
    } as any;

    render(
      <MemoryRouter initialEntries={[{ pathname: '/ecg-booking', state: { doctor, patientPhone: '9876543210' } }]}>
        <Routes>
          <Route path="/ecg-booking" element={<ECGBookingScreen />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('9876543210')).toBeInTheDocument();
  });

  it('PhysioBookingScreen shows patient phone pill when passed in location.state', async () => {
    const physio = {
      id: 'p-1',
      name: 'Physio Test',
      specialty: 'Rehab',
      experience: '5 years',
      fee: 400,
    } as any;

    render(
      <MemoryRouter initialEntries={[{ pathname: '/physio-booking', state: { physio, patientPhone: '9998887776' } }]}>
        <Routes>
          <Route path="/physio-booking" element={<PhysioBookingScreen />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('9998887776')).toBeInTheDocument();
  });

  it('ConsultationBookingScreen shows phone pill when audio phone entered', async () => {
    const professional = {
      id: 1,
      name: 'Dr. Audio',
      specialty: 'General',
      image: 'https://example.com/avatar.jpg',
      audioCallFee: 199,
    } as any;

    render(
      <MemoryRouter initialEntries={[{ pathname: '/consultation-booking', state: { type: 'audio', professional, professionalType: 'doctor' } }]}>
        <Routes>
          <Route path="/consultation-booking" element={<ConsultationBookingScreen />} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    const phoneInput = await screen.findByLabelText(/Phone number to call/i);
    await user.type(phoneInput, '9123456780');

    expect(screen.getByText('9123456780')).toBeInTheDocument();
  });
});
