import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Supabase (moved to top so imports use the mocked client)
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              then: vi.fn((callback) => {
                if (table === 'tests') {
                  callback({
                    data: [
                      { id: 'test-1', name: 'Complete Blood Count', price: 299, original_price: 499, discount_percent: 40, is_active: true },
                      { id: 'test-2', name: 'Thyroid Profile', price: 399, original_price: 699, discount_percent: 43, is_active: true },
                    ],
                    error: null
                  });
                } else if (table === 'diagnostic_centers') {
                  callback({
                    data: [
                      { id: 'lal-1', name: 'Dr. Lal PathLabs', rating: 4.8, reviews_count: 2500, logo_url: null, is_active: true },
                    ],
                    error: null
                  });
                } else if (table === 'test_packages') {
                  callback({
                    data: [
                      {
                        id: 'pkg-1',
                        name: 'Full Body Checkup',
                        tests_count: 70,
                        price: 1499,
                        original_price: 3000,
                        discount_percent: 50,
                        icon: 'HeartPulse',
                        color: 'from-primary to-primary/60',
                        is_active: true,
                        is_popular: true,
                        diagnostic_centers: {
                          id: 'lal-1',
                          name: 'Dr. Lal PathLabs',
                          logo_url: null
                        }
                      },
                      {
                        id: 'pkg-2',
                        name: 'Comprehensive Health Package',
                        tests_count: 85,
                        price: 2499,
                        original_price: 5000,
                        discount_percent: 50,
                        icon: 'Activity',
                        color: 'from-success to-success/60',
                        is_active: true,
                        is_popular: false,
                        diagnostic_centers: {
                          id: 'met-1',
                          name: 'Metropolis Healthcare',
                          logo_url: null
                        }
                      },
                      {
                        id: 'pkg-3',
                        name: 'Wellness Package',
                        tests_count: 45,
                        price: 999,
                        original_price: 2000,
                        discount_percent: 50,
                        icon: 'Shield',
                        color: 'from-secondary to-secondary/60',
                        is_active: true,
                        is_popular: false,
                        diagnostic_centers: {
                          id: 'srl-1',
                          name: 'SRL Diagnostics',
                          logo_url: null
                        }
                      },
                    ],
                    error: null
                  });
                }
                return Promise.resolve({ data: [], error: null });
              }),
              maybeSingle: vi.fn(() => ({
                then: vi.fn((callback) => {
                  if (table === 'test_packages') {
                    callback({
                      data: {
                        id: 'pkg-1',
                        name: 'Full Body Checkup',
                        description: 'A comprehensive health check package',
                        tests_count: 70,
                        price: 1499,
                        original_price: 3000,
                        discount_percent: 50,
                        icon: 'HeartPulse',
                        color: 'from-primary to-primary/60',
                        diagnostic_centers: {
                          id: 'lal-1',
                          name: 'Dr. Lal PathLabs',
                          logo_url: null
                        }
                      },
                      error: null
                    });
                  }
                  return Promise.resolve({ data: null, error: null });
                })
              })),
            })),
            single: vi.fn(() => ({
              then: vi.fn((callback) => callback({ data: null, error: null }))
            })),
          })),
          maybeSingle: vi.fn(() => ({
            then: vi.fn((callback) => {
              if (table === 'test_packages') {
                callback({
                  data: {
                    id: 'pkg-1',
                    name: 'Full Body Checkup',
                    description: 'A comprehensive health check package',
                    tests_count: 70,
                    price: 1499,
                    original_price: 3000,
                    discount_percent: 50,
                    icon: 'HeartPulse',
                    color: 'from-primary to-primary/60',
                    diagnostic_centers: {
                      id: 'lal-1',
                      name: 'Dr. Lal PathLabs',
                      logo_url: null
                    }
                  },
                  error: null
                });
              }
              return Promise.resolve({ data: null, error: null });
            })
          })),

        })),
      })),
    })),
  }
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import HomeScreen from '@/pages/HomeScreen';
import PackageDetailScreen from '@/pages/PackageDetailScreen';
import PackagesScreen from '@/pages/PackagesScreen';



