[![Build Status](https://dev.azure.com/City-of-Helsinki/pysakoinnin-verkkokauppa/_apis/build/status/parking-permits-admin-ui%20Test?repoName=City-of-Helsinki%2Fparking-permits-admin-ui&branchName=develop)](https://dev.azure.com/City-of-Helsinki/pysakoinnin-verkkokauppa/_build/latest?definitionId=1132&repoName=City-of-Helsinki%2Fparking-permits-admin-ui&branchName=develop)
[![Continuous Integration](https://github.com/City-of-Helsinki/parking-permits-admin-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/City-of-Helsinki/parking-permits-admin-ui/actions/workflows/ci.yml)
[![SonarCloud Analysis](https://github.com/City-of-Helsinki/parking-permits-admin-ui/actions/workflows/analyze-code.yml/badge.svg)](https://github.com/City-of-Helsinki/parking-permits-admin-ui/actions/workflows/analyze-code.yml)

## Parking Permits Admin UI

Admin user interface for managing parking permits.

Related repositories:

[Customer UI](https://github.com/City-of-Helsinki/parking-permits-ui)

[Backend](https://github.com/City-of-Helsinki/parking-permits)

## Development

Prerequisites:

- Node.js: 24 (LTS)
- pnpm 11.28.5 or higher

The application requires a running parking-permits backend, you can find more details in [this repo](https://github.com/City-of-Helsinki/parking-permits) on how to set up the backend.

Clone the repository:

```bash
$ git clone git@github.com:City-of-Helsinki/parking-permits-admin-ui.git
```

Install the project:

```bash
$ cd parking-permits-admin-ui
$ pnpm install
```

Make a local `.env.template` copy:

```bash
$ cp .env.local.example .env.local
```

Run the application in the development mode:

```bash
$ pnpm start
```

## Available Scripts

In the project directory, you can run:

### `pnpm prepare`

Install pre-commit hooks with husky. You only need to run it once after installing the project.

### `pnpm start`

Run the app in the development mode. Open [http://localhost:3000/](http://localhost:3000/) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.\
If you make changes to the .env files., you need to re-start the development server

### `pnpm lint`

Lint code with ESLint

### `pnpm lint:fix`

Lint code with ESLint and try to fix errors

### `pnpm format`

Format code with prettier

### `pnpm test`

Runs the Vitest test suite in interactive watch mode (locally) or once and exits (in CI, detected automatically).\
Use `pnpm test:coverage` to run the tests once with a coverage report instead.

### `pnpm build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## License

The source code in this repository is licensed under the MIT License; see
[LICENSE](./LICENSE). The licenses of the third-party code included in the
production build are listed in `third-party-licenses.txt`, which is generated
during the build and served from the root of the deployed application. The
same information is emitted alongside it as `oss-licenses.json`, for license
audit tooling.

The MIT License covers source code only. The following files are **not**
covered by it and remain with their respective rights holders:

| Files                                         | Rights holder and terms                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `public/favicon.ico`                          | City of Helsinki. The City of Helsinki logo, a registered trademark.                                            |
| `src/assets/images/icon_poi_talo-sininen.svg` | Map marker icon created for the City of Helsinki parking services; not offered for reuse under the MIT License. |

The map tiles shown by the location picker are loaded at runtime from the tile
service configured in `REACT_APP_MAP_URL_TEMPLATE`, and remain with the Cities
of Helsinki, Espoo, Vantaa and Kauniainen, as attributed on the map.

The copy of [oidc-client-ts](https://github.com/authts/oidc-client-ts)
(Apache-2.0) used by [silent_renew.html](./public/silent_renew.html) is loaded
at runtime from cdnjs with a subresource integrity hash, and is not part of the
build output. The copy bundled into the application is listed in the generated
files.

The Helsinki Grotesk typeface used by the user interface is proprietary and
licensed by Camelot Typefaces. No font files are stored in this repository;
they are loaded at runtime from a City of Helsinki service. See
[index.scss](./src/index.scss).
