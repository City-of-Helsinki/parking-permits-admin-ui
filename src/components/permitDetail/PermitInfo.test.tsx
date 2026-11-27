import { render, screen } from '@testing-library/react';
import {
  ParkingPermitStatus,
  PermitContractType,
  PermitEndType,
} from '../../types';
import type { Address, PermitDetail } from '../../types';
import { getEmptyPermit } from '../residentPermit/consts';
import PermitInfo from './PermitInfo';

const permitAddress: Address = {
  ...getEmptyPermit().address,
  id: 'address-1',
  streetName: 'Main Street',
  streetNumber: '10',
  city: 'Helsinki',
};

const permit: PermitDetail = {
  ...getEmptyPermit(),
  id: 123,
  address: permitAddress,
  addressApartment: 'B 2',
  parkingZone: { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
  primaryVehicle: true,
  status: ParkingPermitStatus.VALID,
  contractType: PermitContractType.FIXED_PERIOD,
  startTime: '2030-01-15T10:30:00',
  currentPeriodEndTime: '2030-03-14T23:59:00',
  monthCount: 2,
  monthsLeft: 0,
  bypassTraficomValidation: false,
  description: 'Resident permit details',
};

const renderPermitInfo = (
  currentPermit: PermitDetail,
  endType?: PermitEndType
) => render(<PermitInfo permit={currentPermit} endType={endType} />);

afterEach(() => {
  vi.useRealTimers();
});

describe('PermitInfo', () => {
  it('renders the permit fields and current-period end time', () => {
    renderPermitInfo(permit);

    expect(screen.getByText('Permit information')).toBeVisible();
    expect(screen.getByText('1. permit')).toBeInTheDocument();
    expect(screen.getByText('Fixed period')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('2 months')).toBeInTheDocument();
    expect(screen.getByText('15.1.2030 10:30')).toBeInTheDocument();
    expect(screen.getByText('14.3.2030 23:59')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
    expect(
      screen.getByText('Main Street 10 B 2, Helsinki')
    ).toBeInTheDocument();
    expect(screen.getByText('Zone A')).toBeInTheDocument();
    expect(screen.getByText('Resident permit details')).toBeInTheDocument();
    expect(screen.getByText('Months left')).toBeInTheDocument();
    expect(screen.getByText('-', { selector: 'div' })).toBeInTheDocument();
  });

  it.each([
    {
      label: 'an explicit end time',
      permit: { ...permit, endTime: '2030-02-01T09:00:00' },
      endType: undefined,
      expected: '1.2.2030 09:00',
    },
    {
      label: 'the after-current-period end type',
      permit: { ...permit, endTime: '2030-02-01T09:00:00' },
      endType: PermitEndType.AFTER_CURRENT_PERIOD,
      expected: '14.3.2030 23:59',
    },
    {
      label: 'no end time',
      permit: { ...permit, currentPeriodEndTime: '' },
      endType: undefined,
      expected: '-',
    },
  ])(
    'displays $label for the permit end time',
    ({ permit: currentPermit, endType, expected }) => {
      renderPermitInfo(currentPermit, endType);

      expect(screen.getByText('End time').parentElement?.textContent).toContain(
        expected
      );
    }
  );

  it('uses the current time for an immediate end type', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-05-04T12:30:00'));
    renderPermitInfo(
      { ...permit, endTime: '2030-02-01T09:00:00' },
      PermitEndType.IMMEDIATELY
    );

    expect(screen.getByText('4.5.2030 12:30')).toBeInTheDocument();
  });
});
