import { ApolloError, useMutation } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import { MutationResponse } from '../../../types';
import CreateAnnouncement from './CreateAnnouncement';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  createAnnouncement: vi.fn(),
  announcement: {
    parkingZones: ['A'],
    subjectFi: 'Finnish subject',
    contentFi: 'Finnish content',
    subjectSv: 'Swedish subject',
    contentSv: 'Swedish content',
    subjectEn: 'English subject',
    contentEn: 'English content',
  },
}));

let mutationCallbacks: {
  onCompleted?: (data: MutationResponse) => void;
  onError?: (error: ApolloError) => void;
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock(
  '../../../components/superAdmin/announcements/AnnouncementForm',
  () => ({
    default: ({
      onSubmit,
      onCancel,
    }: {
      onSubmit: (announcement: typeof mocks.announcement) => unknown;
      onCancel: () => void;
    }) => (
      <div>
        <button onClick={() => onSubmit(mocks.announcement)}>
          Submit announcement
        </button>
        <button onClick={onCancel}>Cancel announcement</button>
      </div>
    ),
  })
);

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  Notification: ({
    children,
    onClose,
  }: {
    children: ReactNode;
    onClose?: () => void;
  }) => (
    <div data-testid="notification">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const renderCreateAnnouncement = () => {
  const user = userEvent.setup();
  render(<CreateAnnouncement />);
  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  mutationCallbacks = {};
  vi.mocked(useMutation).mockImplementation((_mutation, options) => {
    mutationCallbacks = {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    };
    return [mocks.createAnnouncement] as unknown as ReturnType<
      typeof useMutation
    >;
  });
});

describe('CreateAnnouncement', () => {
  it('submits the announcement and navigates after success', async () => {
    const user = renderCreateAnnouncement();

    expect(
      screen.getByRole('heading', { name: 'Create new announcement' })
    ).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Submit announcement' })
    );

    expect(mocks.createAnnouncement).toHaveBeenCalledWith({
      variables: { announcement: mocks.announcement },
    });
    act(() => mutationCallbacks.onCompleted?.({ success: true }));
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/announcements');
  });

  it('navigates back when creation is canceled', async () => {
    const user = renderCreateAnnouncement();

    await user.click(
      screen.getByRole('button', { name: 'Cancel announcement' })
    );

    expect(mocks.createAnnouncement).not.toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/announcements');
  });

  it('shows and dismisses mutation errors', async () => {
    const user = renderCreateAnnouncement();

    act(() => {
      mutationCallbacks.onError?.(
        new ApolloError({ errorMessage: 'Announcement creation failed' })
      );
    });
    expect(
      screen.getByText('Announcement creation failed')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText('Announcement creation failed')
    ).not.toBeInTheDocument();
  });
});
