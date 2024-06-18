# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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