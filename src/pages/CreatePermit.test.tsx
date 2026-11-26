import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { MemoryRouter } from 'react-router';
import { PermitType } from '../types';
import CreatePermit from './CreatePermit';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

const renderCreatePermit = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <CreatePermit />
    </MemoryRouter>
  );
  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreatePermit', () => {
  it('defaults to resident permit and navigates to its form', async () => {
    const user = renderCreatePermit();

    expect(screen.getByRole('link', { name: 'Permits' })).toHaveAttribute(
      'href',
      '/permits'
    );
    expect(screen.getByText('Create new permit')).toBeVisible();
    expect(screen.getByRole('combobox')).toHaveTextContent('Resident permit');

    await user.click(screen.getByRole('button', { name: 'Create permit' }));

    expect(mocks.navigate).toHaveBeenCalledWith(PermitType.RESIDENT);
  });

  it('navigates to the selected company permit form', async () => {
    const user = renderCreatePermit();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Company permit' }));
    await user.click(screen.getByRole('button', { name: 'Create permit' }));

    expect(mocks.navigate).toHaveBeenCalledWith(PermitType.COMPANY);
  });
});
