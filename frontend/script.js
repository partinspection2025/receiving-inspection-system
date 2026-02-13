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

 let runningNo=1;
 let measureIndex=0;

 rows.forEach((r)=>{

 const tr=document.createElement("tr");

 if(r.type==="category"){

  const td=document.createElement("td");
  td.colSpan=36;
  td.innerText=r.item;
  td.style.background="#ccffcc";
  td.style.fontWeight="bold";

  tr.appendChild(td);
  measureBody.appendChild(tr);
  return;
 }

 tr.dataset.measureIndex=measureIndex;

 tr.innerHTML=`
 <td>${runningNo++}</td>
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

    ["OK","NG"].forEach(v=>{
     const opt=document.createElement("option");
     opt.value=v; opt.text=v;
     sel.appendChild(opt);
    });

    sel.addEventListener("change",()=>evaluateCell(td,r));
    box.appendChild(sel);
   }
  }

  td.appendChild(box);
  tr.appendChild(td);
 }

 measureBody.appendChild(tr);
 measureIndex++;

 });
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
   BLOCK 08 — HISTORY REBUILD
================================ */

function rebuildHistory(){

 Object.keys(measurementsHistory).forEach(day=>{

  document.querySelectorAll("#measureBody tr").forEach(tr=>{

   if(!tr.dataset.measureIndex) return;

   const idx=parseInt(tr.dataset.measureIndex);

   const td=tr.querySelector(`td[data-day="${day}"]`);
   if(!td) return;

   const inputs=td.querySelectorAll("input,select");
   const values=measurementsHistory[day][idx]||[];

   inputs.forEach((inp,i)=>{
    if(values[i]!==undefined){
     inp.value=values[i];
     inp.disabled=true;
    }
   });

   const m=dynamicMeasurements[idx];
   evaluateCell(td,m);
  });
 });
}


/* =====================================================
   BLOCK 15 — EXCEL IMPORT ENGINE (ROBUST VERSION)
===================================================== */

async function loadExcel(){

 const file=document.getElementById("excelUpload").files[0];
 if(!file) return alert("Select Excel file");

 const data=await file.arrayBuffer();

 const workbook=XLSX.read(data);
 const sheet=workbook.Sheets[workbook.SheetNames[0]];
 const rows=XLSX.utils.sheet_to_json(sheet,{header:1});

 applyExcelHeader(rows);

 const measurements=[];

 for(let i=0;i<rows.length;i++){

  const row=rows[i];
  if(!row) continue;

  const item=row.find(c=>typeof c==="string");
  if(!item) continue;

  const name=item.toLowerCase();

  if(name.includes("vendor")) break;
  if(name.includes("stamp")) break;

  let type="appearance";

  if(name==="appearance"||name==="dimension"||name==="function"){
   type="category";
  }
  else if(name.includes("dimension")) type="dimension";
  else if(name.includes("function")) type="function";

  measurements.push({
   type:type,
   item:item,
   std:row[2]||"",
   minus:row[3]||"",
   plus:row[4]||""
  });

 }

 buildMeasurementTableFromExcel(measurements);
}


/* =====================================================
   BLOCK 17 — EXCEL STATIC HEADER APPLY (SMART SCAN)
===================================================== */

function applyExcelHeader(rows){

 let part="",vendor="",type="";

 rows.forEach(r=>{
  if(!r) return;
  const line=r.join(" ").toLowerCase();

  if(line.includes("part")&& !part) part=r[r.length-1];
  if(line.includes("vendor")&& !vendor) vendor=r[r.length-1];
  if(line.includes("type")&& !type) type=r[r.length-1];
 });

 document.querySelector(".static-header tr:nth-child(1) td:nth-child(2)").innerText=part;
 document.querySelector(".static-header tr:nth-child(2) td:nth-child(2)").innerText=vendor;
 document.querySelector(".static-header tr:nth-child(3) td:nth-child(2)").innerText=type;

}
