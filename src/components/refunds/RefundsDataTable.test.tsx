import { render } from '@testing-library/react';
import useUserRole, { UserRole } from '../../api/useUserRole';
import DataTable from '../common/DataTable';
import RefundsDataTable from './RefundsDataTable';

vi.mock('../common/DataTable', () => ({ default: vi.fn(() => null) }));
vi.mock('../../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../../api/useUserRole')>()),
  default: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
});

describe('RefundsDataTable selection', () => {
  it.each([
    [UserRole.INSPECTORS, false],
    [UserRole.PREPARATORS, false],
    [UserRole.CUSTOMER_SERVICE, false],
    [UserRole.SANCTIONS, true],
    [UserRole.SANCTIONS_AND_REFUNDS, true],
    [UserRole.SUPER_ADMIN, true],
  ])('for role %s, selecting refunds is allowed: %s', (role, allowed) => {
    vi.mocked(useUserRole).mockReturnValue(role);

    render(<RefundsDataTable refunds={[]} />);

    const props = vi.mocked(DataTable).mock.calls[0][0];
    expect(props.showCheckbox).toBe(allowed);
    expect(props.showAllSelection).toBe(allowed);
  });
});
