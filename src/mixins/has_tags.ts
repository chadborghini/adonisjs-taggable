// src/mixins/has_tags.ts

import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'

import { Tcl } from '../tcl.js'
import { TaggableModelInterface, ModelIdType } from '../types.js'

/**
 * hasTags() Mixin
 *
 * Adds tagging functionality to any Lucid model.
 *
 * IMPORTANT:
 * - The model MUST implement `getModelId()` and return its primary key.
 * - This requirement exists because Lucid models may use numbers, strings, or UUIDs.
 *
 * Example usage:
 *
 *   export default class Post extends compose(BaseModel, hasTags()) {
 *     getModelId() {
 *       return this.id
 *     }
 *   }
 */
export function hasTags() {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class HasTagsMixin extends superclass implements TaggableModelInterface {
      /**
       * Must be implemented by the consumer model.
       * Should return the model’s primary key (number, string, or UUID).
       */
      getModelId(): ModelIdType {
        throw new Error('You must implement getModelId() in your model when using hasTags() mixin.')
      }

      /**
       * Get a query builder for the tags attached to this model.
       *
       * This behaves similarly to a Lucid relationship:
       *   - `await model.tags()`        → fetch all tags
       *   - `model.tags().where(...)`   → continue querying
       *   - `model.tags().first()`      → fetch a single tag
       *
       * NOTE:
       * This does NOT return Tag[] directly — it returns a QueryBuilder.
       */
      async tags() {
        return Tcl.model(this).tags()
      }

      /**
       * Fetch all tags for this model and return them as an array of Tag instances.
       *
       * Unlike `tags()`, this method EXECUTES the query immediately.
       * Always resolves to Tag[].
       */
      async loadTags() {
        return Tcl.model(this).loadTags()
      }

      /**
       * Attach a tag to this model.
       *
       * If the tag does not exist, it will be created automatically.
       */
      async attachTag(name: string) {
        return Tcl.model(this).attach(name)
      }

      /**
       * Detach a tag from this model.
       * Accepts tag names, slugs, or IDs.
       */
      async detachTag(name: string) {
        return Tcl.model(this).detach(name)
      }

      /**
       * Replace all existing tags with the provided list.
       */
      async syncTags(names: string[]) {
        return Tcl.model(this).sync(names)
      }

      /**
       * Determine whether the model has a given tag.
       * Comparison is made using slug matching.
       */
      async hasTag(name: string) {
        const tags = await this.tags()
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        return tags.some((t) => t.slug === slug)
      }
    }

    return HasTagsMixin
  }
}
