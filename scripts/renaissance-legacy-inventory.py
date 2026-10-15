"""Read the client's existing public site as campaign/media provenance, not copy authority."""
import concurrent.futures
import datetime
import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import urljoin
from lxml import html

ROOT = Path('EXPORT/renaissance-rewrite-v4/content')
ROOT.mkdir(parents=True, exist_ok=True)
ORIGIN = 'https://renaissancepr.co.uk'

def fetch(path, name):
    url = urljoin(ORIGIN, path)
    data = urllib.request.urlopen(url, timeout=30).read()
    (ROOT / name).write_bytes(data)
    return html.fromstring(data)

def text(node):
    return re.sub(r'\s+', ' ', node.text_content()).strip()

index = fetch('/case-studies', 'legacy-cases.html')
cards = index.xpath('//*[@id="list-grid"]/*[contains(@class,"item")]')

def campaign(card):
    path = card.xpath('.//a/@href')[0]
    tree = fetch(path, 'case-' + path.strip('/').split('/')[-1] + '.html')
    return {
        'title': card.xpath('.//img/@alt')[0],
        'sourceUrl': urljoin(ORIGIN, path),
        'legacyPath': path.rstrip('/'),
        'client': text(card.xpath('.//*[contains(@class,"sub-heading")]')[0]),
        'date': card.xpath('.//time/@datetime')[0],
        'regions': json.loads(card.get('data-groups')),
        'heroUrl': urljoin(ORIGIN, tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," image-single ")]//img/@src')[0]),
        'sourceText': '\n\n'.join(text(p) for p in tree.xpath('//article/p')),
    }

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    cases = list(pool.map(campaign, cards))

home = fetch('/', 'legacy-home.html')
awards = []
for img in home.xpath('//li[contains(@class,"award-logo")]//img'):
    name = img.get('alt', '')
    if not any(x['name'] == name for x in awards):
        awards.append({'name': name, 'imageUrl': urljoin(ORIGIN, img.get('src') or img.get('data-src'))})

about = fetch('/about', 'legacy-about.html')
register = fetch('/register', 'legacy-register.html')
registration = list(dict.fromkeys(home.xpath('//a[contains(@href,"docs.google.com/forms")]/@href')))
team = []
for heading in about.xpath('//h5'):
    article = heading.xpath('ancestor::article')[0]
    team.append({'name': text(heading), 'imageUrl': urljoin(ORIGIN, article.xpath('.//img/@src')[0]),
                 'position': ' '.join(article.xpath('.//*[contains(@class,"position")]/text()')).strip()})
data = {'retrievedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': cases, 'awards': awards, 'registrationUrls': registration, 'team': team}
(ROOT / 'legacy-inventory.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
print(json.dumps({'cases': len(cases), 'awards': len(awards), 'registrationUrls': len(registration), 'output': str(ROOT / 'legacy-inventory.json')}))
