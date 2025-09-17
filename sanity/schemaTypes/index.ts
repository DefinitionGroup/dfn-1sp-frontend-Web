import { type SchemaTypeDefinition } from 'sanity'
import page from './page'
import menu from './Global/components/menu'
import caseStudy from './Global/Cases/caseStudy'
import unitCase from './Global/Cases/unitCase'
import { OneSPschemaTypes } from './1spContent'
import link from './Global/Objects/link'
import cta from './Global/Objects/cta'
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [page, menu, caseStudy, unitCase, ...OneSPschemaTypes, link, cta],
}
