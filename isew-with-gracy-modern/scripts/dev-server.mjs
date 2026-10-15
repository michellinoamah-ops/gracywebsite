/* Dependency-free localhost server. Run from VS Code: npm run dev */
import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(fileURLToPath(new URL('../dist/',import.meta.url)));
const portIndex=process.argv.indexOf('--port');
const port=Number(portIndex>=0?process.argv[portIndex+1]:process.env.PORT||5173);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Choose a port between 1 and 65535.');
const types={'.mp4':'video/mp4','.pdf':'application/pdf','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end('Method not allowed');return;}
 try{
  const decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(decoded.includes('\0')||decoded.includes('\\')||decoded.split('/').some(s=>s.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
  let publicPath=decoded;
  if(/^\/(learn|read)\/[a-z0-9-]+$/.test(decoded)){const cfg=JSON.parse(await readFile(path.join(root,'../vercel.json'),'utf8'));const exact=cfg.rewrites?.find(x=>x.source===decoded);publicPath=exact?.destination||(decoded.startsWith('/learn/')?'/courses/class.html':'/journal/article.html');}
  let target=path.resolve(root,'.'+publicPath);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  if((await stat(target)).isDirectory())target=path.join(target,'index.html');
  target=await realpath(target);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const data=await readFile(target);
  if(path.extname(target)==='.mp4'){res.setHeader('Accept-Ranges','bytes');const range=req.headers.range;if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),data.length-1):data.length-1;if(start>=data.length||end<start){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}res.writeHead(206,{'Content-Type':'video/mp4','Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;}}
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
 }catch(err){const bad=err instanceof URIError;res.writeHead(bad?400:404,{'Content-Type':'text/plain; charset=utf-8'});res.end(bad?'Invalid URL':'Page not found');}
});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?`Port ${port} is busy. Try npm run dev -- --port 5174`:err.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`ISew local server ready: http://localhost:${port}\nAdmin preview: http://localhost:${port}/admin.html\nPress Ctrl+C to stop.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
