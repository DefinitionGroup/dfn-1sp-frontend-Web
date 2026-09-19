import Page, {generateMetadata as pageMetadata} from '../../[slug]/page';

type Props = {params: Promise<{locale: string; slug: string}>};
const serviceParams = async (params: Props['params']) => {
  const {locale, slug} = await params;
  return {locale, slug: `services/${slug}`};
};
export const dynamicParams = true;
export const revalidate = 60;
export async function generateMetadata({params}: Props) {return pageMetadata({params: serviceParams(params)});}
export default async function ServicePage({params}: Props) {return Page({params: serviceParams(params)});}
