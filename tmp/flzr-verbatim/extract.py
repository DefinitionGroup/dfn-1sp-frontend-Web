from pathlib import Path
from html.parser import HTMLParser
import json,re,openpyxl,hashlib
class Node:
 def __init__(self,tag='',attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
 def text(self):return ''.join(c if isinstance(c,str) else c.text() for c in self.children)
 def all(self,p):return [n for c in self.children if isinstance(c,Node) for n in ([c] if p(c) else [])+c.all(p)]
 def cls(self,c):return c in self.attrs.get('class','').split()
class Parser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.current=self.root
 def handle_starttag(self,t,a):
  n=Node(t,a,self.current);self.current.children.append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.current=n
 def handle_endtag(self,t):
  n=self.current
  while n.parent and n.tag!=t:n=n.parent
  if n.parent:self.current=n.parent
 def handle_data(self,d):self.current.children.append(d)
def clean(t):return re.sub(r'\s+',' ',t).strip()
p=Parser();p.feed(Path('tmp/flzr-verbatim/references.html').read_text())
records=[]
for n in p.root.all(lambda n:n.cls('dsm_flipbox')):
 title=clean(n.all(lambda n:n.tag=='h3')[0].text())
 subs=n.all(lambda n:n.cls('dsm-subtitle'));subtitle=clean(subs[0].text()) if subs else ''
 paragraphs=[clean(x.text()) for c in n.all(lambda n:n.cls('dsm-content')) for x in c.all(lambda n:n.tag=='p') if clean(x.text())]
 ancestor=n.parent
 while ancestor and not re.search(r'dsm_advanced_tabs_child_\d+',ancestor.attrs.get('class','')):ancestor=ancestor.parent
 category_index=int(re.search(r'dsm_advanced_tabs_child_(\d+)',ancestor.attrs['class']).group(1))
 category=['Consumer Electronics','DIY & Household','Food','Beauty & Fashion','Toys'][category_index]
 records.append({'category':category,'title':title,'subtitle':subtitle,'paragraphs':paragraphs})
assert len(records)==33,len(records)
assert all(r['paragraphs'] for r in records)
source=Path('/Users/martin/Downloads/FLZR_Website_Rewrite_Comparison_v1.xlsx')
s=openpyxl.load_workbook(source,data_only=True)['Rewrite Comparison']
rows=[{'cell':f'E{r}','page':s.cell(r,2).value,'section':s.cell(r,3).value,'text':s.cell(r,5).value} for r in range(2,35)]
result={'spreadsheet':{'filename':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sheet':s.title,'rows':rows},'references':{'url':'https://flzr.com/references/','retrieved':'2026-09-16','heading':'Projects & campaigns for our clients','records':records}}
Path('scripts/content/flzr-english-2026-09/sources.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{'index':i,**r} for i,r in enumerate(records)],ensure_ascii=False,indent=2))
