import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonVariant } from 'hds-react';
import type { ReactNode } from 'react';
import ToggleButton from './ToggleButton';

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  Button: ({
    children,
    className,
    onClick,
    variant,
  }: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    variant: ButtonVariant;
  }) => (
    <button className={className} data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ToggleButton', () => {
  it.each([
    {
      state: 'default',
      selected: undefined,
      variant: ButtonVariant.Secondary,
    },
    {
      state: 'selected',
      selected: true,
      variant: ButtonVariant.Primary,
    },
  ])(
    'uses the $variant variant for the $state state and emits its value',
    async ({ selected, variant }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const value = { id: 'option-1' };

      render(
        <ToggleButton value={value} selected={selected} onChange={onChange}>
          Option
        </ToggleButton>
      );

      const button = screen.getByRole('button', { name: 'Option' });
      expect(button).toHaveAttribute('data-variant', variant);

      await user.click(button);
      expect(onChange).toHaveBeenCalledWith(value);
    }
  );

  it('can be clicked without an onChange handler', async () => {
    const user = userEvent.setup();
    render(<ToggleButton value="option-1">Option</ToggleButton>);

    await user.click(screen.getByRole('button', { name: 'Option' }));
  });
});
