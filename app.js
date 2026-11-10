/* เต้าหู้ — UX/UI prototype (vanilla JS, localStorage) */
(function(){
'use strict';
const KEY='tofu.v2';
const $=s=>document.querySelector(s);
const app=$('#app'), layer=$('#sheetLayer');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);

/* ---------- dates ---------- */
const MS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const ML=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const WD=['อา','จ','อ','พ','พฤ','ศ','ส'];
const WDL=['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{if(!s)return null;const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const addDays=(n,base)=>{const d=new Date(base||today());d.setDate(d.getDate()+n);return iso(d)};
const fmt=s=>{const d=parse(s);return d?`${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()+543}`:'—'};
const fmtLong=s=>{const d=parse(s);return d?`${WDL[d.getDay()]}ที่ ${d.getDate()} ${ML[d.getMonth()]} ${d.getFullYear()+543}`:'—'};
const diff=s=>Math.round((parse(s)-today())/864e5);
const rel=s=>{const n=diff(s);if(n===0)return 'วันนี้';if(n===1)return 'พรุ่งนี้';if(n===-1)return 'เมื่อวาน';return n>0?`อีก ${n} วัน`:`เลยมา ${-n} วัน`};
function age(b){const d=parse(b);if(!d)return '';const t=today();let m=(t.getFullYear()-d.getFullYear())*12+t.getMonth()-d.getMonth();if(t.getDate()<d.getDate())m--;if(m<1)return 'ไม่ถึงเดือน';const y=Math.floor(m/12),r=m%12;return (y?y+' ปี':'')+(y&&r?' ':'')+(r?r+' เดือน':'')}

/* ---------- icons ---------- */
const S='stroke="#414648" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const I={
 paw:`<svg viewBox="0 0 24 24" fill="none" ${S}><ellipse cx="12" cy="16" rx="4.6" ry="3.8" fill="currentColor" fill-opacity=".0"/><path d="M8 17.2c0-2.6 1.8-4.6 4-4.6s4 2 4 4.6c0 1.6-1.3 2.4-2.6 2.1-.6-.1-.9-.3-1.4-.3s-.8.2-1.4.3C9.3 19.6 8 18.8 8 17.2z"/><circle cx="6.2" cy="11.2" r="1.7"/><circle cx="9.6" cy="7.4" r="1.8"/><circle cx="14.4" cy="7.4" r="1.8"/><circle cx="17.8" cy="11.2" r="1.7"/></svg>`,
 book:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5z"/><path d="M5 18a2 2 0 0 1 2-2h11.5"/><path d="M11.8 7.6v5M9.3 10.1h5"/></svg>`,
 cal:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.8" y="5.2" width="16.4" height="15" rx="3.5"/><path d="M3.8 10h16.4M8.3 3.3v3.4M15.7 3.3v3.4"/><circle cx="8.5" cy="14.3" r=".6" fill="#414648"/><circle cx="12" cy="14.3" r=".6" fill="#414648"/><circle cx="15.5" cy="14.3" r=".6" fill="#414648"/></svg>`,
 plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
 back:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.8"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>`,
 chev:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.6"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>`,
 edit:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 19.5 5.3 15 15.6 4.7a2.1 2.1 0 0 1 3 3L8.3 18 4.5 19.5z" fill="#F4E9CB"/><path d="M13.8 6.5l3.5 3.5"/></svg>`,
 trash:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 12.5h9l1-12.5" fill="#E8B9AA"/><path d="M10.2 10.5v6M13.8 10.5v6"/></svg>`,
 gear:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M12 2.8l1.6 2.3 2.8-.4.6 2.7 2.5 1.3-1 2.6 1 2.6-2.5 1.3-.6 2.7-2.8-.4L12 21.2l-1.6-2.3-2.8.4-.6-2.7-2.5-1.3 1-2.6-1-2.6 2.5-1.3.6-2.7 2.8.4z" fill="#F4E9CB"/><circle cx="12" cy="12" r="3"/></svg>`,
 syringe:`<svg viewBox="0 0 24 24" fill="none" ${S}><g transform="rotate(45 12 12)"><rect x="9" y="6.5" width="6" height="10" rx="1.2" fill="#fff"/><path d="M12 16.5v5M8 6.5h8M12 6.5V3M9.5 3h5M9 9.5h3M9 12.5h3"/></g></svg>`,
 steth:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 3.5H4.5v5a4.5 4.5 0 0 0 9 0v-5H12"/><path d="M9 13v1.5a5 5 0 0 0 10 0V12"/><circle cx="19" cy="10" r="2.2" fill="#fff"/></svg>`,
 clock:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
 pin:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>`,
 cake:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 20.5v-7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7z"/><path d="M4.5 16c1.3 1 2.5 1 3.75 0s2.5-1 3.75 0 2.5 1 3.75 0 2.5-1 3.75 0M12 11.5V8.5M12 6.5c-1 0-1.4-1-.6-2.6L12 3l.6.9C13.4 5.5 13 6.5 12 6.5z"/></svg>`,
 scale:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.5" y="4" width="17" height="16" rx="4"/><path d="M8 9.5a5 5 0 0 1 8 0l-2.6 2.3M12 12l1.5-1.5"/></svg>`,
 sex:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="10" cy="14" r="5"/><path d="M13.6 10.4 19 5M14.8 5H19v4.2"/></svg>`,
 check:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="3.2"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
 note:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 3.5h8.5L19 8v12.5H6z"/><path d="M14 3.5V8.5h5M9 13h6.5M9 16.5h4"/></svg>`,
 bell:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" fill="#F4E9CB"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>`,
 hospital:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 20.5V8.5L12 4l7.5 4.5v12z" fill="#fff"/><path d="M12 9.5v6M9 12.5h6"/></svg>`,
 star:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="m12 3.8 2.4 5 5.4.6-4 3.7 1.1 5.4L12 15.8l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="#E9D3A8"/></svg>`,
 warn:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M12 4.2 20.5 19H3.5L12 4.2z"/><path d="M12 10v5" stroke-width="2.4"/><circle cx="12" cy="17.2" r="1" fill="#414648"/></svg>`,
};
Object.keys(I).forEach(k=>{I[k]=I[k].replace('<svg ','<svg aria-hidden="true" ')});
const SP={
 dog:{label:'หมา',bg:'#F4E9CB',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M11 15c-4 1-6 8-4 13 1.5 2.5 4 1 5-1" fill="#BA905D"/><path d="M37 15c4 1 6 8 4 13-1.5 2.5-4 1-5-1" fill="#BA905D"/><path d="M12 22c0-7 5-11 12-11s12 4 12 11v5c0 7-5 11-12 11s-12-4-12-11z" fill="#E9CFA2"/><circle cx="19" cy="23" r="1.6" fill="#414648"/><circle cx="29" cy="23" r="1.6" fill="#414648"/><path d="M21.5 29.5h5l-2.5 2.5z" fill="#414648"/><path d="M24 32v2.2c-1 1.4-3 1.4-4 0M24 34.2c1 1.4 3 1.4 4 0"/></svg>`},
 cat:{label:'แมว',bg:'#E9ECEA',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M11 21 10 8l9 6M37 21l1-13-9 6" fill="#EFEBE4"/><path d="M10 26c0-8 6-13 14-13s14 5 14 13-6 12-14 12-14-4-14-12z" fill="#EFEBE4"/><path d="M17 24.5q2-2 4 0M27 24.5q2-2 4 0"/><path d="M22.5 28.5h3L24 30z" fill="#E8B9AA"/><path d="M24 30q-1.5 2.5-4 1.5M24 30q1.5 2.5 4 1.5M7 27l7 1M7 31l7-1M41 27l-7 1M41 31l-7-1"/></svg>`},
 rabbit:{label:'กระต่าย',bg:'#F4E3DC',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M14 22c-6-2-8-9-7-12 3-1 8 3 10 9M34 22c6-2 8-9 7-12-3-1-8 3-10 9" fill="#E3C9A6"/><path d="M11 29c0-7 6-11 13-11s13 4 13 11-6 10-13 10-13-3-13-10z" fill="#F3E3CB"/><circle cx="18.5" cy="27" r="1.6" fill="#414648"/><circle cx="29.5" cy="27" r="1.6" fill="#414648"/><path d="M22.5 31h3L24 32.5zM24 32.5v2M22 34.5h4"/></svg>`},
 bird:{label:'นก',bg:'#E7EDE0',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M24 9c-8 0-13 6-13 14 0 9 6 16 13 16s13-7 13-16c0-8-5-14-13-14z" fill="#C9D8BE"/><path d="M24 9c1-3 4-4 6-3M24 9c-1-3 0-5 2-6"/><path d="M14 27c-4 2-5 6-4 8 3 0 6-2 7-5M34 27c4 2 5 6 4 8-3 0-6-2-7-5" fill="#A9BF9E"/><circle cx="19" cy="21" r="1.6" fill="#414648"/><circle cx="29" cy="21" r="1.6" fill="#414648"/><path d="M21 25h6l-3 4z" fill="#E9D3A8"/></svg>`},
 other:{label:'อื่นๆ',bg:'#F4E9CB',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M16 33c0-5 3.6-9 8-9s8 4 8 9c0 3-2.5 4.6-5 4.1-1.2-.2-1.8-.6-3-.6s-1.8.4-3 .6c-2.5.5-5-1.1-5-4.1z" fill="#E9CFA2"/><circle cx="12" cy="22.5" r="3.4" fill="#E9CFA2"/><circle cx="19" cy="14.6" r="3.6" fill="#E9CFA2"/><circle cx="29" cy="14.6" r="3.6" fill="#E9CFA2"/><circle cx="36" cy="22.5" r="3.4" fill="#E9CFA2"/></svg>`},
};
Object.values(SP).forEach(s=>{s.svg=s.svg.replace('<svg ','<svg aria-hidden="true" ')});
const SEX={m:'ตัวผู้',f:'ตัวเมีย',u:'ไม่ระบุ'};
const ATYPE={vaccine:{label:'ฉีดวัคซีน',chip:'yellow',ic:'syringe'},checkup:{label:'ตรวจสุขภาพ',chip:'sky',ic:'steth'},other:{label:'อื่นๆ',chip:'mint',ic:'note'}};
const MASCOTS={
 main:{name:'เบื่อนมองขึ้น',img:'mascot-main.jpg',desc:'คุณพยาบาลหน้าเบื่อ เทินเต้าหู้ไว้ใต้หมวก ถือสมุดจดทุกนัด แล้วยกนิ้วให้ (แบบเบื่อๆ)'},
};

/* ---------- state ---------- */
function seed(){
  const p1=uid(),p2=uid(),p3=uid();
  return {
    mascot:'main',onboarded:false,selPet:p1,
    pets:[
      {id:p1,name:'มะลิ',species:'cat',breed:'สก็อตติชโฟลด์',birth:'2023-03-14',sex:'f',weight:'4.2',color:'ขาวเทา หูพับ ตาสีทอง',notes:'ชอบนอนบนโซฟา ไม่ชอบอาบน้ำ แพ้อาหารทะเลบางชนิด'},
      {id:p2,name:'ทองดี',species:'dog',breed:'โกลเด้นรีทรีฟเวอร์',birth:'2021-07-02',sex:'m',weight:'31.5',color:'สีทองอ่อน ขนยาว',notes:'ชอบว่ายน้ำ ต้องแปรงขนสัปดาห์ละ 3 ครั้ง กินเก่งมาก'},
      {id:p3,name:'ปุย',species:'rabbit',breed:'ฮอลแลนด์ลอป',birth:'2024-09-20',sex:'f',weight:'1.6',color:'น้ำตาลครีม หูตก',notes:'กินหญ้าทิโมธีเป็นหลัก ตกใจง่ายเวลามีเสียงดัง'},
    ],
    vaccines:[
      {id:uid(),petId:p1,name:'วัคซีนรวมแมว (FVRCP)',given:addDays(-350),next:addDays(15),note:''},
      {id:uid(),petId:p1,name:'วัคซีนพิษสุนัขบ้า',given:addDays(-200),next:addDays(165),note:''},
      {id:uid(),petId:p1,name:'วัคซีนลิวคีเมียแมว (FeLV)',given:addDays(-400),next:addDays(-10),note:'หมอแนะนำให้มาฉีดกระตุ้น'},
      {id:uid(),petId:p2,name:'วัคซีนรวมสุนัข (DHPPL)',given:addDays(-30),next:addDays(335),note:''},
      {id:uid(),petId:p2,name:'วัคซีนพิษสุนัขบ้า',given:addDays(-370),next:addDays(-5),note:''},
      {id:uid(),petId:p2,name:'ยาป้องกันพยาธิหนอนหัวใจ',given:addDays(-25),next:addDays(5),note:'ให้ทุกเดือน'},
      {id:uid(),petId:p3,name:'วัคซีนโรคเลือดออกในกระต่าย (RHDV2)',given:addDays(-160),next:addDays(205),note:''},
      {id:uid(),petId:p3,name:'ยาหยอดป้องกันเห็บหมัด',given:addDays(-60),next:addDays(28),note:''},
    ],
    visits:[
      {id:uid(),petId:p1,date:addDays(-45),clinic:'โรงพยาบาลสัตว์ทองหล่อ',reason:'ตรวจสุขภาพประจำปี',notes:'สุขภาพดี น้ำหนักเหมาะสม แนะนำขูดหินปูนปีหน้า'},
      {id:uid(),petId:p1,date:addDays(-120),clinic:'คลินิกรักษ์สัตว์ อารีย์',reason:'ท้องเสีย',notes:'ให้ยาปรับลำไส้ 5 วัน หายดีแล้ว'},
      {id:uid(),petId:p2,date:addDays(-25),clinic:'โรงพยาบาลสัตว์มหาวิทยาลัยเกษตรศาสตร์',reason:'ฉีดวัคซีนรวมและตรวจเลือด',notes:'ค่าเลือดปกติทั้งหมด'},
      {id:uid(),petId:p2,date:addDays(-90),clinic:'คลินิกหมอหมา บางนา',reason:'ขาหลังเจ็บ',notes:'เอกซเรย์ไม่พบกระดูกหัก ให้พักการวิ่ง 2 สัปดาห์'},
      {id:uid(),petId:p3,date:addDays(-60),clinic:'โรงพยาบาลสัตว์เล็กและสัตว์แปลก',reason:'ตัดเล็บและตรวจฟัน',notes:'ฟันหน้ายาวเล็กน้อย นัดตรวจซ้ำ'},
    ],
    appts:[
      {id:uid(),petId:p2,type:'vaccine',title:'ฉีดวัคซีนพิษสุนัขบ้า (ตามนัดที่เลยมา)',date:addDays(3),time:'09:00',place:'คลินิกหมอหมา บางนา',notes:'งดอาหารก่อน 2 ชั่วโมง'},
      {id:uid(),petId:p2,type:'other',title:'ให้ยาป้องกันพยาธิหนอนหัวใจ',date:addDays(5),time:'19:00',place:'บ้าน',notes:'ผสมในอาหารเย็น'},
      {id:uid(),petId:p3,type:'checkup',title:'ตรวจฟันซ้ำ',date:addDays(8),time:'14:00',place:'โรงพยาบาลสัตว์เล็กและสัตว์แปลก',notes:''},
      {id:uid(),petId:p1,type:'vaccine',title:'วัคซีนรวมแมว (FVRCP) ประจำปี',date:addDays(15),time:'10:30',place:'โรงพยาบาลสัตว์ทองหล่อ',notes:'พาใส่กระเป๋าแมว อย่าให้หนี'},
      {id:uid(),petId:p2,type:'checkup',title:'ตรวจติดตามอาการขาหลัง',date:addDays(20),time:'16:00',place:'คลินิกหมอหมา บางนา',notes:''},
      {id:uid(),petId:p3,type:'vaccine',title:'หยอดยาป้องกันเห็บหมัด',date:addDays(28),time:'11:00',place:'โรงพยาบาลสัตว์เล็กและสัตว์แปลก',notes:''},
    ],
  };
}
let st;
try{st=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!st||!st.pets)st=seed();
if(!MASCOTS[st.mascot])st.mascot='main';
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
save();
const M=()=>MASCOTS[st.mascot];
const pet=id=>st.pets.find(p=>p.id===id);
const vstatus=v=>{if(v.next){const n=diff(v.next);if(n<0)return 'over';if(n<=30)return 'soon'}return v.given?'done':'soon'};
const VS={done:'ฉีดแล้ว',soon:'ใกล้ถึงกำหนด',over:'เลยกำหนด'};
const VIC={done:'check',soon:'clock',over:'warn'};
const statusChip=s=>`<span class="status ${s}">${I[VIC[s]]}${VS[s]}</span>`;
function nextFor(pid){
  const c=[];st.vaccines.filter(v=>v.petId===pid&&v.next).forEach(v=>c.push({date:v.next,label:v.name}));
  st.appts.filter(a=>a.petId===pid&&a.type==='vaccine'&&diff(a.date)>=0).forEach(a=>c.push({date:a.date,label:a.title}));
  c.sort((a,b)=>a.date.localeCompare(b.date));return c[0]||null;
}
const overdue=pid=>st.vaccines.filter(v=>(pid?v.petId===pid:!!pet(v.petId))&&vstatus(v)==='over');
const upcomingAppts=pid=>st.appts.filter(a=>(pid?a.petId===pid:!!pet(a.petId))&&diff(a.date)>=0).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));

/* ---------- helpers ---------- */
const avatar=(p,cls='')=>{const s=SP[p.species]||SP.other;return `<div class="avatar ${cls}" style="background:${s.bg}">${s.svg}</div>`};
const mimg=(cls='em')=>`<div class="${cls}"><img src="${M().img}" alt="${esc(M().name)}"></div>`;
const emptyBox=(title,text,btn,mini)=>`<div class="empty ${mini?'mini':''}">${mimg('em')}<h3>${title}</h3><p>${text}</p>${btn||''}</div>`;
let toastT;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2200);
  document.querySelectorAll('.hero-mascot img,.bar-mascot img,.sheet-head .em img,.splash-mascot img,.tip .em img,.mascot-card .em img,.empty .em img,.confirm-art img').forEach(img=>{img.classList.remove('mascot-react');void img.offsetWidth;img.classList.add('mascot-react')})}
const go=h=>{location.hash=h};
const nav=tab=>`<nav class="nav" aria-label="เมนูหลัก">
  <button type="button" data-go="#/pets" class="${tab==='pets'?'on':''}" aria-current="${tab==='pets'?'page':'false'}">${I.paw}สัตว์เลี้ยง</button>
  <button type="button" data-go="#/health" class="${tab==='health'?'on':''}" aria-current="${tab==='health'?'page':'false'}">${I.book}สุขภาพ</button>
  <button type="button" data-go="#/appts" class="${tab==='appts'?'on':''}" aria-current="${tab==='appts'?'page':'false'}">${I.cal}นัดหมาย</button></nav>`;
const bar=(title,back,right='')=>`<header class="bar">${back?`<button class="icon-btn" data-back="${back}" aria-label="ย้อนกลับ">${I.back}</button>`:mimg('bar-mascot')}<h1>${title}</h1>${right}</header>`;


const dIn=(n,v,max,id)=>`<div class="dpick input"><span class="dshow ${v?'':'ph'}">${v?fmt(v):'เลือกวันที่'}</span><input class="dnative" id="${id||n}" type="date" name="${n}" value="${esc(v)}"${max?` max="${max}"`:''} aria-label="${v?fmt(v):'เลือกวันที่'}">${I.cal}</div>`;
const tIn=(n,v,id)=>`<div class="dpick input"><span class="dshow ${v?'':'ph'}">${v?esc(v)+' น.':'เลือกเวลา'}</span><input class="dnative" id="${id||n}" type="time" name="${n}" value="${esc(v)}" aria-label="${v?esc(v)+' น.':'เลือกเวลา'}">${I.clock}</div>`;
document.addEventListener('change',e=>{const i=e.target;if(!i.classList||!i.classList.contains('dnative'))return;const sp=i.parentElement.querySelector('.dshow');
  sp.classList.toggle('ph',!i.value);sp.textContent=i.value?(i.type==='date'?fmt(i.value):i.value+' น.'):(i.type==='date'?'เลือกวันที่':'เลือกเวลา');i.parentElement.classList.remove('err')});
document.addEventListener('click',e=>{const i=e.target;if(i.classList&&i.classList.contains('dnative')&&i.showPicker){try{i.showPicker()}catch(_){}}},true);

/* ---------- screens ---------- */
function splash(){
  const first=!st.onboarded;
  return `<div class="splash">
    <p class="tag">สมุดสุขภาพน้อง ที่คอยแซะไม่ให้คุณลืมนัด</p>
    <div class="logo">เต้าหู้</div>
    <div class="splash-mascot"><img src="${M().img}" alt=""><span class="bubble">${first?'ลงชื่อก่อน เดี๋ยวจดให้':'มาช้านะ'}</span></div>
    ${first?`<div class="intro card"><b>รู้จัก${M().name}</b><span>${M().desc} จดประวัติน้อง สมุดสุขภาพ และนัดวัคซีนไว้ที่นี่ ที่เหลือให้คุณพยาบาลเหมียวจดแทน</span></div>`:`<p class="hint">น้องๆ ${st.pets.length} ตัวรออยู่ · มีเรื่องค้าง ${overdue().length} อย่าง</p>`}
    <div class="grow" style="min-height:18px"></div>
    <button class="btn ink block" data-act="enter">${first?'ตกลง เริ่มเลย':'เข้าแอป'} ${I.chev.replace(/#414648/g,'#FFFDF8')}</button>
    ${first?'<p class="hint">ข้อมูลเก็บในเครื่องนี้ ไม่ต้องสมัครอะไรทั้งนั้น</p>':''}
  </div>`;
}
function mascotCard(){return `<div class="card mascot-card">${mimg('em')}<div><b>${M().name}</b><span>${M().desc}</span></div></div>`}

function petsScreen(){
  const ov=overdue().length, up=upcomingAppts().filter(a=>diff(a.date)<=7).length;
  const quips=['ดูแลน้องยัง?','นัดหมอ อย่าลืม!','น้องหิวแล้วมั้ง?'];
  const q=quips[new Date().getDate()%quips.length];
  let list;
  if(!st.pets.length) list=emptyBox('ว่างเปล่า... เหมือนกล่องเต้าหู้','ยังไม่มีน้องสักตัว เพิ่มมาหน่อยสิ เหมียวเหงา',`<button class="btn" data-go="#/pet/new">${I.plus} เพิ่มสัตว์เลี้ยงตัวแรก</button>`);
  else list=`<div class="stack">${st.pets.map(p=>{const n=nextFor(p.id);const s=SP[p.species]||SP.other;
    const st2=n?(diff(n.date)<0?'peach':diff(n.date)<=30?'yellow':'mint'):'';
    return `<button type="button" class="card tap pet-card" data-go="#/pet/${p.id}">${avatar(p)}
      <div class="pet-info"><h3 class="pet-name">${esc(p.name)}</h3>
      <div class="pet-meta">${s.label}${p.breed?' · '+esc(p.breed):''} · ${p.birth?age(p.birth):'ไม่ทราบอายุ'}</div>
      <div class="chips">${n?`<span class="chip ${st2}">${I.syringe} ${diff(n.date)<0?'เลยกำหนด ':''}${fmt(n.date)}</span>`:'<span class="chip">ยังไม่มีนัดวัคซีน</span>'}</div></div>
      <span class="chev">${I.chev}</span></button>`}).join('')}</div>`;
  return `<div class="screen">
    <div class="hero-head"><div class="top-actions"><button class="icon-btn" data-act="settings" aria-label="ตั้งค่า">${I.gear}</button></div>
      <div class="hero-row">${mimg('hero-mascot')}<div><span class="bubble">ว่าไง ทาสน้อง</span><h1 class="hero-title">${q}</h1></div></div>
    </div>
    <div class="section"><div class="todo">
      <button type="button" class="t peach" data-go="#/health"><b>${ov}</b><span>เลยกำหนด อย่าทำเนียน</span></button>
      <button type="button" class="t" style="background:var(--yellow)" data-go="#/appts"><b>${up}</b><span>นัดใน 7 วันนี้</span></button>
      <div class="t mint"><b>${st.pets.length}</b><span>น้องในบ้าน</span></div></div></div>
    <div class="section"><div class="sec-head"><h2>สัตว์เลี้ยงของฉัน</h2><span class="meta">${st.pets.length} ตัว</span></div>${list}</div>
  </div>${st.pets.length?`<button class="fab" data-go="#/pet/new">${I.plus.replace('currentColor','#FFFDF8')} เพิ่มน้อง</button>`:''}${nav('pets')}`;
}

function petDetail(id){
  const p=pet(id);if(!p)return notFound();
  st.selPet=id;save();
  const s=SP[p.species]||SP.other;const vs=st.vaccines.filter(v=>v.petId===id);const ov=vs.filter(v=>vstatus(v)==='over').length;
  const ups=upcomingAppts(id);const visits=st.visits.filter(v=>v.petId===id);
  return `<div class="screen">${bar('ข้อมูลน้อง','#/pets',`<button class="icon-btn" data-go="#/pet/${id}/edit" aria-label="แก้ไข">${I.edit}</button>`)}
   <div class="pet-hero">${avatar(p,'lg')}<h2>${esc(p.name)}</h2><p>${s.label}${p.breed?' · '+esc(p.breed):''}</p>
     <div class="chips">${ov?`<span class="chip peach">เลยกำหนด ${ov} รายการ</span>`:'<span class="chip mint">วัคซีนครบ เก่งมาก</span>'}<span class="chip">${SEX[p.sex]||'ไม่ระบุ'}</span></div></div>
   <div class="section"><div class="stats">
     <div class="stat">${I.cake}<b>${p.birth?age(p.birth):'—'}</b><span>อายุ</span></div>
     <div class="stat">${I.scale}<b>${p.weight?esc(p.weight)+' กก.':'—'}</b><span>น้ำหนัก</span></div>
     <div class="stat">${I.syringe}<b>${vs.length}</b><span>วัคซีน</span></div></div></div>
   <div class="section"><div class="shortcuts">
     <button class="sc y tap" data-go="#/health/${id}"><span class="ic">${I.book}</span><b>สมุดสุขภาพ</b><span>วัคซีน ${vs.length} · หาหมอ ${visits.length} ครั้ง</span></button>
     <button class="sc m tap" data-go="#/appts?pet=${id}"><span class="ic">${I.cal}</span><b>นัดหมาย</b><span>${ups.length?`ถัดไป ${fmt(ups[0].date)}`:'ยังไม่มีนัด ว่างจัด'}</span></button></div></div>
   <div class="section"><div class="sec-head"><h2>นัดที่กำลังจะถึง</h2><button class="link" data-act="addAppt" data-pet="${id}">+ เพิ่มนัด</button></div>
     ${ups.length?`<div class="stack">${ups.slice(0,3).map(apptCard).join('')}</div>`:`<div class="card">${emptyBox('ไม่มีนัดเลย','ว่างขนาดนี้ ไปนอนกลิ้งกันได้','',true)}</div>`}</div>
   <div class="section"><div class="sec-head"><h2>ประวัติน้อง</h2></div><div class="card rows">
     <div class="row"><span class="k">วันเกิด</span><span class="v">${p.birth?fmt(p.birth):'ไม่ทราบ'}</span></div>
     <div class="row"><span class="k">สี / ลักษณะ</span><span class="v">${esc(p.color)||'—'}</span></div>
     <div class="row"><span class="k">บันทึก</span><span class="v">${esc(p.notes)||'—'}</span></div></div></div>
   <div class="section"><button class="btn white block" data-act="delPet" data-id="${id}">${I.trash} ลบ ${esc(p.name)} ออกจากแอป</button></div>
  </div>${nav('pets')}`;
}

function petForm(id){
  const p=id?pet(id):{name:'',species:'dog',breed:'',birth:'',sex:'u',weight:'',color:'',notes:''};
  if(id&&!p)return notFound();
  return `<div class="screen no-nav">${bar(id?'แก้ไขข้อมูลน้อง':'เพิ่มสัตว์เลี้ยง',id?'#/pet/'+id:'#/pets')}
   <form class="form" id="petForm" data-id="${id||''}" novalidate>
    ${id?'':`<div class="tip mt8" style="margin-bottom:18px">${mimg('em')}<span>กรอกให้ครบนะ <b>เหมียวจะจำแทน</b> คุณจะได้ลืมได้เต็มที่</span></div>`}
    <div class="field"><label for="pet-name">ชื่อน้อง</label><input class="input" id="pet-name" name="name" value="${esc(p.name)}" placeholder="เช่น ข้าวปั้น" maxlength="30"></div>
    <div class="field" role="group" aria-labelledby="species-label"><span class="flabel" id="species-label">ชนิดสัตว์</span><div class="choice" data-choice="species">${Object.entries(SP).map(([k,s])=>`<button type="button" data-val="${k}" class="${p.species===k?'on':''}" aria-pressed="${p.species===k?'true':'false'}">${s.svg}${s.label}</button>`).join('')}</div></div>
    <div class="field"><label for="pet-breed">สายพันธุ์ <span class="opt">(ไม่บังคับ)</span></label><input class="input" id="pet-breed" name="breed" value="${esc(p.breed)}" placeholder="เช่น ชิสุ, เปอร์เซีย, พันธุ์ทาง"></div>
    <div class="two"><div class="field"><label for="birth">วันเกิด</label>${dIn("birth",p.birth,iso(today()),"birth")}</div>
     <div class="field"><label for="pet-weight">น้ำหนัก</label><div class="unit"><input class="input" id="pet-weight" name="weight" inputmode="decimal" value="${esc(p.weight)}" placeholder="0.0"><span>กก.</span></div></div></div>
    <div class="field" role="group" aria-labelledby="sex-label"><span class="flabel" id="sex-label">เพศ</span><div class="choice" data-choice="sex">${Object.entries(SEX).map(([k,v])=>`<button type="button" class="noic ${p.sex===k?'on':''}" data-val="${k}" aria-pressed="${p.sex===k?'true':'false'}">${v}</button>`).join('')}</div></div>
    <div class="field"><label for="pet-color">สี / ลักษณะเด่น</label><input class="input" id="pet-color" name="color" value="${esc(p.color)}" placeholder="เช่น ขาวลายส้ม มีจุดที่หู"></div>
    <div class="field"><label for="pet-notes">บันทึกเพิ่มเติม</label><textarea class="input" id="pet-notes" name="notes" placeholder="แพ้อะไร ชอบอะไร นิสัยแปลกๆ จดไว้เลย">${esc(p.notes)}</textarea></div>
    <input type="hidden" name="species" value="${p.species}"><input type="hidden" name="sex" value="${p.sex}">
   </form>
   <div class="form-foot"><button class="btn block" data-act="savePet">${I.check} ${id?'บันทึกการแก้ไข':'บันทึก เพิ่มน้องเลย'}</button></div></div>`;
}

let healthTab='vac';
function healthScreen(id){
  if(!st.pets.length)return `<div class="screen">${bar('สมุดสุขภาพ')}${emptyBox('ยังไม่มีใครให้ดูแล','เพิ่มน้องก่อน แล้วค่อยมาเปิดสมุดนะ',`<button class="btn" data-go="#/pet/new">${I.plus} เพิ่มสัตว์เลี้ยง</button>`)}</div>${nav('health')}`;
  let p=pet(id)||pet(st.selPet)||st.pets[0];st.selPet=p.id;save();
  const vs=st.vaccines.filter(v=>v.petId===p.id).sort((a,b)=>({over:0,soon:1,done:2}[vstatus(a)]-{over:0,soon:1,done:2}[vstatus(b)])||(a.next||'').localeCompare(b.next||''));
  const vis=st.visits.filter(v=>v.petId===p.id).sort((a,b)=>b.date.localeCompare(a.date));
  const cnt=k=>vs.filter(v=>vstatus(v)===k).length;
  const vacList=vs.length?`<div class="stack">${vs.map(v=>{const s=vstatus(v);return `<button type="button" class="card tap rec ${s==='over'?'over':''}" data-act="editVac" data-id="${v.id}">
      <span class="ic" style="background:${s==='over'?'var(--peach)':s==='soon'?'var(--yellow-hi)':'var(--mint)'}">${I.syringe}</span>
      <div class="body"><div style="display:flex;gap:8px;justify-content:space-between;align-items:flex-start"><h4>${esc(v.name)}</h4>${statusChip(s)}</div>
      <div class="dates"><span><i>ฉีดเมื่อ</i> ${v.given?fmt(v.given):'ยังไม่ฉีด'}</span><span><i>ครั้งถัดไป</i> ${v.next?fmt(v.next):'—'}</span></div>
      ${v.next?`<div class="countdown mt8">${s==='over'?I.warn+' '+rel(v.next)+' แล้วนะ ทำเป็นลืม?':rel(v.next)}</div>`:''}
      ${v.note?`<div class="note">${esc(v.note)}</div>`:''}</div></button>`}).join('')}</div>`
    :`<div class="card">${emptyBox('ไม่มีวัคซีนสักเข็ม?','จดไว้หน่อย ไม่งั้นเหมียวจะมองบนทุกวัน','',true)}</div>`;
  const visList=vis.length?`<div class="stack">${vis.map(v=>`<button type="button" class="card tap rec" data-act="editVisit" data-id="${v.id}"><span class="ic" style="background:var(--sky-bg)">${I.steth}</span>
      <div class="body"><h4>${esc(v.reason)}</h4><div class="sub">${fmt(v.date)} · ${esc(v.clinic)}</div>${v.notes?`<div class="note">${esc(v.notes)}</div>`:''}</div></button>`).join('')}</div>`
    :`<div class="card">${emptyBox('ยังไม่เคยไปหาหมอ','สุขภาพดี หรือแค่ยังไม่ได้จด? เหมียวสงสัย','',true)}</div>`;
  return `<div class="screen">${bar('สมุดสุขภาพ')}
   <div class="switcher">${st.pets.map(x=>`<button type="button" class="sw ${x.id===p.id?'on':''}" data-go="#/health/${x.id}" aria-pressed="${x.id===p.id?'true':'false'}">${avatar(x,'sm')}${esc(x.name)}</button>`).join('')}</div>
   <div class="section" style="padding-top:12px"><div class="todo">
     <div class="t mint"><b>${cnt('done')}</b><span>ฉีดแล้ว</span></div><div class="t" style="background:#F4E9CB"><b>${cnt('soon')}</b><span>ใกล้ถึง</span></div><div class="t peach"><b>${cnt('over')}</b><span>เลยกำหนด</span></div></div></div>
   <div class="section"><div class="seg" role="tablist" aria-label="ประเภทสมุดสุขภาพ"><button type="button" class="${healthTab==='vac'?'on':''}" data-htab="vac" aria-pressed="${healthTab==='vac'?'true':'false'}">วัคซีน</button><button type="button" class="${healthTab==='visit'?'on':''}" data-htab="visit" aria-pressed="${healthTab==='visit'?'true':'false'}">การพบสัตวแพทย์</button></div></div>
   <div class="section"><div class="sec-head"><h2>${healthTab==='vac'?'วัคซีนของ'+esc(p.name):'ประวัติหาหมอของ'+esc(p.name)}</h2><button class="btn sm" data-act="${healthTab==='vac'?'addVac':'addVisit'}" data-pet="${p.id}">${I.plus} เพิ่ม</button></div>
   ${healthTab==='vac'?vacList:visList}</div>
  </div>${nav('health')}`;
}

function apptCard(a){const d=parse(a.date);const p=pet(a.petId);const t=ATYPE[a.type]||ATYPE.other;
  return `<button type="button" class="card tap appt" data-act="viewAppt" data-id="${a.id}"><div class="datebox"><div class="m">${MS[d.getMonth()]}</div><div class="d">${d.getDate()}</div><div class="w">${WD[d.getDay()]}</div></div>
   <div class="body"><h4>${esc(a.title)}</h4><div class="sub">${p?esc(p.name)+' · ':''}${I.clock} ${esc(a.time)||'—'} น.</div>
   <div class="chips mt8"><span class="chip ${t.chip}">${I[t.ic]} ${t.label}</span><span class="chip">${rel(a.date)}</span></div></div><span class="chev">${I.chev}</span></button>`}

let calCursor=null, calSel=null;
function apptsScreen(q){
  const petF=q.pet&&pet(q.pet)?q.pet:null;
  if(!calCursor){const t=today();calCursor=new Date(t.getFullYear(),t.getMonth(),1)}
  const y=calCursor.getFullYear(),m=calCursor.getMonth();
  const start=new Date(y,m,1-new Date(y,m,1).getDay());
  const list=st.appts.filter(a=>!petF||a.petId===petF);
  const byDay={};list.forEach(a=>(byDay[a.date]=byDay[a.date]||[]).push(a));
  let cells='';for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const k=iso(d);const has=byDay[k];
    if(i===35&&d.getMonth()!==m)break;
    const dayLab=`${d.getDate()} ${ML[d.getMonth()]} ${d.getFullYear()+543}${k===iso(today())?' วันนี้':''}${has?` มีนัด ${has.length} รายการ`:''}`;
    cells+=`<button type="button" class="day ${d.getMonth()!==m?'out':''} ${k===iso(today())?'today':''} ${has?'has':''} ${calSel===k?'sel':''}" data-day="${k}" aria-pressed="${calSel===k?'true':'false'}" aria-label="${dayLab}">${d.getDate()}<span class="dots" aria-hidden="true">${has?has.slice(0,3).map(a=>`<i class="dot-${a.type}"></i>`).join(''):''}</span></button>`}
  let body;
  if(calSel){const ds=(byDay[calSel]||[]).sort((a,b)=>a.time.localeCompare(b.time));
    body=`<div class="sec-head"><h2>${fmt(calSel)}</h2><button class="link" data-act="clearDay">ดูทั้งหมด</button></div>`+(ds.length?`<div class="stack">${ds.map(apptCard).join('')}</div>`:`<div class="card">${emptyBox('วันนี้ว่างจ้า','ไม่มีนัดเลย จะเพิ่มก็ได้นะ ไม่บังคับ',`<button class="btn sm" data-act="addAppt" data-date="${calSel}" data-pet="${petF||''}">${I.plus} เพิ่มนัดวันนี้</button>`,true)}</div>`);
  }else{const ups=list.filter(a=>diff(a.date)>=0).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));const past=list.filter(a=>diff(a.date)<0).sort((a,b)=>b.date.localeCompare(a.date));
    body=`<div class="sec-head"><h2>นัดที่กำลังจะถึง</h2><span class="meta">${ups.length} นัด</span></div>`+(ups.length?`<div class="stack">${ups.map(apptCard).join('')}</div>`:`<div class="card">${emptyBox('ไม่มีนัดเลยสักนัด','ชิลเกินไปแล้ว ลองเพิ่มนัดวัคซีนดูมั้ย','',true)}</div>`)
     +(past.length?`<div class="sec-head mt16"><h2>ที่ผ่านมาแล้ว</h2></div><div class="stack" style="opacity:.7">${past.slice(0,5).map(apptCard).join('')}</div>`:'');}
  return `<div class="screen">${bar(petF?'นัดหมายของ'+esc(pet(petF).name):'ตารางนัดหมาย',petF?'#/pet/'+petF:null)}
   ${!petF&&st.pets.length?'':''}
   <div class="section"><div class="card cal"><div class="cal-head"><button class="icon-btn" data-cal="-1" aria-label="เดือนก่อน">${I.back}</button><b>${ML[m]} ${y+543}</b><button class="icon-btn" data-cal="1" aria-label="เดือนถัดไป">${I.chev}</button></div>
    <div class="cal-grid">${WD.map(w=>`<div class="wd">${w}</div>`).join('')}${cells}</div>
    <div class="legend"><span><i class="dot-vaccine"></i>วัคซีน</span><span><i class="dot-checkup"></i>ตรวจสุขภาพ</span><span><i class="dot-other"></i>อื่นๆ</span></div></div></div>
   <div class="section">${body}</div>
  </div>${st.pets.length?`<button class="fab" data-act="addAppt" data-date="${calSel||''}" data-pet="${petF||''}">${I.plus.replace('currentColor','#FFFDF8')} เพิ่มนัด</button>`:''}${nav('appts')}`;
}
const notFound=()=>`<div class="screen">${bar('ไม่เจอเลย','#/pets')}${emptyBox('หาไม่เจอ','น้องตัวนี้อาจถูกลบไปแล้ว หรือเหมียวแค่มึน',`<button class="btn" data-go="#/pets">กลับหน้าแรก</button>`)}</div>`;

