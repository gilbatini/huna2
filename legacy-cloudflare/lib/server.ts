import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { defaults, seed } from './seed';
export const database=()=> (env as any).DB;
export async function context(){
 const user=await getChatGPTUser(); if(!user) throw new Error('Sign in required');
 const db=database();
 await db.prepare("INSERT OR IGNORE INTO settings (id,value) VALUES ('owner',?)").bind(user.userId).run();
 const owner=await db.prepare("SELECT value FROM settings WHERE id='owner'").first();
 if(owner.value===user.userId) await db.prepare('INSERT OR IGNORE INTO members (email,role,permissions,tenant) VALUES (?,?,?,?)').bind(user.email.toLowerCase(),'Owner',JSON.stringify(defaults.Owner),'').run();
 let member=await db.prepare('SELECT * FROM members WHERE user_id=?').bind(user.userId).first();
 if(!member){member=await db.prepare('SELECT * FROM members WHERE email=? AND user_id IS NULL').bind(user.email.toLowerCase()).first();if(member)await db.prepare('UPDATE members SET user_id=? WHERE email=? AND user_id IS NULL').bind(user.userId,member.email).run();}
 if(!member) throw new Error('Access denied: ask your landlord to add your account');
 return {user,db,member:{...member,permissions:JSON.parse(member.permissions)}};
}
export function allow(member:any,p:string){if(member.role!=='Owner'&&!member.permissions.includes(p))throw new Error('Permission denied');}
export async function rows(db:any){const r=await db.prepare('SELECT * FROM records').all();return r.results.map((x:any)=>({...JSON.parse(x.data),kind:x.kind}));}
export async function save(db:any,kind:string,data:any){await db.prepare('INSERT INTO records (id,kind,data) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind(data.id,kind,JSON.stringify(data)).run();}
export {seed};
