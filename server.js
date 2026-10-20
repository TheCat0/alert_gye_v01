import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url));
const dbPath=process.env.DB_PATH||join(root,'.data/reports.sqlite');
mkdirSync(dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY,type TEXT,sector TEXT,description TEXT,lat REAL,lng REAL,photo TEXT,status TEXT,created_at TEXT)`);
const sources=[['INAMHI','Meteorología y pronósticos','https://www.inamhi.gob.ec/'],['Segura EP','Seguridad y gestión de riesgos','https://seguraep.gob.ec/'],['ATM','Tránsito y movilidad','https://www.atm.gob.ec/'],['Municipio de Guayaquil','Drenaje y obras preventivas','https://www.guayaquil.gob.ec/'],['SNGR','Alertas y gestión de riesgos','https://www.gestionderiesgos.gob.ec/']].map(([name,description,url])=>({name,description,url,status:'Sin conexión de datos · requiere convenio o API autorizada'}));
const types=['Inundación','Alcantarilla obstruida','Árbol caído','Daño en vía','Otro riesgo'];
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
const server=http.createServer(async(req,res)=>{try{
const url=new URL(req.url,'http://localhost');
if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true});
if(req.method==='GET'&&url.pathname==='/api/sources')return json(res,200,sources);
if(req.method==='GET'&&url.pathname==='/api/reports')return json(res,200,db.prepare('SELECT id,type,sector,description,lat,lng,status,created_at,CASE WHEN photo IS NOT NULL THEN 1 ELSE 0 END AS has_photo FROM reports ORDER BY created_at DESC').all());
if(req.method==='GET'&&/^\/api\/reports\/[^/]+\/photo$/.test(url.pathname)){const r=db.prepare('SELECT photo FROM reports WHERE id=?').get(url.pathname.split('/')[3]);if(!r?.photo)return json(res,404,{error:'Fotografía no encontrada'});const [,mime,data]=r.photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);res.writeHead(200,{'Content-Type':mime,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});return res.end(Buffer.from(data,'base64'));}
if(req.method==='POST'&&url.pathname==='/api/reports'){
if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)return json(res,403,{error:'Origen no permitido'});
let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4200000)return json(res,413,{error:'La imagen supera el límite permitido'});}
let r;try{r=JSON.parse(body)}catch{return json(res,400,{error:'Solicitud inválida'})}
if(!types.includes(r.type)||typeof r.sector!=='string'||!r.sector.trim()||r.sector.length>100||typeof r.description!=='string'||r.description.trim().length<10||r.description.length>2000||!Number.isFinite(r.lat)||!Number.isFinite(r.lng)||r.lat< -2.4||r.lat> -1.8||r.lng< -80.2||r.lng> -79.7)return json(res,400,{error:'Revisa el tipo, sector, descripción y ubicación en Guayaquil'});
if(r.photo&& (typeof r.photo!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(r.photo)))return json(res,400,{error:'Formato de imagen no permitido'});
const id=randomUUID(),created_at=new Date().toISOString();db.prepare('INSERT INTO reports VALUES(?,?,?,?,?,?,?,?,?)').run(id,r.type,r.sector.trim(),r.description.trim(),r.lat,r.lng,r.photo||null,'Pendiente',created_at);return json(res,201,{id,status:'Pendiente',created_at});
}
if(req.method==='GET'&&['/','/app.js','/style.css'].includes(url.pathname)){const file=url.pathname==='/'?'index.html':url.pathname.slice(1);res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"});return res.end(readFileSync(join(root,'public',file)));}
json(res,404,{error:'No encontrado'});
}catch(err){console.error(err.message);if(!res.headersSent)json(res,500,{error:'No se pudo procesar la solicitud'});else res.end();}});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log('Alerta Guayaquil iniciado'));
