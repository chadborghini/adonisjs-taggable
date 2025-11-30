/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(_command: ConfigureCommand) {
  const codemods = await _command.createCodemods()

  /**
   * ----------------------------------------------
   * Publish migration: tags + taggables tables
   * ----------------------------------------------
   */
  await codemods.makeUsingStub(stubsRoot, 'migrations/create_db.stub', {
    prefix: Date.now(),
  })

  _command.logger.success('Published taggable migration')

  /**
   * ----------------------------------------------
   * Register provider in adonisrc.ts
   * ----------------------------------------------
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@chadborghini/adonisjs-taggable/taggable_provider')
  })

  _command.logger.success('Registered TaggableProvider')

  /**
   * Done!
   */
  _command.logger.success('Taggable package configured successfully!')
}
