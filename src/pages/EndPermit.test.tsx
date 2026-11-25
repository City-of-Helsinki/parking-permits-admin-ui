import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getEmptyPermit } from '../components/residentPermit/consts';
import { PermitContractType, PermitDetail } from '../types';
import EndPermit from './EndPermit';

const mockNavigate = vi.fn();

const createPermitDetail = (
  overrides: Partial<PermitDetail> = {}
): PermitDetail => ({
  ...getEmptyPermit(),
  id: 123,
  contractType: PermitContractType.FIXED_PERIOD,
  canBeRefunded: true,
  totalRefundAmount: 100,
  ...overrides,
});

const defaultPermit = createPermitDetail();
let queryPermit = defaultPermit;
let onQueryError: ((error: ApolloError) => void) | undefined;

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: () => [true, true, true, true],
}));

vi.mock('../components/permitDetail/VehicleInfo', () => ({
  default: () => null,
}));

vi.mock('../components/permitDetail/CustomerInfo', () => ({
  default: () => null,
}));

vi.mock('../components/permitDetail/PermitInfo', () => ({
  default: () => null,
}));

const renderPage = (
  permit = defaultPermit,
  endType = 'after_current_period'
) => {
  queryPermit = permit;
  return render(
    <MemoryRouter initialEntries={[`/permits/123/end/${endType}`]}>
      <Routes>
        <Route path="/permits/:id/end/:endType" element={<EndPermit />} />
      </Routes>
    </MemoryRouter>
  );
};

const getEndPermitButton = () =>
  screen.getByRole('button', { name: 'End permit' });
const getIbanInput = () => screen.getByLabelText(/IBAN-number/);

describe('EndPermit', () => {
  const endPermit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryPermit = defaultPermit;
    onQueryError = undefined;
    vi.mocked(useQuery).mockImplementation((_query, options) => {
      onQueryError = options?.onError;
      return {
        loading: false,
        data: { permitDetail: queryPermit },
      } as unknown as ReturnType<typeof useQuery>;
    });
    vi.mocked(useMutation).mockReturnValue([endPermit] as unknown as ReturnType<
      typeof useMutation
    >);
    endPermit.mockResolvedValue({ data: { endPermit: { success: true } } });
  });

  it('shows a loading state while permit details are fetched', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: true,
    } as unknown as ReturnType<typeof useQuery>);
    renderPage();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'End permit' })
    ).not.toBeInTheDocument();
  });

  it.each([
    {
      scenario: 'a refundable fixed-period permit',
      permit: createPermitDetail({ totalRefundAmount: null }),
    },
    {
      scenario: 'a non-refundable open-ended permit',
      permit: createPermitDetail({
        contractType: PermitContractType.OPEN_ENDED,
        canBeRefunded: false,
        totalRefundAmount: null,
      }),
    },
  ])(
    'disables ending for $scenario without a reviewed refund amount',
    ({ permit }) => {
      renderPage(permit);

      expect(getEndPermitButton()).toBeDisabled();
      expect(
        screen.getByText(
          'Reconcile the previous refund for this permit before ending it.'
        )
      ).toBeInTheDocument();
    }
  );

  it('requires a valid IBAN for a refundable fixed-period permit', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(getEndPermitButton()).toBeEnabled();
    await user.type(getIbanInput(), 'FI00');
    expect(getEndPermitButton()).toBeDisabled();

    await user.clear(getIbanInput());
    await user.type(getIbanInput(), 'FI0600000000000000');
    expect(getIbanInput()).toHaveValue('FI06 0000 0000 0000 00');
    expect(getEndPermitButton()).toBeEnabled();
  });

  it('requires a valid IBAN for a refundable open-ended permit', async () => {
    const user = userEvent.setup();
    renderPage(
      createPermitDetail({ contractType: PermitContractType.OPEN_ENDED })
    );
    await user.type(getIbanInput(), 'FI00');

    expect(getEndPermitButton()).toBeDisabled();

    await user.clear(getIbanInput());
    await user.type(getIbanInput(), 'FI0600000000000000');
    expect(getEndPermitButton()).toBeEnabled();
  });

  it.each([
    {
      scenario: 'the refund amount is zero',
      permit: { totalRefundAmount: 0 },
    },
    {
      scenario: 'refunds are disabled',
      permit: { canBeRefunded: false },
    },
  ])('does not require an IBAN when $scenario', ({ permit }) => {
    renderPage(createPermitDetail(permit));

    expect(screen.queryByLabelText(/IBAN-number/)).not.toBeInTheDocument();
    expect(getEndPermitButton()).toBeEnabled();
  });

  it('submits the selected end type and navigates after success', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getEndPermitButton());

    await waitFor(() =>
      expect(endPermit).toHaveBeenCalledWith({
        variables: {
          permitId: 123,
          endType: 'AFTER_CURRENT_PERIOD',
          iban: '',
        },
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/permits/123');
  });

  it('shows query and mutation errors and navigates back on cancel', async () => {
    const user = userEvent.setup();
    renderPage();

    act(() => {
      onQueryError?.(new ApolloError({ errorMessage: 'Permit lookup failed' }));
    });
    expect(await screen.findByText('Permit lookup failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByText('Permit lookup failed')).not.toBeInTheDocument()
    );

    endPermit.mockRejectedValueOnce(new Error('Ending failed'));
    await user.click(getEndPermitButton());
    expect(await screen.findByText('Ending failed')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalledWith('/permits/123');
  });
});
