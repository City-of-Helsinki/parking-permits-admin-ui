import { thirdPartyLicensesConfig } from '../thirdPartyLicenses.config.mts';

describe('thirdPartyLicensesConfig', () => {
  // The election is the one decision in the notices that a reader cannot
  // verify from the bundle alone, so losing it has to fail a test.
  it('elects MIT for the dual-licensed ibantools', () => {
    const decision = thirdPartyLicensesConfig.licenseDecisions?.ibantools;

    expect(decision?.license).toBe('MIT');
    expect(decision?.declared).toBe('MIT or MPL-2.0');
    expect(decision?.note).toContain('"MIT OR MPL-2.0"');
  });

  it('lists the Sass-inlined packages the bundler cannot see', () => {
    expect(thirdPartyLicensesConfig.sassResolvedPackages).toContain(
      'hds-design-tokens'
    );
  });
});
