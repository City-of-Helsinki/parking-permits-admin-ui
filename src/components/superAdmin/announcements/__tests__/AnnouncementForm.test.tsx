import { useQuery } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnouncementForm from '../AnnouncementForm';

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
}));

const field = (label: string) => screen.getByLabelText(label, { exact: false });
const submitButton = () => screen.getByRole('button', { name: 'Submit' });

const renderForm = () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<AnnouncementForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel };
};

describe('AnnouncementForm', () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({
      data: { zones: [{ name: 'A' }, { name: 'B' }] },
      loading: false,
    } as unknown as ReturnType<typeof useQuery>);
  });

  it('renders zone options and fields, with submit disabled', () => {
    renderForm();

    expect(screen.getByLabelText('A')).not.toBeChecked();
    expect(screen.getByLabelText('B')).not.toBeChecked();
    [
      'Subject header (fi)',
      'Content (fi)',
      'Subject header (sv)',
      'Content (sv)',
      'Subject header (en)',
      'Content (en)',
    ].forEach(label => expect(field(label)).toHaveValue(''));
    expect(submitButton()).toBeDisabled();
  });

  it('shows a spinner instead of the form while loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: true,
    } as unknown as ReturnType<typeof useQuery>);
    renderForm();

    expect(
      screen.queryByLabelText('Subject header (fi)', { exact: false })
    ).toBeNull();
  });

  it('shows validation errors and keeps submit disabled', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(field('Subject header (fi)'));
    await user.click(field('Content (fi)'));
    await user.tab();

    expect(await screen.findByText('Enter subject')).toBeVisible();
    expect(await screen.findByText('Enter Content')).toBeVisible();
    expect(await screen.findByText('Select zone')).toBeVisible();
    expect(submitButton()).toBeDisabled();
  });

  it('submits the selected zones and entered texts', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByLabelText('B'));
    for (const [lang, subjectLabel, contentLabel] of [
      ['Fi', 'Subject header (fi)', 'Content (fi)'],
      ['Sv', 'Subject header (sv)', 'Content (sv)'],
      ['En', 'Subject header (en)', 'Content (en)'],
    ]) {
      await user.type(field(subjectLabel), `Subject ${lang}`);
      await user.type(field(contentLabel), `Content ${lang}`);
    }
    await waitFor(() => expect(submitButton()).toBeEnabled());
    await user.click(submitButton());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      parkingZones: ['B'],
      subjectFi: 'Subject Fi',
      contentFi: 'Content Fi',
      subjectSv: 'Subject Sv',
      contentSv: 'Content Sv',
      subjectEn: 'Subject En',
      contentEn: 'Content En',
    });
  });

  it('calls onCancel', async () => {
    const user = userEvent.setup();
    const { onCancel, onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
