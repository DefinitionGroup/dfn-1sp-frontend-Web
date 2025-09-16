import { type SchemaTypeDefinition } from 'sanity'
import page from './page'
import menu from './Global/components/menu'
import caseStudy from './Global/Cases/caseStudy'
import unitCase from './Global/Cases/unitCase'
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [page, menu, caseStudy, unitCase],
}
