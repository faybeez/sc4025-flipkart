import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => { const i=line.indexOf('='); return [line.slice(0,i),line.slice(i+1)]; }));
const make = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const a=make(), b=make(), guest=make();
function check(result) { if(result.error) throw result.error; return result.data; }
check(await a.auth.signInAnonymously()); check(await b.auth.signInAnonymously());
assert.ok((await guest.from('demo_entities').select('*')).error,'Unauthenticated reads must be blocked');
const id='order:FMPP4197078643';
const before=check(await a.from('demo_entities').select('*').eq('id',id).single());
let channel;
try {
  let resolveEvent;
  const received = new Promise(resolve => {resolveEvent=resolve;});
  channel=b.channel(`sync-test-${crypto.randomUUID()}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'demo_entities'},event => {if(event.new.id===id && event.new.data.instructions==='Sync verification') resolveEvent(event.new);});
  await new Promise((resolve,reject) => {const timer=setTimeout(()=>reject(new Error('Realtime subscription timed out')),15000);channel.subscribe(status=>{if(status==='SUBSCRIBED'){clearTimeout(timer);resolve();} if(status==='CHANNEL_ERROR'){clearTimeout(timer);reject(new Error('Realtime subscription failed'));}});});
  check(await a.rpc('apply_demo_changes',{p_changes:[{id,patch:{instructions:'Sync verification'}}]}));
  await Promise.race([received,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Realtime update timed out')),10000))]);
  assert.equal(check(await b.from('demo_entities').select('*').eq('id',id).single()).data.instructions,'Sync verification');
  await Promise.all([a.rpc('apply_demo_changes',{p_changes:[{id,patch:{productRating:4}}]}).then(check),b.rpc('apply_demo_changes',{p_changes:[{id,patch:{deliveryRating:5}}]}).then(check)]);
  const merged=check(await a.from('demo_entities').select('*').eq('id',id).single());
  assert.equal(merged.data.productRating,4);assert.equal(merged.data.deliveryRating,5);
  const user=(await a.auth.getUser()).data.user;
  const path=`${user.id}/FMPP4197078643/sync-test-${crypto.randomUUID()}.pdf`;
  check(await a.storage.from('demo-attachments').upload(path,new Blob(['%PDF-1.4 sync verification'],{type:'application/pdf'})));
  assert.ok(check(await b.storage.from('demo-attachments').createSignedUrl(path,30)).signedUrl);
  for(const [client,sender] of [[a,'customer'],[b,'driver']]) {
    const message={id:crypto.randomUUID(),order_id:'FMPP4197078643',sender,body:`Sync verification: ${sender}`};
    check(await client.from('demo_messages').insert(message));
    assert.equal(check(await (client===a?b:a).from('demo_messages').select('*').eq('id',message.id).single()).body,message.body);
  }
  console.log('PASS: authenticated access, realtime updates, shared reads, concurrent field updates, private attachments, and customer/driver messages.');
} finally {
  check(await a.rpc('apply_demo_changes',{p_changes:[{id,patch:before.data}]}));
  if(channel) await b.removeChannel(channel);
  await a.auth.signOut();await b.auth.signOut();
}
