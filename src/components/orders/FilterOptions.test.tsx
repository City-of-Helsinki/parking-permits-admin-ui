import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermitContractType } from '../../types';
import FilterOptions from './FilterOptions';
import type { FilterOption } from './FilterOptions';

const options: FilterOption[] = [
  {
    i18n: 'enums.contractType.fixedPeriod',
    value: PermitContractType.FIXED_PERIOD,
  },
  {
    i18n: 'enums.contractType.openEnded',
    value: PermitContractType.OPEN_ENDED,
  },
];

const renderFilterOptions = (state: Set<string>) => {
  const onChange = vi.fn<(value: Set<string>) => void>();
  const user = userEvent.setup();

  render(
    <FilterOptions
      state={state}
      onChange={onChange}
      label="Contract type"
      options={options}
    />
  );

  return { onChange, user };
};

describe('FilterOptions', () => {
  it('renders the group label, translated options, and selected state', () => {
    renderFilterOptions(new Set([PermitContractType.FIXED_PERIOD]));

    expect(
      screen.getByRole('group', { name: 'Contract type' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Fixed period' })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Open ended' })
    ).not.toBeChecked();
  });

  it.each([
    {
      action: 'adds',
      optionLabel: 'Open ended',
      value: PermitContractType.OPEN_ENDED,
      selectedValues: [PermitContractType.FIXED_PERIOD],
      expectedValues: [
        PermitContractType.FIXED_PERIOD,
        PermitContractType.OPEN_ENDED,
      ],
      wasSelected: false,
    },
    {
      action: 'removes',
      optionLabel: 'Fixed period',
      value: PermitContractType.FIXED_PERIOD,
      selectedValues: [
        PermitContractType.FIXED_PERIOD,
        PermitContractType.OPEN_ENDED,
      ],
      expectedValues: [PermitContractType.OPEN_ENDED],
      wasSelected: true,
    },
  ])(
    '$action an option without mutating the original set',
    async ({
      optionLabel,
      value,
      selectedValues,
      expectedValues,
      wasSelected,
    }) => {
      const state = new Set(selectedValues);
      const { onChange, user } = renderFilterOptions(state);

      await user.click(screen.getByRole('checkbox', { name: optionLabel }));

      const updatedState = onChange.mock.calls[0][0];
      expect(updatedState).not.toBe(state);
      expect(updatedState).toEqual(new Set(expectedValues));
      expect(state.has(value)).toBe(wasSelected);
    }
  );
});
