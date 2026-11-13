import { useMutation, useQuery } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import useUserRole, { UserRole } from '../../api/useUserRole';
import useExportData from '../../export/useExportData';
import RefundDetail from '../RefundDetail';

const mockNavigate = vi.fn();

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));
vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}));
vi.mock('../../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../../api/useUserRole')>()),
  default: vi.fn(),
}));
vi.mock('../../auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: () => [true, true, true],
}));
vi.mock('../../export/useExportData', () => ({ default: vi.fn() }));
vi.mock('../../components/refunds/RefundsDataTable', () => ({
  default: () => null,
}));

const T_PATH = 'pages.refundDetail';
const key = (name: string) => `${T_PATH}.${name}`;
const nameInput = () => screen.getByLabelText(new RegExp(`^${key('name')}`));
const ibanInput = () => screen.getByLabelText(/^IBAN/);
const saveButton = () => screen.getByRole('button', { name: key('save') });

const validIban = 'FI06 0000 0000 0000 00';
const refund = { id: '1', name: 'Test Name', iban: validIban };

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/refunds/1']}>
      <Routes>
        <Route path="/refunds/:id" element={<RefundDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe('RefundDetail', () => {
  const updateRefund = vi.fn();
  const exportData = vi.fn();

  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: { refund },
    } as unknown as ReturnType<typeof useQuery>);
    vi.mocked(useMutation).mockReturnValue([
      updateRefund,
    ] as unknown as ReturnType<typeof useMutation>);
    vi.mocked(useUserRole).mockReturnValue(UserRole.SUPER_ADMIN);
    vi.mocked(useExportData).mockReturnValue(exportData);
  });

  it('renders prefilled fields with save disabled', () => {
    renderPage();

    expect(nameInput()).toHaveValue('Test Name');
    expect(ibanInput()).toHaveValue(validIban);
    expect(saveButton()).toBeDisabled();
  });

  it('shows loading and no-data states instead of the form', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: true,
    } as unknown as ReturnType<typeof useQuery>);
    const { unmount } = renderPage();
    expect(screen.getByText(key('loading'))).toBeInTheDocument();
    unmount();

    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>);
    renderPage();
    expect(screen.getByText(key('noData'))).toBeInTheDocument();
  });

  it('shows required and invalid IBAN errors and disables save', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(nameInput());
    await user.tab();
    expect(await screen.findByText(key('nameIsRequired'))).toBeVisible();

    await user.clear(ibanInput());
    await user.type(ibanInput(), 'FI00');
    await user.tab();
    expect(await screen.findByText('errors.invalidIBAN')).toBeVisible();
    expect(saveButton()).toBeDisabled();
  });

  it('formats the IBAN while typing and submits the values', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(nameInput());
    await user.type(nameInput(), 'New Name');
    await user.clear(ibanInput());
    await user.type(ibanInput(), 'FI0600000000000000');
    expect(ibanInput()).toHaveValue(validIban);

    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(saveButton());

    await waitFor(() => expect(updateRefund).toHaveBeenCalledTimes(1));
    expect(updateRefund).toHaveBeenCalledWith({
      variables: {
        refundId: '1',
        refund: { name: 'New Name', iban: validIban },
      },
    });
  });

  it('exports the PDF and navigates back on cancel', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: key('downloadPdf') }));
    await user.click(screen.getByRole('button', { name: key('cancel') }));

    expect(exportData).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/refunds');
  });

  it('is read-only without save and cancel for preparators', () => {
    vi.mocked(useUserRole).mockReturnValue(UserRole.PREPARATORS);
    renderPage();

    expect(nameInput()).toBeDisabled();
    expect(ibanInput()).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: key('save') })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: key('cancel') })
    ).not.toBeInTheDocument();
  });
});
