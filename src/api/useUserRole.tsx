import { gql, useQuery } from '@apollo/client';
import { useAuthenticatedUser } from 'hds-react';
import { createContext, ReactNode, useContext } from 'react';

export enum Groups {
  SUPER_ADMIN = 'super_admin',
  SANCTIONS_AND_REFUNDS = 'sanctions_and_refunds',
  SANCTIONS = 'sanctions',
  CUSTOMER_SERVICE = 'customer_service',
  PREPARATORS = 'preparators',
  INSPECTORS = 'inspectors',
}

export enum UserRole {
  SUPER_ADMIN = 100,
  SANCTIONS_AND_REFUNDS = 90,
  SANCTIONS = 80,
  CUSTOMER_SERVICE = 70,
  PREPARATORS = 60,
  INSPECTORS = 50,
  NON_AD_GROUPS = 10,
  UNKNOWN = 0,
  LOADING = -1,
  ERROR = 1,
}

export const CURRENT_USER_GROUPS = gql`
  query CurrentUserGroups {
    currentUserGroups
  }
`;

const UserRoleContext = createContext(UserRole.UNKNOWN);

// Ordered from highest to lowest privilege; the first matching group wins.
const ROLE_BY_GROUP: [Groups, UserRole][] = [
  [Groups.SUPER_ADMIN, UserRole.SUPER_ADMIN],
  [Groups.SANCTIONS_AND_REFUNDS, UserRole.SANCTIONS_AND_REFUNDS],
  [Groups.SANCTIONS, UserRole.SANCTIONS],
  [Groups.CUSTOMER_SERVICE, UserRole.CUSTOMER_SERVICE],
  [Groups.PREPARATORS, UserRole.PREPARATORS],
  [Groups.INSPECTORS, UserRole.INSPECTORS],
];

const AuthenticatedUserRoleProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { data, loading, error } = useQuery<{
    currentUserGroups: string[];
  }>(CURRENT_USER_GROUPS, {
    fetchPolicy: 'no-cache',
    context: { queryDeduplication: false },
  });

  let role = UserRole.ERROR;
  if (loading) {
    role = UserRole.LOADING;
  } else if (!error && data?.currentUserGroups) {
    const matched = ROLE_BY_GROUP.find(([group]) =>
      data.currentUserGroups.includes(group)
    );
    role = matched ? matched[1] : UserRole.NON_AD_GROUPS;
  }

  return (
    <UserRoleContext.Provider value={role}>{children}</UserRoleContext.Provider>
  );
};

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const user = useAuthenticatedUser();
  if (!user) {
    return (
      <UserRoleContext.Provider value={UserRole.UNKNOWN}>
        {children}
      </UserRoleContext.Provider>
    );
  }
  return (
    <AuthenticatedUserRoleProvider key={user.profile.sub}>
      {children}
    </AuthenticatedUserRoleProvider>
  );
};

const useUserRole = (): UserRole => useContext(UserRoleContext);

export default useUserRole;
