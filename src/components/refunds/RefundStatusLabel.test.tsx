import { render, screen } from '@testing-library/react';
import { RefundStatus } from '../../types';
import type { RefundStatusOrAll } from '../../types';
import RefundStatusLabel from './RefundStatusLabel';

const statusLabels: Array<[RefundStatusOrAll, string]> = [
  ['ALL', 'All'],
  [RefundStatus.OPEN, 'Open'],
  [RefundStatus.REQUEST_FOR_APPROVAL, 'Request for approval'],
  [RefundStatus.ACCEPTED, 'Accepted'],
  [RefundStatus.REJECTED, 'Rejected'],
];

describe('RefundStatusLabel', () => {
  it.each(statusLabels)('renders the label for status %s', (status, label) => {
    render(<RefundStatusLabel status={status} />);

    expect(screen.getByText(label)).toBeVisible();
  });
});
