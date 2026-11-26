import { ApolloError, useLazyQuery, useMutation } from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getEmptyPermit } from '../components/residentPermit/consts';
import {
  ParkingPermitStatus,
  PermitContractType,
  PermitDetail,
  PermitPrice,
} from '../types';
import CreateResidentPermit from './CreateResidentPermit';

type QueryCallbacks = {
  onCompleted?: (data: unknown) => void;
  onError?: (error: ApolloError) => void;
};
type PermitInfoScenario = {
  label: string;
  activePermits: NonNullable<PermitDetail['customer']['activePermits']>;
  startTime: Date;
};

const mockNavigate = vi.fn();
const queryCallbacks = new Map<string, QueryCallbacks>();
const QUERY_NAME = {
  permit: 'GetPermitDetail',
  customer: 'GetCustomer',
  vehicle: 'GetVehicle',
  prices: 'GetPermitPrices',
} as const;
const PRICE_FOR_TWO_UNITS = 12.34;
const PRICE_FOR_ONE_UNIT = 1.11;

const createPrimaryPermit = (startTime: Date) => ({
  id: 'primary',
  primaryVehicle: true,
  monthCount: 1,
  startTime: startTime.toISOString(),
  contractType: PermitContractType.OPEN_ENDED,
});

const createPermitPrice = (
  unitPrice: number,
  quantity: number
): PermitPrice => ({
  unitPrice,
  quantity,
  startDate: '2026-01-01',
  endDate: '2026-02-01',
});

const completeQuery = (name: string, data: unknown) => {
  const onCompleted = queryCallbacks.get(name)?.onCompleted;
  if (!onCompleted) {
    throw new Error(`No onCompleted callback registered for ${name}`);
  }
  act(() => onCompleted(data));
};

const failQuery = (name: string, errorMessage: string) => {
  const onError = queryCallbacks.get(name)?.onError;
  if (!onError) {
    throw new Error(`No onError callback registered for ${name}`);
  }
  act(() => onError(new ApolloError({ errorMessage })));
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: vi.fn(),
  useMutation: vi.fn(),
  useQuery: () => ({ data: undefined }),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: () => [true, true, true, true],
}));

vi.mock('../components/residentPermit/PermitInfo', () => ({
  default: ({
    permit,
    onUpdatePermit,
  }: {
    permit: PermitDetail;
    onUpdatePermit: (permit: PermitDetail) => void;
  }) => {
    const now = new Date();
    const futureStart = new Date(now);
    futureStart.setDate(futureStart.getDate() + 1);
    const expiredStart = new Date('2020-01-01T00:00:00Z');
    const scenarios: PermitInfoScenario[] = [
      {
        label: 'set permit ready for pricing',
        activePermits: [],
        startTime: now,
      },
      {
        label: 'set secondary permit ready for pricing',
        activePermits: [createPrimaryPermit(now)],
        startTime: now,
      },
      {
        label: 'set customer at permit limit',
        activePermits: [
          createPrimaryPermit(futureStart),
          {
            ...createPrimaryPermit(futureStart),
            id: 'secondary',
            primaryVehicle: false,
          },
        ],
        startTime: futureStart,
      },
      {
        label: 'set expired primary permit',
        activePermits: [
          {
            ...createPrimaryPermit(expiredStart),
            contractType: PermitContractType.FIXED_PERIOD,
            endTime: '2020-02-01T00:00:00Z',
          },
        ],
        startTime: now,
      },
    ];

    const updatePermitFixture = (scenario: PermitInfoScenario) => {
      onUpdatePermit({
        ...permit,
        startTime: scenario.startTime.toISOString(),
        monthCount: 1,
        parkingZone: { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
        vehicle: { ...permit.vehicle, registrationNumber: 'ABC123' },
        customer: {
          ...permit.customer,
          activePermits: scenario.activePermits,
        },
      });
    };

    return (
      <>
        <output data-testid="permit-address">
          {permit.address?.streetName}
        </output>
        {scenarios.map(scenario => (
          <button
            key={scenario.label}
            type="button"
            onClick={() => updatePermitFixture(scenario)}>
            {scenario.label}
          </button>
        ))}
      </>
    );
  },
}));

const createPage = (initialEntry = '/') => (
  <MemoryRouter initialEntries={[initialEntry]}>
    <Routes>
      <Route path="/permits/:id" element={<CreateResidentPermit />} />
      <Route path="*" element={<CreateResidentPermit />} />
    </Routes>
  </MemoryRouter>
);
const renderPage = (initialEntry = '/') => render(createPage(initialEntry));
const renderPageWithUser = (initialEntry = '/') => {
  const user = userEvent.setup();
  renderPage(initialEntry);
  return user;
};

const getPayPermitButton = () =>
  screen.getByRole('button', { name: 'Pay permit' });
const getPaymentCompletedButton = () =>
  screen.getByRole('button', { name: 'Payment completed' });
const getSaveDraftButton = () =>
  screen.getByRole('button', { name: 'Save as draft' });
const getSearchButton = (index: number) =>
  screen.getAllByRole('button', { name: 'Search' })[index];

const setPermitInfoFixture = (name: string) =>
  act(() => screen.getByRole('button', { name }).click());

const confirmPayment = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(getPayPermitButton());
  await user.click(getPaymentCompletedButton());
};

