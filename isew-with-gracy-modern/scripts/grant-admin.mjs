/* Run only on your trusted machine using Application Default Credentials.
   Service-account credentials must stay outside this project and web root. */
import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
const userId=process.argv[2];
if(!userId)throw new Error('Usage: node scripts/grant-admin.mjs FIREBASE_USER_UID');
initializeApp({credential:applicationDefault()});
const auth=getAuth(),user=await auth.getUser(userId);
if(!user.emailVerified)throw new Error('Verify the admin email first; no role has been granted.');
await auth.setCustomUserClaims(userId,{...user.customClaims,admin:true});
console.log('Administrator role granted. Sign out and back in to refresh the session.');
