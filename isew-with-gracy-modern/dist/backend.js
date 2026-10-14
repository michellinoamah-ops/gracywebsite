try { await import('./runtime-config.js'); } catch { /* Offline: public snapshot only. */ }
const config=window.ISewConfig||{};
let sdk=null,session=null;
export const configured=!!(config.firebase?.apiKey&&config.firebase?.projectId&&config.firebase?.authDomain);
export async function connect(){
 if(!configured) return null;
 if(session) return session;
 session=(async()=>{
  const base='https://www.gstatic.com/firebasejs/12.4.0/';
  const [app,auth,store,storage]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js'),import(base+'firebase-storage.js')]);
  const instance=app.initializeApp(config.firebase);
  if(config.appCheckSiteKey){const ac=await import(base+'firebase-app-check.js');ac.initializeAppCheck(instance,{provider:new ac.ReCaptchaV3Provider(config.appCheckSiteKey),isTokenAutoRefreshEnabled:true});}
  const a=auth.getAuth(instance);await auth.setPersistence(a,auth.browserSessionPersistence);
  sdk={a,db:store.getFirestore(instance),bucket:storage.getStorage(instance),auth,store,storage};return sdk;
 })();
 return session;
}
export async function list(collectionName,{publicOnly=false}={}){
 const s=await connect();if(!s)return [];
 const ref=s.store.collection(s.db,collectionName);
 const query=publicOnly?s.store.query(ref,s.store.where(['reviews','comments'].includes(collectionName)?'approved':'published','==',true)):ref;
 const snap=await s.store.getDocs(query);return snap.docs.map(x=>({...x.data(),id:x.id}));
}
export async function get(collectionName,id){const s=await connect();if(!s)return null;const snap=await s.store.getDoc(s.store.doc(s.db,collectionName,id));return snap.exists()?{...snap.data(),id:snap.id}:null;}
export async function save(collectionName,id,data){const s=await connect();if(!s)throw new Error('The live backend is not connected.');const {id:ignored,...payload}=data;await s.store.setDoc(s.store.doc(s.db,collectionName,id),payload,{merge:true});}
export async function remove(collectionName,id){const s=await connect();if(!s)throw new Error('The live backend is not connected.');await s.store.deleteDoc(s.store.doc(s.db,collectionName,id));}
export async function login(email,password){const s=await connect();if(!s)throw new Error('Connect your Firebase web app first. See SETUP.md.');const {user}=await s.auth.signInWithEmailAndPassword(s.a,email,password);const token=await user.getIdTokenResult(true);if(token.claims.admin!==true||!user.emailVerified){await s.auth.signOut(s.a);throw new Error('This account does not have verified administrator access.');}return user;}
export async function watchAuth(callback){const s=await connect();if(!s){callback(null);return()=>{};}return s.auth.onAuthStateChanged(s.a,async user=>{try{if(!user){callback(null);return;}const token=await user.getIdTokenResult();callback(token.claims.admin===true&&user.emailVerified?user:null);}catch{callback(null);}});}
export async function logout(){const s=await connect();if(s)await s.auth.signOut(s.a);}
export async function submit(kind,data){
 const s=await connect();if(!s)throw new Error('The enquiry service is not connected yet. Please use WhatsApp or email.');
 if(!config.appCheckSiteKey)throw new Error('Secure submissions are not enabled yet. Please use WhatsApp or email.');
 if(!s.a.currentUser)await s.auth.signInAnonymously(s.a);
 const uid=s.a.currentUser.uid;
 if(kind==='comments'){const nonce=crypto.randomUUID(),commentRef=s.store.doc(s.db,'comments',uid+'_'+nonce),limitRef=s.store.doc(s.db,'commentLimits',uid);await s.store.runTransaction(s.db,async tx=>{const previous=await tx.get(limitRef);if(previous.exists()&&Date.now()-(previous.data().lastAt?.toMillis()||0)<60000)throw new Error('Please wait a minute before adding another comment.');tx.set(limitRef,{lastAt:s.store.serverTimestamp(),nonce});tx.set(commentRef,{...data,owner:uid,nonce,approved:false,createdAt:s.store.serverTimestamp()});});return;} 
 const value={...data,owner:uid,createdAt:s.store.serverTimestamp()};
 const id=kind==='reviews'?uid+'_'+data.classId:uid;
 const ref=s.store.doc(s.db,kind,id);
 // One initial enquiry per identity and one review per class. Rules enforce this.
 if(['reviews','comments'].includes(kind))value.approved=false;
 if(kind==='enquiries')value.status='new';
 try{await s.store.setDoc(ref,value);}catch{throw new Error('Unable to submit. You may have already sent this form; please contact Gracy directly.');}
}
export async function upload(file,folder){
 const s=await connect();if(!s)throw new Error('Backend unavailable.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Choose a JPG, PNG or WebP image up to 5 MB.');
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
 const ref=s.storage.ref(s.bucket,folder+'/'+crypto.randomUUID()+'.'+ext);await s.storage.uploadBytes(ref,file,{contentType:file.type});return s.storage.getDownloadURL(ref);
}