describe('CreateResidentPermit', () => {
  const createPermit = vi.fn();
  const executeQuery = vi.fn();
  let mutationOnError: ((error: ApolloError) => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationOnError = undefined;
    queryCallbacks.clear();
    vi.mocked(useLazyQuery).mockImplementation((query, options) => {
      const operation = query.definitions[0];
      if (operation?.kind !== 'OperationDefinition' || !operation.name) {
        throw new Error('Expected a named GraphQL operation in useLazyQuery');
      }
      queryCallbacks.set(operation.name.value, {
        onCompleted: options?.onCompleted,
        onError: options?.onError,
      });
      return [executeQuery, { loading: false }] as unknown as ReturnType<
        typeof useLazyQuery
      >;
    });
    vi.mocked(useMutation).mockImplementation((_mutation, options) => {
      mutationOnError = options?.onError;
      return [createPermit] as unknown as ReturnType<typeof useMutation>;
    });
    createPermit.mockResolvedValue({
      data: { createResidentPermit: { success: true, permit: { id: '42' } } },
    });
  });

  it('confirms a valid permit before creating it and navigates to its detail', async () => {
    const user = renderPageWithUser();

    await user.click(getPayPermitButton());
    expect(createPermit).not.toHaveBeenCalled();
    await user.click(getPaymentCompletedButton());

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/permits/42')
    );
    expect(createPermit).toHaveBeenCalledWith({
      variables: {
        permit: expect.objectContaining({ status: ParkingPermitStatus.VALID }),
      },
    });
  });

  it('does not create a permit when payment confirmation is canceled', async () => {
    const user = renderPageWithUser();

    await user.click(getPayPermitButton());
    await user.click(screen.getByRole('button', { name: 'Cancel payment' }));

    expect(createPermit).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Payment completed' })
    ).not.toBeInTheDocument();
  });

  it('navigates away without creating a permit when canceled and closed', async () => {
    const user = renderPageWithUser();

    await user.click(
      screen.getByRole('button', { name: 'Cancel and close without saving' })
    );

    expect(mockNavigate).toHaveBeenCalledWith('/permits');
    expect(createPermit).not.toHaveBeenCalled();
  });

  it('shows draft success only when a permit id is returned', async () => {
    const user = renderPageWithUser();
    await user.click(getSaveDraftButton());

    await waitFor(() =>
      expect(screen.getByText('Permit 42 draft saved')).toBeInTheDocument()
    );
    expect(createPermit).toHaveBeenCalledWith({
      variables: {
        permit: expect.objectContaining({ status: ParkingPermitStatus.DRAFT }),
      },
    });
    expect(mockNavigate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(
        screen.queryByText('Permit 42 draft saved')
      ).not.toBeInTheDocument()
    );

    createPermit.mockResolvedValueOnce({
      data: { createResidentPermit: null },
    });
    await user.click(getSaveDraftButton());
    expect(screen.queryByText(/draft saved/i)).not.toBeInTheDocument();
  });

  it('shows mutation errors without navigating', async () => {
    createPermit.mockResolvedValueOnce({
      errors: [{ message: 'Save failed' }],
    });
    const user = renderPageWithUser();
    await confirmPayment(user);

    expect(await screen.findByText('Save failed')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByText('Save failed')).not.toBeInTheDocument()
    );
  });

  it('shows mutation hook errors', async () => {
    renderPage();

    act(() => {
      mutationOnError?.(new ApolloError({ errorMessage: 'Mutation failed' }));
    });

    expect(await screen.findByText('Mutation failed')).toBeInTheDocument();
  });

  it('shows draft-save errors when the mutation rejects', async () => {
    createPermit.mockRejectedValueOnce(
      new ApolloError({ errorMessage: 'Draft save failed' })
    );
    const user = renderPageWithUser();

    await user.click(getSaveDraftButton());

    expect(await screen.findByText('Draft save failed')).toBeInTheDocument();
  });

  it('shows a fallback error when the create response contains no permit', async () => {
    createPermit.mockResolvedValueOnce({
      data: { createResidentPermit: null },
    });
    await confirmPayment(renderPageWithUser());

    expect(
      await screen.findByText('Permit creation failed')
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows a network error when creating a permit fails', async () => {
    createPermit.mockRejectedValueOnce(
      new ApolloError({ errorMessage: 'Network unavailable' })
    );
    await confirmPayment(renderPageWithUser());

    expect(await screen.findByText('Network unavailable')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('searches for a customer and vehicle and applies their results', async () => {
    const user = renderPageWithUser();

    await user.type(screen.getByLabelText('Personal ID'), '123456-7890');
    await user.click(getSearchButton(0));
    expect(executeQuery).toHaveBeenCalledWith({
      variables: { query: { nationalIdNumber: '123456-7890' } },
    });

    const customer = {
      ...getEmptyPermit().customer,
      firstName: 'Test',
      nationalIdNumber: '123456-7890',
      primaryAddress: {
        ...getEmptyPermit().address,
        zone: { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
      },
    };
    completeQuery(QUERY_NAME.customer, { customer });
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Registration number'), 'ABC123');
    await user.click(getSearchButton(1));
    expect(executeQuery).toHaveBeenCalledWith({
      variables: {
        regNumber: 'ABC123',
        nationalIdNumber: '123456-7890',
      },
    });
    completeQuery(QUERY_NAME.vehicle, {
      vehicle: {
        ...getEmptyPermit().vehicle,
        manufacturer: 'Test Motors',
      },
    });
    expect(screen.getByDisplayValue('Test Motors')).toBeDisabled();
  });

  it('loads an existing draft and locks its vehicle fields', async () => {
    const user = renderPageWithUser('/permits/123');

    expect(executeQuery).toHaveBeenCalledWith({
      variables: { permitId: '123' },
    });

    const permitDetail = {
      ...getEmptyPermit(),
      id: 123,
      status: ParkingPermitStatus.DRAFT,
      customer: {
        ...getEmptyPermit().customer,
        firstName: 'Existing customer',
      },
      vehicle: {
        ...getEmptyPermit().vehicle,
        manufacturer: 'Existing manufacturer',
      },
    };
    completeQuery(QUERY_NAME.permit, { permitDetail });

    expect(screen.getByDisplayValue('Existing customer')).toBeInTheDocument();
    expect(screen.getByLabelText('Manufacturer')).toBeDisabled();
    expect(
      screen.getByDisplayValue('Existing manufacturer')
    ).toBeInTheDocument();

    await user.click(getSaveDraftButton());

    expect(createPermit).toHaveBeenCalledWith({
      variables: {
        permit: expect.objectContaining({ status: ParkingPermitStatus.DRAFT }),
      },
    });
    expect(
      await screen.findByText('Permit 42 draft saved')
    ).toBeInTheDocument();
  });

  it('shows an error when loading an existing permit fails', async () => {
    renderPage('/permits/123');

    failQuery(QUERY_NAME.permit, 'Permit lookup failed');

    expect(await screen.findByText('Permit lookup failed')).toBeInTheDocument();
  });

  it('recovers from search errors and uses the other address when no primary address exists', async () => {
    const user = renderPageWithUser();

    await user.type(screen.getByLabelText('Registration number'), 'ABC123');
    await user.click(getSearchButton(1));
    expect(executeQuery).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Personal ID'), '123456-7890');
    await user.click(getSearchButton(0));
    failQuery(QUERY_NAME.customer, 'Customer lookup failed');
    expect(
      await screen.findByText('Customer lookup failed')
    ).toBeInTheDocument();

    await user.click(getSearchButton(0));
    const otherAddress = {
      ...getEmptyPermit().address,
      id: 'other-address',
      streetName: 'Other Street',
      streetNumber: '10',
      zone: { name: 'B', label: 'Zone B', labelSv: 'Zon B' },
    };
    completeQuery(QUERY_NAME.customer, {
      customer: {
        ...getEmptyPermit().customer,
        nationalIdNumber: '123456-7890',
        otherAddress,
      },
    });
    await waitFor(() =>
      expect(
        screen.queryByText('Customer lookup failed')
      ).not.toBeInTheDocument()
    );
    expect(screen.getByTestId('permit-address')).toHaveTextContent(
      'Other Street'
    );

    await user.click(getSearchButton(1));
    failQuery(QUERY_NAME.vehicle, 'Vehicle lookup failed');
    expect(
      await screen.findByText('Vehicle lookup failed')
    ).toBeInTheDocument();

    await user.click(getSearchButton(1));
    completeQuery(QUERY_NAME.vehicle, {
      vehicle: {
        ...getEmptyPermit().vehicle,
        manufacturer: 'Recovered vehicle',
      },
    });
    await waitFor(() =>
      expect(
        screen.queryByText('Vehicle lookup failed')
      ).not.toBeInTheDocument()
    );
    expect(screen.getByDisplayValue('Recovered vehicle')).toBeDisabled();
  });

  it('blocks both save actions when the primary permit dates are invalid', async () => {
    const user = renderPageWithUser();

    await user.click(
      screen.getByRole('button', { name: 'set expired primary permit' })
    );

    expect(
      screen.getByText(
        'The full duration of the second permit must fit within the first permit’s validity. Select a valid start date and a shorter duration, or extend the first permit.'
      )
    ).toBeInTheDocument();
    expect(getPayPermitButton()).toBeDisabled();
    expect(getSaveDraftButton()).toBeDisabled();
    expect(createPermit).not.toHaveBeenCalled();
  });

  it('requests primary and secondary permit prices and displays their totals', () => {
    renderPage();

    setPermitInfoFixture('set permit ready for pricing');

    expect(executeQuery).toHaveBeenCalledWith({
      variables: {
        permit: expect.objectContaining({
          zone: 'A',
          vehicle: expect.objectContaining({ registrationNumber: 'ABC123' }),
        }),
        isSecondary: false,
      },
    });

    completeQuery(QUERY_NAME.prices, {
      permitPrices: [
        createPermitPrice(PRICE_FOR_TWO_UNITS, 2),
        createPermitPrice(PRICE_FOR_ONE_UNIT, 1),
      ],
    });
    expect(screen.getByText('25.79')).toBeInTheDocument();

    setPermitInfoFixture('set secondary permit ready for pricing');

    expect(executeQuery).toHaveBeenLastCalledWith({
      variables: {
        permit: expect.objectContaining({
          zone: 'A',
          vehicle: expect.objectContaining({ registrationNumber: 'ABC123' }),
        }),
        isSecondary: true,
      },
    });
  });

  it('shows pricing errors and clears pricing when a secondary permit is invalid', async () => {
    const user = renderPageWithUser();

    setPermitInfoFixture('set permit ready for pricing');
    failQuery(QUERY_NAME.prices, 'Pricing lookup failed');
    expect(
      await screen.findByText('Pricing lookup failed')
    ).toBeInTheDocument();

    completeQuery(QUERY_NAME.prices, {
      permitPrices: [createPermitPrice(50, 1)],
    });
    expect(screen.getByText('50.00')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'set expired primary permit' })
    );
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('disables both save actions when the customer already has two permits', async () => {
    const user = renderPageWithUser();

    await user.click(
      screen.getByRole('button', { name: 'set customer at permit limit' })
    );

    expect(getPayPermitButton()).toBeDisabled();
    expect(getSaveDraftButton()).toBeDisabled();
    expect(createPermit).not.toHaveBeenCalled();
  });

  it('clears vehicle search errors and unlocks fields when the vehicle is cleared', async () => {
    const user = renderPageWithUser();

    await user.type(screen.getByLabelText('Personal ID'), '123456-7890');
    await user.click(getSearchButton(0));
    completeQuery(QUERY_NAME.customer, {
      customer: {
        ...getEmptyPermit().customer,
        nationalIdNumber: '123456-7890',
      },
    });

    await user.type(screen.getByLabelText('Registration number'), 'ABC123');
    await user.click(getSearchButton(1));
    failQuery(QUERY_NAME.vehicle, 'Vehicle lookup failed');
    expect(
      await screen.findByText('Vehicle lookup failed')
    ).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Clear' })[1]);

    expect(screen.queryByText('Vehicle lookup failed')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Manufacturer')).toBeEnabled();
    expect(screen.getByLabelText('Registration number')).toHaveValue('');
  });
});
