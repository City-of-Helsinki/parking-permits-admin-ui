import {
  ApolloError,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DocumentNode } from 'graphql';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getEmptyPermit } from '../components/residentPermit/consts';
import {
  ExtendedPriceListItem,
  MutationResponse,
  PermitDetail,
} from '../types';
import ExtendPermit from './ExtendPermit';

const mockNavigate = vi.fn();
type QueryCallbacks = {
  onCompleted?: (data: unknown) => void;
  onError?: (error: ApolloError) => void;
};
const queryCallbacks = new Map<string, QueryCallbacks>();
let mutationCallbacks: {
  onCompleted?: (data: MutationResponse) => void;
  onError?: (error: ApolloError) => void;
};

const getOperationName = (query: DocumentNode) => {
  const operation = query.definitions[0];
  if (operation?.kind !== 'OperationDefinition' || !operation.name) {
    throw new Error('Expected a named GraphQL operation');
  }
  return operation.name.value;
};

const captureQueryCallbacks = (
  query: DocumentNode,
  options?: QueryCallbacks
) => {
  queryCallbacks.set(getOperationName(query), {
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
};

const completeQuery = (name: string, data: unknown) => {
  const callback = queryCallbacks.get(name)?.onCompleted;
  if (!callback) {
    throw new Error(`Missing onCompleted callback for ${name}`);
  }
  act(() => callback(data));
};

const failQuery = (name: string, message: string) => {
  const callback = queryCallbacks.get(name)?.onError;
  if (!callback) {
    throw new Error(`Missing onError callback for ${name}`);
  }
  act(() => callback(new ApolloError({ errorMessage: message })));
};

const permitDetail: PermitDetail = {
  ...getEmptyPermit(),
  id: 123,
  canAdminExtendPermit: true,
  maxExtensionMonthCount: 6,
  vehicle: {
    ...getEmptyPermit().vehicle,
    registrationNumber: 'ABC123',
    manufacturer: 'Test Motors',
  },
};

const priceList: ExtendedPriceListItem[] = [
  {
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    vat: 0.25,
    unitPrice: 10,
    price: 20,
    netPrice: 16,
    vatPrice: 4,
  },
  {
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    vat: 0.25,
    unitPrice: 5,
    price: 5,
    netPrice: 4,
    vatPrice: 1,
  },
];

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', async importOriginal => {
  const { createEnglishReactI18nextMock } = await import('../__tests__/i18n');
  return {
    ...(await importOriginal<typeof import('react-i18next')>()),
    ...(await createEnglishReactI18nextMock()),
  };
});

vi.mock('../components/permitDetail/VehicleInfo', () => ({
  default: ({ permit }: { permit: PermitDetail }) => (
    <div>{permit.vehicle.registrationNumber}</div>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/permits/123/extend']}>
      <Routes>
        <Route path="/permits/:id/extend" element={<ExtendPermit />} />
      </Routes>
    </MemoryRouter>
  );

const loadPermit = (permit = permitDetail) =>
  completeQuery('GetPermitDetail', { permitDetail: permit });
const renderWithPermit = (permit = permitDetail) => {
  renderPage();
  loadPermit(permit);
};

const getMonthCountInput = () =>
  screen.getByRole('spinbutton', { name: /Number of months/ });
const getContinueButton = () =>
  screen.getByRole('button', { name: 'Continue' });
const setMonthCount = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string
) => {
  const input = getMonthCountInput();
  await user.click(input);
  await user.keyboard('{Control>}a{/Control}');
  await user.type(input, value);
};

describe('ExtendPermit', () => {
  const getPriceList = vi.fn();
  const extendPermit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryCallbacks.clear();
    mutationCallbacks = {};
    vi.mocked(useQuery).mockImplementation((query, options) => {
      captureQueryCallbacks(query, options);
      return { loading: false } as unknown as ReturnType<typeof useQuery>;
    });
    vi.mocked(useLazyQuery).mockImplementation((query, options) => {
      captureQueryCallbacks(query, options);
      return [getPriceList, { loading: false }] as unknown as ReturnType<
        typeof useLazyQuery
      >;
    });
    vi.mocked(useMutation).mockImplementation((_mutation, options) => {
      mutationCallbacks = {
        onCompleted: options?.onCompleted,
        onError: options?.onError,
      };
      return [extendPermit] as unknown as ReturnType<typeof useMutation>;
    });
    getPriceList.mockResolvedValue({
      data: { getExtendedPriceList: priceList },
    });
  });

  it('loads the permit and displays its vehicle and month selector', () => {
    renderWithPermit();

    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(getMonthCountInput()).toHaveValue(0);
    expect(getContinueButton()).toBeDisabled();
  });

  it('shows an error and hides the month selector when the permit is not extendable', async () => {
    renderWithPermit({ ...permitDetail, canAdminExtendPermit: false });

    expect(await screen.findByText(/permitNotExtendable/)).toBeInTheDocument();
    expect(
      screen.queryByRole('spinbutton', { name: /Number of months/ })
    ).not.toBeInTheDocument();
    expect(getContinueButton()).toBeDisabled();
  });

  it('loads a price quote, confirms the extension, and navigates to the permit', async () => {
    const user = userEvent.setup();
    renderWithPermit();

    await setMonthCount(user, '2');

    await waitFor(() =>
      expect(getPriceList).toHaveBeenCalledWith({
        variables: { permitId: '123', monthCount: 2 },
      })
    );
    expect(
      await screen.findByRole('table', { name: 'Total price 25.00 €' })
    ).toBeInTheDocument();
    expect(getContinueButton()).toBeEnabled();

    await user.click(getContinueButton());
    expect(screen.getByText('Total price of order: 25 €.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Payment completed' }));

    expect(extendPermit).toHaveBeenCalledWith({
      variables: { permitId: '123', monthCount: 2 },
    });
    act(() => mutationCallbacks.onCompleted?.({ success: true }));
    expect(mockNavigate).toHaveBeenCalledWith('/permits/123');
  });

  it('clears the quote and disables continuation for an out-of-range month count', async () => {
    const user = userEvent.setup();
    renderWithPermit();

    await setMonthCount(user, '2');
    expect(
      await screen.findByRole('table', { name: 'Total price 25.00 €' })
    ).toBeInTheDocument();

    await setMonthCount(user, '7');

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(getContinueButton()).toBeDisabled();
    expect(getPriceList).toHaveBeenCalledTimes(1);
  });

  it('ignores a price response without data', async () => {
    const user = userEvent.setup();
    getPriceList.mockResolvedValueOnce({ data: undefined });
    renderWithPermit();

    await setMonthCount(user, '2');

    await waitFor(() => expect(getPriceList).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows errors returned by the extension mutation', async () => {
    renderPage();

    act(() => {
      mutationCallbacks.onError?.(
        new ApolloError({ errorMessage: 'Extension failed' })
      );
    });

    expect(await screen.findByText('Extension failed')).toBeInTheDocument();
  });

  it('reports query and pricing errors and allows canceling the confirmation', async () => {
    const user = userEvent.setup();
    renderPage();
    failQuery('GetPermitDetail', 'Permit lookup failed');
    expect(await screen.findByText('Permit lookup failed')).toBeInTheDocument();

    loadPermit();
    await setMonthCount(user, '1');
    failQuery('GetExtendedPriceList', 'Price lookup failed');
    expect(await screen.findByText('Price lookup failed')).toBeInTheDocument();

    await user.click(getContinueButton());
    await user.click(screen.getByRole('button', { name: 'Cancel payment' }));
    expect(extendPermit).not.toHaveBeenCalled();
  });
});
