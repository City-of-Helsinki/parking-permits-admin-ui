# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.3] - 2025-03-06
### Changed

- Change button text when creating new resident permit ([3816d95](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/3816d959873c3db23649fe50c4c2d043c2dfef3c))
- Remove 2 week limit for temporary vehicle ([285e281](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/285e28161ce2613c776e6110ba738ac35fe57647))

## [1.5.2] - 2025-02-06

### Fixed

- Use lazy query in address pagination ([09410c9](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/09410c95e6033ecdb76cb605a0820597a0f4a789))
- Issues caused by API token renewal ([e73a4dd](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/e73a4ddc13f40734bc42480b76e982f65ff4fb76))
- Fix paginator and datatable layouts ([f2f0326](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/f2f0326805a7efacca746a5e91dbe0e4cef27a2b))
- Fix date formatting which sometimes caused incorrect year to appear ([92ec33f](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/92ec33ff7c85b9524f81102bd0be6e1db55d69ff))
- Add localization to time so it is displayed in local time and with correct localization. ([3aae664](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/3aae664a91d094a14d4ab2d1e4f1080c44d36025))

### Changed

- Update to use nginx v1.24 ([8fdefbd](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/8fdefbd8b6b22cb26eb6dfeadbfc18dfa4ccc1b0))

## [1.5.1] - 2024-12-13

### Fixed

- Use permit id from response ([42ac4d2](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/42ac4d2b914e75b870e8b040550133347f63573e))

## [1.5.0] - 2024-12-09

### Added

- Copy HDS login module ([85b563e](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/85b563e539f0d9eee8415d50f71a0228fc15274f))
- Use the ApolloClient module ([29ff2cf](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/29ff2cf748460b061eff131d8eee0267093b8a7d))

### Changed

- Move callback to routes ([a98f1fa](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/a98f1faf16d239a38a093f2b44bb9c9337968f69))
- Use useApiTokensClientTracking to refresh client tokens when tokens are renewed ([b1b7e00](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/b1b7e0096ec257a8442662c2b0dec984ebc4d1b7))

### Fixed

- Fix page contents emptying when tokens are renewed ([8467c6f](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/8467c6f1b60f291dc1c86fc96272f0854d180e8e))

## [1.4.0] - 2024-11-25

### Added

- Allow draft-permit creation ([4943a22](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/4943a228a34f1737abcd5622eaf08a1f99f43efc))
- Add silent_renewal-template ([e90cb48](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/e90cb487b2ba7884583d8b5473a9751dbec34d46))
- Add support for permit preliminary-status ([e90cb48](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/12adc867ef05f593f46d3c1004f15476efbffe12))

### Changed

- Switch order of radio buttons ([5b52516](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/5b52516caf701326c98be0a1f76e1f291e8f353d))
- Switch to keycloak authentication ([43dd9b4](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/43dd9b42ac599abd7021da786028d6b6fa7e9679))
- Set automaticSilentRenew always true ([9d90965](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/9d90965dbf1b937896fca1e27a7394dc118de9609))
- Track if api tokens have been fetched once ([eef8f5a](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/eef8f5a16c40d81894657ca44f769dcea87ecc34))
- Hide ALL-status from permit forms ([4304194](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/4304194e121d6429b3be1d47d7c4fcc8756e4df7))
- Update fi/sv/en-translations ([eb89290](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/eb89290ee824910f2a0ee6d9ad15990a1b67383f))

### Fixed

- Fix wrong timestamp ([bd2b0df](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/bd2b0df96123df4ccde7a9669c8214e04a09e6a5))
- Fix HDS Notification dialog layout ([e0d77a9](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/e0d77a912bb8b11cf4dbd2a439b5f6086b4ed95c))

### Removed

- Remove unnecessary api token fetch ([01dae43](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/01dae43b77b8bd68acc898afa14c32913b2a52f5))
- Remove renewal checks ([e3c36f7](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/e3c36f710b7644af5e450f826763be8c5f9fd889))
- Remove StrictMode ([1b167cc](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/1b167cc700bf55123047b3dd80f339d684d87d61))

## [1.3.0] - 2024-11-14

### Added

- Update refunds to support multiple orders ([7e9460a](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/7e9460a3741d56a070dfc666ca56f92627ac64c3))

### Changed

