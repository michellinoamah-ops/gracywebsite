/* Python 3 launcher for Windows, macOS and Linux. */
import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2);
const choices=process.platform==='win32'?[['py',['-3']],['python',[]],['python3',[]]]:[['python3',[]],['python',[]]];
let command;
for(const [name,prefix] of choices){const check=spawnSync(name,[...prefix,'-c','import sys; assert sys.version_info >= (3,9)'],{stdio:'ignore'});if(check.status===0){command=[name,prefix];break;}}
if(!command){console.error('Python 3.9+ is needed for build/check only. Install Python, restart VS Code and retry. npm run dev does not need Python.');process.exit(1);}
const result=spawnSync(command[0],[...command[1],...args],{stdio:'inherit'});if(result.error)console.error(result.error.message);process.exit(result.status??1);
