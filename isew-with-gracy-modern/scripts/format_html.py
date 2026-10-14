"""Make generated HTML readable without changing text or embedded data."""
import re
from html.parser import HTMLParser
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Depth(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=False);self.depth=0
 def handle_starttag(self,tag,attrs):
  if tag not in VOID:self.depth+=1
 def handle_endtag(self,tag):
  if tag not in VOID:self.depth=max(0,self.depth-1)
 def handle_startendtag(self,tag,attrs):pass
def format_html(text):
 # Protect literal blocks: whitespace inside them belongs to their data.
 saved=[]
 def protect(m):saved.append(m.group());return '<literal-block data-slot="'+str(len(saved)-1)+'"></literal-block>'
 text=re.sub(r'<(script|style|pre|textarea)\b[^>]*>.*?</\1\s*>',protect,text,flags=re.S|re.I)
 # Newlines are inserted only between adjacent tags, never into text/attributes.
 chunks=re.split(r'(?<=>)(?=<)',text)
 parser=Depth();lines=[]
 for chunk in chunks:
  leading=1 if chunk.startswith('</') else 0
  lines.append('  '*max(0,parser.depth-leading)+chunk)
  parser.feed(chunk)
 result='\n'.join(lines).rstrip()+'\n'
 for i,block in enumerate(saved):result=re.sub(r'<literal-block data-slot="'+str(i)+r'">\s*</literal-block>',lambda m:block,result)
 return result
