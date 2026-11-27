import { render, screen } from '@testing-library/react';
import Zone from './Zone';

describe('Zone', () => {
  it('renders the zone name', () => {
    render(<Zone name="Zone A" />);

    expect(screen.getByText('Zone A')).toBeVisible();
  });
});
