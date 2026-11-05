import type { ThirdPartyLicensesConfig } from '@city-of-helsinki/license-notices/rsbuild';

/**
 * Everything about the third-party license notices that is specific to this
 * repository. The generator itself comes from the license-notices package and
 * knows nothing about this project.
 */
export const thirdPartyLicensesConfig: ThirdPartyLicensesConfig = {
  repositoryUrl: 'https://github.com/City-of-Helsinki/parking-permits-admin-ui',

  licenseDecisions: {
    ibantools: {
      declared: 'MIT or MPL-2.0',
      license: 'MIT',
      note:
        'Offered by its author under "MIT OR MPL-2.0". This distribution ' +
        'elects MIT, so the MPL-2.0 obligations do not apply to this ' +
        'component.',
    },
  },

  sassResolvedPackages: ['hds-design-tokens'],
};
