/* เต้าหู้ — UX/UI prototype 0.3 (vanilla JS, localStorage schema 3) */
(function(){
'use strict';
const KEY='tofu.v3', OLD_KEYS=['tofu.v2'], SCHEMA=3, SOON=7; /* SOON: เกณฑ์ «ใกล้ถึง» เดียวทั้งแอป = 7 วัน (วันนี้ถึงอีก 6 วัน) */
const $=s=>document.querySelector(s);
const app=$('#app'), layer=$('#sheetLayer'), dlg=$('#dlgLayer'), toastEl=$('#toast');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const reduceMotion=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- dates (พ.ศ.) ---------- */
const MS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const ML=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const WD=['อา','จ','อ','พ','พฤ','ศ','ส'];
const WDL=['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{if(!s)return null;const[y,m,d]=s.split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const todayIso=()=>iso(today());
const addDays=(n,base)=>{const d=base?parse(base):today();d.setDate(d.getDate()+n);return iso(d)};
const addYears=n=>{const d=today();d.setFullYear(d.getFullYear()+n);return iso(d)};
const MIN_DATE='2000-01-01';
const fmt=s=>{const d=parse(s);return d?`${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()+543}`:'—'};
const fmtLong=s=>{const d=parse(s);return d?`${WDL[d.getDay()]}ที่ ${d.getDate()} ${ML[d.getMonth()]} ${d.getFullYear()+543}`:'—'};
const diff=s=>Math.round((parse(s)-today())/864e5);
const rel=s=>{const n=diff(s);if(n===0)return 'วันนี้';if(n===1)return 'พรุ่งนี้';if(n===-1)return 'เมื่อวาน';return n>0?`อีก ${n} วัน`:`เลยมา ${-n} วัน`};
const timeTxt=t=>t?esc(t)+' น.':'ไม่ระบุเวลา';
const byDT=(a,b)=>(a.date+(a.time||'99:99')).localeCompare(b.date+(b.time||'99:99'));
const in7=s=>{const n=diff(s);return n>=0&&n<SOON};
function fmtBirth(p){if(!p.birth)return 'ไม่ทราบ';const[y,m]=p.birth.split('-').map(Number);
  if(p.birthPrec==='y')return 'ปี '+(y+543)+' (ไม่ทราบวัน)';if(p.birthPrec==='ym')return ML[m-1]+' '+(y+543)+' (ไม่ทราบวัน)';return fmt(p.birth)}
function age(p){if(!p||!p.birth)return '';const t=today();const[y,m,d]=p.birth.split('-').map(Number);
  if(p.birthPrec==='y'){const n=t.getFullYear()-y;return n<1?'ไม่ถึงปี':'ราว '+n+' ปี'}
  let mo=(t.getFullYear()-y)*12+(t.getMonth()+1-m);if(p.birthPrec!=='ym'&&t.getDate()<d)mo--;
  if(mo<1)return 'ไม่ถึงเดือน';const yy=Math.floor(mo/12),r=mo%12;const s=(yy?yy+' ปี':'')+(yy&&r?' ':'')+(r?r+' เดือน':'');return p.birthPrec==='ym'?'ราว '+s:s}

/* ---------- icons ---------- */
const S='stroke="#414648" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const I={
 paw:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M8 17.2c0-2.6 1.8-4.6 4-4.6s4 2 4 4.6c0 1.6-1.3 2.4-2.6 2.1-.6-.1-.9-.3-1.4-.3s-.8.2-1.4.3C9.3 19.6 8 18.8 8 17.2z"/><circle cx="6.2" cy="11.2" r="1.7"/><circle cx="9.6" cy="7.4" r="1.8"/><circle cx="14.4" cy="7.4" r="1.8"/><circle cx="17.8" cy="11.2" r="1.7"/></svg>`,
 home:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4 11.2 12 4.5l8 6.7V20H4z"/><path d="M9.5 20v-5.5h5V20"/></svg>`,
 book:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5z"/><path d="M5 18a2 2 0 0 1 2-2h11.5"/><path d="M11.8 7.6v5M9.3 10.1h5"/></svg>`,
 cal:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.8" y="5.2" width="16.4" height="15" rx="3.5"/><path d="M3.8 10h16.4M8.3 3.3v3.4M15.7 3.3v3.4"/></svg>`,
 plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
 back:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.8"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>`,
 chev:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.6"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>`,
 x:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.8"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>`,
 edit:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 19.5 5.3 15 15.6 4.7a2.1 2.1 0 0 1 3 3L8.3 18 4.5 19.5z"/><path d="M13.8 6.5l3.5 3.5"/></svg>`,
 trash:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 12.5h9l1-12.5"/><path d="M10.2 10.5v6M13.8 10.5v6"/></svg>`,
 gear:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M12 2.8l1.6 2.3 2.8-.4.6 2.7 2.5 1.3-1 2.6 1 2.6-2.5 1.3-.6 2.7-2.8-.4L12 21.2l-1.6-2.3-2.8.4-.6-2.7-2.5-1.3 1-2.6-1-2.6 2.5-1.3.6-2.7 2.8.4z"/><circle cx="12" cy="12" r="3"/></svg>`,
 syringe:`<svg viewBox="0 0 24 24" fill="none" ${S}><g transform="rotate(45 12 12)"><rect x="9" y="6.5" width="6" height="10" rx="1.2"/><path d="M12 16.5v5M8 6.5h8M12 6.5V3M9.5 3h5M9 9.5h3M9 12.5h3"/></g></svg>`,
 steth:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 3.5H4.5v5a4.5 4.5 0 0 0 9 0v-5H12"/><path d="M9 13v1.5a5 5 0 0 0 10 0V12"/><circle cx="19" cy="10" r="2.2"/></svg>`,
 scissors:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="6.5" cy="7" r="2.8"/><circle cx="6.5" cy="17" r="2.8"/><path d="M8.8 8.6 19.5 18M8.8 15.4 19.5 6"/></svg>`,
 clock:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
 cake:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 20.5v-7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7z"/><path d="M4.5 16c1.3 1 2.5 1 3.750 0s2.5-1 3.75 0 2.5 1 3.75 0 2.5-1 3.75 0M12 11.5V8.5"/></svg>`,
 scale:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.5" y="4" width="17" height="16" rx="4"/><path d="M8 9.5a5 5 0 0 1 8 0l-2.6 2.3M12 12l1.5-1.5"/></svg>`,
 check:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="3.2"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
 note:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 3.5h8.5L19 8v12.5H6z"/><path d="M14 3.5V8.5h5M9 13h6.5M9 16.5h4"/></svg>`,
 bell:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>`,
 share:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="8" cy="9" r="3"/><circle cx="16.5" cy="8" r="2.5"/><path d="M3 19.5c.6-3.3 2.6-5.2 5-5.2s4.4 1.9 5 5.2M13.6 14.6c.9-.6 1.8-.9 2.9-.9 2.1 0 3.7 1.6 4.2 4.6"/></svg>`,
 photo:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m4.5 17 5-4.5 3.5 3 2.5-2 4 3.5"/></svg>`,
 copy:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/></svg>`,
 repeat:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 11V9.5a3 3 0 0 1 3-3h11M15.5 3.5l3 3-3 3M19.5 13v1.5a3 3 0 0 1-3 3h-11M8.5 20.5l-3-3 3-3"/></svg>`,
 lock:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>`,
 warn:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M12 4.2 20.5 19H3.5L12 4.2z"/><path d="M12 10v4.5" stroke-width="2.4"/><circle cx="12" cy="17" r="1" fill="#414648"/></svg>`,
 list:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M9 6.5h10.5M9 12h10.5M9 17.5h10.5"/><circle cx="5" cy="6.5" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="5" cy="17.5" r="1.2"/></svg>`,
};
Object.keys(I).forEach(k=>{I[k]=I[k].replace('<svg ','<svg aria-hidden="true" focusable="false" ')});
const SP={
 dog:{label:'สุนัข',bg:'#F4E9CB',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M11 15c-4 1-6 8-4 13 1.5 2.5 4 1 5-1" fill="#BA905D"/><path d="M37 15c4 1 6 8 4 13-1.5 2.5-4 1-5-1" fill="#BA905D"/><path d="M12 22c0-7 5-11 12-11s12 4 12 11v5c0 7-5 11-12 11s-12-4-12-11z" fill="#E9CFA2"/><circle cx="19" cy="23" r="1.6" fill="#414648"/><circle cx="29" cy="23" r="1.6" fill="#414648"/><path d="M21.5 29.5h5l-2.5 2.5z" fill="#414648"/><path d="M24 32v2.2c-1 1.4-3 1.4-4 0M24 34.2c1 1.4 3 1.4 4 0"/></svg>`},
 cat:{label:'แมว',bg:'#E9ECEA',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M11 21 10 8l9 6M37 21l1-13-9 6" fill="#EFEBE4"/><path d="M10 26c0-8 6-13 14-13s14 5 14 13-6 12-14 12-14-4-14-12z" fill="#EFEBE4"/><path d="M17 24.5q2-2 4 0M27 24.5q2-2 4 0"/><path d="M22.5 28.5h3L24 30z" fill="#E8B9AA"/><path d="M24 30q-1.5 2.5-4 1.5M24 30q1.5 2.5 4 1.5M7 27l7 1M7 31l7-1M41 27l-7 1M41 31l-7-1"/></svg>`},
 rabbit:{label:'กระต่าย',bg:'#F4E3DC',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M14 22c-6-2-8-9-7-12 3-1 8 3 10 9M34 22c6-2 8-9 7-12-3-1-8 3-10 9" fill="#E3C9A6"/><path d="M11 29c0-7 6-11 13-11s13 4 13 11-6 10-13 10-13-3-13-10z" fill="#F3E3CB"/><circle cx="18.5" cy="27" r="1.6" fill="#414648"/><circle cx="29.5" cy="27" r="1.6" fill="#414648"/><path d="M22.5 31h3L24 32.5zM24 32.5v2M22 34.5h4"/></svg>`},
 bird:{label:'นก',bg:'#E7EDE0',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M24 9c-8 0-13 6-13 14 0 9 6 16 13 16s13-7 13-16c0-8-5-14-13-14z" fill="#C9D8BE"/><path d="M14 27c-4 2-5 6-4 8 3 0 6-2 7-5M34 27c4 2 5 6 4 8-3 0-6-2-7-5" fill="#A9BF9E"/><circle cx="19" cy="21" r="1.6" fill="#414648"/><circle cx="29" cy="21" r="1.6" fill="#414648"/><path d="M21 25h6l-3 4z" fill="#E9D3A8"/></svg>`},
 other:{label:'อื่นๆ',bg:'#F4E9CB',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M16 33c0-5 3.6-9 8-9s8 4 8 9c0 3-2.5 4.6-5 4.1-1.2-.2-1.8-.6-3-.6s-1.8.4-3 .6c-2.5.5-5-1.1-5-4.1z" fill="#E9CFA2"/><circle cx="12" cy="22.5" r="3.4" fill="#E9CFA2"/><circle cx="19" cy="14.6" r="3.6" fill="#E9CFA2"/><circle cx="29" cy="14.6" r="3.6" fill="#E9CFA2"/><circle cx="36" cy="22.5" r="3.4" fill="#E9CFA2"/></svg>`},
};
Object.values(SP).forEach(s=>{s.svg=s.svg.replace('<svg ','<svg aria-hidden="true" focusable="false" ')});
const SEX={m:'ตัวผู้',f:'ตัวเมีย',u:'ไม่ระบุ'};
const ATYPE={vaccine:{label:'ฉีดวัคซีน',chip:'yellow',ic:'syringe',mk:'vaccine'},checkup:{label:'ตรวจสุขภาพ',chip:'sky',ic:'steth',mk:'checkup'},grooming:{label:'Grooming',chip:'peach',ic:'scissors',mk:'grooming'},other:{label:'อื่นๆ',chip:'mint',ic:'note',mk:'other'}};
const BREEDS={
 cat:['เปอร์เซีย','สก็อตติชโฟลด์','บริติชช็อตแฮร์','อเมริกันช็อตแฮร์','เมนคูน','แร็กดอลล์','เอ็กซ์โซติกช็อตแฮร์','เบงกอล','วิเชียรมาศ','ขาวมณี'],
 dog:['ชิวาวา','ปอมเมอเรเนียน','ชิสุ','พุดเดิ้ล','ไซบีเรียนฮัสกี้','โกลเด้นรีทรีฟเวอร์','ลาบราดอร์รีทรีฟเวอร์','เฟรนช์บูลด็อก','คอร์กี้','บีเกิ้ล'],
};
const BREED_MIX='ไทย/พันธุ์ผสม', BREED_UNK='ไม่ทราบ';
const COLORS={white:{label:'ขาว',hex:'#FBF8F0'},cream:{label:'ครีม',hex:'#E8CF9E'},gold:{label:'ทอง',hex:'#D29A32'},orange:{label:'ส้ม',hex:'#D9733A'},brown:{label:'น้ำตาล',hex:'#7E5233'},gray:{label:'เทา',hex:'#8E918F'},black:{label:'ดำ',hex:'#2E3032'},calico:{label:'สามสี / ลาย',hex:'#D9733A'}};
const COLOR_KEYS=Object.keys(COLORS);
const VACS=[
 {value:'rabies',label:'วัคซีนพิษสุนัขบ้า (Rabies)',species:'all'},
 {value:'dog_5in1',label:'วัคซีนรวมสุนัข 5 โรค (DHPPi)',species:'dog'},
 {value:'dog_6in1',label:'วัคซีนรวมสุนัข 6 โรค (DHPPi+L)',species:'dog'},
 {value:'kennel_cough',label:'วัคซีนหลอดลมอักเสบสุนัข (Kennel Cough)',species:'dog'},
 {value:'cat_3in1',label:'วัคซีนรวมแมว 3 โรค (FVRCP)',species:'cat'},
 {value:'cat_4in1',label:'วัคซีนรวมแมว 4 โรค (FVRCP-C)',species:'cat'},
 {value:'felv',label:'วัคซีนลิวคีเมียแมว (FeLV)',species:'cat'},
 {value:'fiv',label:'วัคซีนเอดส์แมว (FIV)',species:'cat'},
 {value:'fip',label:'วัคซีนเยื่อบุช่องท้องอักเสบแมว (FIP)',species:'cat'},
 {value:'other',label:'อื่นๆ (Other)',species:'all'},
];
const VACMAP=Object.fromEntries(VACS.map(v=>[v.value,v]));
const vacOpts=sp=>VACS.filter(v=>v.species==='all'||v.species===sp);
const NIM={main:'nim-main.png',hello:'nim-hello.png',writing:'nim-writing.png',trash:'nim-trash.png',syringe:'nim-syringe.png',healthbook:'nim-healthbook.png',appointment:'nim-appointment.png',thumbsup:'nim-thumbsup.png',sleep:'nim-sleep.png',badge:'nim-badge.png'};
const NIM_DESC='ก้อนเต้าหู้ไหมหน้าตาย ใส่หมวกพยาบาลลายอุ้งเท้า มีต้นหอมแปะหัว คอยจดทุกนัดแบบขี้เกียจแต่ชัวร์';

/* ---------- state + migration ---------- */
const genCode=()=>String(Math.floor(100000+Math.random()*900000));
const familyDefault=()=>({code:genCode(),members:[{id:uid(),name:'ฉัน',role:'owner',self:true}]});
function seed(){
  const p1=uid(),p2=uid(),p3=uid();const w=(n,kg)=>({id:uid(),date:addDays(n),kg});
  const V=(petId,type,given,next,name,note)=>({id:uid(),petId,type,name:name||'',given:addDays(given),next:next==null?'':addDays(next),note:note||''});
  const A=(petId,type,title,d,time,place,extra)=>Object.assign({id:uid(),petId,type,title,date:addDays(d),time,place,notes:'',status:'planned',vacKey:''},extra||{});
  return {schema:SCHEMA,onboarded:false,selPet:p1,
    pets:[
      {id:p1,name:'มะลิ',species:'cat',breed:'สก็อตติชโฟลด์',birth:'2023-03-14',birthPrec:'ymd',sex:'f',color:'gray',colorOther:'',look:'ขาวเทา หูพับ ตาสีทอง',notes:'ชอบนอนบนโซฟา ไม่ชอบอาบน้ำ แพ้อาหารทะเลบางชนิด',weights:[w(-180,3.8),w(-95,4.0),w(-12,4.2)]},
      {id:p2,name:'ทองดี',species:'dog',breed:'โกลเด้นรีทรีฟเวอร์',birth:'2021-07',birthPrec:'ym',sex:'m',color:'gold',colorOther:'',look:'สีทองอ่อน ขนยาว',notes:'ชอบว่ายน้ำ ต้องแปรงขนสัปดาห์ละ 3 ครั้ง กินเก่งมาก',weights:[w(-200,29.8),w(-120,30.6),w(-40,31.5)]},
      {id:p3,name:'ปุย',species:'rabbit',breed:'ฮอลแลนด์ลอป',birth:'2024',birthPrec:'y',sex:'f',color:'brown',colorOther:'',look:'น้ำตาลครีม หูตก',notes:'กินหญ้าทิโมธีเป็นหลัก ตกใจง่ายเวลามีเสียงดัง',weights:[w(-60,1.6)]},
    ],
    vaccines:[
      V(p1,'cat_3in1',-715,-350),V(p1,'cat_3in1',-350,15),V(p1,'rabies',-200,165),V(p1,'felv',-400,-10,'','หมอแนะนำให้มาฉีดกระตุ้น'),
      V(p2,'dog_6in1',-30,335),V(p2,'rabies',-370,-5),V(p2,'other',-25,5,'ยาป้องกันพยาธิหนอนหัวใจ','ให้ทุกเดือน'),
      V(p3,'other',-160,205,'วัคซีนโรคเลือดออกในกระต่าย (RHDV2)'),V(p3,'other',-60,28,'ยาหยอดป้องกันเห็บหมัด'),
    ],
    visits:[
      {id:uid(),petId:p1,date:addDays(-45),clinic:'โรงพยาบาลสัตว์ทองหล่อ',reason:'ตรวจสุขภาพประจำปี',notes:'สุขภาพดี น้ำหนักเหมาะสม แนะนำขูดหินปูนปีหน้า'},
      {id:uid(),petId:p1,date:addDays(-120),clinic:'คลินิกรักษ์สัตว์ อารีย์',reason:'ท้องเสีย',notes:'ให้ยาปรับลำไส้ 5 วัน หายดีแล้ว'},
      {id:uid(),petId:p2,date:addDays(-30),clinic:'โรงพยาบาลสัตว์มหาวิทยาลัยเกษตรศาสตร์',reason:'ฉีดวัคซีนรวมและตรวจเลือด',notes:'ค่าเลือดปกติทั้งหมด'},
      {id:uid(),petId:p2,date:addDays(-90),clinic:'คลินิกหมอหมา บางนา',reason:'ขาหลังเจ็บ',notes:'เอกซเรย์ไม่พบกระดูกหัก ให้พักการวิ่ง 2 สัปดาห์'},
      {id:uid(),petId:p3,date:addDays(-60),clinic:'โรงพยาบาลสัตว์เล็กและสัตว์แปลก',reason:'ตัดเล็บและตรวจฟัน',notes:'ฟันหน้ายาวเล็กน้อย นัดตรวจซ้ำ'},
    ],
    appts:[
      A(p2,'vaccine','ฉีดวัคซีนพิษสุนัขบ้า (ตามนัดที่เลยมา)',3,'09:00','คลินิกหมอหมา บางนา',{vacKey:'rabies',notes:'งดอาหารก่อน 2 ชั่วโมง'}),
      A(p1,'grooming','อาบน้ำตัดเล็บ',6,'13:00','ร้านหอมกรุ่น เพ็ทสปา'),
      A(p3,'checkup','ตรวจฟันซ้ำ',8,'14:00','โรงพยาบาลสัตว์เล็กและสัตว์แปลก'),
      A(p1,'vaccine','ฉีดวัคซีนรวมแมว 3 โรค ประจำปี',15,'10:30','โรงพยาบาลสัตว์ทองหล่อ',{vacKey:'cat_3in1',notes:'พาใส่กระเป๋าแมว อย่าให้หนี'}),
      A(p2,'checkup','ตรวจติดตามอาการขาหลัง',20,'16:00','คลินิกหมอหมา บางนา'),
      A(p3,'checkup','ตรวจผิวหนังที่หลัง',-4,'','โรงพยาบาลสัตว์เล็กและสัตว์แปลก'),
      A(p2,'grooming','ตัดขนรับหน้าร้อน',-20,'11:00','ร้านหอมกรุ่น เพ็ทสปา',{status:'done',doneAt:addDays(-20)}),
    ],
    notes:[{id:uid(),petId:p1,text:'ช่วงนี้กินน้ำน้อย ลองเปลี่ยนเป็นน้ำพุแมวดู ถ้าไม่ดีขึ้นจะพาไปหาหมอ',created:addDays(-3),updated:addDays(-3)}],
    reminders:[
      {id:uid(),petId:p2,title:'ป้อนยาแก้อักเสบหลังอาหาร',time:'19:00',start:addDays(-2),end:addDays(4),paused:false},
      {id:uid(),petId:p1,title:'แปรงฟันมะลิ',time:'21:00',start:addDays(-10),end:'',paused:false},
    ],
    family:{code:genCode(),members:[{id:uid(),name:'ฉัน',role:'owner',self:true},{id:uid(),name:'แม่',role:'carer'}]},
  };
}
const COLOR_WORDS=[['สามสี','calico'],['ลาย','calico'],['ขาว','white'],['ครีม','cream'],['ทอง','gold'],['ส้ม','orange'],['น้ำตาล','brown'],['เทา','gray'],['ดำ','black']];
function guessColor(text,used){let best=null,pos=1e9;COLOR_WORDS.forEach(([w,k])=>{const i=text.indexOf(w);if(i>=0&&i<pos){pos=i;best=k}});
  return best||COLOR_KEYS.find(k=>!used.has(k))||COLOR_KEYS[used.size%COLOR_KEYS.length]}
function guessVac(name){const n=String(name||'').toLowerCase();
  if(/พิษสุนัขบ้า|rabies/.test(n))return 'rabies';if(/fvrcp-c|รวมแมว 4/.test(n))return 'cat_4in1';if(/fvrcp|รวมแมว/.test(n))return 'cat_3in1';
  if(/felv|ลิวคีเมีย/.test(n))return 'felv';if(/\bfiv\b|เอดส์แมว/.test(n))return 'fiv';if(/\bfip\b|เยื่อบุช่องท้อง/.test(n))return 'fip';
  if(/kennel|หลอดลม/.test(n))return 'kennel_cough';if(/dhppl|dhppi\+l|6 โรค/.test(n))return 'dog_6in1';if(/dhpp|รวมสุนัข/.test(n))return 'dog_5in1';return 'other'}
/* schema 2 (key tofu.v2, ไม่มีเลขเวอร์ชัน) -> schema 3 */
function migrate2to3(s){
  const used=new Set();
  s.pets=(s.pets||[]).map(p=>{const q=Object.assign({},p);
    q.name=String(p.name||'').trim()||'ไม่มีชื่อ';q.breed=String(p.breed||'').trim();
    q.birth=p.birth||'';q.birthPrec=p.birth?(p.birthPrec||'ymd'):'';
    if(!COLORS[p.color]&&p.color!=='other'){q.look=p.look!=null?p.look:String(p.color||'');q.color=guessColor(String(p.color||''),used);q.colorOther=''}
    used.add(q.color);
    if(!Array.isArray(p.weights)){const kg=parseFloat(String(p.weight||'').replace(',','.'));q.weights=isFinite(kg)&&kg>0&&kg<=150?[{id:uid(),date:todayIso(),kg:Math.round(kg*100)/100}]:[]}
    delete q.weight;q.notes=p.notes||'';q.sex=SEX[p.sex]?p.sex:'u';q.species=SP[p.species]?p.species:'other';return q});
  s.vaccines=(s.vaccines||[]).map(v=>{const type=v.type||guessVac(v.name);return Object.assign({},v,{type,name:type==='other'?(v.name||'ไม่ระบุชื่อ'):'',given:v.given||'',next:v.next||'',note:v.note||''})});
  s.visits=s.visits||[];
  s.appts=(s.appts||[]).map(a=>{const vk=a.type==='vaccine'?(a.vacKey||guessVac(a.title)):'';return Object.assign({},a,{status:a.status||'planned',time:a.time||'',vacKey:vk==='other'?'':vk})});
  s.notes=s.notes||[];s.reminders=s.reminders||[];s.family=s.family||familyDefault();
  delete s.mascot;s.schema=3;return s;
}
function migrate(s){if(!s||!Array.isArray(s.pets))return null;let v=Number(s.schema)||2;
  if(v<3){s=migrate2to3(s);v=3}
  s.schema=SCHEMA;['vaccines','visits','appts','notes','reminders'].forEach(k=>{if(!Array.isArray(s[k]))s[k]=[]});if(!s.family)s.family=familyDefault();return s}
let migratedFrom=null;
function load(){let s=null;
  try{const raw=localStorage.getItem(KEY);if(raw)s=JSON.parse(raw)}catch(e){s=null}
  if(!s){for(const k of OLD_KEYS){try{const raw=localStorage.getItem(k);if(raw){s=JSON.parse(raw);migratedFrom=k;break}}catch(e){}}}
  /* ข้อมูลเก่าใน tofu.v2 ไม่ถูกลบ เก็บไว้เป็นสำเนาสำรอง */
  return migrate(s)||seed();
}
let st=load();
let saveWarned=0;
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));return true}catch(e){if(Date.now()-saveWarned>4000){saveWarned=Date.now();setTimeout(()=>toast('บันทึกลงเครื่องไม่ได้ พื้นที่เก็บข้อมูลของเบราว์เซอร์อาจเต็ม ข้อมูลรอบนี้จะหายเมื่อปิดหน้า'),0)}return false}}
save();

/* ---------- derived data ---------- */
const pet=id=>st.pets.find(p=>p.id===id);
const vacKeyOf=v=>v.type&&v.type!=='other'?v.type:'other:'+String(v.name||'').trim();
const vacLabelOf=v=>v.type&&v.type!=='other'&&VACMAP[v.type]?VACMAP[v.type].label:(v.name||'ไม่ระบุชื่อ');
const keyLabel=k=>k.startsWith('other:')?k.slice(6):(VACMAP[k]?VACMAP[k].label:k);
function vstatus(v){if(v.next){const n=diff(v.next);if(n<0)return 'over';if(n<SOON)return 'soon';return 'sched'}return v.given?'done':'none'}
const VS={over:'เลยกำหนด',soon:'ใกล้ถึง',sched:'มีนัดครั้งถัดไป',done:'ฉีดแล้ว',none:'ยังไม่ลงวัน'};
const VIC={over:'warn',soon:'clock',sched:'cal',done:'check',none:'note'};
const RANK={over:0,soon:1,sched:2,none:3,done:4};
const statusChip=s=>`<span class="status ${s}">${I[VIC[s]]}${VS[s]}</span>`;
function vacGroups(pid){const g={};st.vaccines.filter(v=>v.petId===pid).forEach(v=>{const k=vacKeyOf(v);(g[k]=g[k]||{key:k,petId:pid,label:vacLabelOf(v),recs:[]}).recs.push(v)});
  return Object.values(g).map(x=>{x.recs.sort((a,b)=>(b.given||'').localeCompare(a.given||''));x.latest=x.recs[0];x.status=vstatus(x.latest);x.next=x.latest.next||'';return x})
    .sort((a,b)=>RANK[a.status]-RANK[b.status]||(a.next||'9').localeCompare(b.next||'9'))}
function vacSummary(pid){const g=vacGroups(pid);const c={over:0,soon:0,sched:0,done:0,none:0};g.forEach(x=>c[x.status]++);return {groups:g,c}}
function vacBadge(pid){const {groups,c}=vacSummary(pid);
  if(!groups.length)return '<span class="chip">ยังไม่มีบันทึกวัคซีน</span>';
  if(c.over)return `<span class="chip peach">${I.warn} วัคซีนเลยกำหนด ${c.over} รายการ</span>`;
  if(c.soon)return `<span class="chip yellow">${I.clock} วัคซีนใกล้ถึงใน 7 วัน ${c.soon} รายการ</span>`;
  if(c.none)return `<span class="chip">${I.note} ยังไม่ลงวันฉีด ${c.none} รายการ</span>`;
  return `<span class="chip mint">${I.check} วัคซีนครบ เก่งมาก</span>`}
const hasPlannedFor=(pid,key)=>st.appts.some(a=>a.petId===pid&&a.type==='vaccine'&&a.status!=='done'&&a.vacKey===key&&diff(a.date)>=0);
function dueItems(){const out=[];st.pets.forEach(p=>vacGroups(p.id).forEach(g=>{if(!g.next)return;
  if(diff(g.next)>=0&&hasPlannedFor(p.id,g.key))return; /* มีนัดในหน้านัดหมายแล้ว ไม่โชว์ซ้ำ */
  out.push({kind:'due',id:'due-'+p.id+'-'+g.key,petId:p.id,type:'vaccine',date:g.next,time:'',title:'ครบกำหนด '+g.label,key:g.key,status:'planned'})}));return out}
const apptItems=()=>st.appts.filter(a=>pet(a.petId)).map(a=>Object.assign({kind:'appt'},a));
const allItems=()=>apptItems().concat(dueItems());
const isOver=it=>it.status!=='done'&&diff(it.date)<0;
const upcoming=pid=>allItems().filter(it=>(!pid||it.petId===pid)&&it.status!=='done'&&diff(it.date)>=0).sort(byDT);
const overdueItems=pid=>allItems().filter(it=>(!pid||it.petId===pid)&&isOver(it)).sort(byDT);
const remEnded=r=>!!r.end&&diff(r.end)<0;
const remOnDay=(r,day)=>!r.paused&&r.start<=day&&(!r.end||day<=r.end);
function remNext(r){if(r.paused||remEnded(r))return null;let d=r.start>todayIso()?r.start:todayIso();
  if(d===todayIso()&&r.time){const n=new Date();const[h,m]=r.time.split(':').map(Number);if(n.getHours()*60+n.getMinutes()>h*60+m)d=addDays(1)}
  if(r.end&&d>r.end)return null;return d}
const latestWeight=p=>{const w=(p.weights||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));return w[w.length-1]||null};

/* ---------- small renderers ---------- */
const nimImg=(pose,cls,size)=>`<img class="nim ${cls||''}" src="${NIM[pose]||NIM.hello}" alt="" aria-hidden="true" width="${size||88}" height="${size||88}" decoding="async">`;
const colorOf=p=>COLORS[p.color]||null;
const colorName=p=>p.color==='other'?(p.colorOther||'อื่นๆ'):(colorOf(p)?colorOf(p).label:'ไม่ระบุ');
const dot=(p,cls)=>{const c=colorOf(p);return `<span class="pdot ${p.color==='calico'?'calico':''} ${p.color==='other'||!c?'other':''} ${cls||''}" style="--c:${c?c.hex:'#DDC9AC'}" aria-hidden="true"></span>`};
const pbadge=p=>p?`<span class="pbadge">${dot(p)}<span class="pb-name">${esc(p.name)}</span></span>`:'';
const avatar=(p,cls)=>{const s=SP[p.species]||SP.other;return `<div class="avatar ${cls||''}" style="background:${s.bg}">${s.svg}${dot(p,'av-dot')}</div>`};
const emptyBox=(title,text,btn,mini,pose)=>`<div class="empty ${mini?'mini':''}">${nimImg(pose||'sleep','nim-empty',mini?84:140)}<h3>${title}</h3><p>${text}</p>${btn||''}</div>`;
const breedTxt=p=>!p.breed?'':(p.breed===BREED_UNK?'ไม่ทราบพันธุ์':p.breed);
const petMeta=p=>{const s=SP[p.species]||SP.other;return [s.label,breedTxt(p),p.birth?age(p):'ไม่ทราบอายุ'].filter(Boolean).map(esc).join(' · ')};
let toastT,toastUndo=null;
function toast(t,undo){toastEl.innerHTML=`<span class="toast-msg">${esc(t)}</span>${undo?'<button type="button" class="toast-act" data-act="undo">เลิกทำ</button>':''}`;toastUndo=undo||null;
  toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(hideToast,undo?6500:2600);
  document.querySelectorAll('.hero-nim,.bar-mascot img,.sheet-head .nim,.empty .nim').forEach(img=>{img.classList.remove('mascot-react');void img.offsetWidth;img.classList.add('mascot-react')})}
function hideToast(){toastEl.classList.remove('show');toastUndo=null;setTimeout(()=>{if(!toastEl.classList.contains('show'))toastEl.innerHTML=''},350)}
function withUndo(fn,msg){const snap=JSON.stringify(st);fn();save();rerender();toast(msg,()=>{st=JSON.parse(snap);save();rerender();toast('กู้คืนให้แล้ว')})}
/* scroll inside our own scroller only (never shifts the phone frame) */
function scrollToEl(el,center){if(!el)return;const box=el.closest('.sheet-body,.screen');if(!box)return;const r=el.getBoundingClientRect(),b=box.getBoundingClientRect();
  const top=box.scrollTop+r.top-b.top-(center?(b.height-r.height)/2:8);box.scrollTo({top:Math.max(0,top),behavior:reduceMotion()?'auto':'smooth'})}
function centerChip(el){if(!el)return;const box=el.parentElement;const left=el.offsetLeft-(box.clientWidth-el.offsetWidth)/2;box.scrollTo({left:Math.max(0,left),behavior:reduceMotion()?'auto':'smooth'})}
const go=h=>{if(location.hash===h)route();else location.hash=h};
const NAVS=[['home','#/home','home','หน้าแรก'],['health','#/health','book','สุขภาพ'],['appts','#/appts','cal','นัดหมาย'],['settings','#/settings','gear','ตั้งค่า']];
const nav=tab=>`<nav class="nav" aria-label="เมนูหลัก">${NAVS.map(([k,h,ic,l])=>`<button type="button" data-go="${h}" class="${tab===k?'on':''}" ${tab===k?'aria-current="page"':''}>${I[ic]}<span>${l}</span></button>`).join('')}</nav>`;
const bar=(title,back,right)=>`<header class="bar">${back?`<button type="button" class="icon-btn" data-go="${back}" aria-label="ย้อนกลับ">${I.back}</button>`:`<span class="bar-mascot">${nimImg('main','',44)}</span>`}<h1>${title}</h1>${right||''}</header>`;
const req='<span class="req" aria-hidden="true">*</span>';
const reqNote='<p class="req-note"><span aria-hidden="true">*</span> = ต้องกรอก ที่เหลือไม่บังคับ</p>';
const dIn=(n,v,id,o)=>{o=o||{};return `<div class="dpick input"><span class="dshow ${v?'':'ph'}" aria-hidden="true">${v?fmt(v):'เลือกวันที่'}</span><input class="dnative" id="${id}" type="date" name="${n}" value="${esc(v)}"${o.min?` min="${o.min}"`:''}${o.max?` max="${o.max}"`:''}${o.req?' aria-required="true"':''}>${I.cal}</div>`};
const tIn=(n,v,id,o)=>{o=o||{};return `<div class="dpick input"><span class="dshow ${v?'':'ph'}" aria-hidden="true">${v?esc(v)+' น.':'ไม่ระบุเวลา'}</span><input class="dnative" id="${id}" type="time" name="${n}" value="${esc(v)}"${o.req?' aria-required="true"':''}>${I.clock}</div>`};
function syncPick(i){const sp=i.parentElement.querySelector('.dshow');if(!sp)return;sp.classList.toggle('ph',!i.value);sp.textContent=i.value?(i.type==='date'?fmt(i.value):i.value+' น.'):(i.type==='date'?'เลือกวันที่':'ไม่ระบุเวลา')}
document.addEventListener('click',e=>{const i=e.target;if(i.classList&&i.classList.contains('dnative')&&i.showPicker){try{i.showPicker()}catch(_){}}},true);
const petOptions=(sel)=>st.pets.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)} (${(SP[p.species]||SP.other).label})</option>`).join('');
function sheetHead(title,lead,pose){return `<div class="sheet-head">${pose?nimImg(pose,'nim-sticker',88):''}<div class="sh-text"><h3 id="sheetTitle">${title}</h3>${lead?`<p class="lead">${lead}</p>`:''}</div></div>`}

/* ---------- greeting ---------- */
function greet(){const h=window.__TOFU_HOUR!=null?window.__TOFU_HOUR:new Date().getHours();
  if(h>=5&&h<12)return {k:'ช่วงเช้า',hi:'อรุณสวัสดิ์ ทาสน้อง',q:'ตื่นแล้วก็ไปเติมน้ำให้เจ้านายด้วย'};
  if(h>=12&&h<17)return {k:'ช่วงบ่าย',hi:'บ่ายแล้ว ง่วงยัง?',q:'นิ่มละลายไปครึ่งก้อน แต่นัดยังไม่ละลายนะ'};
  if(h>=17&&h<21)return {k:'ช่วงเย็น',hi:'เย็นแล้ว กลับบ้านยัง?',q:'เจ้านายรอข้าวเย็นอยู่ อย่าทำเนียน'};
  return {k:'ช่วงดึก',hi:'ดึกแล้ว ยังไม่นอนอีก',q:'เช็คนัดพรุ่งนี้ให้เสร็จ แล้วไปนอนซะ'}}

/* ---------- screens ---------- */
function splash(){
  return `<div class="splash">
    <p class="tag">สมุดสุขภาพน้อง ที่คอยแซะไม่ให้คุณลืมนัด</p>
    <h1 class="logo">เต้าหู้</h1>
    <div class="splash-mascot">${nimImg('main','',260)}<span class="bubble">ลงชื่อก่อน เดี๋ยวจดให้</span></div>
    <div class="intro card"><b>รู้จักน้องนิ่ม</b><span>${NIM_DESC} จดประวัติน้อง สมุดสุขภาพ และนัดวัคซีนไว้ที่นี่ ที่เหลือให้นิ่มจดแทน</span></div>
    <div class="grow" style="min-height:18px"></div>
    <button type="button" class="btn ink block" data-act="enter">ตกลง เริ่มเลย ${I.chev}</button>
    <p class="hint">ข้อมูลเก็บในเครื่องนี้ ไม่ต้องสมัครอะไรทั้งนั้น</p>
  </div>`;
}
function summaryBoxes(){
  const ups=upcoming();const n=ups[0];const n7=ups.filter(it=>in7(it.date)).length;const ov=overdueItems().length;
  const next=n?`<button type="button" class="sum-box next" ${n.kind==='due'?`data-act="viewDue" data-pet="${n.petId}" data-key="${esc(n.key)}"`:`data-act="viewAppt" data-id="${n.id}"`}>
      <span class="sic">${I.cal}</span><span class="sbody"><span class="slabel">นัดถัดไป</span><span class="smain">${fmt(n.date)} · ${rel(n.date)}</span>
      <span class="ssub">${pbadge(pet(n.petId))}<span class="stitle">${esc(n.title)}</span></span></span>
      <span class="sside"><b>${n7}</b><span>นัดใน 7 วัน</span></span></button>`
    :`<div class="sum-box next empty-box"><span class="sic">${I.cal}</span><span class="sbody"><span class="slabel">นัดถัดไป</span><span class="smain">ยังไม่มีนัดถัดไป</span><span class="ssub">ว่างจัด ลองลงนัดวัคซีนหรือตรวจสุขภาพไว้</span></span>${st.pets.length?`<button type="button" class="btn sm" data-act="addAppt">${I.plus} เพิ่มนัด</button>`:''}</div>`;
  const over=`<button type="button" class="sum-box over ${ov?'has':''}" data-go="#/overdue"><span class="sic">${I.warn}</span><span class="sbody"><span class="slabel">เลยกำหนด</span>
      <span class="smain">${ov?`${ov} รายการ ต้องเคลียร์`:'ไม่มีอะไรเลยกำหนด'}</span><span class="ssub">${ov?'วัคซีนที่เลยวันนัด และนัดที่ยังไม่เช็คว่าไปแล้ว':'เคลียร์หมดแล้ว นิ่มยอมรับว่าเก่ง'}</span></span>
      <span class="sside"><b>${ov}</b><span>ดูรายการ</span></span></button>`;
  return `<div class="sum" role="group" aria-label="สรุป">${next}${over}</div>`;
}
function homeScreen(){
  const g=greet();const sel=pet(st.selPet)||st.pets[0];const remN=st.reminders.filter(r=>!remEnded(r)).length;
  const cards=[
    ['t1','paw','โปรไฟล์สัตว์',sel?`ดูของ${esc(sel.name)} · ทั้งหมด ${st.pets.length} ตัว`:'ยังไม่มีน้อง เพิ่มเลย',sel?'#/pet/'+sel.id:'#/pet/new'],
    ['t2','book','สมุดสุขภาพ','วัคซีน หาหมอ โน๊ต และรูป','#/health'],
    ['t3','bell','ตั้งแจ้งเตือน',remN?`เตือนประจำ ${remN} รายการ · ในแอปเท่านั้น`:'เตือนซ้ำทุกวัน เช่น ป้อนยา','#/appts?rem=1'],
    ['t4','share','แชร์ให้ครอบครัว',`สมาชิก ${st.family.members.length} คน · ตัวอย่าง`,'#/share'],
  ];
  let list;
  if(!st.pets.length)list=emptyBox('ว่างเปล่า... เหมือนกล่องเต้าหู้','ยังไม่มีน้องสักตัว เพิ่มมาหน่อยสิ นิ่มเหงา',`<button type="button" class="btn" data-go="#/pet/new">${I.plus} เพิ่มสัตว์เลี้ยงตัวแรก</button>`);
  else list=`<div class="stack">${st.pets.map(p=>{const ov=overdueItems(p.id).length;const n=upcoming(p.id)[0];
    return `<button type="button" class="card tap pet-card" data-go="#/pet/${p.id}">${avatar(p)}
      <span class="pet-info"><span class="pet-name">${esc(p.name)}</span><span class="pet-meta">${petMeta(p)}</span>
      <span class="chips">${ov?`<span class="chip peach">${I.warn} เลยกำหนด ${ov}</span>`:''}${n?`<span class="chip ${in7(n.date)?'yellow':''}">${I.cal} ถัดไป ${fmt(n.date)}</span>`:(!ov?'<span class="chip">ยังไม่มีนัด</span>':'')}</span></span>
      <span class="chev">${I.chev}</span></button>`}).join('')}</div>`;
  return `<div class="screen home">
    <header class="hero"><div class="hero-text"><span class="time-pill">${I.clock}${g.k}</span><p class="bubble">${g.hi}</p><h1 class="hero-title">${g.q}</h1><p class="hero-date">${fmtLong(todayIso())}</p></div>${nimImg('main','hero-nim',136)}</header>
    <section class="section">${summaryBoxes()}</section>
    <section class="section" aria-labelledby="menuH"><h2 id="menuH" class="sr-only">เมนูหลัก</h2><div class="menu-grid">${cards.map(([t,ic,b,s,h])=>`<button type="button" class="mcard ${t} tap" data-go="${h}"><span class="ic">${I[ic]}</span><b>${b}</b><span class="sub">${s}</span></button>`).join('')}</div></section>
    <section class="section"><div class="sec-head"><h2>สัตว์เลี้ยงของฉัน <span class="meta">${st.pets.length} ตัว</span></h2>${st.pets.length?`<button type="button" class="btn sm" data-go="#/pet/new">${I.plus} เพิ่มน้อง</button>`:''}</div>${list}</section>
  </div>${nav('home')}`;
}
function overdueScreen(){
  const items=overdueItems();const vac=items.filter(i=>i.kind==='due'),ap=items.filter(i=>i.kind==='appt');
  const vacCards=vac.map(it=>{const p=pet(it.petId);const booked=st.appts.filter(a=>a.petId===it.petId&&a.vacKey===it.key&&a.status!=='done'&&diff(a.date)>=0).sort(byDT)[0];
    return `<div class="card odcard"><div class="od-top">${pbadge(p)}<span class="status over">${I.warn}เลยมา ${-diff(it.date)} วัน</span></div>
      <h3 class="od-title">${esc(keyLabel(it.key))}</h3><p class="od-sub">ครบกำหนดฉีด ${fmt(it.date)}${booked?` · มีนัดแล้ว ${fmt(booked.date)}`:''}</p>
      <div class="actions"><button type="button" class="btn sm" data-act="recordShot" data-pet="${it.petId}" data-key="${esc(it.key)}">${I.check} ฉีดแล้ว บันทึก</button>
      ${booked?'':`<button type="button" class="btn sm white" data-act="bookDue" data-pet="${it.petId}" data-key="${esc(it.key)}">${I.cal} ลงนัด</button>`}
      <button type="button" class="btn sm white" data-go="#/health/${it.petId}?tab=vac">${I.book} ดูในสมุด</button></div></div>`}).join('');
  const apCards=ap.map(a=>{const p=pet(a.petId);const t=ATYPE[a.type]||ATYPE.other;
    return `<div class="card odcard"><div class="od-top">${pbadge(p)}<span class="status over">${I.warn}เลยมา ${-diff(a.date)} วัน</span></div>
      <h3 class="od-title">${esc(a.title)}</h3><p class="od-sub"><span class="chip ${t.chip}">${I[t.ic]} ${t.label}</span> ${fmt(a.date)} · ${timeTxt(a.time)}</p>
      <div class="actions"><button type="button" class="btn sm" data-act="markDone" data-id="${a.id}">${I.check} ไปแล้ว</button>
      <button type="button" class="btn sm white" data-act="reschedule" data-id="${a.id}">${I.cal} เลื่อนวัน</button>
      <button type="button" class="btn sm white" data-act="viewAppt" data-id="${a.id}">รายละเอียด</button></div></div>`}).join('');
  const body=items.length?`
    <div class="section"><div class="sec-head"><h2>วัคซีนเลยกำหนด <span class="meta">${vac.length}</span></h2></div>${vac.length?`<div class="stack">${vacCards}</div>`:'<p class="empty-line">ไม่มีวัคซีนเลยกำหนด</p>'}</div>
    <div class="section"><div class="sec-head"><h2>นัดที่ผ่านมาแล้ว ยังไม่เช็ค <span class="meta">${ap.length}</span></h2></div>${ap.length?`<div class="stack">${apCards}</div>`:'<p class="empty-line">ไม่มีนัดค้างเช็ค</p>'}</div>`
   :`<div class="section"><div class="card">${emptyBox('ไม่มีอะไรเลยกำหนด','เคลียร์หมดแล้ว นิ่มยอมรับว่าเก่ง (นิดนึง)',`<button type="button" class="btn" data-go="#/home">กลับหน้าแรก</button>`,false,'thumbsup')}</div></div>`;
  return `<div class="screen">${bar('รายการเลยกำหนด','#/home')}
    <div class="section"><p class="lead-box">${I.list}<span>รวมของน้องทุกตัว: วัคซีนที่เลยวันนัดครั้งถัดไป และนัดที่วันผ่านไปแล้วแต่ยังไม่ได้เช็คว่าไปแล้ว</span></p></div>${body}
  </div>${nav('home')}`;
}
function petDetail(id){
  const p=pet(id);if(!p)return notFound();
  st.selPet=id;save();
  const s=SP[p.species]||SP.other;const {groups}=vacSummary(id);const ups=upcoming(id);const visits=st.visits.filter(v=>v.petId===id);const lw=latestWeight(p);const nN=st.notes.filter(n=>n.petId===id).length;
  return `<div class="screen">${bar('ข้อมูลน้อง','#/home',`<button type="button" class="icon-btn" data-go="#/pet/${id}/edit" aria-label="แก้ไขข้อมูล${esc(p.name)}">${I.edit}</button>`)}
   <div class="pet-hero">${avatar(p,'lg')}<h2>${esc(p.name)}</h2><p>${esc(s.label)}${p.breed?' · '+esc(breedTxt(p)):''}</p>
     <div class="chips">${vacBadge(id)}<span class="chip">${SEX[p.sex]||'ไม่ระบุ'}</span><span class="chip">${dot(p)} สี${esc(colorName(p))}</span></div></div>
   <div class="section"><div class="stats">
     <div class="stat">${I.cake}<b>${p.birth?age(p):'—'}</b><span>อายุ</span></div>
     <button type="button" class="stat tap stat-btn" data-act="weight" data-pet="${id}" aria-label="น้ำหนัก ${lw?lw.kg+' กิโลกรัม':'ยังไม่มี'} แตะเพื่ออัปเดตและดูกราฟ">${I.scale}<b>${lw?lw.kg+' กก.':'—'}</b><span>น้ำหนัก · อัปเดต</span></button>
     <div class="stat">${I.syringe}<b>${groups.length}</b><span>ชนิดวัคซีน</span></div></div></div>
   <div class="section"><div class="shortcuts">
     <button type="button" class="sc y tap" data-go="#/health/${id}?tab=vac"><span class="ic">${I.book}</span><b>สมุดสุขภาพ</b><span>วัคซีน ${groups.length} · หาหมอ ${visits.length} ครั้ง</span></button>
     <button type="button" class="sc m tap" data-go="#/appts?pet=${id}"><span class="ic">${I.cal}</span><b>นัดหมาย</b><span>${ups.length?`ถัดไป ${fmt(ups[0].date)}`:'ยังไม่มีนัด ว่างจัด'}</span></button>
     <button type="button" class="sc p tap" data-go="#/health/${id}?tab=notes"><span class="ic">${I.note}</span><b>โน๊ตเจ้าของ</b><span>${nN?nN+' โน๊ต':'ยังไม่มีโน๊ต'}</span></button>
     <button type="button" class="sc s tap" data-go="#/share?pet=${id}"><span class="ic">${I.share}</span><b>แชร์ให้ครอบครัว</b><span>ตัวอย่าง · ${st.family.members.length} คน</span></button></div></div>
   <div class="section"><div class="sec-head"><h2>นัดที่กำลังจะถึง</h2><button type="button" class="btn sm white" data-act="addAppt" data-pet="${id}">${I.plus} เพิ่มนัด</button></div>
     ${ups.length?`<div class="stack">${ups.slice(0,3).map(itemCard).join('')}</div>`:`<div class="card">${emptyBox('ไม่มีนัดเลย','ว่างขนาดนี้ ไปนอนกลิ้งกันได้','',true)}</div>`}</div>
   <div class="section"><div class="sec-head"><h2>ประวัติน้อง</h2></div><div class="card rows">
     <div class="row"><span class="k">วันเกิด</span><span class="v">${fmtBirth(p)}</span></div>
     <div class="row"><span class="k">สีประจำตัว</span><span class="v">${dot(p)} ${esc(colorName(p))}</span></div>
     <div class="row"><span class="k">ลักษณะเด่น</span><span class="v">${esc(p.look)||'—'}</span></div>
     <div class="row"><span class="k">บันทึก</span><span class="v">${esc(p.notes)||'—'}</span></div></div></div>
   <div class="section"><button type="button" class="btn white block" data-act="delPet" data-id="${id}">${I.trash} ลบ ${esc(p.name)} ออกจากแอป</button></div>
  </div>${nav('home')}`;
}

/* ---- pet form ---- */
function breedField(species,val){
  const list=BREEDS[species];
  if(!list)return `<div class="field" id="breedField" data-f="breedText"><label for="pet-breed">สายพันธุ์ <span class="opt">(ไม่บังคับ)</span></label><input class="input" id="pet-breed" name="breedText" value="${esc(val)}" placeholder="เช่น ฮอลแลนด์ลอป, ค็อกคาเทล" maxlength="40"></div>`;
  const preset=[...list,BREED_MIX,BREED_UNK];const isOther=!!val&&!preset.includes(val);const sel=!val?'':(isOther?'__other':val);
  return `<div class="field" id="breedField" data-f="breedOther"><label for="pet-breed">สายพันธุ์${species==='cat'?'แมว':'สุนัข'} <span class="opt">(ไม่บังคับ)</span></label>
    <select class="input" id="pet-breed" name="breedSel"><option value="" ${sel===''?'selected':''}>— เลือกสายพันธุ์ —</option>
    <optgroup label="ยอดนิยม">${list.map(b=>`<option ${sel===b?'selected':''}>${b}</option>`).join('')}</optgroup>
    <optgroup label="อื่นๆ"><option ${sel===BREED_MIX?'selected':''}>${BREED_MIX}</option><option ${sel===BREED_UNK?'selected':''}>${BREED_UNK}</option><option value="__other" ${sel==='__other'?'selected':''}>อื่นๆ (พิมพ์เอง)</option></optgroup></select>
    <div class="sub-field" ${sel==='__other'?'':'hidden'}><label for="pet-breed-other" class="sublabel">พิมพ์ชื่อสายพันธุ์ ${req}</label><input class="input" id="pet-breed-other" name="breedOther" value="${isOther?esc(val):''}" placeholder="เช่น ชิบะ อินุ" maxlength="40"></div></div>`;
}
function petForm(id){
  const p=id?pet(id):{name:'',species:'dog',breed:'',birth:'',birthPrec:'',sex:'u',color:'',colorOther:'',look:'',notes:''};
  if(id&&!p)return notFound();
  const bp=p.birthPrec||'';const[by,bm]=(p.birth||'').split('-');const ty=today().getFullYear();
  const years=[];for(let y=ty;y>=ty-30;y--)years.push(y);
  const usedColors=new Set(st.pets.filter(x=>x.id!==id).map(x=>x.color));
  const col=p.color||COLOR_KEYS.find(k=>!usedColors.has(k))||'white';
  const PREC=[['','ไม่ทราบ'],['y','รู้แค่ปี'],['ym','ปีกับเดือน'],['ymd','วันเต็ม']];
  return `<div class="screen no-nav">${bar(id?'แก้ไขข้อมูลน้อง':'เพิ่มสัตว์เลี้ยง',id?'#/pet/'+id:'#/home')}
   <form class="form" id="petForm" data-id="${id||''}" novalidate>
    <div class="form-art">${nimImg('writing','nim-sticker',88)}<p>${id?'แก้ตรงไหน บอกมา <b>นิ่มรอจดอยู่</b>':'กรอกเท่าที่รู้ <b>นิ่มจะจำแทน</b> คุณจะได้ลืมได้เต็มที่'}</p></div>
    ${reqNote}
    <div class="field" data-f="name"><label for="pet-name">ชื่อน้อง ${req}</label><input class="input" id="pet-name" name="name" value="${esc(p.name)}" placeholder="เช่น ข้าวปั้น" maxlength="30" aria-required="true" autocomplete="off"></div>
    <div class="field" role="group" aria-labelledby="species-label"><span class="flabel" id="species-label">ชนิดสัตว์</span><div class="choice" data-choice="species">${Object.entries(SP).map(([k,s])=>`<button type="button" data-val="${k}" class="${p.species===k?'on':''}" aria-pressed="${p.species===k?'true':'false'}">${s.svg}${s.label}</button>`).join('')}</div></div>
    ${breedField(p.species,p.breed)}
    <div class="field" role="group" aria-labelledby="prec-label" data-f="birth"><span class="flabel" id="prec-label">วันเกิด <span class="opt">(น้องจรรู้แค่ปีก็ได้)</span></span>
      <div class="choice" data-choice="birthPrec">${PREC.map(([k,l])=>`<button type="button" class="noic ${bp===k?'on':''}" data-val="${k}" aria-pressed="${bp===k?'true':'false'}">${l}</button>`).join('')}</div>
      <div class="two mt8" data-birth="y ym" ${bp==='y'||bp==='ym'?'':'hidden'}>
        <div data-f="birthY"><label for="birthY" class="sublabel">ปี (พ.ศ.) ${req}</label><select class="input" id="birthY" name="birthY"><option value="">— ปี —</option>${years.map(y=>`<option value="${y}" ${String(y)===by&&bp!=='ymd'?'selected':''}>${y+543}</option>`).join('')}</select></div>
        <div data-birth="ym" data-f="birthM" ${bp==='ym'?'':'hidden'}><label for="birthM" class="sublabel">เดือน ${req}</label><select class="input" id="birthM" name="birthM"><option value="">— เดือน —</option>${ML.map((m,i)=>`<option value="${pad(i+1)}" ${pad(i+1)===bm&&bp==='ym'?'selected':''}>${m}</option>`).join('')}</select></div></div>
      <div class="mt8" data-birth="ymd" data-f="birthD" ${bp==='ymd'?'':'hidden'}><label for="birthD" class="sublabel">วันเกิด ${req}</label>${dIn('birthD',bp==='ymd'?p.birth:'','birthD',{max:todayIso(),min:'1990-01-01'})}</div></div>
    ${id?'':`<div class="field" data-f="weight"><label for="pet-weight">น้ำหนักตอนนี้ <span class="opt">(ไม่บังคับ)</span></label><div class="unit"><input class="input" id="pet-weight" name="weight" inputmode="decimal" placeholder="เช่น 4.2" maxlength="6"><span>กก.</span></div><p class="hint-s">หลังจากนี้อัปเดตน้ำหนักได้ที่หน้าข้อมูลน้อง พร้อมดูกราฟ</p></div>`}
    <div class="field" role="group" aria-labelledby="sex-label"><span class="flabel" id="sex-label">เพศ</span><div class="choice" data-choice="sex">${Object.entries(SEX).map(([k,v])=>`<button type="button" class="noic ${p.sex===k?'on':''}" data-val="${k}" aria-pressed="${p.sex===k?'true':'false'}">${v}</button>`).join('')}</div></div>
    <fieldset class="field" data-f="colorOther"><legend class="flabel">สีประจำตัว <span class="opt">(เป็นจุดสีของน้องทั้งแอป)</span></legend>
      <div class="swatches">${COLOR_KEYS.map(k=>`<label class="swopt"><input type="radio" name="color" value="${k}" ${col===k?'checked':''}><span class="pdot big ${k==='calico'?'calico':''}" style="--c:${COLORS[k].hex}" aria-hidden="true"></span><span>${COLORS[k].label}</span></label>`).join('')}
      <label class="swopt"><input type="radio" name="color" value="other" ${col==='other'?'checked':''}><span class="pdot big other" aria-hidden="true"></span><span>อื่นๆ</span></label></div>
      <div class="sub-field" ${col==='other'?'':'hidden'}><label for="pet-color-other" class="sublabel">ชื่อสี ${req}</label><input class="input" id="pet-color-other" name="colorOther" value="${esc(p.colorOther)}" placeholder="เช่น ช็อกโกแลต" maxlength="20"></div></fieldset>
    <div class="field"><label for="pet-look">ลักษณะเด่น <span class="opt">(ไม่บังคับ)</span></label><input class="input" id="pet-look" name="look" value="${esc(p.look)}" placeholder="เช่น ขาวลายส้ม มีจุดที่หู" maxlength="60"></div>
    <div class="field"><label for="pet-notes">บันทึกเพิ่มเติม <span class="opt">(ไม่บังคับ)</span></label><textarea class="input" id="pet-notes" name="notes" placeholder="แพ้อะไร ชอบอะไร นิสัยแปลกๆ จดไว้เลย" maxlength="300">${esc(p.notes)}</textarea></div>
    <input type="hidden" name="species" value="${p.species}"><input type="hidden" name="sex" value="${p.sex}"><input type="hidden" name="birthPrec" value="${bp}">
    <div class="form-foot"><button type="submit" class="btn block">${I.check} ${id?'บันทึกการแก้ไข':'บันทึก เพิ่มน้องเลย'}</button></div>
   </form></div>`;
}

/* ---- health book ---- */
let healthTab='vac';
const photoURLs={}; /* ตัวอย่างเท่านั้น: อยู่ในหน่วยความจำ ไม่บันทึกไฟล์ หายเมื่อรีเฟรช */
const HTABS=[['vac','วัคซีน'],['visit','หาหมอ'],['notes','โน๊ต & รูป']];
function healthScreen(id){
  if(!st.pets.length)return `<div class="screen">${bar('สมุดสุขภาพ')}${emptyBox('ยังไม่มีใครให้ดูแล','เพิ่มน้องก่อน แล้วค่อยมาเปิดสมุดนะ',`<button type="button" class="btn" data-go="#/pet/new">${I.plus} เพิ่มสัตว์เลี้ยง</button>`)}</div>${nav('health')}`;
  const p=pet(id)||pet(st.selPet)||st.pets[0];st.selPet=p.id;save();
  const chips=`<div class="switcher" role="tablist" aria-label="เลือกสัตว์เลี้ยงที่จะดูสมุด">${st.pets.map(x=>{const on=x.id===p.id;return `<button type="button" role="tab" class="sw ${on?'on':''}" data-pchip="${x.id}" data-go="#/health/${x.id}" aria-selected="${on}" aria-controls="hpanel" tabindex="${on?0:-1}">${dot(x)}<span class="sw-name">${esc(x.name)}</span>${on?I.check:''}</button>`}).join('')}</div>`;
  const tabs=`<div class="seg" role="tablist" aria-label="หมวดในสมุดสุขภาพ">${HTABS.map(([k,l])=>`<button type="button" role="tab" id="htab-${k}" data-htab="${k}" aria-controls="hpanel" aria-selected="${healthTab===k}" tabindex="${healthTab===k?0:-1}" class="${healthTab===k?'on':''}">${l}</button>`).join('')}</div>`;
  let panel;
  if(healthTab==='vac'){const {groups,c}=vacSummary(p.id);
    const plannedV=st.appts.filter(a=>a.petId===p.id&&a.type==='vaccine'&&a.status!=='done'&&diff(a.date)>=0).sort(byDT);
    panel=`<div class="todo" role="group" aria-label="สถานะนัดวัคซีน"><div class="t mint"><b>${c.done+c.sched}</b><span>ฉีดแล้ว / มีนัด</span></div><div class="t cream"><b>${c.soon}</b><span>ใกล้ถึง 7 วัน</span></div><div class="t peach"><b>${c.over}</b><span>เลยกำหนด</span></div></div>
      <div class="sec-head mt16"><h2>วัคซีนของ${esc(p.name)}</h2><button type="button" class="btn sm" data-act="addVac" data-pet="${p.id}">${I.plus} บันทึกเข็ม</button></div>
      ${groups.length?`<div class="stack">${groups.map(g=>{const s=g.status;const lv=g.latest;return `<button type="button" class="card tap rec ${s==='over'?'over':''}" data-act="vacGroup" data-pet="${p.id}" data-key="${esc(g.key)}">
        <span class="ic ic-${s}">${I.syringe}</span><span class="body"><span class="rec-top"><span class="rec-title">${esc(g.label)}</span>${statusChip(s)}</span>
        <span class="dates"><span><i>ฉีดล่าสุด</i> ${lv.given?fmt(lv.given):'ยังไม่ลง'}</span><span><i>ครั้งถัดไป</i> ${lv.next?fmt(lv.next):'—'}</span></span>
        <span class="countdown">${lv.next?(s==='over'?I.warn+' '+rel(lv.next)+' แล้วนะ ทำเป็นลืม?':rel(lv.next))+' · ':''}ฉีดมาแล้ว ${g.recs.filter(r=>r.given).length} ครั้ง · ดูประวัติ</span></span></button>`}).join('')}</div>`
        :`<div class="card">${emptyBox('ไม่มีวัคซีนสักเข็ม?','จดไว้หน่อย ไม่งั้นนิ่มจะมองบนทุกวัน','',true)}</div>`}
      <div class="sec-head mt16"><h2>นัดวัคซีนที่ลงไว้</h2><button type="button" class="btn sm white" data-act="addAppt" data-pet="${p.id}" data-type="vaccine">${I.plus} นัดฉีด</button></div>
      ${plannedV.length?`<div class="stack">${plannedV.map(itemCard).join('')}</div>`:'<p class="empty-line">ยังไม่มีนัดฉีดที่ลงไว้ในหน้านัดหมาย</p>'}`;
  }else if(healthTab==='visit'){const vis=st.visits.filter(v=>v.petId===p.id).sort((a,b)=>b.date.localeCompare(a.date));
    const ck=st.appts.filter(a=>a.petId===p.id&&a.type==='checkup');const cu=ck.filter(a=>a.status!=='done'&&diff(a.date)>=0).length,co=ck.filter(a=>a.status!=='done'&&diff(a.date)<0).length,cd=ck.filter(a=>a.status==='done').length;
    panel=`<div class="todo" role="group" aria-label="สถานะนัดหมอ"><div class="t sky"><b>${cu}</b><span>นัดหมอที่จะถึง</span></div><div class="t peach"><b>${co}</b><span>เลยนัดหมอ</span></div><div class="t mint"><b>${cd}</b><span>ไปตามนัดแล้ว</span></div></div>
      <div class="sec-head mt16"><h2>ประวัติหาหมอของ${esc(p.name)}</h2><button type="button" class="btn sm" data-act="addVisit" data-pet="${p.id}">${I.plus} บันทึก</button></div>
      ${vis.length?`<div class="stack">${vis.map(v=>`<button type="button" class="card tap rec" data-act="editVisit" data-id="${v.id}"><span class="ic ic-visit">${I.steth}</span>
        <span class="body"><span class="rec-title">${esc(v.reason)}</span><span class="sub">${fmt(v.date)}${v.clinic?' · '+esc(v.clinic):''}</span>${v.notes?`<span class="note">${esc(v.notes)}</span>`:''}</span></button>`).join('')}</div>`
       :`<div class="card">${emptyBox('ยังไม่เคยไปหาหมอ','สุขภาพดี หรือแค่ยังไม่ได้จด? นิ่มสงสัย','',true)}</div>`}`;
  }else{const notes=st.notes.filter(n=>n.petId===p.id).sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
    const SLOTS=[['book','สมุด'],['sticker','สติกเกอร์วัคซีน'],['wound','แผล']];
    panel=`<div class="sec-head"><h2>รูปในสมุดสุขภาพ</h2><span class="sample-tag">${I.photo}ตัวอย่าง ไม่บันทึกรูป</span></div>
      <div class="photos">${SLOTS.map(([k,l])=>{const u=photoURLs[p.id+':'+k];return `<label class="pslot ${u?'has':''}">${u?`<img class="prev" src="${u}" alt="รูป${l}ที่เลือก (ตัวอย่าง)">`:I.photo}<span class="plabel">${l}${u?' · เลือกแล้ว (ตัวอย่าง)':''}</span><input type="file" accept="image/*" data-photo="${p.id}:${k}" aria-label="เลือกรูป${l} (ตัวอย่าง ไม่บันทึกรูป)"></label>`}).join('')}</div>
      <p class="hint-s">เปิดกล้องหรือคลังรูปได้ รูปแสดงให้ดูเท่านั้น ไม่ถูกเก็บในเครื่องและหายเมื่อรีเฟรช</p>
      <div class="sec-head mt16"><h2>โน๊ตเจ้าของ</h2><button type="button" class="btn sm" data-act="addNote" data-pet="${p.id}">${I.plus} เขียนโน๊ต</button></div>
      ${notes.length?`<div class="stack">${notes.map(n=>`<button type="button" class="card tap rec" data-act="editNote" data-id="${n.id}"><span class="ic ic-note">${I.note}</span><span class="body"><span class="note-text">${esc(n.text)}</span><span class="sub">แก้ล่าสุด ${fmt(n.updated||n.created)}</span></span></button>`).join('')}</div>`
       :`<div class="card">${emptyBox('ยังไม่มีโน๊ต','เรื่องเล็กๆ ของน้อง จดไว้ตรงนี้ได้เลย','',true)}</div>`}`;
  }
  return `<div class="screen">${bar('สมุดสุขภาพ')}${chips}
   <div class="section" style="padding-top:10px">${tabs}</div>
   <div class="section" id="hpanel" role="tabpanel" aria-labelledby="htab-${healthTab}" tabindex="0">${panel}</div>
  </div>${nav('health')}`;
}

/* ---- appointments ---- */
const AP={mode:'all',sel:null,cursor:null,petF:'',typeF:'',from:'',showAll:false,showEnded:false};
function itemCard(it){const d=parse(it.date);const p=pet(it.petId);const t=ATYPE[it.type]||ATYPE.other;const od=isOver(it),done=it.status==='done';
  const stc=done?`<span class="status done">${I.check}ไปแล้ว</span>`:od?`<span class="status over">${I.warn}เลยกำหนด ${-diff(it.date)} วัน</span>`:`<span class="chip ${in7(it.date)?'yellow':''}">${rel(it.date)}</span>`;
  const act=it.kind==='due'?`data-act="viewDue" data-pet="${it.petId}" data-key="${esc(it.key)}"`:`data-act="viewAppt" data-id="${it.id}"`;
  return `<button type="button" class="card tap appt ${done?'is-done':''} ${od?'is-over':''}" ${act}><span class="datebox" aria-hidden="true"><span class="m">${MS[d.getMonth()]}</span><span class="d">${d.getDate()}</span><span class="w">${WD[d.getDay()]}</span></span>
   <span class="body"><span class="appt-title">${esc(it.title)}</span><span class="sr-only">${fmtLong(it.date)}</span><span class="sub">${pbadge(p)}<span class="tm">${I.clock} ${timeTxt(it.time)}</span></span>
   <span class="chips mt8"><span class="chip ${t.chip}"><span class="mk mk-${t.mk}" aria-hidden="true"></span>${t.label}</span>${it.kind==='due'?'<span class="chip">จากสมุดสุขภาพ</span>':''}${stc}</span></span><span class="chev">${I.chev}</span></button>`}
function remCard(r){const p=pet(r.petId);const nx=remNext(r);const ended=remEnded(r);
  return `<div class="card rem ${r.paused?'paused':''}"><div class="rem-top"><span class="ic ic-rem">${I.repeat}</span><div class="rem-body"><h3 class="rem-title">${esc(r.title)}</h3>
    <div class="rem-meta">${pbadge(p)}<span>ทุกวัน · ${timeTxt(r.time)}</span></div>
    <div class="rem-range">${fmt(r.start)} ถึง ${r.end?fmt(r.end):'ไม่มีวันสิ้นสุด'}</div>
    <div class="rem-next">${ended?'จบแล้ว':r.paused?'หยุดชั่วคราวอยู่':nx?`ครั้งถัดไป ${nx===todayIso()?'วันนี้':fmt(nx)} ${timeTxt(r.time)}`:'ไม่มีรอบถัดไป'}</div></div></div>
    <div class="rem-actions">${ended?'':`<button type="button" class="switch-btn" role="switch" aria-checked="${!r.paused}" data-act="toggleRem" data-id="${r.id}"><span class="switch" aria-hidden="true"></span><span>${r.paused?'หยุดชั่วคราว':'เปิดเตือนอยู่'}</span></button>`}
    <button type="button" class="btn sm white" data-act="editRem" data-id="${r.id}">${I.edit} แก้ไข</button><button type="button" class="icon-btn" data-act="delRem" data-id="${r.id}" aria-label="ลบเตือน ${esc(r.title)}">${I.trash}</button></div></div>`}
function apptsScreen(){
  const petF=AP.petF&&pet(AP.petF)?AP.petF:'';const typeF=ATYPE[AP.typeF]?AP.typeF:'';
  if(!AP.cursor){const t=today();AP.cursor=new Date(t.getFullYear(),t.getMonth(),1)}
  const y=AP.cursor.getFullYear(),m=AP.cursor.getMonth();const start=new Date(y,m,1-new Date(y,m,1).getDay());
  const items=allItems().filter(it=>(!petF||it.petId===petF)&&(!typeF||it.type===typeF));
  const byDay={};items.forEach(a=>(byDay[a.date]=byDay[a.date]||[]).push(a));const T=todayIso();
  let cells='';for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const k=iso(d);const has=byDay[k];
    if(i===35&&d.getMonth()!==m)break;
    const types=has?[...new Set(has.map(a=>a.type))]:[];
    const lab=`${d.getDate()} ${ML[d.getMonth()]} ${d.getFullYear()+543}${k===T?' วันนี้':''}${has?` มี ${has.length} รายการ: ${types.map(x=>(ATYPE[x]||ATYPE.other).label).join(', ')}`:''}`;
    const sel=AP.mode==='day'&&AP.sel===k;
    cells+=`<button type="button" class="day ${d.getMonth()!==m?'out':''} ${k===T?'today':''} ${has?'has':''} ${sel?'sel':''}" data-day="${k}" aria-pressed="${sel}" aria-label="${lab}">${d.getDate()}<span class="mks" aria-hidden="true">${types.slice(0,3).map(x=>`<i class="mk mk-${(ATYPE[x]||ATYPE.other).mk}"></i>`).join('')}</span></button>`}
  const rems=st.reminders.filter(r=>(!petF||r.petId===petF)&&pet(r.petId));
  let body;
  if(AP.mode==='day'&&AP.sel){const ds=(byDay[AP.sel]||[]).sort(byDT);const rd=rems.filter(r=>remOnDay(r,AP.sel));
    body=`<div class="sec-head"><h2>${fmtLong(AP.sel)}</h2></div>`+(ds.length?`<div class="stack">${ds.map(itemCard).join('')}</div>`:`<div class="card">${emptyBox('ว่างจ้า ไม่มีนัด','ไม่มีนัดเลย จะเพิ่มก็ได้นะ ไม่บังคับ',`<button type="button" class="btn sm" data-act="addAppt" data-date="${AP.sel}" data-pet="${petF}">${I.plus} เพิ่มนัด</button>`,true)}</div>`)
      +(rd.length?`<div class="sec-head mt16"><h2>เตือนประจำวันนั้น</h2><span class="sample-tag soft">เตือนในแอปเท่านั้น</span></div><div class="stack">${rd.map(r=>`<div class="card rem-mini">${I.repeat}<span><b>${esc(r.title)}</b> ${pbadge(pet(r.petId))} ${timeTxt(r.time)}</span></div>`).join('')}</div>`:'');
  }else{const ov=items.filter(isOver).sort(byDT);const ups=items.filter(it=>it.status!=='done'&&diff(it.date)>=0).sort(byDT);
    const done=items.filter(it=>it.status==='done').sort((a,b)=>b.date.localeCompare(a.date));const shown=AP.showAll?ups:ups.slice(0,7);
    body=(ov.length?`<div class="sec-head"><h2>เลยกำหนด ยังไม่เช็ค <span class="meta">${ov.length}</span></h2><button type="button" class="link" data-go="#/overdue">จัดการทั้งหมด</button></div><div class="stack">${ov.map(itemCard).join('')}</div><div class="mt16"></div>`:'')
      +`<div class="sec-head"><h2>นัดที่กำลังจะถึง <span class="meta">${ups.length} รายการ</span></h2></div>`
      +(ups.length?`<div class="stack">${shown.map(itemCard).join('')}</div>${ups.length>7?`<button type="button" class="btn white block mt16" data-act="toggleAll" aria-expanded="${AP.showAll}">${AP.showAll?'แสดงแค่ 7 รายการที่ใกล้ที่สุด':`แสดงทั้งหมด (${ups.length})`}</button>`:''}`:`<div class="card">${emptyBox('ไม่มีนัดเลยสักนัด','ชิลเกินไปแล้ว ลองเพิ่มนัดวัคซีนดูมั้ย','',true)}</div>`)
      +(done.length?`<div class="sec-head mt16"><h2>ไปแล้ว</h2></div><div class="stack">${done.slice(0,5).map(itemCard).join('')}</div>`:'');}
  const active=rems.filter(r=>!remEnded(r)),ended=rems.filter(remEnded);
  const remSec=`<div class="section" id="remSec"><div class="sec-head"><h2>เตือนประจำ <span class="meta">${active.length}</span></h2>${st.pets.length?`<button type="button" class="btn sm" data-act="addRem" data-pet="${petF}">${I.plus} ตั้งเตือน</button>`:''}</div>
    <p class="lead-box soft">${I.bell}<span><b>เตือนในแอปเท่านั้น</b> ไม่ส่ง LINE หรือแจ้งเตือนมือถือ ต้องเปิดแอปถึงจะเห็น</span></p>
    ${active.length?`<div class="stack mt8">${active.map(remCard).join('')}</div>`:`<p class="empty-line">ยังไม่มีเตือนประจำ เช่น ป้อนยาทุกวัน ตั้งได้ที่ปุ่ม ตั้งเตือน</p>`}
    ${ended.length?`<button type="button" class="link mt8" data-act="toggleEnded" aria-expanded="${AP.showEnded}">${AP.showEnded?'ซ่อนที่จบแล้ว':`ดูที่จบแล้ว (${ended.length})`}</button>${AP.showEnded?`<div class="stack mt8">${ended.map(remCard).join('')}</div>`:''}`:''}</div>`;
  const fp=AP.from&&pet(AP.from);
  const filters=`<div class="filters" role="group" aria-label="กรองตามสัตว์เลี้ยง"><button type="button" class="fchip" data-fpet="" aria-pressed="${!petF}">ทุกตัว</button>${st.pets.map(p=>`<button type="button" class="fchip" data-fpet="${p.id}" aria-pressed="${petF===p.id}">${dot(p)}<span class="fc-name">${esc(p.name)}</span></button>`).join('')}</div>
    <div class="filters" role="group" aria-label="กรองตามประเภทนัด"><button type="button" class="fchip" data-ftype="" aria-pressed="${!typeF}">ทุกประเภท</button>${Object.entries(ATYPE).map(([k,t])=>`<button type="button" class="fchip" data-ftype="${k}" aria-pressed="${typeF===k}"><span class="mk mk-${t.mk}" aria-hidden="true"></span>${t.label}</button>`).join('')}</div>`;
  return `<div class="screen">${bar(fp&&petF===AP.from?'นัดหมายของ'+esc(fp.name):'ตารางนัดหมาย',fp?'#/pet/'+fp.id:null)}
   ${fp?`<div class="ctx-bar">${pbadge(fp)}<span>มาจากโปรไฟล์${esc(fp.name)}</span><button type="button" class="link" data-go="#/pet/${fp.id}">กลับโปรไฟล์</button></div>`:''}
   ${filters}
   <div class="section" style="padding-top:8px"><div class="seg" role="group" aria-label="มุมมองรายการ"><button type="button" data-mode="day" aria-pressed="${AP.mode==='day'}" class="${AP.mode==='day'?'on':''}">รายวัน</button><button type="button" data-mode="all" aria-pressed="${AP.mode==='all'}" class="${AP.mode==='all'?'on':''}">ทั้งหมด</button></div></div>
   <div class="section"><div class="card cal"><div class="cal-head"><button type="button" class="icon-btn" data-cal="-1" aria-label="เดือนก่อน">${I.back}</button><b aria-live="polite">${ML[m]} ${y+543}</b><button type="button" class="icon-btn" data-cal="1" aria-label="เดือนถัดไป">${I.chev}</button></div>
    <div class="cal-grid">${WD.map(w=>`<div class="wd" aria-hidden="true">${w}</div>`).join('')}${cells}</div>
    <div class="cal-foot"><div class="legend">${Object.values(ATYPE).map(t=>`<span><i class="mk mk-${t.mk}" aria-hidden="true"></i>${t.label}</span>`).join('')}</div><button type="button" class="btn sm white" data-act="goToday">กลับวันนี้</button></div></div></div>
   <div class="section">${body}</div>${remSec}
  </div>${st.pets.length?`<button type="button" class="fab" data-act="addAppt" data-date="${AP.mode==='day'&&AP.sel?AP.sel:''}" data-pet="${petF}">${I.plus} เพิ่มนัด</button>`:''}${nav('appts')}`;
}

/* ---- share (mock) ---- */
function shareScreen(q){
  const fp=q.pet&&pet(q.pet);const f=st.family;const link=`https://teeratin.github.io/tofu-app/#/join/${f.code}`;
  return `<div class="screen">${bar('แชร์ให้ครอบครัว',fp?'#/pet/'+fp.id:'#/home')}
   <div class="section"><div class="share-hero">${nimImg('badge','',96)}<div><span class="sample-tag">ตัวอย่าง</span><h2>ชวนคนในบ้านมาช่วยดูแล${fp?esc(fp.name):'น้องๆ'}</h2><p>หน้านี้เป็นตัวอย่าง ลิงก์และรหัสยังใช้ไม่ได้จริง ไม่มีการส่งข้อมูลไปเครื่องอื่น</p></div></div></div>
   <div class="section"><div class="card share-card">
     <label class="flabel" for="shareLink">ลิงก์เชิญ</label><div class="copy-row"><input class="input" id="shareLink" value="${esc(link)}" readonly><button type="button" class="btn sm" data-act="copy" data-copy="${esc(link)}" data-what="ลิงก์">${I.copy} คัดลอก</button></div>
     <span class="flabel mt16" id="codeLbl">รหัสเชิญ 6 หลัก</span><div class="copy-row"><span class="code" role="text" aria-labelledby="codeLbl">${f.code.slice(0,3)} ${f.code.slice(3)}</span><button type="button" class="btn sm" data-act="copy" data-copy="${f.code}" data-what="รหัส">${I.copy} คัดลอก</button></div>
     <button type="button" class="link mt8" data-act="newCode">ขอรหัสใหม่</button></div></div>
   <div class="section"><div class="sec-head"><h2>สมาชิกที่แชร์แล้ว <span class="meta">${f.members.length} คน</span></h2></div><div class="card rows members">
     ${f.members.map(mb=>`<div class="row member"><span class="mav" aria-hidden="true">${esc(mb.name.slice(0,1))}</span><span class="v">${esc(mb.name)}${mb.self?' (คุณ)':''}</span>
       <span class="role ${mb.role}">${mb.role==='owner'?'เจ้าของ':'ช่วยดูแล'}</span>
       ${mb.role==='owner'?`<span class="lock" role="img" aria-label="เจ้าของลบไม่ได้">${I.lock}</span>`:`<button type="button" class="icon-btn" data-act="delMember" data-id="${mb.id}" aria-label="ลบ ${esc(mb.name)} ออกจากรายชื่อ">${I.trash}</button>`}</div>`).join('')}</div>
     <form class="card mt16" id="memberForm" novalidate><h3 class="card-h">เพิ่มสมาชิกตัวอย่าง</h3>
       <div class="field" data-f="mname"><label for="m-name">ชื่อ ${req}</label><input class="input" id="m-name" name="mname" maxlength="30" placeholder="เช่น พี่ชาย, ยาย" autocomplete="off" aria-required="true"></div>
       <fieldset class="field"><legend class="flabel">บทบาท</legend><div class="swatches two-col"><label class="swopt"><input type="radio" name="role" value="carer" checked><span>ช่วยดูแล</span></label><label class="swopt"><input type="radio" name="role" value="owner"><span>เจ้าของ (ลบไม่ได้)</span></label></div></fieldset>
       <button type="submit" class="btn block">${I.plus} เพิ่มสมาชิก</button></form></div>
  </div>${nav('home')}`;
}
function settingsScreen(){
  return `<div class="screen">${bar('ตั้งค่า')}
   <div class="section"><div class="card mascot-card">${nimImg('main','',96)}<div><b>น้องนิ่ม</b><span>${NIM_DESC}</span></div></div></div>
   <div class="section"><div class="card rows"><div class="row"><span class="k">เวอร์ชัน</span><span class="v">ต้นแบบ 0.3 · ข้อมูลรุ่น ${SCHEMA} (เก็บในเครื่อง)</span></div>
     <div class="row"><span class="k">เกณฑ์ใกล้ถึง</span><span class="v">ภายใน 7 วัน (วันนี้ถึงอีก 6 วัน)</span></div>
     <div class="row"><span class="k">การแจ้งเตือน</span><span class="v">เตือนในแอปเท่านั้น ไม่ส่ง LINE</span></div></div></div>
   <div class="section"><button type="button" class="btn white block" data-go="#/share">${I.share} แชร์ให้ครอบครัว (ตัวอย่าง)</button></div>
   <div class="section"><button type="button" class="btn white block" data-act="reset">รีเซ็ตเป็นข้อมูลตัวอย่าง</button><p class="hint-s">ปุ่มนี้ลบข้อมูลที่คุณเพิ่มทั้งหมด แล้วใส่ข้อมูลตัวอย่างใหม่ทันที</p></div>
  </div>${nav('settings')}`;
}
const notFound=()=>`<div class="screen">${bar('ไม่เจอเลย','#/home')}${emptyBox('หาไม่เจอ','น้องตัวนี้อาจถูกลบไปแล้ว หรือนิ่มแค่มึน',`<button type="button" class="btn" data-go="#/home">กลับหน้าแรก</button>`)}</div>${nav('home')}`;

