# ToxTime

## Requirements

- Node.js v12.13.0 or better
- NPM v6.12.1 or better
- MongoDB v4.4.2 or better

## Project setup

1. Install mongoDB (see [MongoDB website](https://www.mongodb.com/try/download/community)) and configure a valid user. Do not configure a database for this application. It will be created automatically on first start.
2. Configure the application in the "env" section of the config.json in root folder
3. Install other dependencies with `npm install`
4. Start the application with `npm start`

## Configuration

To configure this application, open the `config.json` file and edit or add values of the "env" section.

For example:

```json
{
  "verbose": false,
  "restartable": "rs",
  "env": {
    "NODE_ENV": "production"
    // Other configuration
  }
}
```

**NODE_ENV:**

Defines the environment in which the application is running.

- Type: string
- Default: production
- Possible values: production, development

**DEBUG:**

Enables or disables debug information printed to the logs. This will increase the ammount of output significant.

- Type: boolean
- Default: false

**APP_HOST:**

The network interface on which the webserver should listen.
Use 0.0.0.0 to listen to all interfaces, localhost to listen only to the local interface or a specific IP address.

- Type: string
- Default: localhost
- Required: No

**APP_PORT:**

The port on which the webserver should listen. Ensure that this port is not used by another application. Otherwise this application will not start.

- Type: number
- Default: 80
- Required: No

**DB_HOST:**

The IP address for database communication.

- Type: string
- Default: localhost
- Required: No

**DB_PORT:**

The port for database communication.

- Type: number
- Default: 27017
- Required: No

**DB_DATABASE_NAME:**

The name of the database where the data should be stored.

- Type: string
- Required: Yes

**DB_USER:**

The user name for database communication. This user should have database creation rights
as well as collection creation and modification rights.

- Type: string
- Default: ""
- Required: No

**DB_USER_PASSWORD:**

The password for the database user.

- Type: string
- Default: ""
- Required: No

## Development

### Compiles and hot-reloads for development

```bash
npm run dev
```

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

### Start for development

```bash
npm run dev:serve
```

### Start for production

```bash
npm start
```

### Customize configuration

- See [Configuration Reference For VUE](https://cli.vuejs.org/config/)
- See [Configuration Reference For NODEMON](https://github.com/remy/nodemon/blob/master/lib/config/defaults.js)
