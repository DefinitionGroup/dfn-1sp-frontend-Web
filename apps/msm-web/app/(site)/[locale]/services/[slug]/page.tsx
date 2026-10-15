import Page, {generateMetadata as pageMetadata} from '../../[slug]/page';
import {getMsmSeoInventory} from '@msm/lib/seo-inventory';

type Props = {params: Promise<{locale: string; slug: string}>};
const serviceParams = async (params: Props['params']) => {
  const {locale, slug} = await params;
  return {locale, slug: `services/${slug}`};
};
// Service pages are `page` documents slugged `services/<slug>`.
export const dynamicParams = true;
export async function generateStaticParams() {
  const routes = await getMsmSeoInventory();
  return routes.filter(route => route._type === 'page' && /^services\/[^/]+$/.test(route.path))
    .map(route => ({locale: route.language || 'en', slug: route.path.slice('services/'.length)}));
}
export async function generateMetadata({params}: Props) {return pageMetadata({params: serviceParams(params)});}
export default async function ServicePage({params}: Props) {return Page({params: serviceParams(params)});}
