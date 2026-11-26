import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router';
import { OrderDirection } from '../../../components/types';
import type { Announcement, AnnouncementsQueryData } from '../../../types';
import '../../../i18n';
import Announcements from './Announcements';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  navigate: vi.fn(),
  refetch: vi.fn(),
  language: 'en',
}));

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: mocks.useQuery,
}));

vi.mock('react-i18next', async importOriginal => {
  const { createEnglishReactI18nextMock } = await import(
    '../../../__tests__/i18n'
  );
  const englishMock = await createEnglishReactI18nextMock();
  return {
    ...(await importOriginal<typeof import('react-i18next')>()),
    useTranslation: (
      ...args: Parameters<typeof englishMock.useTranslation>
    ) => {
      const translation = englishMock.useTranslation(...args);
      return {
        ...translation,
        i18n: { ...translation.i18n, language: mocks.language },
      };
    },
  };
});

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

const announcement: Announcement = {
  id: 'announcement-1',
  parkingZones: [
    { name: 'B', label: 'Zone B', labelSv: 'Zon B' },
    { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
  ],
  subjectFi: 'Finnish subject',
  subjectSv: 'Swedish subject',
  subjectEn: 'English subject',
  contentFi: 'Finnish content',
  contentSv: 'Swedish content',
  contentEn: 'English content',
  createdAt: '2026-01-15T10:30:00.000Z',
  createdBy: 'Announcement editor',
};

const announcementsData: AnnouncementsQueryData = {
  announcements: {
    objects: [announcement],
    pageInfo: {
      numPages: 3,
      page: 1,
      prev: null,
      next: 2,
      startIndex: 0,
      endIndex: 1,
      count: 1,
    },
  },
};

const CurrentLocation = () => {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  return (
    <output
      data-testid="current-location"
      data-pathname={pathname}
      data-search={search}
      data-navigation-type={navigationType}
    />
  );
};

const renderAnnouncements = (initialEntry = '/admin/announcements') => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/announcements/*" element={<Announcements />} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  );
  return user;
};

const getSearchParams = () =>
  Object.fromEntries(
    new URLSearchParams(
      screen.getByTestId('current-location').getAttribute('data-search') ?? ''
    )
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.language = 'en';
  mocks.useQuery.mockReturnValue({
    loading: false,
    data: announcementsData,
    refetch: mocks.refetch,
  });
});

describe('Announcements', () => {
  it('uses the current page and renders announcement row data', () => {
    renderAnnouncements('/admin/announcements?page=3');

    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          pageInput: { page: 3 },
          orderBy: {
            orderField: '',
            orderDirection: OrderDirection.DESC,
          },
        },
      })
    );
    expect(
      screen.getByRole('heading', { name: 'Announcements' })
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: 'A, B' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Announcement editor' })
    ).toBeInTheDocument();
  });

  it.each([
    ['fi', 'Finnish subject'],
    ['sv', 'Swedish subject'],
    ['en', 'English subject'],
    ['de', 'Finnish subject'],
  ])(
    'selects the %s subject, with Finnish as the fallback',
    (language, subject) => {
      mocks.language = language;
      renderAnnouncements();

      expect(screen.getByRole('cell', { name: subject })).toBeInTheDocument();
    }
  );

  it('passes loading state to the table while announcements are fetched', () => {
    mocks.useQuery.mockReturnValue({
      loading: true,
      data: undefined,
      refetch: mocks.refetch,
    });
    renderAnnouncements();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'English subject' })
    ).not.toBeInTheDocument();
  });

  it('navigates to the create page', async () => {
    const user = renderAnnouncements();

    await user.click(
      screen.getByRole('button', { name: 'Create new announcement' })
    );
    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-pathname',
      '/admin/announcements/create'
    );
  });

  it('navigates to announcement details when a row is clicked', async () => {
    const user = renderAnnouncements();

    await user.click(screen.getByRole('row', { name: /English subject/ }));
    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-pathname',
      '/admin/announcements/announcement-1'
    );
  });

  it('refetches for page and order changes and replaces query parameters', async () => {
    const user = renderAnnouncements('/admin/announcements?page=3');

    await user.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(1, {
      pageInput: { page: 2 },
    });
    expect(getSearchParams()).toEqual({ page: '2' });

    await user.click(screen.getByRole('button', { name: 'Sender' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(2, {
      orderBy: {
        orderField: 'createdBy',
        orderDirection: OrderDirection.ASC,
      },
    });
    expect(getSearchParams()).toEqual({
      page: '2',
      orderField: 'createdBy',
      orderDirection: OrderDirection.ASC,
    });
    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-navigation-type',
      'REPLACE'
    );
  });
});
