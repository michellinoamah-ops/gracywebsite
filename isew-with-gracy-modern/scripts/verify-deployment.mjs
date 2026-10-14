/* Vercel validates the prepared static site. No dependencies or Python required. */
import {readFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function files(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
try{
 for(const name of ['index.html','courses.html','journal.html','styles.css','app.js','admin.html','admin.js','runtime-config.js','assets/hero/hero-1.jpg'])await stat(path.join(root,name));
 const html=(await files(root)).filter(p=>p.endsWith('.html'));
 for(const f of html){const text=await readFile(f,'utf8');for(const match of text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)){const raw=match[1];if(/^[a-z][a-z\d+.-]*:|^\/\/|^#/i.test(raw))continue;const pathname=decodeURIComponent(raw.split(/[?#]/)[0]);if(!pathname)continue;let target=pathname.startsWith('/')?path.join(root,pathname):path.resolve(path.dirname(f),pathname);if(!target.startsWith(root))throw new Error('Invalid local link: '+raw);if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);}}
 console.log(`Static deployment verified: ${html.length} pages and their local assets. Vercel output directory: dist`);
}catch(error){console.error('Static deployment verification failed: '+error.message+'\nSet the Vercel Root Directory to the folder containing vercel.json, package.json and dist. Commit the complete dist directory.');process.exit(1);}
