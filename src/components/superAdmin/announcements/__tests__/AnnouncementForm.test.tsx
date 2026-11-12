import { useQuery } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnouncementForm from '../AnnouncementForm';

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
}));

const T_PATH = 'components.superAdmin.announcements.announcementForm';
const key = (name: string) => `${T_PATH}.${name}`;
const field = (name: string) =>
  screen.getByLabelText(new RegExp(`^${key(name)}`));
const submitButton = () => screen.getByRole('button', { name: key('submit') });

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
      'subjectFi',
      'contentFi',
      'subjectSv',
      'contentSv',
      'subjectEn',
      'contentEn',
    ].forEach(name => expect(field(name)).toHaveValue(''));
    expect(submitButton()).toBeDisabled();
  });

  it('shows a spinner instead of the form while loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: true,
    } as unknown as ReturnType<typeof useQuery>);
    renderForm();

    expect(screen.queryByLabelText(new RegExp(key('subjectFi')))).toBeNull();
  });

  it('shows validation errors and keeps submit disabled', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(field('subjectFi'));
    await user.click(field('contentFi'));
    await user.tab();

    expect(await screen.findByText(key('enterSubject'))).toBeVisible();
    expect(await screen.findByText(key('enterContent'))).toBeVisible();
    expect(await screen.findByText(key('selectZone'))).toBeVisible();
    expect(submitButton()).toBeDisabled();
  });

  it('submits the selected zones and entered texts', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByLabelText('B'));
    for (const lang of ['Fi', 'Sv', 'En']) {
      await user.type(field(`subject${lang}`), `Subject ${lang}`);
      await user.type(field(`content${lang}`), `Content ${lang}`);
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

    await user.click(screen.getByRole('button', { name: key('cancel') }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