/* ---------- router ---------- */
let splashSeen=sessionStorage.getItem('tofu.splash');
function route(){
  const h=location.hash.slice(1)||'/';
  const [path,qs]=h.split('?');const q=Object.fromEntries(new URLSearchParams(qs||''));
  const seg=path.split('/').filter(Boolean);
  if(!route.keep)closeSheet(true);
  let html;
  if(seg[0]==='splash'||(!splashSeen&&!seg.length))html=splash();
  else if(seg[0]==='pet'&&seg[1]==='new')html=petForm(null);
  else if(seg[0]==='pet'&&seg[2]==='edit')html=petForm(seg[1]);
  else if(seg[0]==='pet')html=petDetail(seg[1]);
  else if(seg[0]==='health'){if(q.tab)healthTab=q.tab;html=healthScreen(seg[1])}
  else if(seg[0]==='appts'){if(q.day){calSel=q.day}html=apptsScreen(q)}
  else html=petsScreen();
  app.innerHTML=html;
  const sc=app.querySelector('.screen');if(sc&&!route.keep)sc.scrollTop=0;route.keep=false;
}
const rerender=()=>{const sc=app.querySelector('.screen');const t=sc?sc.scrollTop:0;route.keep=true;route();const s2=app.querySelector('.screen');if(s2)s2.scrollTop=t};
window.addEventListener('hashchange',route);

