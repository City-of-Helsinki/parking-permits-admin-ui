import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import type { Announcement } from '../../../types';
import '../../../i18n';
import ViewAnnouncement from './ViewAnnouncement';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useQuery: vi.fn(),
}));

const announcement: Announcement = {
  id: 'announcement-1',
  parkingZones: [
    { name: 'Zone B', label: 'Zone B', labelSv: 'Zon B' },
    { name: 'Zone A', label: 'Zone A', labelSv: 'Zon A' },
  ],
  subjectFi: 'Finnish subject',
  contentFi: 'Finnish line one\nFinnish line two',
  subjectSv: 'Swedish subject',
  contentSv: 'Swedish content',
  subjectEn: 'English subject',
  contentEn: 'English content',
  createdAt: '2026-01-15T10:30:00.000Z',
  createdBy: 'Announcement editor',
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: mocks.useQuery,
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
  useParams: () => ({ id: 'announcement-1' }),
}));

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

const renderViewAnnouncement = () => {
  const user = userEvent.setup();
  render(<ViewAnnouncement />);
  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useQuery.mockReturnValue({
    loading: false,
    data: { announcement },
  });
});

describe('ViewAnnouncement', () => {
  it('queries the announcement and renders its details and language versions', () => {
    renderViewAnnouncement();

    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { announcementId: 'announcement-1' },
        fetchPolicy: 'no-cache',
      })
    );
    expect(screen.getByText('Zone A, Zone B')).toBeInTheDocument();
    expect(screen.getByText('Announcement editor')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Announcement in Finnish' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Announcement in Swedish' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Announcement in English' })
    ).toBeInTheDocument();
    expect(screen.getByText('Finnish subject')).toBeInTheDocument();
    expect(screen.getByText('Finnish line one')).toBeInTheDocument();
    expect(screen.getByText('Finnish line two')).toBeInTheDocument();
    expect(screen.getByText('Swedish subject')).toBeInTheDocument();
    expect(screen.getByText('Swedish content')).toBeInTheDocument();
    expect(screen.getByText('English subject')).toBeInTheDocument();
    expect(screen.getByText('English content')).toBeInTheDocument();
  });

  it('shows a loading spinner while the announcement is fetched', () => {
    mocks.useQuery.mockReturnValue({ loading: true });
    renderViewAnnouncement();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Finnish subject')).not.toBeInTheDocument();
  });

  it('keeps the return-to-list button when no announcement is returned', () => {
    mocks.useQuery.mockReturnValue({
      loading: false,
      data: undefined,
    });
    renderViewAnnouncement();

    expect(
      screen.getByRole('button', { name: 'Return to list' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Finnish subject')).not.toBeInTheDocument();
  });

  it('navigates back to the announcement list', async () => {
    const user = renderViewAnnouncement();

    await user.click(screen.getByRole('button', { name: 'Return to list' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/admin/announcements');
  });
});