- Convert to use HDS login component ([b34ee90](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/b34ee902d2a6092cab49017c2757be372f96ca48))
- Update hds-react to 3.11.0 ([3d71b63](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/3d71b63bba980a38c350c1f433ac45818662dfbd))

### Fixed

- Fix bug where api tokens are not available on first page load ([29fca4a](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/29fca4a5b6c361b768d6db9624f1c268da033844))
- Reload page after login ([c7bbd93](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/c7bbd938fea793ebee6ff221e6680fddf34ad36b))

## [1.2.0] - 2024-08-30

### Added

- Add accessibility report to footer ([f31cfdc](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/f31cfdce471caff6337b7f42503518ba7ab5667e))

### Changed

- Update hds-react ([d399f7e](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/d399f7e28e2159a4aa3c1335f4d08543d1b5581f))
- Update react to version 18 ([2a0d79c](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/2a0d79c29597ab357b83592df7bed6176829f682))
- Update packages ([e816696](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/e81669697c5f6859850d84b09fff3b77ea123318))
- Use AWS ECR Docker image repository ([aae00bb](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/aae00bb28c4b5614f8baf03ac8923f7e4b162918))
- Allow one day selection with Admin UI temporary vehicles ([aae00bb](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/2aa05af609d1d11f1d494276c999810024e733a2))
- Update VAT-texts ([2b6a105](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/2b6a10513bc15e261ece6b4298464c8aea8e2f01))
- Update permit prices layout ([74ff198](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/74ff198beb208761807c4f5a62118cac86095280))

### Fixed

- No longer remove customer email or phone when re-fetching customer data from DVV ([d22ee04](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/d22ee04063f8b2fc7319f8376e827f581fabc09a))
- Update VAT-format ([315e675](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/315e675ebf34cf4835edb58d7ce2c83199f7330b))

## [1.1.0] - 2024-06-19

### Added

- Add changelog to project ([4cf3911](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/4cf3911311b9dad051d8fde51cbc167d1fbeef82))

### Changed

- Allow permit editing for all cases except closed ([c4ca6f5](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/c4ca6f584b7e9efa26c97e69211a16fccdae666a))
- Update application packages ([0761628](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/076162817b03a7a00bab29ce02b87524cc8da90c))
- Use calc-function for border-radius calculation ([047981d](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/047981dae165c3b23512793da5805a87a9f910ce))
- Update Azure CI-settings ([ddac505](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/ddac5059d1218398a89ceed827cacf13ebeb7790))
- Update README ([8d5bfec](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/8d5bfec2d8a2248514704168c89a93b9b6c964c9))

### Removed