/* ---------- sheets ---------- */
let lastFocus=null;
function sheetFocusables(){const sheet=layer.querySelector('.sheet');if(!sheet)return[];return [...sheet.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.getAttribute('aria-hidden')!=='true')}
function openSheet(html){if(!layer.classList.contains('open'))lastFocus=document.activeElement;
  layer.innerHTML=`<div class="scrim" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" tabindex="-1"><div class="grab"></div>${html}</div>`;
  const title=layer.querySelector('h3');if(title&&!title.id)title.id='sheetTitle';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{layer.classList.add('open');const sheet=layer.querySelector('.sheet');const title=layer.querySelector('h3');if(title&&!title.id)title.id='sheetTitle';if(sheet)sheet.focus()}))}
function closeSheet(now){const back=lastFocus;layer.classList.remove('open');
  const done=()=>{layer.innerHTML='';if(back&&document.contains(back)&&typeof back.focus==='function'){try{back.focus()}catch(e){}}};
  if(now){done();return}setTimeout(()=>{if(!layer.classList.contains('open'))done()},300)}
const petSelect=(sel)=>`<select class="input" id="petId" name="petId">${st.pets.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)} (${(SP[p.species]||SP.other).label})</option>`).join('')}</select>`;

function vacSheet(v,petId){
  const isNew=!v;v=v||{name:'',given:iso(today()),next:'',note:'',petId};
  openSheet(`<div class="sheet-head">${mimg('em')}<div><h3 id="sheetTitle">${isNew?'บันทึกวัคซีน':'แก้ไขวัคซีน'}</h3><p class="lead" style="margin:0">ของ${esc(pet(v.petId).name)} · ฉีดแล้วจดเลย อย่าดอง</p></div></div>
  <form id="vacForm" data-id="${isNew?'':v.id}" data-pet="${v.petId}" novalidate>
   <div class="field"><label for="vac-name">ชื่อวัคซีน</label><input class="input" id="vac-name" name="name" value="${esc(v.name)}" placeholder="เช่น วัคซีนรวม, พิษสุนัขบ้า" list="vacNames"><datalist id="vacNames"><option value="วัคซีนรวมสุนัข (DHPPL)"><option value="วัคซีนรวมแมว (FVRCP)"><option value="วัคซีนพิษสุนัขบ้า"><option value="วัคซีนลิวคีเมียแมว (FeLV)"><option value="ยาป้องกันพยาธิหนอนหัวใจ"></datalist></div>
   <div class="two"><div class="field"><label for="given">วันที่ฉีด</label>${dIn("given",v.given,null,"given")}</div><div class="field"><label for="next">นัดครั้งถัดไป</label>${dIn("next",v.next,null,"next")}</div></div>
   <div class="field"><label for="vac-note">หมายเหตุ <span class="opt">(ไม่บังคับ)</span></label><textarea class="input" id="vac-note" name="note" placeholder="ล็อตวัคซีน อาการหลังฉีด ฯลฯ">${esc(v.note)}</textarea></div>
  </form>
  <div class="btn-row">${isNew?'':`<button class="btn white" data-act="delVac" data-id="${v.id}">${I.trash} ลบ</button>`}<button class="btn" data-act="saveVac">${I.check} บันทึก</button></div>`);
}
function visitSheet(v,petId){
  const isNew=!v;v=v||{date:iso(today()),clinic:'',reason:'',notes:'',petId};
  openSheet(`<div class="sheet-head">${mimg('em')}<div><h3 id="sheetTitle">${isNew?'บันทึกการหาหมอ':'แก้ไขการหาหมอ'}</h3><p class="lead" style="margin:0">ของ${esc(pet(v.petId).name)} · หมอพูดอะไร จดไว้ก่อนลืม</p></div></div>
  <form id="visitForm" data-id="${isNew?'':v.id}" data-pet="${v.petId}" novalidate>
   <div class="two"><div class="field"><label for="visit-date">วันที่</label>${dIn("date",v.date,null,"visit-date")}</div><div class="field"><label for="visit-reason">สาเหตุ</label><input class="input" id="visit-reason" name="reason" value="${esc(v.reason)}" placeholder="เช่น ตรวจประจำปี"></div></div>
   <div class="field"><label for="visit-clinic">คลินิก / โรงพยาบาล</label><input class="input" id="visit-clinic" name="clinic" value="${esc(v.clinic)}" placeholder="เช่น โรงพยาบาลสัตว์ใกล้บ้าน"></div>
   <div class="field"><label for="visit-notes">ผลตรวจ / คำแนะนำหมอ</label><textarea class="input" id="visit-notes" name="notes" placeholder="ยาที่ได้ ผลเลือด นัดติดตาม">${esc(v.notes)}</textarea></div>
  </form>
  <div class="btn-row">${isNew?'':`<button class="btn white" data-act="delVisit" data-id="${v.id}">${I.trash} ลบ</button>`}<button class="btn" data-act="saveVisit">${I.check} บันทึก</button></div>`);
}
function apptSheet(a,opts){
  opts=opts||{};const isNew=!a;
  a=a||{petId:opts.pet||st.selPet||st.pets[0].id,type:'vaccine',title:'',date:opts.date||addDays(1),time:'10:00',place:'',notes:''};
  if(!pet(a.petId))a.petId=st.pets[0].id;
  openSheet(`<div class="sheet-head">${mimg('em')}<div><h3 id="sheetTitle">${isNew?'เพิ่มนัดหมาย':'แก้ไขนัดหมาย'}</h3><p class="lead" style="margin:0">นัดแล้วต้องไปนะ เหมียวจะคอยทวง</p></div></div>
  <form id="apptForm" data-id="${isNew?'':a.id}" novalidate>
   <div class="field"><label for="petId">น้องตัวไหน</label>${petSelect(a.petId)}</div>
   <div class="field" role="group" aria-labelledby="type-label"><span class="flabel" id="type-label">ประเภทนัด</span><div class="choice" data-choice="type">${Object.entries(ATYPE).map(([k,t])=>`<button type="button" data-val="${k}" class="${a.type===k?'on':''}" aria-pressed="${a.type===k?'true':'false'}">${I[t.ic]}${t.label}</button>`).join('')}</div><input type="hidden" name="type" value="${a.type}"></div>
   <div class="field"><label for="appt-title">หัวข้อนัด</label><input class="input" id="appt-title" name="title" value="${esc(a.title)}" placeholder="เช่น ฉีดวัคซีนรวมเข็มกระตุ้น"></div>
   <div class="two"><div class="field"><label for="appt-date">วันที่</label>${dIn("date",a.date,null,"appt-date")}</div><div class="field"><label for="appt-time">เวลา</label>${tIn("time",a.time,"appt-time")}</div></div>
   <div class="field"><label for="appt-place">สถานที่</label><input class="input" id="appt-place" name="place" value="${esc(a.place)}" placeholder="คลินิกหรือโรงพยาบาลสัตว์"></div>
   <div class="field"><label for="appt-notes">หมายเหตุ <span class="opt">(ไม่บังคับ)</span></label><textarea class="input" id="appt-notes" name="notes" placeholder="เช่น งดอาหารก่อนไป">${esc(a.notes)}</textarea></div>
  </form>
  <button class="btn block" data-act="saveAppt">${I.check} ${isNew?'บันทึกนัด':'บันทึกการแก้ไข'}</button>`);
}
function apptDetail(a){const p=pet(a.petId);const t=ATYPE[a.type]||ATYPE.other;
  openSheet(`<div class="sheet-head">${p?avatar(p):''}<div><span class="chip ${t.chip}">${I[t.ic]} ${t.label}</span><h3 id="sheetTitle" style="margin-top:6px">${esc(a.title)}</h3></div></div>
  <div class="card rows">
   <div class="row"><span class="k">น้อง</span><span class="v">${p?esc(p.name):'—'}</span></div>
   <div class="row"><span class="k">วันที่</span><span class="v">${fmtLong(a.date)}<div class="countdown">${rel(a.date)}</div></span></div>
   <div class="row"><span class="k">เวลา</span><span class="v">${esc(a.time)||'—'} น.</span></div>
   <div class="row"><span class="k">สถานที่</span><span class="v">${esc(a.place)||'—'}</span></div>
   <div class="row"><span class="k">หมายเหตุ</span><span class="v">${esc(a.notes)||'—'}</span></div></div>
  ${diff(a.date)>=0&&diff(a.date)<=3?`<div class="tip mt16">${mimg('em')}<span>ใกล้แล้วนะ <b>${rel(a.date)}</b> อย่ามาบอกว่าลืม</span></div>`:''}
  <div class="btn-row mt16"><button class="btn white" data-act="delAppt" data-id="${a.id}">${I.trash} ลบนัด</button><button class="btn" data-act="editAppt" data-id="${a.id}">${I.edit} แก้ไข</button></div>`);
}
function confirmSheet(title,text,act,id,label){
  openSheet(`<div class="center"><div class="confirm-art"><img src="${M().img}" alt=""></div><h3 id="sheetTitle">${title}</h3><p class="lead">${text}</p></div>
  <div class="btn-row"><button class="btn white" data-act="closeSheet">ไม่ลบแล้ว</button><button class="btn danger" data-act="${act}" data-id="${id}">${I.trash} ${label||'ลบเลย'}</button></div>`);
}
function settingsSheet(){
  openSheet(`<h3 id="sheetTitle">ตั้งค่า</h3><p class="lead">มาสคอตประจำแอป จะโผล่ทุกหน้าคอยมองบนใส่คุณ</p>${mascotCard()}
  <div class="card mt16 rows"><div class="row"><span class="k">เวอร์ชัน</span><span class="v">ต้นแบบ 0.2 (เก็บข้อมูลในเครื่อง)</span></div></div>
  <div class="btn-row mt16"><button class="btn white" data-act="reset">ล้างข้อมูลตัวอย่าง</button><button class="btn" data-act="closeSheet">เรียบร้อย</button></div>`);
}

/* ---------- form utils ---------- */
const fdata=f=>Object.fromEntries(new FormData(f).entries());
const REQ={petForm:['name'],vacForm:['name'],visitForm:['reason','date'],apptForm:['title','date']};
function markErr(input,bad){
  if(!input)return;
  const field=input.classList&&input.classList.contains('dnative')?input.parentElement:input;
  field.classList.toggle('err',!!bad);
  const eid=(input.id||input.name||'field')+'-err';
  let err=document.getElementById(eid);
  if(bad){
    input.setAttribute('aria-invalid','true');
    input.setAttribute('aria-describedby',eid);
    if(!err){field.insertAdjacentHTML('afterend',`<div class="err-msg" id="${eid}" role="alert">ช่องนี้ต้องกรอกนะ อย่าขี้เกียจ</div>`)}
  }else{
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    if(err)err.remove();
  }
}
function need(f,names){let ok=true;names.forEach(n=>{const el=f.elements[n];const bad=!String(el&&el.value||'').trim();markErr(el,bad);if(bad)ok=false});return ok}
document.addEventListener('focusout',e=>{
  const el=e.target;if(!el||!el.name)return;
  const f=el.closest('form');if(!f||!REQ[f.id]||!REQ[f.id].includes(el.name))return;
  markErr(el,!String(el.value).trim());
},true);
document.addEventListener('input',e=>{
  const el=e.target;if(!el||!el.name||el.getAttribute('aria-invalid')!=='true')return;
  if(String(el.value).trim())markErr(el,false);
});

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-back],[data-act],[data-htab],[data-cal],[data-day],.choice button');
  if(!t)return;
  if(t.matches('.choice button')){const box=t.parentElement;box.querySelectorAll('button').forEach(b=>{const on=b===t;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
    const form=t.closest('form');form.elements[box.dataset.choice].value=t.dataset.val;return}
  if(t.dataset.go){go(t.dataset.go);return}
  if(t.dataset.back){go(t.dataset.back);return}
  if(t.dataset.htab){healthTab=t.dataset.htab;rerender();return}
  if(t.dataset.cal){calCursor=new Date(calCursor.getFullYear(),calCursor.getMonth()+Number(t.dataset.cal),1);calSel=null;rerender();return}
  if(t.dataset.day){calSel=calSel===t.dataset.day?null:t.dataset.day;const d=parse(t.dataset.day);
    if(d.getMonth()!==calCursor.getMonth())calCursor=new Date(d.getFullYear(),d.getMonth(),1);
    rerender();const s=app.querySelectorAll('.section')[1];if(s&&calSel)s.scrollIntoView({behavior:'smooth',block:'start'});return}
  const a=t.dataset.act,id=t.dataset.id;
  switch(a){
   case 'enter':st.onboarded=true;save();splashSeen='1';sessionStorage.setItem('tofu.splash','1');go('#/pets');if(location.hash==='#/pets')route();break;
   case 'settings':settingsSheet();break;
   case 'closeSheet':closeSheet();break;
   case 'reset':localStorage.removeItem(KEY);st=seed();st.onboarded=true;save();closeSheet();rerender();toast('รีเซ็ตแล้ว เหมือนเริ่มชีวิตใหม่');break;
   case 'savePet':{const f=$('#petForm');if(!need(f,['name']))return;const d=fdata(f);const pid=f.dataset.id;
     if(pid){Object.assign(pet(pid),d);save();toast('แก้แล้ว ดูดีขึ้นเยอะ');go('#/pet/'+pid)}
     else{const np={id:uid(),...d};st.pets.unshift(np);st.selPet=np.id;save();toast(`ยินดีต้อนรับ ${d.name} เข้าแก๊ง`);go('#/pets')}break}
   case 'delPet':{const p=pet(id);confirmSheet(`ลบ${esc(p.name)}จริงดิ?`,'ประวัติ วัคซีน และนัดหมายทั้งหมดของน้องจะหายไปเลย กู้คืนไม่ได้นะ','doDelPet',id);break}
   case 'doDelPet':{const p=pet(id);st.pets=st.pets.filter(x=>x.id!==id);['vaccines','visits','appts'].forEach(k=>st[k]=st[k].filter(x=>x.petId!==id));if(st.selPet===id)st.selPet=st.pets[0]&&st.pets[0].id;save();closeSheet(true);toast(`ลบ${p.name}แล้ว... เหมียวเสียใจนิดนึง (นิดเดียว)`);go('#/pets');break}
   case 'addVac':vacSheet(null,t.dataset.pet);break;
   case 'editVac':vacSheet(st.vaccines.find(v=>v.id===id));break;
   case 'saveVac':{const f=$('#vacForm');if(!need(f,['name']))return;const d=fdata(f);if(f.dataset.id)Object.assign(st.vaccines.find(v=>v.id===f.dataset.id),d);else st.vaccines.push({id:uid(),petId:f.dataset.pet,...d});save();closeSheet();healthTab='vac';rerender();toast('จดวัคซีนแล้ว เก่งเกินคาด');break}
   case 'delVac':confirmSheet('ลบวัคซีนนี้?','ประวัติเข็มนี้จะหายไปเลย กู้คืนไม่ได้นะ','doDelVac',id,'ลบเลย');break;
   case 'doDelVac':st.vaccines=st.vaccines.filter(v=>v.id!==id);save();closeSheet();rerender();toast('ลบวัคซีนแล้ว');break;
   case 'addVisit':visitSheet(null,t.dataset.pet);break;
   case 'editVisit':visitSheet(st.visits.find(v=>v.id===id));break;
   case 'saveVisit':{const f=$('#visitForm');if(!need(f,['reason','date']))return;const d=fdata(f);if(f.dataset.id)Object.assign(st.visits.find(v=>v.id===f.dataset.id),d);else st.visits.push({id:uid(),petId:f.dataset.pet,...d});save();closeSheet();healthTab='visit';rerender();toast('บันทึกการหาหมอแล้ว');break}
   case 'delVisit':confirmSheet('ลบบันทึกการหาหมอ?','รายการนี้จะหายไปเลย กู้คืนไม่ได้นะ','doDelVisit',id,'ลบเลย');break;
   case 'doDelVisit':st.visits=st.visits.filter(v=>v.id!==id);save();closeSheet();rerender();toast('ลบบันทึกแล้ว');break;
   case 'addAppt':apptSheet(null,{date:t.dataset.date||null,pet:t.dataset.pet||null});break;
   case 'viewAppt':apptDetail(st.appts.find(x=>x.id===id));break;
   case 'editAppt':apptSheet(st.appts.find(x=>x.id===id));break;
   case 'saveAppt':{const f=$('#apptForm');if(!need(f,['title','date']))return;const d=fdata(f);if(f.dataset.id)Object.assign(st.appts.find(x=>x.id===f.dataset.id),d);else st.appts.push({id:uid(),...d});save();closeSheet();
     if(location.hash.startsWith('#/appts')){const dd=parse(d.date);calCursor=new Date(dd.getFullYear(),dd.getMonth(),1);calSel=d.date}rerender();toast(`นัดแล้ว ${fmt(d.date)} อย่าเบี้ยวนะ`);break}
   case 'delAppt':confirmSheet('ยกเลิกนัดนี้?','ถ้ายกเลิกแล้ว อย่าลืมโทรบอกคลินิกด้วยนะ','doDelAppt',id,'ยกเลิกนัด');break;
   case 'doDelAppt':st.appts=st.appts.filter(x=>x.id!==id);save();closeSheet();rerender();toast('ยกเลิกนัดแล้ว');break;
   case 'clearDay':calSel=null;rerender();break;
  }
});
document.addEventListener('keydown',e=>{
  if(!layer.querySelector('.sheet'))return;
  if(e.key==='Escape'){e.preventDefault();closeSheet();return}
  if(e.key!=='Tab')return;
  const list=sheetFocusables();if(!list.length)return;
  const first=list[0],last=list[list.length-1];
  if(e.shiftKey&&(document.activeElement===first||!layer.contains(document.activeElement))){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
route();
})();
