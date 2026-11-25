import { useMutation, useQuery } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import i18n from '../../i18n';
import { PermitContractType, PermitDetailData } from '../../types';
import EndPermit from '../EndPermit';

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));
vi.mock('../../auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: () => [true, true, true],
}));
vi.mock('../../components/permitDetail/CustomerInfo', () => ({
  default: () => null,
}));
vi.mock('../../components/permitDetail/PermitInfo', () => ({
  default: () => null,
}));
vi.mock('../../components/permitDetail/VehicleInfo', () => ({
  default: () => null,
}));

const mockEndPermit = vi.fn();
const permitDetail = {
  id: 1,
  primaryVehicle: true,
  contractType: PermitContractType.OPEN_ENDED,
  canBeRefunded: false,
  totalRefundAmount: null,
  customer: { activePermits: [] },
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/permits/1/end/immediately']}>
      <Routes>
        <Route path="/permits/:id/end/:endType" element={<EndPermit />} />
      </Routes>
    </MemoryRouter>
  );

describe('EndPermit', () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: { permitDetail } as unknown as PermitDetailData,
    } as unknown as ReturnType<typeof useQuery>);
    vi.mocked(useMutation).mockReturnValue([
      mockEndPermit,
    ] as unknown as ReturnType<typeof useMutation>);
  });

  it('blocks ending and shows the review notice when a refund amount is missing', () => {
    renderPage();

    expect(
      screen.getByText(
        i18n.t('components.permitDetail.refundInfo.reviewRequired')
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: i18n.t('pages.endPermit.endPermit'),
      })
    ).toBeDisabled();
  });
});