- Remove obsolete Docker Compose version ([d34dc3c](https://github.com/City-of-Helsinki/parking-permits-admin-ui/commit/d34dc3c0464d2df45d94a3ad29b15ea45ada77bd))

## [1.0.0] - 2024-06-12

* A starting layout for the admin ui app by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/1
* Docker setup by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/3
* Setup project with OIDC authentication  by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/2
* Add husky git pre-commit hooks by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/4
* Show permits data table in permits page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/5
* Implement column sorting for permits datatable by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/6
* Pipeline triggers for develop branch by @jannetasa in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/8
* Pipeline triggers for main branch by @jannetasa in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/9
* Use test backend for REACT_APP_PARKING_PERMIT_ADMIN_API in .env by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/7
* Merging develop to main by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/10
* Run github action CI by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/11
* Update README.md by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/12
* Update environment variables naming by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/13
* Integrate with SonarCloud by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/14
* Implement permits search by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/15
* Persist permits search by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/16
* Add a dummy permit detail page which opens when clicking permits table rows by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/17
* Implement basic permit detail page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/18
* Include a icon prefix to status label by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/19
* Fix hard-coded permit id for permit detail view by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/20
* Include changelogs in permit detail page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/21
* Replacing css variable syntax with scss variable syntax for HDS variables by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/22
* Create navigation routes and page for selecting which permit type to create by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/23
* Creating Resident Permit by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/24
* Various UI fixes by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/25
* Update favicon and app title by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/26
* Add more fields to mock vehicle data by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/27
* Implement end permit UI by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/28
* Minor ui fix by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/29
* Handle errors with a toast error message by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/30
* Update create resident permit layout by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/31
* Disable names fields if security ban is checked by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/32
* Handle errors for searching customer/vehicle and creating permits by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/33
* Update time formatting by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/34
* Implement editing permit page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/35
* Exclude zone id field from queries by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/36
* Show product list prices in PermitDetail, EditResidentPermit and CreateResidentPermit page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/37
* Create super admin layout and a dummy products page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/38
* Add product list page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/39
* Implement edit product page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/40
* Implement create product page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/41
* Make product form zone select wider by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/42
* Remove holder from vehicle node query by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/43
* Implement real time address search by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/44
* Auto select zone by address by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/45
* Update refund interface and add refund list page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/46
* Update scopes and client_id by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/48
* Implement refund detail page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/47
* Show a confirm payment dialog before permit is created by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/49
* Show total results in datatable by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/50
* Update resident permit refund: refund, extra payment and no price change cases by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/51
* Disable the number input and date input when editing permits by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/52
* Fix end permit layout by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/53
* Update customer name display format by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/54
* Validate IBAN input by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/55
* Allow creating/updating permits with description by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/56
* Disable and uncheck consent low emission if low emission is unchecked by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/57
* Merge develop to main by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/58
* Merge develop to main by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/59
* Seperate last name and first name with a comma by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/60
* Improve address UI by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/61
* Merge develop to main by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/62
* Auto-select the zone when fetch profile from backend or switch the address by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/63
* Remove sourceSystem and sourceId from addresses by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/64
* Remove address source system by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/65
* Fix address saving issue by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/70
* Upgrade dependencies by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/71
* Admin UI Orders list view by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/72
* Vehicle use low emission fields instead of checkbox by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/73
* Merge develop to main by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/74
* Disable create button if customer already have two active permits by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/75
* Update azure-pipelines-develop.yml by @lorand-ibm in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/76
* Add batch trigger to azure-pipelines-release.yml by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/79
* Allow exporting data as csv files for permits, orders, refunds and products by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/78
* Add an addresses view by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/81
* Allow super admin to edit addresses by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/82
* Update interface to match data model fields update by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/83
* Fix order/refund data interfaces after refactoring models by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/84
* Low emission criteria super admin list view by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/85
* Add edit/create low emission criterion pages by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/86
* Add a readonly zone field to AddressForm by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/87
* Fetch permit prices from backend by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/88
* Create links to permit details in orders page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/89
* Remove the obsolete monthly price by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/91
* Improve permit search filters by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/90
* Apply no-cache fetch policy for queries by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/92
* Refactor address form by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/93
* Refactor low emission form by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/94
* Fix permit pricing not updated on creating resident permit by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/95
* Download Parking Permit as PDF by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/96
* Add refunds search to refunds page by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/98
* Enable datatable checkbox selection by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/99
* Add "Download refund details as PDF"-functionality by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/100
* Allow admins to request refunds for approval and accept refunds by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/101
* Show more fields to refunds datatable by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/102
* Add Delete confirmation dialogs for SuperAdmin forms by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/103
* Refactor datatable search, pagination and ordering by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/104
* PV-257: Add CookieHub widget (cookie consent) by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/106
* PV-438: Fix refund detail page error by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/109
* Revert "PV-257: Add CookieHub widget (cookie consent)" by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/110
* Add pull request template by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/113
* Fix/pv 257 cookie consent by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/111
* Add Sentry-integration by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/114
* Use env template for environment variables by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/116
* Bump async from 2.6.3 to 2.6.4 by @dependabot in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/80
* Remove package-lock.json since yarn is used by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/118
* [Snyk] Upgrade @types/node from 12.20.47 to 12.20.55 by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/123
* [Snyk] Upgrade @apollo/client from 3.6.1 to 3.6.9 by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/122
* [Snyk] Upgrade react-i18next from 11.16.2 to 11.18.6 by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/121
* [Snyk] Upgrade i18next from 21.6.14 to 21.9.1 by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/120
* [Snyk] Upgrade typescript from 4.4.4 to 4.8.3 by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/119
* [Snyk] Upgrade hds-design-tokens from 1.12.0 to 1.15.0 by @snyk-bot in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/128
* [Snyk] Upgrade eslint-plugin-prettier from 4.0.0 to 4.2.1 by @snyk-bot in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/127
* [Snyk] Upgrade date-fns from 2.28.0 to 2.29.2 by @snyk-bot in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/126
* [Snyk] Upgrade @types/react from 17.0.44 to 17.0.49 by @snyk-bot in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/124
* PV-402: Add search parameters in the orders view by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/130
* Fix Address component save button always being disabled by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/134
* PV-346: Add announcements superadmin panel by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/135
* PV-453/PV-433/PV-458: In refunds/permits, add search buttons, make the query lazy and unify the styles by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/136
* Role base access control admin UI by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/138
* PV-421/PV-444: Add customers panel in superadmin, add retrieve customer data button by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/139
* Update Admin UI layouts by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/141
* Remove draft-status from search criteria by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/142
* PV-459: Add address search parameters by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/143
* PV-463: Fix orders CSV export by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/144
* Role base access control for inspectors by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/140
* Add swedish city field to Address-form by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/145
* Vehicle power type by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/147
* Clear name and address fields always when "Non-disclosure for personal safety"-checkbox is enabled by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/148
* Fix: Add missing subfields for vehicle powerType queries by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/149
* Fix inspectors not being able to search the permits by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/150
* Minimum role to create a permit is customer service by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/151
* Non ad group user by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/152
* Fix: Fix powerType in convertToVehicleInput by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/153
* Prevent closed permit editing in Admin UI by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/155
* Show permit creation error messages properly by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/156
* Feat/temporary vehicle support by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/157
* Finetune Orders- and Permits-views by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/159
* PV-350: Update parking permit history by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/158
* Disable permit row-clicks and CSV-export from inspectors by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/161
* Use contract type from the permit-object itself by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/162
* PV-350: Add temporary vehicles events, fix event column by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/163
* Fix end permit refunding to work by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/164
* Update permit form end date handling by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/165
* Update all prices to have two decimals by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/166
* Prevent future starting open-ended permit editing by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/167
* Fix/permit editing admin by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/168
* Update SuperAdmin form buttons by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/170
* Remove unnecessary address type text by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/171
* Add location to the address search query by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/172
* Fix address search with loading by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/173
* PV-519: Show the current period end time for open-ended permits by @danipran in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/178
* Add apartment support for addresses by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/181
* Add footer-panel to Admin UI by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/182
* Add browser reload to user info poll on session timeout by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/183
* Use user selected language for all backend error messages by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/184
* Change default status to “All” in Permits search by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/185
* Always enable customer search button by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/186
* Refreshing the page in admin pages takes the user back to permits by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/187
* Admin UI: Footer of the page interferes with the bottom selection by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/188
* Fix swedish translation typo by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/189
* Ensure better precision in formatting prices by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/190
* Remove crossed out discount prices from UI by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/191
* Fix IBAN checking logic from permit edit preview by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/192
* Fix new price and total for all months in summary by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/193
* Reset permit fields on person and vehicle search by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/194
* Ensure other address is only selected if available by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/196
* Set default to empty string if no order permits by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/197
* Add Traficom copyrights for vehicle fields by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/198
* Add rules for editing permit by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/199
* Add restrictions message to vehicle registration on permit lookup by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/201
* Disable Traficom-fetched vehicle informations by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/202
* Updated translations for Traficom messages by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/203
* Add pre-wrap style to notification to handle line breaks by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/204
* Remove IBAN and refund status rules for disabling "Save" button on edit by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/205
* Translations updates by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/206
* Use only one backend-url as environment variable by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/210
* Set HETU to upper case when updating customer data by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/209
* Enforce start date for admin UI new permit start date by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/211
* Add permit cancelled status by @mhieta in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/213
* Extend permit page by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/215
* Add new Change history types to GraphQL and translations. by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/216
* Use canAdminExtendPermit property by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/217
* Show temporary vehicle times in permit detail page. by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/218
* Set correct address apartment when switching from primary to/from temp by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/219
* Ensure that either primary or secondary address is selected. by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/220
* Handle address fields from customer query- by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/221
* Set start date to current date by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/222
* Admin UI search fixes by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/223
* Add Talpa order ID column to orders by @tonipel in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/224
* Change order date search text by @tonipel in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/225

## New Contributors
* @mingfeng made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/1
* @jannetasa made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/8
* @amanpdyadav made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/48
* @lorand-ibm made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/76
* @danipran made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/106
* @dependabot made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/80
* @snyk-bot made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/128
* @tonipel made their first contribution in https://github.com/City-of-Helsinki/parking-permits-admin-ui/pull/224

**Full Changelog**: https://github.com/City-of-Helsinki/parking-permits-admin-ui/commits/release-1.0.0
