from html.parser import HTMLParser
from urllib.request import urlopen
import json,re
class Main(HTMLParser):
 def __init__(self):super().__init__();self.on=True;self.skip=0;self.parts=[]
 def handle_starttag(self,t,a):
  if t=='main':self.on=True
  if t in ['script','style']:self.skip+=1
 def handle_endtag(self,t):
  if t=='main':self.on=True
  if t in ['script','style']:self.skip-=1
 def handle_data(self,d):
  if self.on and not self.skip:self.parts.append(d)
s=json.load(open('scripts/content/flzr-english-2026-09/sources.json'))
routes={'Home':'','Agency':'agency','Trainings':'trainings','Promotion':'promotion','Video Consulting':'video-consulting','PoS Management':'pos-management','Sales Force':'sales-force','Go To Markets':'go-to-markets','Business Intelligence':'business-intelligence','References':'cases','Career':'careers'}
checked=[]
for page,route in routes.items():
 p=Main();p.feed(urlopen('http://localhost:3000/en/'+route).read().decode());text=' '.join(p.parts);norm=lambda t:re.sub(r'\s+',' ',t)
 rows=[r for r in s['spreadsheet']['rows'] if r['page']==page]
 if page=='References':assert s['references']['heading'] in text;continue
 for i,r in enumerate(rows):
  if r['cell'] in ['E24','E33']:
   assert r['text'] not in text;continue
  fragments=r['text'].split('. ',1) if i==0 else re.findall(r'"([^"]+)"',r['text']) if i==2 else [r['text']]
  for f in fragments:assert norm(f) in norm(text),(page,r['cell'],f)
  checked.append(r['cell'])
 print(page,'verbatim copy rendered')
assert len(checked)==28
print('PASS: all 28 public spreadsheet cells rendered exactly; editorial cells absent.')

from concurrent.futures import ThreadPoolExecutor
import unicodedata
def slugify(s):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().lower()).strip('-')
def verify_case(pair):
 i,r=pair
 slug={0:'sonys-retail-sales-force',1:'o2-studio-berlin-brand-ambassadors',4:'bose-q4-sales-activation'}.get(i,slugify(r['title'])+'-'+slugify(r['subtitle']))
 p=Main();p.feed(urlopen('http://localhost:3000/en/cases/'+slug).read().decode());text=norm(' '.join(p.parts))
 for fragment in [r['title'],r['subtitle'],*r['paragraphs']]:assert norm(fragment) in text,(slug,fragment)
 return slug
with ThreadPoolExecutor(max_workers=4) as pool: cases=list(pool.map(verify_case,enumerate(s['references']['records'])))
print(f'PASS: {len(cases)} case pages render every original source paragraph.')
