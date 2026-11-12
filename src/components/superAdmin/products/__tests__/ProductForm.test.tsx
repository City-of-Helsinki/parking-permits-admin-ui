import { useQuery } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductInput, ProductType, ProductUnit } from '../../../../types';
import ProductForm from '../ProductForm';

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
}));

const T_PATH = 'components.superAdmin.products.productForm';
const key = (name: string) => `${T_PATH}.${name}`;
const field = (name: string) =>
  screen.getByLabelText(new RegExp(`^${key(name)}`));
const saveButton = () => screen.getByRole('button', { name: key('save') });

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

    expect(field('price')).toHaveDisplayValue('30');
    expect(field('vat')).toHaveDisplayValue('24');
    expect(field('lowEmissionDiscount')).toHaveValue(50);
    expect(saveButton()).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: key('delete') })
    ).not.toBeInTheDocument();
  });

  it('prefills an existing product and supports delete and cancel', async () => {
    const user = userEvent.setup();
    const { onDelete, onCancel } = renderForm(product);

    expect(field('price')).toHaveValue(10);
    expect(field('startDate')).toHaveValue('10.1.2030');
    expect(field('endDate')).toHaveValue('20.2.2030');
    expect(saveButton()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: key('delete') }));
    await user.click(screen.getByRole('button', { name: key('cancel') }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows a validation error for a cleared price and disables save', async () => {
    const user = userEvent.setup();
    renderForm(product);

    await user.clear(field('price'));
    await user.tab();

    expect(await screen.findByText(key('errorEnterPrice'))).toBeVisible();
    expect(saveButton()).toBeDisabled();
  });

  it('submits edited number and date values', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm(product);

    await user.clear(field('price'));
    await user.type(field('price'), '40');
    fireEvent.change(field('endDate'), {
      target: { value: '25.2.2030' },
    });
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