/* ---------- router ---------- */
let pendingFocus=null, afterRender=[];
function parseHash(){const h=location.hash.slice(1)||'/';const[path,qs]=h.split('?');return {seg:path.split('/').filter(Boolean),q:Object.fromEntries(new URLSearchParams(qs||''))}}
function route(){
  const {seg,q}=parseHash();const fresh=!route.keep;route.keep=false;
  if(fresh){closeSheet(true);closeDlg(true)}
  let html;
  if(seg[0]==='splash'||(!st.onboarded&&seg[0]!=='pet'))html=splash();
  else if(seg[0]==='pet'&&seg[1]==='new')html=petForm(null);
  else if(seg[0]==='pet'&&seg[2]==='edit')html=petForm(seg[1]);
  else if(seg[0]==='pet')html=petDetail(seg[1]);
  else if(seg[0]==='health'){if(fresh&&q.tab&&HTABS.some(t=>t[0]===q.tab))healthTab=q.tab;html=healthScreen(seg[1]);
    if(fresh)afterRender.push(()=>{const c=app.querySelector('.sw[aria-selected="true"]');centerChip(c)})}
  else if(seg[0]==='appts'){if(fresh){AP.from=q.pet&&pet(q.pet)?q.pet:'';AP.petF=AP.from;AP.showAll=false;if(q.day){AP.mode='day';AP.sel=q.day;const d=parse(q.day);AP.cursor=new Date(d.getFullYear(),d.getMonth(),1)}
      if(q.rem)afterRender.push(()=>{const r=$('#remSec');const sc=app.querySelector('.screen');if(r&&sc)sc.scrollTop=r.offsetTop-70})}
    html=apptsScreen()}
  else if(seg[0]==='overdue')html=overdueScreen();
  else if(seg[0]==='share')html=shareScreen(q);
  else if(seg[0]==='settings')html=settingsScreen();
  else if(!seg[0]||seg[0]==='home')html=homeScreen();
  else html=notFound();
  app.innerHTML=html;
  const sc=app.querySelector('.screen');if(sc&&fresh)sc.scrollTop=0;
  const fns=afterRender;afterRender=[];fns.forEach(f=>{try{f()}catch(e){}});
  if(pendingFocus){const el=app.querySelector(pendingFocus);pendingFocus=null;if(el)el.focus()}
}
const rerender=()=>{const sc=app.querySelector('.screen');const t=sc?sc.scrollTop:0;const sw=app.querySelector('.switcher');const sl=sw?sw.scrollLeft:0;route.keep=true;route();
  const s2=app.querySelector('.screen');if(s2)s2.scrollTop=t;const sw2=app.querySelector('.switcher');if(sw2)sw2.scrollLeft=sl};
