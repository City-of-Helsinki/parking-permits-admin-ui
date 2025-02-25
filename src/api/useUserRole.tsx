import { useAuthenticatedUser } from 'hds-react';
import { decode } from 'jsonwebtoken';

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

const useUserRole = (): UserRole => {
  const user = useAuthenticatedUser();
  const decodedToken = user && decode(user.id_token);
  if (decodedToken) {
    const adGroups: string[] = [];
    // Remove special ADFS-prefix
    const adfsPrefix = 'helsinki1\\';
    decodedToken.ad_groups.forEach((adGroup: string) => {
      adGroups.push(adGroup.replace(adfsPrefix, '').toLowerCase());
    });

    if (adGroups.includes(Groups.SUPER_ADMIN)) {
      return UserRole.SUPER_ADMIN;
    }

    if (adGroups.includes(Groups.SANCTIONS_AND_REFUNDS)) {
      return UserRole.SANCTIONS_AND_REFUNDS;
    }

    if (adGroups.includes(Groups.SANCTIONS)) {
      return UserRole.SANCTIONS;
    }

    if (adGroups.includes(Groups.CUSTOMER_SERVICE)) {
      return UserRole.CUSTOMER_SERVICE;
    }

    if (adGroups.includes(Groups.PREPARATORS)) {
      return UserRole.PREPARATORS;
    }

    if (adGroups.includes(Groups.INSPECTORS)) {
      return UserRole.INSPECTORS;
    }
    return UserRole.NON_AD_GROUPS;
  }
  return UserRole.UNKNOWN;
};

export default useUserRole;
