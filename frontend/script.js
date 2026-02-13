/* ================================
   BLOCK 01 — SYSTEM CONFIG
================================ */

const API_URL="https://receiving-inspection-system-production.up.railway.app";

const dayHeader=document.getElementById("dayHeader");
const measureBody=document.getElementById("measureBody");
const inspectionDate=document.getElementById("inspectionDate");

let activeDay=null;
let daysWithData=[];
let stampedDays={};
let measurementsHistory={};
let dynamicMeasurements=[];
let lockedDays=[];


/* ================================
   BLOCK 02 — DAY HEADER ENGINE
================================ */

for(let d=1;d<=31;d++){
 const th=document.createElement("th");
 th.textContent=d;
 th.dataset.day=d;
 dayHeader.appendChild(th);
}


/* ================================
   BLOCK 03 — DYNAMIC TABLE BUILDER
================================ */

function buildMeasurementTableFromExcel(rows){

 measureBody.innerHTML="";
 dynamicMeasurements=[];

 rows.forEach((r,index)=>{

  const tr=document.createElement("tr");

  tr.innerHTML=`
  <td>${index+1}</td>
  <td>${r.item}</td>
  <td class="std-col">${r.std||""}</td>
  <td>${r.minus||""}</td>
  <td>${r.plus||""}</td>`;

  dynamicMeasurements.push(r);

  for(let d=1;d<=31;d++){

   const td=document.createElement("td");
   td.dataset.day=d;

   const box=document.createElement("div");

   if(r.type==="dimension"){
    for(let i=0;i<3;i++){
     const inp=document.createElement("input");
     inp.type="number";
     inp.disabled=true;
     inp.addEventListener("input",()=>evaluateCell(td,r));
     box.appendChild(inp);
    }
   }else{
    for(let i=0;i<3;i++){
     const sel=document.createElement("select");
     sel.disabled=true;

     const ok=document.createElement("option");
     ok.value="OK"; ok.text="OK";

     const ng=document.createElement("option");
     ng.value="NG"; ng.text="NG";

     sel.appendChild(ok);
     sel.appendChild(ng);

     sel.addEventListener("change",()=>evaluateCell(td,r));
     box.appendChild(sel);
    }
   }

   td.appendChild(box);
   tr.appendChild(td);
  }

  measureBody.appendChild(tr);
 });

 addBottomRow("Vendor Production Date","vendor");
 addBottomRow("Inspection Date","inspection");
 addBottomRow("PIC Stamp","PIC");
 addBottomRow("Checker Stamp","Checker");
 addBottomRow("Approver Stamp","Approver");

 rebuildStamps();
 updateVisibleDays();
}


/* ================================
   BLOCK 04 — CELL EVALUATION
================================ */

function evaluateCell(td,m){

 const inputs=td.querySelectorAll("input,select");
 let red=false;

 if(m.type==="dimension"){
  const min=m.std-m.minus;
  const max=m.std+m.plus;

  inputs.forEach(i=>{
   const v=parseFloat(i.value);
   if(!isNaN(v)&&(v<min||v>max)) red=true;
  });

 }else{
  inputs.forEach(i=>{
   if(i.value==="NG") red=true;
  });
 }

 td.style.backgroundColor=red?"#ffb3b3":"";
}


/* ================================
   BLOCK 05 — BOTTOM STRUCTURE
================================ */

function addBottomRow(label,role){

 const tr=document.createElement("tr");
 tr.dataset.role=role;

 const first=document.createElement("td");
 first.colSpan=5;
 first.textContent=label;
 first.style.fontWeight="bold";

 tr.appendChild(first);

 for(let d=1;d<=31;d++){
  const td=document.createElement("td");
  td.dataset.day=d;
  tr.appendChild(td);
 }

 measureBody.appendChild(tr);
}


/* ================================
   BLOCK 06 — STAMP ENGINE
================================ */

function applyStamp(role){

 if(!activeDay) return;

 const row=document.querySelector(`tr[data-role="${role}"]`);
 const cell=row.querySelector(`td[data-day="${activeDay}"]`);

 if(!stampedDays[activeDay]) stampedDays[activeDay]={};
 if(stampedDays[activeDay][role]) return;

 const stamp=document.createElement("div");

 stamp.style.border="2px solid red";
 stamp.style.borderRadius="50%";
 stamp.style.width="60px";
 stamp.style.height="60px";
 stamp.style.display="flex";
 stamp.style.alignItems="center";
 stamp.style.justifyContent="center";
 stamp.style.color="red";
 stamp.style.fontWeight="bold";
 stamp.textContent=role;

 cell.appendChild(stamp);

 stampedDays[activeDay][role]=true;
}


/* ================================
   BLOCK 07 — HISTORY LOADER
================================ */