window.addEventListener('hashchange',route);

/* ---------- sheets & dialogs ---------- */
let lastFocus=null, sheetSnap='';
const snap=()=>[...layer.querySelectorAll('form')].map(f=>JSON.stringify([...new FormData(f)].filter(([,v])=>typeof v==='string'))).join('|');
function openSheet(html,opts){opts=opts||{};const wasOpen=layer.classList.contains('open');if(!wasOpen)lastFocus=document.activeElement;
  layer.innerHTML=`<div class="scrim" data-act="reqClose"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" tabindex="-1"><div class="sheet-top"><div class="grab" aria-hidden="true"></div><button type="button" class="icon-btn sheet-x" data-act="reqClose" aria-label="ปิดหน้าต่างนี้">${I.x}</button></div><div class="sheet-body">${html}</div></div>`;
  sheetSnap=snap();
  const focus=()=>{const t=opts.focus&&layer.querySelector(opts.focus);(t||layer.querySelector('.sheet')).focus()};
  if(wasOpen)focus();else requestAnimationFrame(()=>requestAnimationFrame(()=>{layer.classList.add('open');focus()}));
}
function closeSheet(now){const back=lastFocus;layer.classList.remove('open');sheetSnap='';
  const done=()=>{layer.innerHTML='';if(back&&document.contains(back)&&typeof back.focus==='function'){try{back.focus()}catch(e){}}};
  if(now||!layer.innerHTML){done();return}setTimeout(()=>{if(!layer.classList.contains('open'))done()},reduceMotion()?0:300)}
