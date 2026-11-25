import { render, screen } from '@testing-library/react';
import Footer from './Footer';

const externalLinkLabels = [
  'Information about parking',
  'Privacy statement',
  'Data protection',
  'Accessibility',
];

describe('Footer', () => {
  it('renders translated footer content and external links in new tabs', () => {
    render(<Footer />);

    expect(
      screen.getByText(/City of Helsinki, Personal data/)
    ).toBeInTheDocument();

    externalLinkLabels.forEach(label => {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
