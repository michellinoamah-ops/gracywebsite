importScripts('/vendor/mammoth.browser.min.js');
self.onmessage=async event=>{try{const result=await mammoth.convertToHtml({arrayBuffer:event.data},{externalFileAccess:false,includeEmbeddedStyleMap:false});self.postMessage({html:result.value});}catch{self.postMessage({error:'Could not import this DOCX. Export it as TXT and try again.'});}};