function reqClose(){if(layer.querySelector('form')&&snap()!==sheetSnap){confirmDialog({title:'ทิ้งที่กรอกไว้?',text:'ที่พิมพ์ไว้ยังไม่ได้บันทึก ถ้าปิดตอนนี้จะหายหมดนะ',ok:'ทิ้งเลย',cancel:'กลับไปกรอกต่อ',pose:'writing',onOk:()=>closeSheet()});return}closeSheet()}
let dlgLast=null,dlgOk=null;
function confirmDialog(o){dlgLast=document.activeElement;dlgOk=o.onOk;
  dlg.innerHTML=`<div class="dlg-scrim" data-dlg="cancel"></div><div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgTitle" aria-describedby="dlgText"><button type="button" class="icon-btn dlg-x" data-dlg="cancel" aria-label="ปิด">${I.x}</button>
    ${o.pose?`<div class="dlg-art">${nimImg(o.pose,'nim-sticker',96)}</div>`:''}<h3 id="dlgTitle">${o.title}</h3><p id="dlgText">${o.text}</p>
    <div class="btn-row"><button type="button" class="btn white" data-dlg="cancel">${o.cancel||'ไม่ลบแล้ว'}</button><button type="button" class="btn ${o.danger?'danger':''}" data-dlg="ok">${o.danger?I.trash:''} ${o.ok||'ลบเลย'}</button></div></div>`;
  dlg.classList.add('open');const c=dlg.querySelector('.btn.white');if(c)c.focus()}
