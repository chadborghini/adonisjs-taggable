// src/providers/taggable_provider.ts

import type { ApplicationService } from '@adonisjs/core/types'
import { morphMap, MorphMapManager } from '@holoyan/morph-map-js'

import { Tcl, TclManager } from '../src/tcl.js'
import ModelManager from '../src/model_manager.js'

import Tag from '../src/models/tag.js'
import Taggable from '../src/models/taggable.js'

// ✔ This stays exactly as is
declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    taggableMorphMap: MorphMapManager
    tclModelManager: ModelManager
    tcl: TclManager
  }
}

export default class TaggableProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register into IoC container
   */
  register() {
    /**
     * Register global morphMap so decorators work
     */
    this.app.container.singleton('taggableMorphMap', () => morphMap)

    /**
     * Register the Tcl ModelManager
     */
    this.app.container.singleton('tclModelManager', () => {
      const manager = new ModelManager()

      // Register internal models
      manager.setModel('tag', Tag)
      manager.setModel('taggable', Taggable)

      return manager
    })

    /**
     * Register the singleton TclManager instance
     */
    this.app.container.singleton('tcl', () => Tcl)
  }

  /**
   * Boot phase — wire dependencies into TclManager
   */
  async boot() {
    const modelManager = await this.app.container.make('tclModelManager')
    const map = await this.app.container.make('taggableMorphMap')

    // Inject dependencies into TclManager (ACL-style)
    TclManager.setModelManager(modelManager)
    TclManager.setMorphMap(map)
  }
}
