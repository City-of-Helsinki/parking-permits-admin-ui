import { render, screen } from '@testing-library/react';
import AuthError from './AuthError';

describe('AuthError', () => {
  it('displays the authentication error message', () => {
    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeVisible();
  });
});