function closeDlg(silent){if(!dlg.classList.contains('open'))return;dlg.classList.remove('open');dlg.innerHTML='';dlgOk=null;if(!silent&&dlgLast&&document.contains(dlgLast)){try{dlgLast.focus()}catch(e){}}}
const confirmDelete=(title,text,onOk,label)=>confirmDialog({title,text,ok:label||'ลบเลย',cancel:'ไม่ลบแล้ว',pose:'trash',danger:true,onOk});

function vacSheet(v,petId,pre){
  const isNew=!v;const p=pet(isNew?petId:v.petId);if(!p)return;
  v=v||Object.assign({type:'',name:'',given:todayIso(),next:'',note:'',petId},pre||{});
  const opts=vacOpts(p.species);const typeVal=v.type||'';
  openSheet(`${sheetHead(isNew?'บันทึกวัคซีน':'แก้ไขวัคซีน',`ของ${esc(p.name)} · ฉีดแล้วจดเลย อย่าดอง`,'syringe')}
  <form id="vacForm" data-id="${isNew?'':v.id}" data-pet="${p.id}" novalidate>${reqNote}
   <div class="field" data-f="type"><label for="vac-type">ชนิดวัคซีน ${req}</label><select class="input" id="vac-type" name="type" aria-required="true"><option value="">— เลือกชนิดวัคซีน —</option>${opts.map(o=>`<option value="${o.value}" ${typeVal===o.value?'selected':''}>${o.label}</option>`).join('')}</select></div>
   <div class="field sub-field" data-f="name" ${typeVal==='other'?'':'hidden'}><label for="vac-name">ชื่อวัคซีนหรือยา ${req}</label><input class="input" id="vac-name" name="name" value="${esc(v.name)}" placeholder="เช่น ยาป้องกันพยาธิหนอนหัวใจ" maxlength="60"></div>
   <div class="two"><div class="field" data-f="given"><label for="given">วันที่ฉีด ${req}</label>${dIn('given',v.given,'given',{max:todayIso(),min:MIN_DATE,req:1})}</div><div class="field" data-f="next"><label for="next">นัดครั้งถัดไป</label>${dIn('next',v.next,'next',{min:v.given||MIN_DATE})}</div></div>
   <p class="hint-s">ลงย้อนหลังได้ ครั้งถัดไปต้องหลังวันที่ฉีด และจะไปโผล่ในหน้านัดหมายให้เอง</p>
   <div class="field"><label for="vac-note">หมายเหตุ <span class="opt">(ไม่บังคับ)</span></label><textarea class="input" id="vac-note" name="note" placeholder="ล็อตวัคซีน อาการหลังฉีด ฯลฯ" maxlength="200">${esc(v.note)}</textarea></div>
   <div class="btn-row">${isNew?'':`<button type="button" class="btn white" data-act="delVac" data-id="${v.id}">${I.trash} ลบ</button>`}<button type="submit" class="btn">${I.check} บันทึก</button></div>
  </form>`);
}
function vacGroupSheet(pid,key){const p=pet(pid);const g=vacGroups(pid).find(x=>x.key===key);if(!p||!g){closeSheet();return}
  const shots=g.recs.filter(r=>r.given);
  openSheet(`${sheetHead(esc(g.label),`ของ${esc(p.name)} · ฉีดมาแล้ว ${shots.length} ครั้ง`,'syringe')}
   <div class="card rows"><div class="row"><span class="k">สถานะล่าสุด</span><span class="v">${statusChip(g.status)}</span></div><div class="row"><span class="k">ครั้งถัดไป</span><span class="v">${g.next?fmt(g.next)+' · '+rel(g.next):'ยังไม่ลง'}</span></div></div>
   <h4 class="sub-h">ประวัติการฉีด</h4><ol class="hist">${g.recs.map((r,i)=>`<li><button type="button" class="hist-row tap" data-act="editVac" data-id="${r.id}"><span class="hist-n" aria-hidden="true">${g.recs.length-i}</span><span class="hist-b"><b>เข็มที่ ${g.recs.length-i} · ${r.given?fmt(r.given):'ยังไม่ลงวันฉีด'}</b><span>${r.next?'นัดถัดไปตอนนั้น '+fmt(r.next):'ไม่มีนัดถัดไป'}${r.note?' · '+esc(r.note):''}</span></span>${I.edit}</button></li>`).join('')}</ol>
   <button type="button" class="btn block mt16" data-act="recordShot" data-pet="${pid}" data-key="${esc(key)}">${I.plus} บันทึกเข็มใหม่</button>`);
}
function visitSheet(v,petId){
  const isNew=!v;v=v||{date:todayIso(),clinic:'',reason:'',notes:'',petId};const p=pet(v.petId);if(!p)return;
  openSheet(`${sheetHead(isNew?'บันทึกการหาหมอ':'แก้ไขการหาหมอ',`ของ${esc(p.name)} · หมอพูดอะไร จดไว้ก่อนลืม`,'healthbook')}
  <form id="visitForm" data-id="${isNew?'':v.id}" data-pet="${p.id}" novalidate>${reqNote}
   <div class="two"><div class="field" data-f="date"><label for="visit-date">วันที่ไป ${req}</label>${dIn('date',v.date,'visit-date',{max:todayIso(),min:MIN_DATE,req:1})}</div><div class="field" data-f="reason"><label for="visit-reason">สาเหตุ ${req}</label><input class="input" id="visit-reason" name="reason" value="${esc(v.reason)}" placeholder="เช่น ตรวจประจำปี" maxlength="60" aria-required="true"></div></div>
   <div class="field"><label for="visit-clinic">คลินิก / โรงพยาบาล <span class="opt">(ไม่บังคับ)</span></label><input class="input" id="visit-clinic" name="clinic" value="${esc(v.clinic)}" placeholder="เช่น โรงพยาบาลสัตว์ใกล้บ้าน" maxlength="60"></div>
   <div class="field"><label for="visit-notes">ผลตรวจ / คำแนะนำหมอ <span class="opt">(ไม่บังคับ)</span></label><textarea class="input" id="visit-notes" name="notes" placeholder="ยาที่ได้ ผลเลือด นัดติดตาม" maxlength="400">${esc(v.notes)}</textarea></div>
   <div class="btn-row">${isNew?'':`<button type="button" class="btn white" data-act="delVisit" data-id="${v.id}">${I.trash} ลบ</button>`}<button type="submit" class="btn">${I.check} บันทึก</button></div>
  </form>`);
}
function vacPickHtml(petIds,checked,vacName,single){
  const sps=[...new Set(petIds.map(id=>(pet(id)||{}).species))];const list=VACS.filter(v=>v.species==='all'||sps.includes(v.species));
  const tag=v=>v.species==='all'?'':` <span class="sp-tag">${SP[v.species].label}</span>`;
  return `<span class="flabel" id="vac-label">${single?'วัคซีน':'วัคซีนที่จะฉีด'} ${req} <span class="opt">${single?'':'(หลายชนิด = แยกเป็นคนละนัด)'}</span></span><div class="ck-list" role="group" aria-labelledby="vac-label">${list.map(v=>`<label class="ck"><input type="${single?'radio':'checkbox'}" name="vac" value="${v.value}" ${checked.includes(v.value)?'checked':''}><span>${v.label}${tag(v)}</span></label>`).join('')}</div>
   <div class="sub-field" data-f="vacName" ${checked.includes('other')?'':'hidden'}><label for="appt-vacname" class="sublabel">ชื่อวัคซีนอื่นๆ ${req}</label><input class="input" id="appt-vacname" name="vacName" value="${esc(vacName||'')}" maxlength="60" placeholder="เช่น ยาหยอดป้องกันเห็บหมัด"></div>`}
