import { type SchemaTypeDefinition } from 'sanity'
import page from './page'
import menu from './Global/components/menu'
import caseStudy from './Global/Cases/caseStudy'
import unitCase from './Global/Cases/unitCase'
import client from './Global/Cases/client'
import person from './Global/Cases/person'
import { OneSPschemaTypes } from './1spContent'
import link from './Global/Objects/link'
import cta from './Global/Objects/cta'
import paragraph from './Global/Objects/paragraph'
import size from './Global/Objects/size'
import services from './Global/Objects/services'
import serviceGroup from './Global/Objects/serviceGroup'
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [page, menu, caseStudy, unitCase, client, person, ...OneSPschemaTypes, link, cta, paragraph, size, services, serviceGroup],
}
