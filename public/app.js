const staticMode=document.body.dataset.mode==='static';
const demoMode=staticMode||new URLSearchParams(location.search).get('demo')==='1';
const $=s=>document.querySelector(s);
let reports=[];
$('#today').textContent=new Intl.DateTimeFormat('es-EC',{dateStyle:'long',timeZone:'America/Guayaquil'}).format(new Date());
const dialog=$('#report-dialog');
document.querySelectorAll('.report-trigger').forEach(b=>b.addEventListener('click',()=>{ $('#form-message').textContent='';dialog.showModal(); }));
$('#close-dialog').onclick=()=>dialog.close();$('#close-detail').onclick=()=>$('#detail-dialog').close();
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>{document.querySelectorAll('nav a').forEach(n=>n.classList.remove('active'));a.classList.add('active')});
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function showDetail(r){
  const el=$('#detail-content');
  el.replaceChildren(node('h2',r.type));
  if(r.simulated)el.append(node('p','DEMOSTRACIÓN · Caso ficticio. El estado y la ubicación son simulados.','demo-detail'));
  el.append(node('p',`${r.sector} · ${r.status}${r.simulated?' (simulado)':''}`),node('p',r.description),node('p',`Ubicación${r.simulated?' aproximada de ejemplo':''}: ${r.lat}, ${r.lng}`));
  if(r.has_photo&&!r.simulated){const img=node('img');img.src=`/api/reports/${encodeURIComponent(r.id)}/photo`;img.alt='Fotografía del incidente reportado';el.append(img)}
  $('#detail-dialog').showModal();
}
function render(){
  const filtered=reports.filter(r=>!$('#type-filter').value||r.type===$('#type-filter').value);
  $('#count-total').textContent=reports.length;
  $('#count-pending').textContent=reports.filter(r=>r.status==='Pendiente').length;
  $('#count-verified').textContent=reports.filter(r=>r.status==='Verificado').length;
  $('#count-sectors').textContent=new Set(reports.map(r=>r.sector.toLocaleLowerCase())).size;
  $('#reports-empty').hidden=filtered.length>0;
  $('#map-empty').hidden=filtered.length>0;
  $('#reports-empty').textContent=demoMode?'No hay casos de ejemplo con este filtro.':'No hay reportes con este filtro.';
  $('#map-empty').textContent=demoMode?'Sin casos de ejemplo para este filtro.':'Sin reportes para este filtro.';
  $('#report-list').replaceChildren();
  for(const r of filtered){
    const tr=node('tr'),td=node('td'),button=node('button',r.type);
    button.onclick=()=>showDetail(r);td.append(button);
    if(r.simulated)td.append(node('small','Caso ficticio','demo-row-label'));
    tr.append(td,node('td',r.sector),node('td',new Date(r.created_at).toLocaleDateString('es-EC',{timeZone:'America/Guayaquil'})));
    const status=node('td');status.append(node('span',r.status+(r.simulated?' · simulado':''),'badge'+(r.status==='Pendiente'?'':' status-blue')));tr.append(status);
    $('#report-list').append(tr);
  }
  $('#map-markers').replaceChildren();
  for(const r of filtered){
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',String(30+(r.lng+80.2)/.5*680));c.setAttribute('cy',String(20+(-1.8-r.lat)/.6*375));c.setAttribute('r','8');
    c.setAttribute('fill',r.status==='Pendiente'?'#e46517':'#2369d6');c.setAttribute('stroke','white');c.setAttribute('stroke-width','3');c.setAttribute('tabindex','0');c.setAttribute('role','button');
    c.setAttribute('aria-label',`${r.type} en ${r.sector}${r.simulated?' · caso ficticio':''}`);
    c.onclick=()=>showDetail(r);c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showDetail(r)}};$('#map-markers').append(c);
  }
}
async function loadReports(){const res=await fetch('/api/reports');if(!res.ok)throw Error('No se pudieron cargar los reportes. Recarga la página para reintentar.');reports=await res.json();render()}
$('#type-filter').onchange=render;
$('#locate').onclick=()=>{if(!navigator.geolocation){$('#location-status').textContent='La ubicación no está disponible; ingresa las coordenadas.';return}$('#location-status').textContent='Obteniendo ubicación…';navigator.geolocation.getCurrentPosition(p=>{const {latitude,longitude}=p.coords;if(latitude< -2.4||latitude> -1.8||longitude< -80.2||longitude> -79.7){$('#location-status').textContent='Estás fuera del área de Guayaquil. Ingresa la ubicación del incidente.';return}$('#report-form').elements.lat.value=latitude;$('#report-form').elements.lng.value=longitude;$('#location-status').textContent='Ubicación obtenida. Comprueba que corresponde al incidente.'},()=>{$('#location-status').textContent='No se pudo obtener la ubicación. Ingresa las coordenadas manualmente.'},{timeout:10000,enableHighAccuracy:true})};
$('#report-form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;const button=$('#submit-report');button.disabled=true;$('#form-message').textContent='Enviando…';let saved=false;try{const data=Object.fromEntries(new FormData(form));const file=data.photo;delete data.photo;data.lat=Number(data.lat);data.lng=Number(data.lng);if(file.size){if(file.size>3*1024*1024)throw Error('La fotografía debe pesar menos de 3 MB.');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Usa una imagen JPG, PNG o WebP.');data.photo=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('No se pudo leer la imagen'));r.readAsDataURL(file)})}const res=await fetch('/api/reports',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await res.json();if(!res.ok)throw Error(result.error||'No se pudo enviar el reporte');saved=true;form.reset();$('#location-status').textContent='Puedes ingresar las coordenadas manualmente.';$('#form-message').textContent=`Reporte recibido (${result.id.slice(0,8)}). Pendiente de verificación; no implica despacho de emergencias.`;await loadReports()}catch(error){$('#form-message').textContent=saved?'Tu reporte se guardó. Recarga la página para actualizar la lista.':error.message}finally{button.disabled=false}};
if(!demoMode)loadReports().catch(e=>{$('#load-error').textContent=e.message;$('#reports-empty').hidden=true;$('#map-empty').textContent='No se pudo consultar la información.'});
fetch(staticMode?'./sources.json':'/api/sources').then(r=>{if(!r.ok)throw Error();return r.json()}).then(sources=>{for(const s of sources){const a=node('a',undefined,'source');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.append(node('strong',s.name+' ↗'),node('p',s.description),node('small',s.status),node('span','Consultar sitio oficial'));$('#sources-list').append(a)}}).catch(()=>{$('#sources-list').textContent='No se pudieron cargar las fuentes oficiales.'});

if(demoMode){
  document.body.classList.add('demo-mode');
  document.querySelectorAll('.report-trigger').forEach(button=>{button.disabled=true;button.textContent='Presentación de demostración';button.title='La recepción real de reportes no está habilitada en esta presentación.'});
  document.querySelector('.notice strong').textContent='Demostración · datos ficticios';
  document.querySelector('.notice p').textContent='Los incidentes, estados y ubicaciones son ejemplos para presentar el proyecto. No representan emergencias reales ni validación institucional.';
  const labels=['Casos de demostración','Pendientes simulados','Verificados simulados','Sectores de ejemplo'];
  document.querySelectorAll('.stats article small').forEach((label,i)=>label.textContent=labels[i]);
  document.querySelector('#reportes h2').textContent='Reportes ciudadanos · demostración';
  document.querySelector('#reportes .card-heading p').textContent='10 casos ficticios para mostrar el funcionamiento de la propuesta';
  document.querySelector('#reportes th:nth-child(3)').textContent='FECHA DE EJEMPLO';
  document.querySelector('#mapa h2').textContent='Escenario de demostración por sector';
  document.querySelector('#mapa .card-heading p').textContent='Ubicaciones aproximadas de ejemplo · mapa esquemático';
  document.querySelector('#mapa .legend').replaceChildren(node('span','● Pendiente simulado'),node('span','● Otros estados simulados'),node('span','Datos ficticios · sin validación institucional'));
  document.querySelector('#coe .badge').textContent='Directorio institucional';
  document.querySelector('.stats').after(document.querySelector('.dashboard'),document.querySelector('#reportes'));
  fetch('./demo-reports.json?v=1').then(r=>{if(!r.ok)throw Error('No se pudieron cargar los casos de demostración.');return r.json()}).then(data=>{
    if(data.demo!==true||!Array.isArray(data.reports)||data.reports.length!==10||!data.reports.every(r=>r.simulated===true))throw Error('Los datos de demostración no son válidos.');
    reports=data.reports;render();
  }).catch(error=>{document.querySelectorAll('.stats strong').forEach(el=>el.textContent='—');$('#load-error').textContent=error.message;$('#reports-empty').hidden=true;$('#map-empty').textContent='Demostración no disponible. Recarga para reintentar.';});
}


document.querySelectorAll('.risk-viewer').forEach(viewer=>{
  viewer.addEventListener('toggle',()=>{
    if(viewer.open){const frame=viewer.querySelector('iframe');if(!frame.getAttribute('src'))frame.src=frame.dataset.src;}
  });
});
