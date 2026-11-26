import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
  ParkingPermitStatus,
  PermitContractType,
  PermitDetail,
  PermitPrice,
} from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import { getEmptyPermit } from './consts';
import PermitInfo from './PermitInfo';

const permit: PermitDetail = {
  ...getEmptyPermit(),
  id: 123,
  startTime: new Date('2030-01-15T12:00:00').toISOString(),
  monthCount: 2,
  description: 'Resident permit',
  status: ParkingPermitStatus.VALID,
  contractType: PermitContractType.FIXED_PERIOD,
};

const renderPermitInfo = (
  props: Partial<React.ComponentProps<typeof PermitInfo>> = {}
) => {
  const onUpdatePermit = vi.fn();
  const {
    permit: initialPermit = permit,
    permitPrices = [],
    ...otherProps
  } = props;
  const ControlledPermitInfo = () => {
    const [currentPermit, setCurrentPermit] = useState(initialPermit);
    return (
      <PermitInfo
        {...otherProps}
        permit={currentPermit}
        permitPrices={permitPrices}
        onUpdatePermit={updatedPermit => {
          onUpdatePermit(updatedPermit);
          setCurrentPermit(updatedPermit);
        }}
      />
    );
  };
  render(<ControlledPermitInfo />);
  return { onUpdatePermit, user: userEvent.setup() };
};

const getField = (label: string) =>
  screen.getByLabelText(label, { exact: false });

const getMonthCountInput = () =>
  screen.getByRole('spinbutton', { name: /Valid period in months/ });

describe('PermitInfo', () => {
  it('renders permit details and the calculated expiration date', () => {
    renderPermitInfo();

    expect(getField('Order')).toHaveValue('1. permit');
    expect(getField('Contract type')).toHaveValue('Fixed period');
    expect(getMonthCountInput()).toHaveValue(2);
    expect(getField('Expiration date')).toHaveValue('14.3.2030 23:59');
    expect(screen.queryByText('Price *')).not.toBeInTheDocument();
  });

  it('updates permit fields and status', async () => {
    const { onUpdatePermit, user } = renderPermitInfo();

    await user.click(getField('Bypass Traficom checking'));
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      bypassTraficomValidation: true,
    });

    await user.click(screen.getByRole('button', { name: 'Increase by one' }));
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      bypassTraficomValidation: true,
      monthCount: 3,
    });

    await user.click(
      screen.getByRole('combobox', {
        name: /^Status/,
      })
    );
    await user.click(screen.getByRole('option', { name: 'Cancelled' }));
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      bypassTraficomValidation: true,
      monthCount: 3,
      status: ParkingPermitStatus.CANCELLED,
    });

    const additionalInfo = getField('Additional information');
    await user.clear(additionalInfo);
    await user.type(additionalInfo, 'Updated description');
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      bypassTraficomValidation: true,
      monthCount: 3,
      status: ParkingPermitStatus.CANCELLED,
      description: 'Updated description',
    });
  });

  it('updates the start date from the date input', async () => {
    const { onUpdatePermit, user } = renderPermitInfo();
    const startDate = getField('Start date');

    await user.clear(startDate);
    await user.type(startDate, '20.1.2030');
    await user.tab();

    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      startTime: new Date('2030-01-20T00:00:00').toISOString(),
    });
  });

  it('disables period and start date in edit mode and uses the existing end time', () => {
    const endTime = new Date('2030-03-20T15:45:00').toISOString();
    renderPermitInfo({
      editMode: true,
      permit: { ...permit, endTime },
    });

    expect(getMonthCountInput()).toBeDisabled();
    expect(getField('Start date')).toBeDisabled();
    expect(getField('Expiration date')).toHaveValue(
      formatDateTimeDisplay(endTime)
    );
  });

  it('renders the price list when prices are available', () => {
    const permitPrices: PermitPrice[] = [
      {
        unitPrice: 12.5,
        startDate: '2030-01-01',
        endDate: '2030-01-31',
        quantity: 1,
      },
    ];
    renderPermitInfo({ permitPrices });

    expect(screen.getByText('Price *')).toBeInTheDocument();
    expect(screen.getByText('12.50 €/pm')).toBeInTheDocument();
    expect(screen.getByText('(1.1.2030 - 31.1.2030)')).toBeInTheDocument();
    expect(
      screen.getByText(
        '* the price of the permit is determined by the start date of the period'
      )
    ).toBeInTheDocument();
  });
});