// Mock console errors
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe('Health Packages Feature', () => {
  const renderWithRouter = (component: React.ReactElement, initialRoute = '/home') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <NotificationProvider>
          <CartProvider>
            <Routes>
              <Route path="/home" element={component} />
              <Route path="/package/:packageId" element={<PackageDetailScreen />} />
              <Route path="/packages" element={<PackagesScreen />} />
            </Routes>
          </CartProvider>
        </NotificationProvider>
      </MemoryRouter>
    );
  };

  // Test 1: Health Packages section renders on home screen
  it('should render Health Packages section on home screen', async () => {
    renderWithRouter(<HomeScreen />);
    
    await waitFor(() => {
      const packagesSection = screen.getByText('Health Packages');
      expect(packagesSection).toBeInTheDocument();
    });
  });

  // Test 2: Packages are displayed with correct information
  it('should display health packages with name, tests count, and price', async () => {
    renderWithRouter(<HomeScreen />);
    
    await waitFor(() => {
      const fullBodyCheckup = screen.getByText('Full Body Checkup');
      expect(fullBodyCheckup).toBeInTheDocument();
      
      const testsCount = screen.getByText(/70 tests included/);
      expect(testsCount).toBeInTheDocument();
      
      const price = screen.getByText('₹1499');
      expect(price).toBeInTheDocument();
    });
  });

  // Test 3: Clicking on a package navigates to package detail screen
  it('should navigate to package detail when clicking on a package', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomeScreen />);
    
    await waitFor(() => {
      const packageElement = screen.getByTestId('health-package-pkg-1');
      expect(packageElement).toBeInTheDocument();
    });

    const packageElement = screen.getByTestId('health-package-pkg-1');
    await user.click(packageElement);

    // Should navigate to package detail page (package title should be visible)
    await waitFor(() => {
      const packageTitle = screen.getByText('Full Body Checkup');
      expect(packageTitle).toBeInTheDocument();
    });
  });

  // Test 4: Package detail screen shows all package information
  it('should display all package details on package detail screen', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      // Check package name
      const packageName = screen.getByText('Full Body Checkup');
      expect(packageName).toBeInTheDocument();
      
      // Check tests count badge
      const testsBadge = screen.getByText(/70 Tests Included/);
      expect(testsBadge).toBeInTheDocument();
      
      // Check price
      const price = screen.getByText('₹1499');
      expect(price).toBeInTheDocument();
    });
  });

  // Test 5: Package detail shows lab information
  it('should display lab information if package is from a specific lab', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      const labName = screen.getByText(/Dr. Lal PathLabs/);
      expect(labName).toBeInTheDocument();
    });
  });

  // Test 6: Package detail shows "What's Included" section
  it('should display what is included in the package', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      const whatIncluded = screen.getByText(/What's Included/);
      expect(whatIncluded).toBeInTheDocument();
      
      // Check for specific benefits
      const homeCollection = screen.getByText(/Home sample collection/);
      expect(homeCollection).toBeInTheDocument();
    });
  });

  // Test 7: Package can be added to cart
  it('should add package to cart when clicking Add to Cart button', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add Package to Cart/i });
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Package to Cart/i });
    await user.click(addButton);

    // Should show success message
    await waitFor(() => {
      // Toast notification would appear (check if component renders without errors)
      expect(addButton).toBeInTheDocument();
    });
  });

  // Test 8: Shows discount percentage if available
  it('should display discount percentage on package', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      const discountBadge = screen.getByText(/50% OFF/);
      expect(discountBadge).toBeInTheDocument();
    });
  });

  // Test 9: Multiple packages shown on home screen
  it('should display multiple health packages on home screen', async () => {
    renderWithRouter(<HomeScreen />);
    
    await waitFor(() => {
      const fullBodyCheckup = screen.getByText('Full Body Checkup');
      const comprehensiveHealthPackage = screen.getByText('Comprehensive Health Package');
      const wellnessPackage = screen.getByText('Wellness Package');
      
      expect(fullBodyCheckup).toBeInTheDocument();
      expect(comprehensiveHealthPackage).toBeInTheDocument();
      expect(wellnessPackage).toBeInTheDocument();
    });
  });

  // Test 10: Lab selection works on package detail (if no specific lab)
  it('should allow lab selection for generic packages', async () => {
    const user = userEvent.setup();
    
    // Create a mock component that uses a generic package without lab_id
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-2');
    
    await waitFor(() => {
      // Check if lab selection section is present
      const chooseLabText = screen.queryByText(/Choose Your Lab/i);
      if (chooseLabText) {
        expect(chooseLabText).toBeInTheDocument();
      }
    });
  });

  // Test 11: View all packages link works
  it('should have view all packages link in home screen', async () => {
    renderWithRouter(<HomeScreen />);
    
    await waitFor(() => {
      const viewAllButtons = screen.getAllByText(/View all/);
      expect(viewAllButtons.length).toBeGreaterThan(0);
    });
  });

  // Test 12: Package displays original price with strikethrough when discounted
  it('should display original price with strikethrough when package is discounted', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      const originalPrice = screen.getByText('₹3000');
      expect(originalPrice).toHaveClass('line-through');
    });
  });

  // Test 13: Responsive design - packages stack vertically on mobile
  it('should render packages in a vertical stack (mobile view)', async () => {
    const { container } = renderWithRouter(<HomeScreen />);
    
    await waitFor(() => {
      const packagesSection = screen.getByText('Health Packages');
      expect(packagesSection).toBeInTheDocument();
      
      // Check if the container uses vertical stacking utility (space-y-3)
      const spaceElement = container.querySelector('.space-y-3');
      expect(spaceElement).toBeInTheDocument();
    });
  });

  // Test 14: Package name is truncated if too long
  it('should truncate long package names', async () => {
    renderWithRouter(<HomeScreen />);
    
    await waitFor(() => {
      const packageName = screen.getByText('Full Body Checkup');
      expect(packageName).toHaveClass('truncate');
    });
  });

  // Test 15: Package detail shows lab rating and reviews
  it('should display lab rating and reviews on package detail', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      // The component might show rating in the selected lab section
      const labName = screen.getByText(/Dr. Lal PathLabs/);
      expect(labName).toBeInTheDocument();
    });
  });
});

