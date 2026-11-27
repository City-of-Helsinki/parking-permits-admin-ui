import { render, screen } from '@testing-library/react';
import FieldItem from './FieldItem';

describe('FieldItem', () => {
  it('renders the label, React-node value, and optional class name', () => {
    const { container } = render(
      <FieldItem
        className="customer-field"
        label="Customer"
        value={<strong>Jane Doe</strong>}
      />
    );

    expect(screen.getByText('Customer')).toBeVisible();
    expect(screen.getByText('Jane Doe').tagName).toBe('STRONG');
    expect(container.firstChild).toHaveClass('customer-field');
  });
});
