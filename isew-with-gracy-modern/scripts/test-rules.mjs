import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
const cli=new URL('../node_modules/firebase-tools/lib/bin/firebase.js',import.meta.url);
if(!existsSync(cli)){console.error('Install the optional Firebase test tools first: npm install');process.exit(1);}
const r=spawnSync(process.execPath,[fileURLToPath(cli),'emulators:exec','--project','demo-isew','--only','firestore,storage','node --test tests/security.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);