const titleLabel=type=>type==='vaccine'?'หัวข้อนัด <span class="opt">(ไม่บังคับ ถ้าว่างจะตั้งตามชื่อวัคซีน)</span>':'หัวข้อนัด '+req;
function apptSheet(a,opts){
  opts=opts||{};const isNew=!a;
  a=a||{petId:opts.pet||st.selPet||st.pets[0].id,type:opts.type||'checkup',title:'',date:opts.date||addDays(1),time:'',place:'',notes:'',vacKey:opts.vacKey||''};
  if(!pet(a.petId))a.petId=st.pets[0].id;
  const vk=a.vacKey||'';const checked=vk?[vk.startsWith('other:')?'other':vk]:[];const vacName=vk.startsWith('other:')?vk.slice(6):'';
  const title=opts.reschedule?'เลื่อนนัด':(isNew?'เพิ่มนัดหมาย':'แก้ไขนัดหมาย');
  openSheet(`${sheetHead(title,opts.reschedule?'เลือกวันใหม่ แล้วกดบันทึก':'นัดแล้วต้องไปนะ นิ่มจะคอยทวง','appointment')}
  <form id="apptForm" data-id="${isNew?'':a.id}" novalidate>${reqNote}
   ${isNew?`<fieldset class="field" data-f="pets"><legend class="flabel">น้องตัวไหน ${req} <span class="opt">(หลายตัว = แยกเป็นคนละนัด)</span></legend><div class="ck-list pets">${st.pets.map(p=>`<label class="ck"><input type="checkbox" name="pets" value="${p.id}" ${p.id===a.petId?'checked':''}>${dot(p)}<span>${esc(p.name)}</span></label>`).join('')}</div></fieldset>`
     :`<div class="field"><label for="petId">น้องตัวไหน</label><select class="input" id="petId" name="petId">${petOptions(a.petId)}</select></div>`}
   <div class="field" role="group" aria-labelledby="type-label"><span class="flabel" id="type-label">ประเภทนัด</span><div class="choice" data-choice="type">${Object.entries(ATYPE).map(([k,t])=>`<button type="button" data-val="${k}" class="${a.type===k?'on':''}" aria-pressed="${a.type===k?'true':'false'}">${I[t.ic]}${t.label}</button>`).join('')}</div><input type="hidden" name="type" value="${a.type}"></div>
   <div class="field" id="vacPick" data-f="vac" ${a.type==='vaccine'?'':'hidden'}>${vacPickHtml([a.petId],checked,vacName,!isNew)}</div>
   <div class="field" data-f="title"><label for="appt-title" id="title-label">${titleLabel(a.type)}</label><input class="input" id="appt-title" name="title" value="${esc(a.title)}" placeholder="เช่น ตรวจสุขภาพประจำปี" maxlength="60"></div>
   <div class="two"><div class="field" data-f="date"><label for="appt-date">วันที่ ${req}</label>${dIn('date',a.date,'appt-date',{min:MIN_DATE,max:addYears(3),req:1})}</div><div class="field"><label for="appt-time">เวลา <span class="opt">(ไม่บังคับ)</span></label>${tIn('time',a.time,'appt-time')}</div></div>
   <div class="field"><label for="appt-place">สถานที่ <span class="opt">(ไม่บังคับ)</span></label><input class="input" id="appt-place" name="place" value="${esc(a.place)}" placeholder="คลินิก โรงพยาบาลสัตว์ หรือร้าน Grooming" maxlength="60"></div>
   <div class="field"><label for="appt-notes">หมายเหตุ <span class="opt">(ไม่บังคับ)</span></label><textarea class="input" id="appt-notes" name="notes" placeholder="เช่น งดอาหารก่อนไป" maxlength="200">${esc(a.notes)}</textarea></div>
   <button type="submit" class="btn block">${I.check} ${isNew?'บันทึกนัด':'บันทึกการแก้ไข'}</button>
  </form>`,{focus:opts.reschedule?'#appt-date':null});
}
function apptDetail(a){const p=pet(a.petId);const t=ATYPE[a.type]||ATYPE.other;const od=isOver(a),done=a.status==='done';
  openSheet(`<div class="sheet-head">${p?avatar(p):''}<div class="sh-text"><span class="chip ${t.chip}">${I[t.ic]} ${t.label}</span><h3 id="sheetTitle" style="margin-top:6px">${esc(a.title)}</h3></div></div>
  <div class="card rows">
   <div class="row"><span class="k">น้อง</span><span class="v">${pbadge(p)}</span></div>
   <div class="row"><span class="k">วันที่</span><span class="v">${fmtLong(a.date)}<span class="countdown d-block">${rel(a.date)}</span></span></div>
   <div class="row"><span class="k">เวลา</span><span class="v">${timeTxt(a.time)}</span></div>
   ${a.type==='vaccine'&&a.vacKey?`<div class="row"><span class="k">วัคซีน</span><span class="v">${esc(keyLabel(a.vacKey))}</span></div>`:''}
   <div class="row"><span class="k">สถานที่</span><span class="v">${esc(a.place)||'—'}</span></div>
   <div class="row"><span class="k">หมายเหตุ</span><span class="v">${esc(a.notes)||'—'}</span></div>
   <div class="row"><span class="k">สถานะ</span><span class="v">${done?`<span class="status done">${I.check}ไปแล้ว</span>${a.vacRecId?'<span class="countdown d-block">ลงสมุดสุขภาพแล้ว</span>':''}`:od?`<span class="status over">${I.warn}เลยกำหนด ยังไม่เช็ค</span>`:'<span class="status sched">'+I.cal+'รอไป</span>'}</span></div></div>
  ${!done&&diff(a.date)>=0&&diff(a.date)<=3?`<div class="tip mt16">${nimImg('appointment','tip-nim',44)}<span>ใกล้แล้วนะ <b>${rel(a.date)}</b> อย่ามาบอกว่าลืม</span></div>`:''}
  <div class="actions mt16">${done?`<button type="button" class="btn white" data-act="undoDone" data-id="${a.id}">ยกเลิกว่าไปแล้ว</button>`:`<button type="button" class="btn" data-act="markDone" data-id="${a.id}">${I.check} ไปแล้ว</button><button type="button" class="btn white" data-act="reschedule" data-id="${a.id}">${I.cal} เลื่อนวัน</button>`}</div>
  <div class="btn-row mt8"><button type="button" class="btn white" data-act="delAppt" data-id="${a.id}">${I.trash} ลบนัด</button><button type="button" class="btn white" data-act="editAppt" data-id="${a.id}">${I.edit} แก้ไข</button></div>`);
}
function dueSheet(pid,key){const p=pet(pid);const g=vacGroups(pid).find(x=>x.key===key);if(!p||!g)return;
  openSheet(`${sheetHead('ครบกำหนด'+esc(g.label),`ของ${esc(p.name)} · มาจากนัดครั้งถัดไปในสมุดสุขภาพ`,'syringe')}
   <div class="card rows"><div class="row"><span class="k">น้อง</span><span class="v">${pbadge(p)}</span></div><div class="row"><span class="k">ครบกำหนด</span><span class="v">${fmtLong(g.next)}<span class="countdown d-block">${rel(g.next)}</span></span></div>
   <div class="row"><span class="k">ฉีดล่าสุด</span><span class="v">${g.latest.given?fmt(g.latest.given):'—'}</span></div><div class="row"><span class="k">สถานะ</span><span class="v">${statusChip(g.status)}</span></div></div>
   <div class="actions mt16"><button type="button" class="btn" data-act="recordShot" data-pet="${pid}" data-key="${esc(key)}">${I.check} ฉีดแล้ว บันทึกลงสมุด</button><button type="button" class="btn white" data-act="bookDue" data-pet="${pid}" data-key="${esc(key)}">${I.cal} ลงนัดหมาย</button></div>
   <button type="button" class="btn white block mt8" data-go="#/health/${pid}?tab=vac">${I.book} ดูในสมุดสุขภาพ</button>`)}
