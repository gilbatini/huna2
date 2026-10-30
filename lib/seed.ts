import {BUILDING,units,counts,rentKes,INDICATIVE_RENT_KES} from './huna-heights';
// Sample data: one building (Huna Heights) with the shared unit list. Tenants, payments and
// maintenance are illustrative records, each tied to a unit whose status is 'let'.
const lease=(unit:string)=>{const u=units.find(x=>x.unit===unit);if(!u||u.status!=='let'||rentKes(u.beds)===null)throw Error('Sample tenant must be on a let unit with an indicative rent: '+unit);return rentKes(u.beds) as number};
export const properties = [
{id:'p1',name:BUILDING,area:'Nairobi',units:counts.total,occupied:counts.let,reserved:counts.reserved,rent:Math.min(...Object.values(INDICATIVE_RENT_KES).filter((x):x is number=>x!==null)),image:'/residence.jpg',sample:true}];
export const payments = [
{id:'r1',name:'Wanjiku Mwangi',unit:'2605',property:BUILDING,amount:lease('2605'),paid:lease('2605'),date:'2026-10-03',method:'M-Pesa',reference:'SAMPLE-001',email:'wanjiku@example.com'},
{id:'r2',name:'Brian Otieno',unit:'1208',property:BUILDING,amount:lease('1208'),paid:lease('1208'),date:'2026-10-04',method:'Bank transfer',reference:'SAMPLE-002',email:'brian@example.com'},
{id:'r3',name:'Amina Hassan',unit:'1202',property:BUILDING,amount:lease('1202'),paid:70000,date:'2026-10-05',method:'M-Pesa',reference:'SAMPLE-003',email:'amina@example.com'},
{id:'r4',name:'David Kamau',unit:'1108',property:BUILDING,amount:lease('1108'),paid:0,date:'2026-10-05',method:'—',reference:'',email:'david@example.com'},
{id:'r5',name:'Grace Njeri',unit:'2501',property:BUILDING,amount:lease('2501'),paid:lease('2501'),date:'2026-10-02',method:'Bank transfer',reference:'SAMPLE-005',email:'grace@example.com'}];
export const requests=[{id:'m1',title:'Leaking kitchen tap',property:BUILDING,unit:'2605',name:'Wanjiku Mwangi',email:'wanjiku@example.com',priority:'High',status:'Open',date:'2026-10-28',description:'Water is dripping under the kitchen sink. Please arrange a plumber.'},{id:'m2',title:'Lift service required',property:BUILDING,unit:'Common area',name:'Brian Otieno',email:'brian@example.com',priority:'Medium',status:'In progress',date:'2026-10-27',description:'Lift is making an unusual noise on the second floor.'},{id:'m3',title:'Bedroom light fitting',property:BUILDING,unit:'1108',name:'David Kamau',email:'david@example.com',priority:'Low',status:'Open',date:'2026-10-26',description:'The bedroom fitting needs replacing.'}];
export const seed=[...properties.map(x=>({id:x.id,kind:'property',data:JSON.stringify(x)})),...payments.map(x=>({id:x.id,kind:'payment',data:JSON.stringify(x)})),...requests.map(x=>({id:x.id,kind:'request',data:JSON.stringify(x)})),{id:'e1',kind:'expense',data:JSON.stringify({id:'e1',title:'October property maintenance',amount:28500,date:'2026-10-20',property:BUILDING})}];
export const defaults:any={Owner:['finance','maintenance','documents','messages','team'],Manager:['maintenance','documents','messages'],Accountant:['finance','documents'],Tenant:['messages']};

// ---- Demo-only extras (no backend): give every screen something to show.
export const expenses=[
{id:'e1',title:'October property maintenance',amount:28500,date:'2026-10-20',property:BUILDING},
{id:'e2',title:'Lift servicing contract',amount:18000,date:'2026-10-14',property:BUILDING},
{id:'e3',title:'Security & caretaker wages',amount:42000,date:'2026-10-01',property:BUILDING},
{id:'e4',title:'Garden & common-area cleaning',amount:9500,date:'2026-10-09',property:BUILDING}];
export const messages=[
{id:'msg1',email:'wanjiku@example.com',sender:'Wanjiku Mwangi',text:'Hello, the kitchen tap is still dripping. Could someone come by this week?',date:'2026-10-28T07:42:00.000Z'},
{id:'msg2',email:'wanjiku@example.com',sender:'Huna property team',text:'Thanks Wanjiku — a plumber is booked for Thursday between 10am and 12pm.',date:'2026-10-28T09:15:00.000Z'},
{id:'msg3',email:'amina@example.com',sender:'Amina Hassan',text:'I will clear the remaining October balance by the 10th. Thank you for your patience.',date:'2026-10-26T16:03:00.000Z'},
{id:'msg4',email:'david@example.com',sender:'Huna property team',text:'Hi David, a friendly reminder that October rent is now due.',date:'2026-10-06T08:00:00.000Z'}];
export const documents=[
{id:'doc1',name:'Lease agreement — 2605.pdf',size:248000,email:'wanjiku@example.com',date:'2026-01-15T10:00:00.000Z',uploadedBy:'owner'},
{id:'doc2',name:'House rules — '+BUILDING+'.pdf',size:96000,email:'',date:'2026-02-01T10:00:00.000Z',uploadedBy:'owner'},
{id:'doc3',name:'Inventory checklist — 1208.pdf',size:132000,email:'brian@example.com',date:'2026-03-10T10:00:00.000Z',uploadedBy:'owner'}];
export const team=[
{email:'owner@hunaforhuna.co.ke',role:'Owner',permissions:JSON.stringify(['finance','maintenance','documents','messages','team']),tenant:''},
{email:'manager@hunaforhuna.co.ke',role:'Manager',permissions:JSON.stringify(['maintenance','documents','messages']),tenant:''},
{email:'accounts@hunaforhuna.co.ke',role:'Accountant',permissions:JSON.stringify(['finance','documents']),tenant:''}];
export const demoData=()=>[
 ...properties.map(x=>({...x,kind:'property'})),...payments.map(x=>({...x,kind:'payment'})),
 ...requests.map(x=>({...x,kind:'request'})),...expenses.map(x=>({...x,kind:'expense'})),
 ...messages.map(x=>({...x,kind:'message'})),...documents.map(x=>({...x,kind:'document'}))];
