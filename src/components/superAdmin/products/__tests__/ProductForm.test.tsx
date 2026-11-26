import { useQuery } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductInput, ProductType, ProductUnit } from '../../../../types';
import ProductForm from '../ProductForm';

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
}));

const numberFieldLabels = ['Price', 'Vat', 'Low emission discount'];
const field = (label: string) =>
  numberFieldLabels.includes(label)
    ? screen.getByRole('spinbutton', { name: new RegExp(`^${label}`) })
    : screen.getByLabelText(label, { exact: false });
const saveButton = () => screen.getByRole('button', { name: 'Save' });

const product: ProductInput = {
  type: ProductType.COMPANY,
  zone: 'B',
  unitPrice: 10,
  unit: ProductUnit.PIECES,
  startDate: '2030-01-10',
  endDate: '2030-02-20',
  vatPercentage: 20,
  lowEmissionDiscountPercentage: 5,
};

const renderForm = (initial?: ProductInput) => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const onDelete = vi.fn();
  render(
    <ProductForm
      product={initial}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onDelete={onDelete}
    />
  );
  return { onSubmit, onCancel, onDelete };
};

describe('ProductForm', () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        zones: [
          { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
          { name: 'B', label: 'Zone B', labelSv: 'Zon B' },
        ],
      },
    } as unknown as ReturnType<typeof useQuery>);
  });

  it('renders an empty create form with defaults, disabled save and no delete', () => {
    renderForm();

    expect(field('Price')).toHaveDisplayValue('30');
    expect(field('Vat')).toHaveDisplayValue('24');
    expect(field('Low emission discount')).toHaveValue(50);
    expect(saveButton()).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  it('prefills an existing product and supports delete and cancel', async () => {
    const user = userEvent.setup();
    const { onDelete, onCancel } = renderForm(product);

    expect(field('Price')).toHaveValue(10);
    expect(field('Start date')).toHaveValue('10.1.2030');
    expect(field('End date')).toHaveValue('20.2.2030');
    expect(saveButton()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows a validation error for a cleared price and disables save', async () => {
    const user = userEvent.setup();
    renderForm(product);

    await user.clear(field('Price'));
    await user.tab();

    expect(await screen.findByText('Please enter a price')).toBeVisible();
    expect(saveButton()).toBeDisabled();
  });

  it('submits decimal product values', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm(product);

    await user.clear(field('Price'));
    await user.type(field('Price'), '40.50');
    await user.clear(field('Vat'));
    await user.type(field('Vat'), '20.5');
    await user.clear(field('Low emission discount'));
    await user.type(field('Low emission discount'), '5.25');
    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(saveButton());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      ...product,
      unitPrice: 40.5,
      vatPercentage: 20.5,
      lowEmissionDiscountPercentage: 5.25,
    });
  });

  it('submits edited number and date values', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm(product);

    await user.clear(field('Price'));
    await user.type(field('Price'), '40');
    fireEvent.change(field('End date'), {
      target: { value: '25.2.2030' },
    });
    // HDS 4 DateInput reports the parsed date on blur or Enter
    fireEvent.blur(field('End date'));
    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(saveButton());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      ...product,
      unitPrice: 40,
      endDate: '2030-02-25',
    });
  });
});
