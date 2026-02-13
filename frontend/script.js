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

 let numbering=1;

 rows.forEach(r=>{

  const tr=document.createElement("tr");

  /* CATEGORY HEADER */
  if(r.type==="category"){

   const td=document.createElement("td");
   td.colSpan=36;
   td.innerText=r.item;
   td.style.background="#ccffcc";
   td.style.fontWeight="bold";

   tr.appendChild(td);
   measureBody.appendChild(tr);

   numbering=1;
   return;
  }

  tr.innerHTML=`
   <td>${numbering}</td>
   <td>${r.item}</td>
   <td class="std-col">${r.std||""}</td>
   <td>${r.minus||""}</td>
   <td>${r.plus||""}</td>`;

  numbering++;

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
     sel.innerHTML=`<option>OK</option><option>NG</option>`;
     sel.addEventListener("change",()=>evaluateCell(td,r));
     box.appendChild(sel);
    }
   }

   td.appendChild(box);
   tr.appendChild(td);
  }

  measureBody.appendChild(tr);

 });

 addBottomRow("Vendor Production Date","vendor_date");
 addBottomRow("Inspection Date","inspection_date");
 addBottomRow("PIC Stamp","pic");
 addBottomRow("Checker Stamp","checker");
 addBottomRow("Approver Stamp","approver");

}


/* ================================
   BLOCK 04 — CELL EVALUATION
================================ */

function evaluateCell(td,m){

 const inputs=td.querySelectorAll("input,select");
 let red=false;

 if(m.type==="dimension"){
  const std=parseFloat(m.std)||0;
  const min=std-(parseFloat(m.minus)||0);
  const max=std+(parseFloat(m.plus)||0);

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
   BLOCK 15 — EXCEL IMPORT ENGINE (FINAL COMPANY VERSION)
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
 let currentType="appearance";

 for(let i=11;i<rows.length;i++){

  const row=rows[i];
  if(!row || !row[1]) continue;

  const name=row[1].toString().trim();

  if(name==="Appearance"||name==="Dimension"||name==="Function"){
   measurements.push({type:"category",item:name});
   currentType=name.toLowerCase();
   continue;
  }

  if(name.toLowerCase().includes("vendor production")) break;

  measurements.push({
   type:currentType,
   item:name,
   std:row[2]||"",
   minus:row[3]||"",
   plus:row[4]||""
  });

 }

 buildMeasurementTableFromExcel(measurements);

}


/* =====================================================
   BLOCK 17 — EXCEL STATIC HEADER APPLY
===================================================== */

function applyExcelHeader(rows){

 try{

  document.querySelector("#partName").innerText = rows[8][1] || "";
  document.querySelector("#type").innerText = rows[7][1] || "";
  document.querySelector("#vendor").innerText = rows[6][1] || "";

 }catch(e){
  console.log("Header apply failed",e);
 }

}
