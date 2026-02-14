import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DoctorConsultScreen from '@/pages/DoctorConsultScreen';

describe('DoctorConsultScreen', () => {
  it('shows specialization-specific empty state when selected category has no doctors (Dental)', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/doctor-consult"]}>
        <Routes>
          <Route path="/doctor-consult" element={<DoctorConsultScreen />} />
        </Routes>
      </MemoryRouter>
    );

    // Select the Dental specialization (mock data has no dental doctors)
    const dentalBtn = screen.getByText('Dental');
    await user.click(dentalBtn);

    await waitFor(() => {
      const emptyMsg = screen.getByText(/There are no Dental doctors available right now/i);
      expect(emptyMsg).toBeInTheDocument();
    });
  });
});
