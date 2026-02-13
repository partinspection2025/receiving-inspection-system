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
   BLOCK 03 — TABLE BUILDER
================================ */

function buildMeasurementTableFromExcel(rows){

 measureBody.innerHTML="";
 dynamicMeasurements=[];

 let counters={
  appearance:0,
  dimension:0,
  function:0
 };

 rows.forEach(r=>{

  const tr=document.createElement("tr");

  /* CATEGORY */
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

  counters[r.type]++;
  const number=counters[r.type];

  tr.innerHTML=`
   <td>${number}</td>
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

}


/* ================================
   BLOCK 04 — CELL EVALUATION
================================ */

function evaluateCell(td,m){

 const inputs=td.querySelectorAll("input,select");
 let red=false;

 if(m.type==="dimension"){

  const std=parseFloat(m.std);
  const minus=parseFloat(m.minus);
  const plus=parseFloat(m.plus);

  const min=std-minus;
  const max=std+plus;

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


/* =====================================================
   BLOCK 15 — EXCEL IMPORT ENGINE (FINAL STABLE)
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

 for(let i=11;i<rows.length;i++){

  const row=rows[i];
  if(!row) continue;

  const category=(row[0]||"").toString().trim().toLowerCase();
  const item=(row[1]||"").toString().trim();

  if(!category && !item) continue;
  if(category.includes("vendor")) break;

  /* CATEGORY HEADER */
  if(
   category==="appearance" ||
   category==="dimension" ||
   category==="function"
  ){
   measurements.push({
    type:"category",
    item:row[0]
   });
   continue;
  }

  let type="appearance";
  if(category.includes("dimension")) type="dimension";
  if(category.includes("function")) type="function";

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
   BLOCK 17 — STATIC HEADER SMART SCAN
===================================================== */

function applyExcelHeader(rows){

 try{

  rows.forEach(r=>{

   const label=(r[0]||"").toString().toLowerCase();

   if(label.includes("vendor")){
    document.querySelector(".static-header tr:nth-child(3) td:nth-child(2)").innerText=r[2]||"";
   }

   if(label.includes("type")){
    document.querySelector(".static-header tr:nth-child(2) td:nth-child(2)").innerText=r[2]||"";
   }

   if(label.includes("part name")){
    document.querySelector(".static-header tr:nth-child(1) td:nth-child(2)").innerText=r[2]||"";
   }

  });

 }catch(e){
  console.log("Header apply failed",e);
 }

}


/* ================================
   BLOCK INIT
================================ */

updateVisibleDays();
