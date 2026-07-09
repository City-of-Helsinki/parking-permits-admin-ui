import { useAuthenticatedUser } from 'hds-react';
import { jwtDecode } from 'jwt-decode';

export enum Groups {
  SUPER_ADMIN = 'sg_kymp_pyva_asukpt_yllapito',
  SANCTIONS_AND_REFUNDS = 'sg_kymp_pyva_asukpt_maksuseuraamukset_palautukset',
  SANCTIONS = 'sg_kymp_pyva_asukpt_maksuseuraamukset',
  CUSTOMER_SERVICE = 'sg_kymp_pyva_asukpt_asiakaspalvelu',
  PREPARATORS = 'sg_kymp_pyva_asukpt_valmistelijat',
  INSPECTORS = 'sg_kymp_pyva_asukpt_tarkastajat',
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
}

// eslint-disable-next-line
type IdTokenClaims = { ad_groups: string[] };

// Ordered from highest to lowest privilege; the first matching group wins.
const ROLE_BY_GROUP: [Groups, UserRole][] = [
  [Groups.SUPER_ADMIN, UserRole.SUPER_ADMIN],
  [Groups.SANCTIONS_AND_REFUNDS, UserRole.SANCTIONS_AND_REFUNDS],
  [Groups.SANCTIONS, UserRole.SANCTIONS],
  [Groups.CUSTOMER_SERVICE, UserRole.CUSTOMER_SERVICE],
  [Groups.PREPARATORS, UserRole.PREPARATORS],
  [Groups.INSPECTORS, UserRole.INSPECTORS],
];

const useUserRole = (): UserRole => {
  const user = useAuthenticatedUser();
  let decodedToken: IdTokenClaims | undefined;
  if (user?.id_token) {
    try {
      decodedToken = jwtDecode<IdTokenClaims>(user.id_token);
    } catch {
      // A malformed id_token makes jwtDecode throw InvalidTokenError; the old
      // jsonwebtoken.decode() returned null here, so degrade to UNKNOWN.
      return UserRole.UNKNOWN;
    }
  }
  if (decodedToken) {
    // Remove special ADFS-prefix and normalize case before matching.
    const adfsPrefix = 'helsinki1\\';
    const adGroups = decodedToken.ad_groups.map((adGroup: string) =>
      adGroup.replace(adfsPrefix, '').toLowerCase()
    );
    const matched = ROLE_BY_GROUP.find(([group]) => adGroups.includes(group));
    return matched ? matched[1] : UserRole.NON_AD_GROUPS;
  }
  return UserRole.UNKNOWN;
};

export default useUserRole;
