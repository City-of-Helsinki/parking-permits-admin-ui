import { render, screen } from '@testing-library/react';
import { ParkingPermitStatus } from '../../types';
import styles from './StatusTag.module.scss';
import StatusTag from './StatusTag';

const statusCases: Array<[ParkingPermitStatus, string, keyof typeof styles]> = [
  [ParkingPermitStatus.DRAFT, 'Draft', 'draft'],
  [
    ParkingPermitStatus.PAYMENT_IN_PROGRESS,
    'Payment in progress',
    'paymentInProgress',
  ],
  [ParkingPermitStatus.VALID, 'Valid', 'valid'],
  [ParkingPermitStatus.CANCELLED, 'Cancelled', 'cancelled'],
  [ParkingPermitStatus.CLOSED, 'Closed', 'closed'],
  [ParkingPermitStatus.PRELIMINARY, 'Preliminary', 'preliminary'],
];

describe('StatusTag', () => {
  it.each(statusCases)(
    'renders the %s status label and style',
    (status, label, style) => {
      render(<StatusTag status={status} />);

      expect(screen.getByText(label)).toHaveClass(styles.tag, styles[style]);
    }
  );
});
