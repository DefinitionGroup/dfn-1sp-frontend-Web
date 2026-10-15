"""Read-only source recovery for the approved MSM rewrite. HTML remains in EXPORT."""
import concurrent.futures, hashlib, json, pathlib, re, urllib.request
from urllib.parse import urljoin
from bs4 import BeautifulSoup

root = pathlib.Path('EXPORT/msm-rewrite/legacy')
root.mkdir(parents=True, exist_ok=True)
rows = json.loads(pathlib.Path('scripts/data/msm-rewrite-v1.json').read_text())

def read(url):
    path = root / (hashlib.sha256(url.encode()).hexdigest()[:20] + '.html')
    try:
        if not path.exists():
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=35) as response:
                path.write_bytes(response.read())
        soup = BeautifulSoup(path.read_bytes(), 'html.parser')
        main = soup.select_one('main') or soup.select_one('article') or soup.body
        def meta(key):
            el = soup.find('meta', attrs={'property':key}) or soup.find('meta', attrs={'name':key})
            return el.get('content') if el else None
        # Shared navigation is not a case/service relationship. Keep page-owned cards.
        for tag in main.select('script,style,nav,footer,section#footer,amp-sidebar'):tag.decompose()
        project_cards = []
        for card in main.select('.project'):
            targets = list(dict.fromkeys(urljoin(url,a['href']) for a in card.select('a[href]') if '/project/' in a['href']))
            categories = list(dict.fromkeys(a.get_text(' ',strip=True) for a in card.select('a[href*="archive="]')))
            for target in targets:project_cards.append({'url':target,'categories':categories})
        leaders = []
        for card in main.select('.person'):
            profile = card.select_one('a[href*="/people/"]')
            email = card.select_one('a[href^="mailto:"]')
            phone = card.select_one('a[href^="tel:"]')
            headings = card.select('h2')
            role = card.select_one('h5')
            if email:leaders.append({'profile':urljoin(url,profile['href']) if profile else None,'email':email['href'][7:],'phone':phone['href'].replace('tel: ', 'tel:') if phone else None,'position':role.get_text(' ',strip=True) if role else None,'quote':headings[0].get_text(' ',strip=True) if len(headings)>1 else None})
        links = [{'url':urljoin(url,a['href'].strip()), 'text':a.get_text(' ',strip=True)} for a in main.select('a[href]')]
        images = [urljoin(url,i.get('data-src') or i.get('src')) for i in main.select('img,amp-img') if i.get('data-src') or i.get('src')]
        for tag in main.select('[style]'):
            images += [urljoin(url,u.strip('"\'')) for u in re.findall(r'url\(([^)]+)\)',tag['style'])]
        videos = [urljoin(url,v['src']) for v in main.select('video[src],video source[src],amp-video[src],amp-video source[src]') if not v.find_parent(class_='project') and not v.find_previous('h1')]
        hero_images = [urljoin(url,i.get('data-src') or i.get('src')) for i in main.select('img,amp-img') if (i.get('data-src') or i.get('src')) and not i.find_parent(class_='project') and not i.find_previous('h1')]
        for tag in main.select('[style]'):
            if not tag.find_parent(class_='project') and not tag.find_previous('h1'):hero_images += [urljoin(url,u.strip('"\'')) for u in re.findall(r'url\(([^)]+)\)',tag['style'])]
        quote_attribution = next((h.get_text(' ',strip=True).lstrip(' —–-') for h in main.select('h5') if h.get_text(' ',strip=True).startswith(('—','–'))), None)
        legal = soup.select_one('.content-page')
        legal_blocks = []
        if legal:
            for index, el in enumerate(legal.select('h2,h3,h4,h5,h6,p,li')):
                if el.name == 'p' and el.find_parent('li'): continue
                text = el.get_text(' ',strip=True)
                if not text:continue
                mark_links = []
                spans = []
                for node in el.descendants:
                    if not isinstance(node, str) or not str(node).strip():continue
                    anchor = node.find_parent('a')
                    marks = []
                    if anchor and anchor.get('href'):
                        k = 'link-' + str(len(mark_links))
                        mark_links.append({'_type':'link','_key':k,'href':urljoin(url,anchor['href'])})
                        marks = [k]
                    spans.append({'_type':'span','_key':'span-'+str(len(spans)),'text':str(node),'marks':marks})
                legal_blocks.append({'_type':'block','_key':'legal-'+str(index),'style':'h3' if el.name.startswith('h') else 'normal','markDefs':mark_links,'children':spans,**({'listItem':'bullet','level':1} if el.name=='li' else {})})
        for tag in main.select('script,style,nav,footer'):tag.decompose()
        return url, {'leaders':leaders,'projectCards':project_cards,'heroImages':list(dict.fromkeys(hero_images)),'quoteAttribution':quote_attribution, 'legalBlocks':legal_blocks, 'title':meta('og:title'), 'description':meta('description'), 'image':meta('og:image'), 'images':list(dict.fromkeys(images)), 'videos':videos, 'links':links, 'alternates':{a.get('hreflang'):a['href'] for a in soup.select('link[hreflang][href]')}, 'text':main.get_text('\n',strip=True), 'headings':[h.get_text(' ',strip=True) for h in main.select('h1,h2,h3,h4')], 'forms':[{'action':f.get('action'),'id':f.get('id')} for f in main.select('form')]}
    except Exception as error:
        return url, {'error':str(error)}

if __name__ == '__main__':
    urls = list(dict.fromkeys(r['url'] for r in rows))
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for url, data in pool.map(read, urls):
            results[url] = data
            if len(results)%20 == 0:print(f'Recovered {len(results)}/{len(urls)}',flush=True)
    pathlib.Path('scripts/data/msm-legacy-v1.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    print('Complete',len(results),'errors',sum('error' in v for v in results.values()))
