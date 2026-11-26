import { render, screen } from '@testing-library/react';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('displays the not-found message', () => {
    render(<NotFound />);

    expect(
      screen.getByRole('heading', { level: 2, name: '404 Not Found' })
    ).toBeVisible();
  });
});
