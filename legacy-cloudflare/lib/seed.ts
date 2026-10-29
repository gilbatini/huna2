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
