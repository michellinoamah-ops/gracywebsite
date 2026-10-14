import unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from rich_html import sanitize_rich_html
class RichPublishing(unittest.TestCase):
 def test_formatting_survives(self):
  src='<h2>A new skill</h2><p class="align-center"><strong>Practice</strong> and <em>patience</em>.</p><ul><li>Measure</li><li>Make</li></ul>'
  self.assertEqual(sanitize_rich_html(src),src)
 def test_active_content_is_removed(self):
  out=sanitize_rich_html('<script>alert(1)</script><svg onload="bad()"><script>bad()</script></svg><p onclick="bad()" style="color:red">Safe<img src=x onerror=bad()></p>')
  self.assertEqual(out,'<p>Safe</p>')
 def test_links_classes_and_unclosed_content(self):
  out=sanitize_rich_html('<p class="text-clay secret"><a href="javascript:alert(1)">Unsafe link</a><a href="https://example.com">Good</a>')
  self.assertNotIn('javascript:',out);self.assertNotIn('secret',out);self.assertIn('class="text-clay"',out);self.assertTrue(out.endswith('</p>'));self.assertIn('rel="noopener noreferrer"',out)
 def test_div_paragraphs_are_preserved(self):
  self.assertEqual(sanitize_rich_html('<div>First</div><div>Second<br>line</div>'),'<p>First</p><p>Second<br>line</p>')
if __name__=='__main__':unittest.main()
