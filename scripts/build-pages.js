import {cpSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=root+'dist';
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
cpSync(root+'public',out,{recursive:true});
let html=readFileSync(out+'/index.html','utf8').replace('<body>','<body data-mode="static">');
// Cada contenido tiene una URL distinta para evitar estilos antiguos en caché.
for(const filename of ['style.css','app.js']){
  const content=readFileSync(out+'/'+filename);
  const hash=createHash('sha256').update(content).digest('hex').slice(0,12);
  const dot=filename.lastIndexOf('.');
  const versioned=filename.slice(0,dot)+'.'+hash+filename.slice(dot);
  writeFileSync(out+'/'+versioned,content);
  rmSync(out+'/'+filename);
  html=html.replace('./'+filename,'./'+versioned);
}
writeFileSync(out+'/index.html',html);
writeFileSync(out+'/.nojekyll','');
const sources=[['INAMHI','Meteorología y pronósticos','https://inamhi.gob.ec/info/visor/'],['Segura EP','Seguridad y gestión de riesgos','https://seguraep.gob.ec/'],['ATM','Tránsito y movilidad','https://www.atm.gob.ec/'],['Municipio de Guayaquil','Drenaje y obras preventivas','https://www.guayaquil.gob.ec/'],['SNGR','Alertas y gestión de riesgos','https://sgrportal.gestionderiesgos.gob.ec/server/rest/services/SUSCEPT_INUNDACIONES_Z/MapServer?f=jsapi']].map(([name,description,url])=>({name,description,url,status:['INAMHI','SNGR'].includes(name)?'Visor externo enlazado · consulta en el proveedor':'Enlace de consulta · sin conexión de datos'}));
writeFileSync(out+'/sources.json',JSON.stringify(sources));
console.log('Presentación para GitHub Pages creada en dist/: 10 reportes ficticios señalados como demostración, sin datos ciudadanos reales ni API.');