function weightSheet(pid){const p=pet(pid);if(!p)return;const ws=(p.weights||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  openSheet(`${sheetHead('น้ำหนักของ'+esc(p.name),'อัปเดตได้บ่อยๆ ไม่ต้องเข้าไปแก้ข้อมูลรวม','writing')}
   ${weightChart(ws)}
   <form id="weightForm" data-pet="${pid}" class="mt16" novalidate>
    <div class="two"><div class="field" data-f="kg"><label for="w-kg">น้ำหนักใหม่ ${req}</label><div class="unit"><input class="input" id="w-kg" name="kg" inputmode="decimal" maxlength="6" placeholder="เช่น 4.3" aria-required="true"><span>กก.</span></div></div>
    <div class="field" data-f="wdate"><label for="w-date">ชั่งวันที่ ${req}</label>${dIn('wdate',todayIso(),'w-date',{max:todayIso(),min:MIN_DATE,req:1})}</div></div>
    <button type="submit" class="btn block">${I.check} บันทึกน้ำหนัก</button></form>
   ${ws.length?`<h4 class="sub-h">ประวัติ</h4><ul class="wlist">${ws.slice().reverse().map(w=>`<li><span>${fmt(w.date)}</span><b>${w.kg} กก.</b><button type="button" class="icon-btn" data-act="delWeight" data-pet="${pid}" data-id="${w.id}" aria-label="ลบน้ำหนัก ${w.kg} กก. วันที่ ${fmt(w.date)}">${I.trash}</button></li>`).join('')}</ul>`:''}`)}
function weightChart(ws){
  if(!ws.length)return `<div class="chart-empty">ยังไม่มีน้ำหนัก ใส่ครั้งแรกด้านล่าง</div>`;
  if(ws.length<2)return `<div class="chart-empty">มีแค่ ${ws[0].kg} กก. (${fmt(ws[0].date)}) ใส่อีกครั้งเพื่อดูเทรนด์</div>`;
  const W=320,H=150,L=40,R=12,T=14,B=28;const xs=ws.map(w=>parse(w.date).getTime());const ys=ws.map(w=>w.kg);
  let x0=Math.min(...xs),x1=Math.max(...xs);if(x0===x1)x1=x0+1;let y0=Math.min(...ys),y1=Math.max(...ys);const padY=Math.max((y1-y0)*.2,.2);y0=Math.max(0,y0-padY);y1+=padY;
  const X=t=>L+(t-x0)/(x1-x0)*(W-L-R),Y=v=>T+(1-(v-y0)/(y1-y0))*(H-T-B);
  const pts=ws.map((w,i)=>`${X(xs[i]).toFixed(1)},${Y(w.kg).toFixed(1)}`).join(' ');
  const first=ws[0],last=ws[ws.length-1];const d=Math.round((last.kg-first.kg)*100)/100;
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟน้ำหนัก ${ws.length} ครั้ง จาก ${first.kg} เป็น ${last.kg} กิโลกรัม">
    <line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#DDC9AC" stroke-width="1.5"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#DDC9AC" stroke-width="1.5"/>
    <text x="${L-6}" y="${T+10}" text-anchor="end" class="ax">${y1.toFixed(1)}</text><text x="${L-6}" y="${H-B}" text-anchor="end" class="ax">${y0.toFixed(1)}</text>
    <text x="${L}" y="${H-8}" class="ax">${fmt(first.date)}</text><text x="${W-R}" y="${H-8}" text-anchor="end" class="ax">${fmt(last.date)}</text>
    <polyline points="${pts}" fill="none" stroke="#7A5A32" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${ws.map((w,i)=>`<circle cx="${X(xs[i]).toFixed(1)}" cy="${Y(w.kg).toFixed(1)}" r="4.5" fill="#FFFDF8" stroke="#7A5A32" stroke-width="2.5"/>`).join('')}</svg>
    <figcaption>${d===0?'น้ำหนักคงที่':d>0?`เพิ่มขึ้น ${d} กก.`:`ลดลง ${-d} กก.`} ตั้งแต่ ${fmt(first.date)}</figcaption></figure>`}
function noteSheet(n,petId){const isNew=!n;n=n||{text:'',petId};const p=pet(n.petId);if(!p)return;if(photoURLs['note:draft']){URL.revokeObjectURL(photoURLs['note:draft']);delete photoURLs['note:draft']}
  openSheet(`${sheetHead(isNew?'เขียนโน๊ตเจ้าของ':'แก้ไขโน๊ต',`ของ${esc(p.name)} · เรื่องส่วนตัว จดไว้กันลืม`,'writing')}
   <form id="noteForm" data-id="${isNew?'':n.id}" data-pet="${p.id}" novalidate>
    <div class="field" data-f="text"><label for="note-text">โน๊ต ${req}</label><textarea class="input" id="note-text" name="text" maxlength="500" placeholder="เช่น ช่วงนี้กินน้อย ชอบขนมยี่ห้อใหม่" aria-required="true">${esc(n.text)}</textarea></div>
    <div class="field"><span class="flabel">แนบรูป <span class="sample-tag">ตัวอย่าง ไม่บันทึกรูป</span></span><div class="photos one"><label class="pslot">${I.photo}<span class="plabel">เลือกรูป</span><input type="file" accept="image/*" data-photo="note:draft" aria-label="แนบรูปในโน๊ต (ตัวอย่าง ไม่บันทึกรูป)"></label></div></div>
    <div class="btn-row">${isNew?'':`<button type="button" class="btn white" data-act="delNote" data-id="${n.id}">${I.trash} ลบ</button>`}<button type="submit" class="btn">${I.check} บันทึกโน๊ต</button></div></form>`)}
function remSheet(r,petId){const isNew=!r;r=r||{title:'',petId:petId||st.selPet||st.pets[0].id,time:'08:00',start:todayIso(),end:'',paused:false};if(!pet(r.petId))r.petId=st.pets[0].id;
  openSheet(`${sheetHead(isNew?'ตั้งเตือนประจำ':'แก้ไขเตือนประจำ','เช่น ป้อนยาทุกวัน ตั้งครั้งเดียวจบ','writing')}
   <form id="remForm" data-id="${isNew?'':r.id}" novalidate>${reqNote}
    <p class="lead-box soft">${I.bell}<span><b>เตือนในแอปเท่านั้น</b> ไม่ส่ง LINE หรือแจ้งเตือนมือถือ</span></p>
    <div class="field" data-f="title"><label for="rem-title">ชื่อเรื่อง ${req}</label><input class="input" id="rem-title" name="title" value="${esc(r.title)}" maxlength="60" placeholder="เช่น ป้อนยาแก้อักเสบ" aria-required="true"></div>
    <div class="two"><div class="field"><label for="rem-pet">น้องตัวไหน</label><select class="input" id="rem-pet" name="petId">${petOptions(r.petId)}</select></div><div class="field" data-f="time"><label for="rem-time">เวลา ${req}</label>${tIn('time',r.time,'rem-time',{req:1})}</div></div>
    <div class="field"><span class="flabel">ทำซ้ำ</span><span class="chip">${I.repeat} ทุกวัน</span> <span class="hint-s inline">รอบนี้มีแบบทุกวันอย่างเดียว</span></div>
    <div class="two"><div class="field" data-f="start"><label for="rem-start">วันเริ่ม ${req}</label>${dIn('start',r.start,'rem-start',{min:MIN_DATE,req:1})}</div><div class="field" data-f="end"><label for="rem-end">วันสิ้นสุด <span class="opt">(ไม่ใส่ = ไม่มีวันจบ)</span></label>${dIn('end',r.end,'rem-end',{min:r.start})}</div></div>
    <div class="btn-row">${isNew?'':`<button type="button" class="btn white" data-act="delRem" data-id="${r.id}">${I.trash} ลบ</button>`}<button type="submit" class="btn">${I.check} บันทึกเตือน</button></div></form>`)}

/* ---------- validation ---------- */
const fdata=f=>{const o={};new FormData(f).forEach((v,k)=>{if(typeof v==='string')o[k]=v.trim()});return o};
const fall=(f,n)=>new FormData(f).getAll(n).map(String);
function clearErrs(f){f.querySelectorAll('.err-msg').forEach(e=>e.remove());f.querySelectorAll('.has-err').forEach(e=>e.classList.remove('has-err'));f.querySelectorAll('[aria-invalid]').forEach(e=>{e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby')})}
function showErrs(f,errs){clearErrs(f);const keys=Object.keys(errs);if(!keys.length)return true;let first=null;
  keys.forEach((k,i)=>{const box=f.querySelector(`[data-f="${k}"]`);if(!box)return;box.classList.add('has-err');const id='err-'+k;
    const m=document.createElement('p');m.className='err-msg';m.id=id;m.innerHTML=I.warn+'<span>'+esc(errs[k])+'</span>';box.appendChild(m);
    const inp=box.querySelector('input:not([type=hidden]):not([hidden]),select,textarea');if(inp){inp.setAttribute('aria-invalid','true');inp.setAttribute('aria-describedby',id);if(!first)first=inp}});
  if(first){first.focus();scrollToEl(first,true)}
  toast('ยังกรอกไม่ครบ '+keys.length+' จุด ดูข้อความสีแดงนะ');return false}
const parseKg=s=>{s=String(s||'').replace(',','.').trim();if(!s)return null;if(!/^\d{1,3}(\.\d{1,2})?$/.test(s))return NaN;return Number(s)};
const kgErr=n=>Number.isNaN(n)?'ใส่เป็นตัวเลขนะ เช่น 4.2 (ทศนิยมไม่เกิน 2 ตำแหน่ง)':(n<=0?'น้ำหนักต้องมากกว่า 0 กก.':(n>150?'เกิน 150 กก. ดูหน่อยว่าพิมพ์ผิดไหม':''));
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(parse(s).getTime());

/* ---------- submit handlers ---------- */
const H={
  petForm(f){const d=fdata(f);const id=f.dataset.id;const e={};
    if(!d.name)e.name='ยังไม่ได้ใส่ชื่อน้อง';
    let breed='';if(BREEDS[d.species]){if(d.breedSel==='__other'){if(!d.breedOther)e.breedOther='เลือก "อื่นๆ" แล้ว พิมพ์ชื่อสายพันธุ์ด้วยนะ';breed=d.breedOther||''}else breed=d.breedSel||''}else breed=d.breedText||'';
    let birth='';const bp=d.birthPrec||'';
    if(bp==='y'){if(!d.birthY)e.birthY='เลือกปีเกิดด้วยนะ';birth=d.birthY}
    else if(bp==='ym'){if(!d.birthY)e.birthY='เลือกปีเกิดด้วยนะ';if(!d.birthM)e.birthM='เลือกเดือนเกิดด้วยนะ';birth=d.birthY+'-'+d.birthM;if(d.birthY&&d.birthM&&birth>todayIso().slice(0,7))e.birthM='เดือนเกิดอยู่ในอนาคต เลือกใหม่นะ'}
    else if(bp==='ymd'){if(!d.birthD)e.birthD='เลือกวันเกิดด้วยนะ';else if(!validDate(d.birthD))e.birthD='วันที่ไม่ถูกต้อง';else if(d.birthD>todayIso())e.birthD='วันเกิดอยู่ในอนาคตไม่ได้';birth=d.birthD}
    const color=d.color||'white';if(color==='other'&&!d.colorOther)e.colorOther='เลือก "อื่นๆ" แล้ว ใส่ชื่อสีด้วยนะ';
    let kg=null;if(!id&&d.weight){kg=parseKg(d.weight);const m=kgErr(kg);if(m)e.weight=m}
    if(!showErrs(f,e))return;
    const data={name:d.name,species:d.species||'other',breed,birth:bp?birth:'',birthPrec:bp,sex:d.sex||'u',color,colorOther:color==='other'?d.colorOther:'',look:d.look||'',notes:d.notes||''};
    if(id){const p=pet(id);if(!p)return;Object.assign(p,data);save();toast('บันทึกการแก้ไขแล้ว');go('#/pet/'+id)}
    else{const p=Object.assign({id:uid(),weights:kg?[{id:uid(),date:todayIso(),kg}]:[]},data);st.pets.push(p);st.selPet=p.id;st.onboarded=true;save();toast('เพิ่ม'+p.name+'แล้ว');go('#/pet/'+p.id)}},
  vacForm(f){const d=fdata(f);const e={};const id=f.dataset.id;
    if(!d.type)e.type='เลือกชนิดวัคซีนก่อนนะ';if(d.type==='other'&&!d.name)e.name='ใส่ชื่อวัคซีนหรือยาด้วยนะ';
    if(!d.given)e.given='ใส่วันที่ฉีดด้วยนะ';else if(!validDate(d.given))e.given='วันที่ไม่ถูกต้อง';else if(d.given>todayIso())e.given='วันที่ฉีดอยู่ในอนาคตไม่ได้ ถ้ายังไม่ฉีดให้ลงเป็นนัดหมายแทน';
    if(d.next){if(!validDate(d.next))e.next='วันที่ไม่ถูกต้อง';else if(d.given&&d.next<=d.given)e.next='ครั้งถัดไปต้องหลังวันที่ฉีด'}
    if(!showErrs(f,e))return;
    const data={type:d.type,name:d.type==='other'?d.name:'',given:d.given,next:d.next||'',note:d.note||''};
    if(id){const v=st.vaccines.find(x=>x.id===id);if(v)Object.assign(v,data)}else st.vaccines.push(Object.assign({id:uid(),petId:f.dataset.pet},data));
    save();closeSheet();rerender();toast(id?'แก้ไขวัคซีนแล้ว':'บันทึกวัคซีนแล้ว'+(data.next?' นัดถัดไปไปโผล่ในหน้านัดหมายด้วยนะ':''))},
  visitForm(f){const d=fdata(f);const e={};const id=f.dataset.id;
    if(!d.date)e.date='ใส่วันที่ไปหาหมอด้วยนะ';else if(!validDate(d.date))e.date='วันที่ไม่ถูกต้อง';else if(d.date>todayIso())e.date='วันที่อยู่ในอนาคตไม่ได้ ถ้ายังไม่ไปให้ลงเป็นนัดหมาย';
    if(!d.reason)e.reason='บอกหน่อยว่าไปหาหมอเรื่องอะไร';if(!showErrs(f,e))return;
    const data={date:d.date,reason:d.reason,clinic:d.clinic||'',notes:d.notes||''};
    if(id){const v=st.visits.find(x=>x.id===id);if(v)Object.assign(v,data)}else st.visits.push(Object.assign({id:uid(),petId:f.dataset.pet},data));
    save();closeSheet();rerender();toast('บันทึกการหาหมอแล้ว')},
  apptForm(f){const d=fdata(f);const e={};const id=f.dataset.id;const type=d.type||'other';
    const pets=id?[d.petId]:fall(f,'pets');if(!id&&!pets.length)e.pets='เลือกน้องอย่างน้อย 1 ตัว';
    let vacs=[];if(type==='vaccine'){vacs=fall(f,'vac');if(!vacs.length)e.vac='เลือกวัคซีนอย่างน้อย 1 ชนิด';if(vacs.includes('other')&&!d.vacName)e.vacName='ใส่ชื่อวัคซีนอื่นๆ ด้วยนะ'}
    if(type!=='vaccine'&&!d.title)e.title='ใส่หัวข้อนัดด้วยนะ เช่น ตรวจสุขภาพประจำปี';
    if(!d.date)e.date='เลือกวันที่นัดด้วยนะ';else if(!validDate(d.date))e.date='วันที่ไม่ถูกต้อง';else if(d.date>addYears(3))e.date='นัดได้ไม่เกิน 3 ปีข้างหน้า';
    if(!showErrs(f,e))return;
    const keyOf=v=>v==='other'?'other:'+d.vacName:v;const base={type,time:d.time||'',place:d.place||'',notes:d.notes||'',date:d.date};
    const mkTitle=k=>d.title||(type==='vaccine'?'ฉีด'+keyLabel(k):d.title);
    if(id){const a=st.appts.find(x=>x.id===id);if(!a)return;const k=type==='vaccine'?keyOf(vacs[0]):'';
      const moved=a.date!==d.date;Object.assign(a,base,{petId:d.petId,vacKey:k,title:mkTitle(k)});if(moved&&a.status==='done'&&diff(d.date)>=0){a.status='planned';delete a.doneAt}
      save();closeSheet();rerender();toast(moved?'เลื่อนนัดเป็น '+fmt(d.date)+' แล้ว':'แก้ไขนัดแล้ว');return}
    let n=0,skipped=0;pets.forEach(pid=>{const p=pet(pid);if(!p)return;
      if(type==='vaccine')vacs.forEach(v=>{const vm=VACMAP[v];if(vm&&vm.species!=='all'&&vm.species!==p.species){skipped++;return}const k=keyOf(v);st.appts.push(Object.assign({id:uid(),petId:pid,title:mkTitle(k),status:'planned',vacKey:k},base));n++});
      else{st.appts.push(Object.assign({id:uid(),petId:pid,title:d.title,status:'planned',vacKey:''},base));n++}});
    if(!n){showErrs(f,{vac:'วัคซีนที่เลือกไม่ตรงกับชนิดของน้องที่เลือก'});return}
    save();closeSheet();rerender();toast(`เพิ่มนัด ${n} รายการแล้ว`+(skipped?` (ข้าม ${skipped} ที่ไม่ตรงชนิดสัตว์)`:''))},
  weightForm(f){const d=fdata(f);const e={};const kg=parseKg(d.kg);
    if(kg==null)e.kg='ใส่น้ำหนักด้วยนะ';else{const m=kgErr(kg);if(m)e.kg=m}
    if(!d.wdate)e.wdate='ใส่วันที่ชั่งด้วยนะ';else if(!validDate(d.wdate))e.wdate='วันที่ไม่ถูกต้อง';else if(d.wdate>todayIso())e.wdate='วันที่ชั่งอยู่ในอนาคตไม่ได้';
    if(!showErrs(f,e))return;const p=pet(f.dataset.pet);if(!p)return;p.weights=p.weights||[];p.weights.push({id:uid(),date:d.wdate,kg});save();rerender();weightSheet(p.id);toast('บันทึกน้ำหนัก '+kg+' กก. แล้ว')},
  noteForm(f){const d=fdata(f);if(!showErrs(f,d.text?{}:{text:'เขียนอะไรสักหน่อยก่อนบันทึกนะ'}))return;const id=f.dataset.id;
    if(id){const n=st.notes.find(x=>x.id===id);if(n){n.text=d.text;n.updated=todayIso()}}else st.notes.push({id:uid(),petId:f.dataset.pet,text:d.text,created:todayIso(),updated:todayIso()});
    save();closeSheet();rerender();toast('บันทึกโน๊ตแล้ว')},
  remForm(f){const d=fdata(f);const e={};const id=f.dataset.id;
    if(!d.title)e.title='ใส่ชื่อเรื่องที่จะให้เตือนด้วยนะ';if(!d.time)e.time='ใส่เวลาที่จะให้เตือนด้วยนะ';
    if(!d.start)e.start='ใส่วันเริ่มด้วยนะ';else if(!validDate(d.start))e.start='วันที่ไม่ถูกต้อง';
    if(d.end){if(!validDate(d.end))e.end='วันที่ไม่ถูกต้อง';else if(d.start&&d.end<d.start)e.end='วันสิ้นสุดต้องไม่ก่อนวันเริ่ม'}
    if(!showErrs(f,e))return;const data={title:d.title,petId:d.petId,time:d.time,start:d.start,end:d.end||''};
    if(id){const r=st.reminders.find(x=>x.id===id);if(r)Object.assign(r,data)}else st.reminders.push(Object.assign({id:uid(),paused:false},data));
    save();closeSheet();rerender();toast('ตั้งเตือนประจำแล้ว เตือนในแอปเท่านั้น')},
  memberForm(f){const d=fdata(f);if(!showErrs(f,d.mname?{}:{mname:'ใส่ชื่อสมาชิกด้วยนะ'}))return;
    st.family.members.push({id:uid(),name:d.mname,role:d.role==='owner'?'owner':'carer'});save();rerender();toast('เพิ่ม'+d.mname+'แล้ว (ตัวอย่าง)');const m=$('#m-name');if(m)m.focus()}
};
document.addEventListener('submit',e=>{const f=e.target;if(!H[f.id])return;e.preventDefault();if(f.dataset.busy)return;f.dataset.busy='1';
  const b=f.querySelector('[type=submit]');if(b)b.disabled=true;
  try{H[f.id](f)}finally{setTimeout(()=>{delete f.dataset.busy;if(b&&document.contains(b))b.disabled=false},400)}});

/* ---------- inputs ---------- */
function onChoice(btn){const box=btn.closest('[data-choice]');const name=box.dataset.choice;const val=btn.dataset.val;const f=btn.closest('form');
  box.querySelectorAll('button').forEach(b=>{const on=b===btn;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
  const h=f&&f.querySelector(`input[type=hidden][name="${name}"]`);if(h)h.value=val;
  if(name==='species'){const bf=f.querySelector('#breedField');if(bf)bf.outerHTML=breedField(val,'')}
  if(name==='birthPrec')f.querySelectorAll('[data-birth]').forEach(el=>{el.hidden=!el.dataset.birth.split(' ').includes(val)});
  if(name==='type'){const vp=f.querySelector('#vacPick');if(vp)vp.hidden=val!=='vaccine';const tl=f.querySelector('#title-label');if(tl)tl.innerHTML=titleLabel(val)}}
function rebuildVacPick(f){const vp=f.querySelector('#vacPick');if(!vp)return;const pets=fall(f,'pets');const checked=fall(f,'vac');const vn=(f.querySelector('[name=vacName]')||{}).value||'';
  vp.innerHTML=vacPickHtml(pets.length?pets:[st.pets[0].id],checked,vn,false)}
function onField(e){const t=e.target;
  if(t.classList&&t.classList.contains('dnative')){syncPick(t);const f=t.form;
    if(f&&t.name==='start'){const en=f.querySelector('[name=end]');if(en)en.min=t.value||MIN_DATE}
    if(f&&t.name==='given'){const nx=f.querySelector('[name=next]');if(nx)nx.min=t.value||MIN_DATE}}
  if(e.type!=='change')return;
  if(t.id==='pet-breed'){const s=t.parentElement.querySelector('.sub-field');if(s){s.hidden=t.value!=='__other';if(!s.hidden)s.querySelector('input').focus()}}
  if(t.name==='color'){const s=t.closest('fieldset').querySelector('.sub-field');if(s)s.hidden=t.value!=='other'}
  if(t.id==='vac-type'){const s=t.form.querySelector('[data-f="name"]');if(s)s.hidden=t.value!=='other'}
  if(t.name==='vac'){const s=t.form.querySelector('[data-f="vacName"]');if(s)s.hidden=!fall(t.form,'vac').includes('other')}
  if(t.name==='pets')rebuildVacPick(t.form);
  if(t.dataset&&t.dataset.photo){const k=t.dataset.photo;const file=t.files&&t.files[0];if(!file)return;
    if(!/^image\//.test(file.type)){toast('ไฟล์นี้ไม่ใช่รูปภาพ เลือกใหม่นะ');t.value='';return}
    if(photoURLs[k])URL.revokeObjectURL(photoURLs[k]);photoURLs[k]=URL.createObjectURL(file);
    if(k==='note:draft'){const sl=t.closest('.pslot');sl.classList.add('has');const old=sl.querySelector('.prev,svg');const img=document.createElement('img');img.className='prev';img.alt='รูปที่แนบ (ตัวอย่าง)';img.src=photoURLs[k];if(old)old.replaceWith(img);else sl.prepend(img);sl.querySelector('.plabel').textContent='เลือกแล้ว (ตัวอย่าง)'}
    else rerender();toast('แสดงรูปให้ดูแล้ว (ตัวอย่าง ไม่บันทึกรูป)')}}
document.addEventListener('input',onField);document.addEventListener('change',onField);

function copyText(txt,what){const ok=()=>toast('คัดลอก'+what+'แล้ว'),fb=()=>{const ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0;left:-9999px';document.body.appendChild(ta);ta.select();let r=false;try{r=document.execCommand('copy')}catch(e){}ta.remove();r?ok():toast('คัดลอกไม่ได้ กดค้างที่ข้อความเพื่อคัดลอกเองนะ')};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(txt).then(ok,fb);else fb()}
function doMarkDone(a){a.status='done';a.doneAt=todayIso();
  if(a.type==='vaccine'&&a.vacKey){const other=a.vacKey.startsWith('other:');const given=a.date<=todayIso()?a.date:todayIso();
    const v={id:uid(),petId:a.petId,type:other?'other':a.vacKey,name:other?a.vacKey.slice(6):'',given,next:'',note:'บันทึกจากนัด '+a.title};st.vaccines.push(v);a.vacRecId=v.id}}
function undoDone(a){if(a.vacRecId){st.vaccines=st.vaccines.filter(v=>v.id!==a.vacRecId);delete a.vacRecId}a.status='planned';delete a.doneAt}
function recordShot(pid,key){const other=key.startsWith('other:');vacSheet(null,pid,{type:other?'other':key,name:other?key.slice(6):''})}
const findA=id=>st.appts.find(x=>x.id===id);
const rmById=(k,id)=>{st[k]=st[k].filter(x=>x.id!==id)};

/* ---------- clicks ---------- */
document.addEventListener('click',e=>{
  const dl=e.target.closest('[data-dlg]');if(dl){const fn=dlgOk;if(dl.dataset.dlg==='ok'){closeDlg();if(fn)fn()}else closeDlg();return}
  const ch=e.target.closest('[data-choice] button');if(ch){onChoice(ch);return}
  const ht=e.target.closest('[data-htab]');if(ht){healthTab=ht.dataset.htab;pendingFocus='#htab-'+healthTab;rerender();return}
  const pc=e.target.closest('[data-pchip]');if(pc){pendingFocus=`[data-pchip="${pc.dataset.pchip}"]`;go(pc.dataset.go);return}
  const fp=e.target.closest('[data-fpet]');if(fp){AP.petF=fp.dataset.fpet;AP.showAll=false;pendingFocus=`[data-fpet="${AP.petF}"]`;rerender();return}
  const ft=e.target.closest('[data-ftype]');if(ft){AP.typeF=ft.dataset.ftype;AP.showAll=false;pendingFocus=`[data-ftype="${AP.typeF}"]`;rerender();return}
  const md=e.target.closest('[data-mode]');if(md){AP.mode=md.dataset.mode;if(AP.mode==='day'&&!AP.sel)AP.sel=todayIso();pendingFocus=`[data-mode="${AP.mode}"]`;rerender();return}
  const cl=e.target.closest('[data-cal]');if(cl){const c=AP.cursor;AP.cursor=new Date(c.getFullYear(),c.getMonth()+Number(cl.dataset.cal),1);pendingFocus=`[data-cal="${cl.dataset.cal}"]`;rerender();return}
  const dy=e.target.closest('[data-day]');if(dy){AP.mode='day';AP.sel=dy.dataset.day;pendingFocus=`[data-day="${AP.sel}"]`;rerender();return}
  const g=e.target.closest('[data-go]');if(g&&!e.target.closest('[data-act]')){go(g.dataset.go);return}
  const b=e.target.closest('[data-act]');if(!b)return;const A=b.dataset.act,id=b.dataset.id,pid=b.dataset.pet,key=b.dataset.key;
  switch(A){
    case 'enter':st.onboarded=true;save();go(st.pets.length?'#/home':'#/pet/new');break;
    case 'undo':{const fn=toastUndo;hideToast();if(fn)fn();break}
    case 'reqClose':reqClose();break;
    case 'reset':st=seed();st.onboarded=true;healthTab='vac';Object.assign(AP,{mode:'all',sel:null,cursor:null,petF:'',typeF:'',from:'',showAll:false,showEnded:false});save();toast('รีเซ็ตเป็นข้อมูลตัวอย่างแล้ว');go('#/home');break;
    case 'delPet':{const p=pet(id);if(!p)break;confirmDelete('ลบ'+esc(p.name)+'?','ข้อมูลวัคซีน การหาหมอ นัดหมาย โน๊ต และเตือนประจำของ'+esc(p.name)+'จะหายทั้งหมด',()=>{
      withUndo(()=>{rmById('pets',id);['vaccines','visits','appts','notes','reminders'].forEach(k=>{st[k]=st[k].filter(x=>x.petId!==id)});if(st.selPet===id)st.selPet=st.pets[0]?st.pets[0].id:null},'ลบ'+p.name+'แล้ว');go('#/home')},'ลบน้อง');break}
    case 'weight':weightSheet(pid);break;
    case 'delWeight':{const p=pet(pid);if(!p)break;withUndo(()=>{p.weights=p.weights.filter(w=>w.id!==id)},'ลบน้ำหนักแล้ว');weightSheet(pid);break}
    case 'addVac':vacSheet(null,pid);break;
    case 'editVac':{const v=st.vaccines.find(x=>x.id===id);if(v)vacSheet(v);break}
    case 'vacGroup':vacGroupSheet(pid,key);break;
    case 'recordShot':recordShot(pid,key);break;
    case 'delVac':confirmDelete('ลบบันทึกวัคซีนนี้?','ประวัติเข็มนี้จะหายจากสมุดสุขภาพ',()=>{closeSheet();withUndo(()=>rmById('vaccines',id),'ลบบันทึกวัคซีนแล้ว')});break;
    case 'addVisit':visitSheet(null,pid);break;
    case 'editVisit':{const v=st.visits.find(x=>x.id===id);if(v)visitSheet(v);break}
    case 'delVisit':confirmDelete('ลบบันทึกหาหมอนี้?','ผลตรวจและคำแนะนำหมอในรายการนี้จะหายไป',()=>{closeSheet();withUndo(()=>rmById('visits',id),'ลบบันทึกหาหมอแล้ว')});break;
    case 'addNote':noteSheet(null,pid);break;
    case 'editNote':{const n=st.notes.find(x=>x.id===id);if(n)noteSheet(n);break}
    case 'delNote':confirmDelete('ลบโน๊ตนี้?','ข้อความในโน๊ตนี้จะหายไป',()=>{closeSheet();withUndo(()=>rmById('notes',id),'ลบโน๊ตแล้ว')});break;
    case 'addAppt':if(!st.pets.length){go('#/pet/new');break}apptSheet(null,{pet:pid||undefined,type:b.dataset.type,date:b.dataset.date||undefined});break;
    case 'viewAppt':{const a=findA(id);if(a)apptDetail(a);break}
    case 'editAppt':{const a=findA(id);if(a)apptSheet(a);break}
    case 'reschedule':{const a=findA(id);if(a)apptSheet(a,{reschedule:true});break}
    case 'markDone':{const a=findA(id);if(!a)break;closeSheet();withUndo(()=>doMarkDone(a),a.type==='vaccine'&&a.vacKey?'ไปแล้ว ลงสมุดสุขภาพให้ด้วย':'บันทึกว่าไปแล้ว');break}
    case 'undoDone':{const a=findA(id);if(!a)break;undoDone(a);save();closeSheet();rerender();toast('ย้ายกลับไปเป็นนัดที่รอไปแล้ว');break}
    case 'delAppt':confirmDelete('ลบนัดนี้?','นัดนี้จะหายจากตารางนัดหมาย',()=>{closeSheet();withUndo(()=>rmById('appts',id),'ลบนัดแล้ว')},'ลบนัด');break;
    case 'viewDue':dueSheet(pid,key);break;
    case 'bookDue':{const gg=vacGroups(pid).find(x=>x.key===key);apptSheet(null,{pet:pid,type:'vaccine',vacKey:key,date:gg&&gg.next&&diff(gg.next)>0?gg.next:addDays(1)});break}
    case 'toggleAll':AP.showAll=!AP.showAll;pendingFocus='[data-act="toggleAll"]';rerender();break;
    case 'toggleEnded':AP.showEnded=!AP.showEnded;pendingFocus='[data-act="toggleEnded"]';rerender();break;
    case 'goToday':{const t=today();AP.cursor=new Date(t.getFullYear(),t.getMonth(),1);AP.sel=todayIso();pendingFocus=`[data-day="${AP.sel}"]`;rerender();break}
    case 'addRem':remSheet(null,pid);break;
    case 'editRem':{const r=st.reminders.find(x=>x.id===id);if(r)remSheet(r);break}
    case 'toggleRem':{const r=st.reminders.find(x=>x.id===id);if(!r)break;r.paused=!r.paused;save();pendingFocus=`[data-act="toggleRem"][data-id="${id}"]`;rerender();toast(r.paused?'พักเตือน "'+r.title+'" แล้ว':'เปิดเตือน "'+r.title+'" แล้ว');break}
    case 'delRem':{const r=st.reminders.find(x=>x.id===id);if(!r)break;confirmDelete('ลบเตือนประจำนี้?','"'+esc(r.title)+'" จะไม่เตือนอีก',()=>{closeSheet();withUndo(()=>rmById('reminders',id),'ลบเตือนแล้ว')});break}
    case 'copy':copyText(b.dataset.copy,b.dataset.what||'');break;
    case 'newCode':st.family.code=genCode();save();pendingFocus='[data-act="newCode"]';rerender();toast('สร้างรหัสใหม่แล้ว (ตัวอย่าง)');break;
    case 'delMember':{const m=st.family.members.find(x=>x.id===id);if(!m)break;if(m.role==='owner'){toast('เจ้าของลบออกไม่ได้');break}
      confirmDelete('เอา'+esc(m.name)+'ออก?','ถ้าเป็นของจริง คนนี้จะดูข้อมูลน้องไม่ได้อีก',()=>withUndo(()=>{st.family.members=st.family.members.filter(x=>x.id!==id)},'เอา'+m.name+'ออกแล้ว'),'เอาออก');break}
  }
});

/* ---------- keyboard ---------- */
const FOC='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
function trap(e,box){const els=[...box.querySelectorAll(FOC)].filter(x=>x.offsetParent!==null||x===document.activeElement);if(!els.length)return;const a=els[0],z=els[els.length-1];
  if(e.shiftKey&&(document.activeElement===a||!box.contains(document.activeElement))){e.preventDefault();z.focus()}else if(!e.shiftKey&&(document.activeElement===z||!box.contains(document.activeElement))){e.preventDefault();a.focus()}}
document.addEventListener('keydown',e=>{
  if(dlg.classList.contains('open')){if(e.key==='Escape'){e.preventDefault();closeDlg();return}if(e.key==='Tab')trap(e,dlg);return}
  if(layer.classList.contains('open')){if(e.key==='Escape'){e.preventDefault();reqClose();return}if(e.key==='Tab'){trap(e,layer.querySelector('.sheet'));return}}
  const tab=e.target.closest&&e.target.closest('[role=tab]');
  if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){const list=[...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')];let i=list.indexOf(tab);
    i=e.key==='Home'?0:e.key==='End'?list.length-1:(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length;e.preventDefault();list[i].focus();list[i].click()}
});

window.__tofu={get st(){return st},seed,migrate,save,migratedFrom};
route();
})();
