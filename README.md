[![Build Status](https://dev.azure.com/City-of-Helsinki/pysakoinnin-verkkokauppa/_apis/build/status/parking-permits-admin-ui%20Test?repoName=City-of-Helsinki%2Fparking-permits-admin-ui&branchName=develop)](https://dev.azure.com/City-of-Helsinki/pysakoinnin-verkkokauppa/_build/latest?definitionId=1132&repoName=City-of-Helsinki%2Fparking-permits-admin-ui&branchName=develop)

## Parking Permits Admin UI

Admin user interface for managing parking permits.

Related repositories:

[Customer UI](https://github.com/City-of-Helsinki/parking-permits-ui)

[Backend](https://github.com/City-of-Helsinki/parking-permits)

## Development

Prerequisites:

- Node.js: 14.x or higher
- yarn: 1.22.x or higher

The application requires a running parking-permits backend, you can find more details in [this repo](https://github.com/City-of-Helsinki/parking-permits) on how to set up the backend.

Clone the repository:

```bash
$ git clone git@github.com:City-of-Helsinki/parking-permits-admin-ui.git
```

Install the project:

```bash
$ cd parking-permits-admin-ui
$ yarn install
```

Make a local `.env.template` copy:

```bash
$ cp .env.template .env.development.local
```

Run the application in the development mode:

```bash
$ yarn start
```

## Available Scripts

In the project directory, you can run:

### `yarn prepare`

Install pre-commit hooks with husky. You only need to run it once after installing the project.

### `yarn start`

Run the app in the development mode. Open [http://localhost:3000/](http://localhost:3000/) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.\
If you make changes to the .env files., you need to re-start the development server

### `yarn lint`

Lint code with ESLint

### `yarn lint:fix`

Lint code with ESLint and try to fix errors

### `yarn format`

Format code with prettier

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