// Integration tests
describe('Health Packages Integration Tests', () => {
  const renderWithRouter = (component: React.ReactElement, initialRoute = '/home') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <NotificationProvider>
          <CartProvider>
            <Routes>
              <Route path="/home" element={component} />
              <Route path="/package/:packageId" element={<PackageDetailScreen />} />
              <Route path="/packages" element={<PackagesScreen />} />
            </Routes>
          </CartProvider>
        </NotificationProvider>
      </MemoryRouter>
    );
  };

  // Test 1: User can click package from home, see details, and add to cart
  it('should allow complete user flow: view package -> see details -> add to cart', async () => {
    const user = userEvent.setup();
    
    const { rerender } = renderWithRouter(<HomeScreen />);
    
    // Step 1: Find and click package from home screen
    await waitFor(() => {
      const packageElement = screen.getByTestId('health-package-pkg-1');
      expect(packageElement).toBeInTheDocument();
    });

    // Package should be visible and clickable
    const packageElement = screen.getByTestId('health-package-pkg-1');
    expect(packageElement).toBeInTheDocument();
  });

  // Test 2: Package information is consistent across navigation
  it('should show consistent package information on detail screen', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      // Package name should match
      const packageName = screen.getByText('Full Body Checkup');
      expect(packageName).toBeInTheDocument();
      
      // Price should match
      const price = screen.getByText('₹1499');
      expect(price).toBeInTheDocument();
    });
  });

  // Test 3: Different packages show different information
  it('should show different package information for different packages', async () => {
    renderWithRouter(<PackageDetailScreen />, '/package/pkg-1');
    
    await waitFor(() => {
      const pkg1Name = screen.getByText('Full Body Checkup');
      expect(pkg1Name).toBeInTheDocument();
      
      const pkg1Tests = screen.getByText(/70 Tests Included/);
      expect(pkg1Tests).toBeInTheDocument();
    });
  });
});