async function loadHistory(){

 try{

  const res=await fetch(API_URL + "/receiving/history/1");
  const data=await res.json();

  daysWithData=data.days||[];
  lockedDays=[...daysWithData];

  stampedDays=data.stamps||{};
  measurementsHistory=data.measurements||{};

  rebuildHistory();
  rebuildStamps();
  updateVisibleDays();

 }catch(e){
  console.log("history load fail",e);
 }
}


/* ================================
   BLOCK 08 — HISTORY REBUILD
================================ */

function rebuildHistory(){

 Object.keys(measurementsHistory).forEach(day=>{

  const rows=document.querySelectorAll("#measureBody tr");

  rows.forEach((tr,index)=>{

   if(tr.dataset.role) return;

   const td=tr.querySelector(`td[data-day="${day}"]`);
   if(!td) return;

   const inputs=td.querySelectorAll("input,select");
   const values=measurementsHistory[day][index]||[];

   inputs.forEach((inp,i)=>{
    if(values[i]!==undefined){
     inp.value=values[i];
     inp.disabled=true;
    }
   });

   const m=dynamicMeasurements[index];
   evaluateCell(td,m);
  });
 });
}


/* ================================
   BLOCK 09 — STAMP REBUILD
================================ */

function rebuildStamps(){

 Object.keys(stampedDays).forEach(day=>{

  const roles=stampedDays[day];

  Object.keys(roles).forEach(role=>{

   const row=document.querySelector(`tr[data-role="${role}"]`);
   if(!row) return;

   const cell=row.querySelector(`td[data-day="${day}"]`);
   if(!cell) return;

   const stamp=document.createElement("div");

   stamp.style.border="2px solid red";
   stamp.style.borderRadius="50%";
   stamp.style.width="60px";
   stamp.style.height="60px";
   stamp.style.display="flex";
   stamp.style.alignItems="center";
   stamp.style.justifyContent="center";
   stamp.style.color="red";
   stamp.style.fontWeight="bold";
   stamp.textContent=role;

   cell.appendChild(stamp);
  });
 });
}


/* ================================
   BLOCK 10 — DAY VISIBILITY
================================ */

function updateVisibleDays(){

 const visible=[...new Set([...daysWithData,activeDay])];

 document.querySelectorAll("[data-day]").forEach(el=>{
  const d=parseInt(el.dataset.day);
  el.style.display=visible.includes(d)?"":"none";
 });
}


/* ================================
   BLOCK 11 — DATE SELECTION
================================ */

inspectionDate.addEventListener("change",()=>{

 const date=new Date(inspectionDate.value);
 activeDay=date.getDate();

 updateVisibleDays();

 document.querySelectorAll("td[data-day]").forEach(td=>{

  const day=parseInt(td.dataset.day);
  const inputs=td.querySelectorAll("input,select");

  if(day===activeDay && !lockedDays.includes(day)){
   inputs.forEach(i=>i.disabled=false);
  }else{
   inputs.forEach(i=>i.disabled=true);
  }

 });
});


/* ================================
   BLOCK 12 — SAVE ENGINE
================================ */

async function saveReceiving(){

 if(!activeDay) return alert("Select inspection date first");

 const measurementsData=[];
 const stampsData=stampedDays[activeDay]||{};

 document.querySelectorAll("#measureBody tr").forEach(tr=>{

  if(tr.dataset.role) return;

  const td=tr.querySelector(`td[data-day="${activeDay}"]`);
  const inputs=td.querySelectorAll("input,select");

  const values=[];
  inputs.forEach(i=>values.push(i.value));

  measurementsData.push(values);
 });

 const payload={
  part_id:1,
  inspection_day:activeDay,
  inspection_date:inspectionDate.value,
  measurements:measurementsData,
  stamps:stampsData
 };

 const res=await fetch(API_URL + "/receiving/save",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify(payload)
 });

 const result=await res.json();

 daysWithData=result.days;
 lockedDays=[...daysWithData];

 updateVisibleDays();

 alert("Receiving Saved");
}


/* ================================
   BLOCK 13 — EXCEL IMPORT
================================ */

async function loadExcel(){

 const file=document.getElementById("excelUpload").files[0];
 if(!file) return alert("Select Excel file");

 const data=await file.arrayBuffer();

 const workbook=XLSX.read(data);
 const sheet=workbook.Sheets[workbook.SheetNames[0]];
 const json=XLSX.utils.sheet_to_json(sheet,{header:1});

 const measurements=[];

 for(let i=11;i<json.length;i++){

  const row=json[i];
  if(!row[1]) break;

  const item=row[1].toString();

  let type="appearance";
  if(item.toLowerCase().includes("dimension")) type="dimension";
  if(item.toLowerCase().includes("function")) type="function";

  measurements.push({
   type:type,
   item:item,
   std:row[2],
   minus:row[3],
   plus:row[4]
  });

 }

 buildMeasurementTableFromExcel(measurements);

 alert("Excel Structure Loaded ✔");
}


/* ================================
   BLOCK 14 — SYSTEM INIT
================================ */

loadHistory();
updateVisibleDays();
