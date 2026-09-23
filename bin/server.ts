/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

await import('reflect-metadata')
const { Ignitor, prettyPrintError } = await import('@adonisjs/core')

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    /**
     * Galaxy Cloud (and likely other platform-managed hosts) has no deploy
     * hook to run `node ace migration:run` after a deploy, and its SQLite
     * mode also gets a brand new, empty file on every deploy (ephemeral
     * container filesystem) — so pending migrations must run at boot, not
     * be a manual step. Lucid's migration locking makes this safe even if
     * multiple instances boot at once.
     */
    app.ready(async () => {
      if (!app.inProduction) return

      const { default: logger } = await import('@adonisjs/core/services/logger')
      const db = await app.container.make('lucid.db')
      const { MigrationRunner } = await import('@adonisjs/lucid/migration')
      const migrator = new MigrationRunner(db, app, { direction: 'up' })

      // Deliberately never call migrator.close() here — unlike the
      // migration:run command's own process, this runs inside the
      // long-lived server process, and close() calls db.manager.closeAll(),
      // which would tear down the app's own primary connection.
      await migrator.run()
      if (migrator.status === 'error') {
        throw migrator.error
      }
      logger.info(
        { migrated: Object.keys(migrator.migratedFiles).length },
        'ran pending migrations at boot'
      )
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start()
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
