export const properties = [
{id:'p1',name:'The Jacaranda',area:'Kilimani',units:24,occupied:22,rent:65000,image:'/residence.jpg'},
{id:'p2',name:'Olive Residences',area:'Westlands',units:18,occupied:17,rent:85000,image:'/residence.jpg'},
{id:'p3',name:'Acacia Court',area:'Kileleshwa',units:16,occupied:15,rent:55000,image:'/residence.jpg'},
{id:'p4',name:'The Cedar',area:'Lavington',units:12,occupied:10,rent:95000,image:'/residence.jpg'}];
export const payments = [
{id:'r1',name:'Wanjiku Mwangi',unit:'A-104',property:'The Jacaranda',amount:65000,paid:65000,date:'2026-10-03',method:'M-Pesa',reference:'SAMPLE-001',email:'wanjiku@example.com'},
{id:'r2',name:'Brian Otieno',unit:'B-202',property:'Olive Residences',amount:85000,paid:85000,date:'2026-10-04',method:'Bank transfer',reference:'SAMPLE-002',email:'brian@example.com'},
{id:'r3',name:'Amina Hassan',unit:'A-306',property:'The Jacaranda',amount:65000,paid:35000,date:'2026-10-05',method:'M-Pesa',reference:'SAMPLE-003',email:'amina@example.com'},
{id:'r4',name:'David Kamau',unit:'C-102',property:'Acacia Court',amount:55000,paid:0,date:'2026-10-05',method:'—',reference:'',email:'david@example.com'},
{id:'r5',name:'Grace Njeri',unit:'D-201',property:'The Cedar',amount:95000,paid:95000,date:'2026-10-02',method:'Bank transfer',reference:'SAMPLE-005',email:'grace@example.com'},
{id:'r6',name:'Kevin Mutua',unit:'B-105',property:'Olive Residences',amount:85000,paid:85000,date:'2026-10-05',method:'M-Pesa',reference:'SAMPLE-006',email:'kevin@example.com'}];
export const requests=[{id:'m1',title:'Leaking kitchen tap',property:'The Jacaranda',unit:'A-104',name:'Wanjiku Mwangi',email:'wanjiku@example.com',priority:'High',status:'Open',date:'2026-10-28',description:'Water is dripping under the kitchen sink. Please arrange a plumber.'},{id:'m2',title:'Lift service required',property:'Olive Residences',unit:'Common area',name:'Brian Otieno',email:'brian@example.com',priority:'Medium',status:'In progress',date:'2026-10-27',description:'Lift is making an unusual noise on the second floor.'},{id:'m3',title:'Bedroom light fitting',property:'Acacia Court',unit:'C-102',name:'David Kamau',email:'david@example.com',priority:'Low',status:'Open',date:'2026-10-26',description:'The bedroom fitting needs replacing.'}];
export const seed=[...properties.map(x=>({id:x.id,kind:'property',data:JSON.stringify(x)})),...payments.map(x=>({id:x.id,kind:'payment',data:JSON.stringify(x)})),...requests.map(x=>({id:x.id,kind:'request',data:JSON.stringify(x)})),{id:'e1',kind:'expense',data:JSON.stringify({id:'e1',title:'October property maintenance',amount:28500,date:'2026-10-20',property:'The Jacaranda'})}];
export const defaults:any={Owner:['finance','maintenance','documents','messages','team'],Manager:['maintenance','documents','messages'],Accountant:['finance','documents'],Tenant:['messages']};

// ---- Demo-only extras (no backend): give every screen something to show.
export const expenses=[
{id:'e1',title:'October property maintenance',amount:28500,date:'2026-10-20',property:'The Jacaranda'},
{id:'e2',title:'Lift servicing contract',amount:18000,date:'2026-10-14',property:'Olive Residences'},
{id:'e3',title:'Security & caretaker wages',amount:42000,date:'2026-10-01',property:'Acacia Court'},
{id:'e4',title:'Garden & common-area cleaning',amount:9500,date:'2026-10-09',property:'The Cedar'}];
export const messages=[
{id:'msg1',email:'wanjiku@example.com',sender:'Wanjiku Mwangi',text:'Hello, the kitchen tap is still dripping. Could someone come by this week?',date:'2026-10-28T07:42:00.000Z'},
{id:'msg2',email:'wanjiku@example.com',sender:'Huna property team',text:'Thanks Wanjiku — a plumber is booked for Thursday between 10am and 12pm.',date:'2026-10-28T09:15:00.000Z'},
{id:'msg3',email:'amina@example.com',sender:'Amina Hassan',text:'I will clear the remaining October balance by the 10th. Thank you for your patience.',date:'2026-10-26T16:03:00.000Z'},
{id:'msg4',email:'david@example.com',sender:'Huna property team',text:'Hi David, a friendly reminder that October rent is now due.',date:'2026-10-06T08:00:00.000Z'}];
export const documents=[
{id:'doc1',name:'Lease agreement — A-104.pdf',size:248000,email:'wanjiku@example.com',date:'2026-01-15T10:00:00.000Z',uploadedBy:'owner'},
{id:'doc2',name:'House rules — The Jacaranda.pdf',size:96000,email:'',date:'2026-02-01T10:00:00.000Z',uploadedBy:'owner'},
{id:'doc3',name:'Inventory checklist — B-202.pdf',size:132000,email:'brian@example.com',date:'2026-03-10T10:00:00.000Z',uploadedBy:'owner'}];
export const team=[
{email:'owner@hunaforhuna.co.ke',role:'Owner',permissions:JSON.stringify(['finance','maintenance','documents','messages','team']),tenant:''},
{email:'manager@hunaforhuna.co.ke',role:'Manager',permissions:JSON.stringify(['maintenance','documents','messages']),tenant:''},
{email:'accounts@hunaforhuna.co.ke',role:'Accountant',permissions:JSON.stringify(['finance','documents']),tenant:''}];
export const demoData=()=>[
 ...properties.map(x=>({...x,kind:'property'})),...payments.map(x=>({...x,kind:'payment'})),
 ...requests.map(x=>({...x,kind:'request'})),...expenses.map(x=>({...x,kind:'expense'})),
 ...messages.map(x=>({...x,kind:'message'})),...documents.map(x=>({...x,kind:'document'}))];
