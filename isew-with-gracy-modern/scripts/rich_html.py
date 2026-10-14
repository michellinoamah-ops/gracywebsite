"""Allowlisted article markup shared by the static publishing workflow."""
from html.parser import HTMLParser
from html import escape
from urllib.parse import urlsplit
TAGS={'p','h2','h3','h4','strong','b','em','i','u','s','blockquote','ul','ol','li','a','br','hr','span'}
DROP={'script','style','iframe','object','embed','svg','math','template','form','input','button','textarea','select'}
CLASSES={'text-clay','text-chocolate','text-olive','align-left','align-center','align-right'}
class Cleaner(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.out=[];self.stack=[];self.drop=[]
 def handle_starttag(self,tag,attrs):
  if self.drop:
   if tag in DROP and tag not in {'input','embed'}:self.drop.append(tag)
   return
  if tag in DROP:
   if tag not in {'input','embed'}:self.drop.append(tag)
   return
  if tag=='div':tag='p'
  if tag not in TAGS:return
  a=dict(attrs);safe=''
  if tag=='a':
   href=a.get('href','');u=urlsplit(href)
   if (u.scheme=='https' and u.netloc) or (href.startswith('/') and not href.startswith('//')):safe+=' href="'+escape(href,quote=True)+'" rel="noopener noreferrer"'
  cls=' '.join(x for x in a.get('class','').split() if x in CLASSES)
  if cls:safe+=' class="'+cls+'"'
  self.out.append('<'+tag+safe+'>')
  if tag not in {'br','hr'}:self.stack.append(tag)
 def handle_endtag(self,tag):
  if self.drop:
   if tag==self.drop[-1]:self.drop.pop()
   return
  if tag=='div':tag='p'
  if tag in self.stack:
   while self.stack:
    end=self.stack.pop();self.out.append('</'+end+'>')
    if end==tag:break
 def handle_data(self,data):
  if not self.drop:self.out.append(escape(data))
 def finish(self):
  while self.stack:self.out.append('</'+self.stack.pop()+'>')
  return ''.join(self.out)
def sanitize_rich_html(value):
 p=Cleaner();p.feed(str(value or ''));p.close();return p.finish()
