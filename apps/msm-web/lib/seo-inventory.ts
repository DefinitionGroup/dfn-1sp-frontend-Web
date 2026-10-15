import {cache} from 'react';
import {sanityFetch} from '@1sp/sanity-queries/fetch';
import {buildMsmSeoInventory, MSM_SEO_INVENTORY_QUERY, type MsmSeoDocument, type MsmTranslation} from './seo-routes';

export const getMsmSeoInventory = cache(async () => {
  const {data} = await sanityFetch({query: MSM_SEO_INVENTORY_QUERY, perspective: 'published', stega: false,
    tags: ['pages', 'cases', 'msmUnits', 'people', 'msm-seo']});
  return buildMsmSeoInventory(data.documents as MsmSeoDocument[], data.translations as MsmTranslation[]);
});
