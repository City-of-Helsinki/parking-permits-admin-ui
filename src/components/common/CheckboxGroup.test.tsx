import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxGroup from './CheckboxGroup';
import type { CheckboxGroupOption } from './CheckboxGroup';

const options: CheckboxGroupOption[] = [
  { label: 'North zone', value: 'north' },
  { label: 'South zone', value: 'south' },
];

const renderCheckboxGroup = (
  groupOptions = options,
  props: { required?: boolean; errorText?: string } = {}
) => {
  const onChange = vi.fn();
  const user = userEvent.setup();

  render(
    <CheckboxGroup
      options={groupOptions}
      heading="Recipient zones"
      idPrefix="recipient-zones"
      name="recipientZones"
      onChange={onChange}
      {...props}
    />
  );

  return { onChange, user };
};

describe('CheckboxGroup', () => {
  it('renders the heading, options, required indicator, and error', () => {
    renderCheckboxGroup(options, {
      required: true,
      errorText: 'Select at least one zone',
    });

    expect(screen.getByText('Recipient zones *')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'North zone' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'South zone' })).toBeVisible();
    expect(screen.getByText('Select at least one zone')).toBeVisible();
  });

  it('updates selected values when individual options and the controller change', async () => {
    const { onChange, user } = renderCheckboxGroup();

    await user.click(screen.getByRole('checkbox', { name: 'North zone' }));
    expect(onChange).toHaveBeenNthCalledWith(1, ['north']);

    await user.click(screen.getByRole('checkbox', { name: 'Select all' }));
    expect(onChange).toHaveBeenNthCalledWith(2, ['north', 'south']);
    expect(screen.getByRole('checkbox', { name: 'North zone' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'South zone' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Select all' }));
    expect(onChange).toHaveBeenNthCalledWith(3, []);
    expect(
      screen.getByRole('checkbox', { name: 'North zone' })
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'South zone' })
    ).not.toBeChecked();
  });

  it('includes initially checked options when reporting changes', async () => {
    const { onChange, user } = renderCheckboxGroup([
      { label: 'North zone', value: 'north', checked: true },
      { label: 'South zone', value: 'south' },
    ]);

    expect(screen.getByRole('checkbox', { name: 'North zone' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'South zone' }));

    expect(onChange).toHaveBeenCalledWith(['north', 'south']);

    await user.click(screen.getByRole('checkbox', { name: 'North zone' }));
    expect(onChange).toHaveBeenLastCalledWith(['south']);
  });
});
