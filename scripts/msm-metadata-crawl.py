"""Crawl MSM metadata against the published CMS audit, including crawler responses."""
import argparse
import concurrent.futures
from html.parser import HTMLParser
import json
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET


class MetadataParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.alternates, self.jsonld = {}, {}, []
        self.canonical = self.lang = self.title = ''
        self.in_title = self.in_json = False
        self.json_text = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.lang = attrs.get('lang', '')
        elif tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            self.meta[attrs.get('name') or attrs.get('property')] = attrs.get('content', '')
        elif tag == 'link':
            if attrs.get('rel') == 'canonical':
                self.canonical = attrs.get('href', '')
            elif attrs.get('rel') == 'alternate' and attrs.get('hreflang'):
                self.alternates[attrs['hreflang']] = attrs.get('href', '')
        elif tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_json = True
            self.json_text = ''

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'script' and self.in_json:
            self.in_json = False
            try:
                self.jsonld.append(json.loads(self.json_text))
            except json.JSONDecodeError:
                self.jsonld.append({'parseError': True})

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_json:
            self.json_text += data


def fetch(url, agent='Twitterbot/1.0'):
    request = urllib.request.Request(url, headers={'User-Agent': agent})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return response.status, response.read(), dict(response.headers), response.url
    except urllib.error.HTTPError as error:
        return error.code, error.read(), dict(error.headers), error.url


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--origin', required=True)
    args.add_argument('--audit', default='EXPORT/msm-metadata-2026-10-06/audit.json')
    args.add_argument('--output', required=True)
    args.add_argument('--beta', action='store_true')
    args.add_argument('--workers', type=int, default=4)
    options = args.parse_args()
    audit = json.load(open(options.audit))

    def crawl(row):
        pathname = ('/' + row['language'] if row['language'] != 'en' else '') + ('/' + row['path'] if row['path'] else '')
        url = options.origin.rstrip('/') + (pathname or '/')
        failures = []
        try:
            status, body, headers, final_url = fetch(url)
            parser = MetadataParser()
            parser.feed(body.decode())
            if status != 200:
                failures.append(f'HTTP {status}')
            if final_url.rstrip('/') != url.rstrip('/'):
                failures.append('unexpected redirect')
            expected = {'description': row['description'], 'og:title': row['socialTitle'], 'og:description': row['socialDescription'], 'og:image': row['image'], 'og:url': row['canonical'], 'twitter:title': row['socialTitle'], 'twitter:description': row['socialDescription'], 'twitter:image': row['image'], 'twitter:card': 'summary_large_image'}
            for field, value in expected.items():
                if parser.meta.get(field) != value:
                    failures.append(f'{field} differs from CMS resolver')
            if parser.title != row['title']:
                failures.append('title differs from CMS resolver')
            if parser.canonical != row['canonical']:
                failures.append('canonical differs from CMS resolver')
            if parser.lang != row['language']:
                failures.append('incorrect server HTML language')
            if parser.alternates != row['languages']:
                failures.append('incorrect translation links')
            if options.beta or row['noIndex']:
                if 'noindex' not in parser.meta.get('robots', ''):
                    failures.append('missing noindex')
            if any(node.get('parseError') for node in parser.jsonld if isinstance(node, dict)):
                failures.append('invalid JSON-LD')
            return {'path': pathname or '/', 'status': status, 'failures': failures}
        except Exception as error:
            return {'path': pathname or '/', 'failures': [str(error)]}

    with concurrent.futures.ThreadPoolExecutor(max_workers=options.workers) as pool:
        rows = list(pool.map(crawl, audit['rows']))
    status, body, _, _ = fetch(options.origin.rstrip('/') + '/sitemap.xml')
    sitemap = ET.fromstring(body)
    urls = [node.text for node in sitemap.findall('{*}url/{*}loc')]
    expected_urls = [row['canonical'] for row in audit['rows'] if row['sitemap']]
    sitemap_failures = []
    if status != 200 or set(urls) != set(expected_urls) or len(urls) != len(set(urls)):
        sitemap_failures.append('sitemap missing / extra / duplicate URLs')
    _, robots, _, _ = fetch(options.origin.rstrip('/') + '/robots.txt')
    if options.beta and 'Disallow: /' not in robots.decode():
        sitemap_failures.append('beta robots.txt does not block crawling')
    samples = []
    for agent in ['facebookexternalhit/1.1', 'Mozilla/5.0']:
        for path in ['/', '/de', '/services/pr', '/people/camillo-stark']:
            status, body, _, _ = fetch(options.origin.rstrip('/') + path, agent)
            parser = MetadataParser()
            parser.feed(body.decode())
            samples.append({'path': path, 'agent': agent, 'status': status, 'metadataPresent': all(parser.meta.get(key) for key in ['description', 'og:description', 'og:image', 'twitter:image'])})
    result = {'origin': options.origin, 'routes': len(rows), 'passed': sum(not row['failures'] for row in rows), 'failures': [row for row in rows if row['failures']], 'sitemap': {'count': len(urls), 'failures': sitemap_failures}, 'agentSamples': samples}
    with open(options.output, 'w') as output:
        json.dump(result, output, indent=2)
    print(json.dumps(result))
    if result['failures'] or sitemap_failures or any(sample['status'] != 200 or not sample['metadataPresent'] for sample in samples):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
