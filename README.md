# ToxTime

## Requirements

- Node.js v12.13.0 or newer ([download here](https://nodejs.org/en/))
- NPM v6.12.1 or newer (comes with nodejs)
- MongoDB v4.4.2 or newer ([download here](https://www.mongodb.com/try/download/community))

## Project setup

1. Install Node.js
2. Install mongoDB and configure a valid user.
   - Skipping user creation for testing is ok.
   - Do not configure a database for this application. It will be created automatically on first start.
3. Go to the root folder of the application `cd /path/to/my/project`
4. Run `npm run setup` in a command line tool like CMS, Powershell or Terminal
   - Skip database user and database password if no database user was created
   - A system user will be created at the end of configuration process
5. Check the `/var/log/error.log` and `/var/log/stdout.log` for errors and success messages
6. The application should be accessible via `<domain>:<port>` or at least via `localhost:80`. See `/var/log/stdout.log` and `/var/log/error.log` for more information.

## General commands

All commands are available in the root folder of the application:

- `npm run setup` starts the full installation of the application
- `npm run upgrade` installs new dependencies of the new copied files of the application
- `npm run config` starts the config wizard of the application
- `npm run start` starts the server
- `npm run stop` stops the server
- `npm run restart` restarts the server
- `npm run logrotate` rotates the logs in /var/log. Means: The newest will be renamed and the overwritten with an empty log
- `npm run startup [platform]` creates a autostart script for the platform or it will be auto detected
- `npm run unstartup [platform]` removes the autostart for the platform or it will be auto detected

### HINT: platform can be one of

[ubuntu | ubuntu14 | ubuntu12 | centos | centos6 | arch | oracle | amazon | macos | darwin | freebsd | systemd | systemv | upstart | launchd | rcd | openrc]
Not supported on windows!

## Configuration

To configure this application, open the `config.yaml` file and edit or add values of the "env" section.

For example:

```yaml
APP_HOST: 0.0.0.0
APP_SECURE: false
APP_HTTP_PORT: 1337
APP_HTTPS_PORT: 1338
APP_TRUST_PROXY: false
```

if there are any questions about which possibilities are available,
see the ecosystem.config.js or type `npm run config`
After changing the config, you have to restart the server with `npm restart`

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
- See [Configuration Reference For PM2](https://pm2.keymetrics.io/docs/usage/application-declaration/)
