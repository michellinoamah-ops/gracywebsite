#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json, re, subprocess, sys, xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1];d=root/'dist';errors=[];pages=list(d.rglob('*.html'));titles=[]
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.h1=0;self.ids=[];self.refs=[];self.desc=False;self.title='';self.in_title=False;self.json='';self.ld=False;self.schemas=[];self.images=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if 'id' in a:self.ids.append(a['id'])
  if tag=='title':self.in_title=True
  if tag=='meta' and a.get('name')=='description':self.desc=bool(a.get('content'))
  if tag=='script' and a.get('type')=='application/ld+json':self.ld=True;self.json=''
  for key in ['src','href']:
   if key in a:self.refs.append(a[key])
  if tag=='img':self.images.append(a)
  if any(k.startswith('on') for k in a):errors.append('Inline event handler present')
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script' and self.ld:
   self.schemas.append(json.loads(self.json));self.ld=False
 def handle_data(self,s):
  if self.in_title:self.title+=s
  if self.ld:self.json+=s
for f in pages:
 p=Parser();p.feed(f.read_text(encoding='utf-8'));titles.append(p.title)
 if not p.desc:errors.append(str(f.relative_to(d))+': missing description')
 # Admin has a separate sign-in and dashboard heading; all public pages have one.
 if f.name!='admin.html' and p.h1!=1:errors.append(str(f.relative_to(d))+': heading count '+str(p.h1))
 if len(set(p.ids))!=len(p.ids):errors.append(str(f.relative_to(d))+': duplicate IDs')
 for a in p.images:
  if not a.get('alt'):errors.append(str(f.relative_to(d))+': missing image description')
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc or ref.startswith('#'):continue
  target=(d/unquote(u.path).lstrip('/')) if u.path.startswith('/') else f.parent/unquote(u.path)
  if u.path and not target.exists():errors.append(str(f.relative_to(d))+': missing '+ref)
 if not p.schemas:errors.append(str(f.relative_to(d))+': no structured data')
if len(set(titles))!=len(titles):errors.append('Duplicate page titles')
ET.parse(d/'sitemap.xml');manifest=json.loads((d/'site.webmanifest').read_text(encoding='utf-8'));assert manifest['display']=='standalone'
for js in d.glob('*.js'):
 result=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
 if result.returncode:errors.append(result.stderr)
# Actual supplied identifiers must be absent from every distributed text file.
for f in d.rglob('*'):
 if f.is_file() and f.suffix in ['.js','.html','.json','.md']:
  t=f.read_text(encoding='utf-8')
  if re.search(r'AIza[0-9A-Za-z_-]{25,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----',t):errors.append(str(f.relative_to(d))+': credential pattern found')
if errors:raise SystemExit('\n'.join(errors))
subprocess.run(['node','--test','tests/ui-security.test.mjs'],cwd=root,check=True)
subprocess.run([sys.executable,'tests/editor-publishing.test.py'],cwd=root,check=True)
for article in (d/'journal').glob('*.html'):
 t=article.read_text(encoding='utf-8');assert 'id="comment-form"' in t and 'data-share=' in t, str(article)
for course in (d/'courses').glob('*.html'):
 if course.name!='class.html':assert 'data-share=' in course.read_text(encoding='utf-8'),str(course)
print(f'PASS: {len(pages)} HTML pages, local links, image descriptions, unique titles, structured data, sitemap, manifest, JavaScript syntax and secret patterns.')
