/* =====================================================
   RECEIVING INSPECTION SYSTEM — SINGLE DAY MODE
   FINAL STABLE VERSION
===================================================== */

const API_URL="https://receiving-inspection-system-production.up.railway.app";

const dayHeader=document.getElementById("dayHeader");
const measureBody=document.getElementById("measureBody");
const inspectionDate=document.getElementById("inspectionDate");

let activeDay=null;
let dynamicMeasurements=[];
let lockedDays=[];


/* ================================
   BUILD SINGLE DAY HEADER
================================ */

function buildDayHeader(){

 dayHeader.innerHTML="";

 if(!activeDay) return;

 const th=document.createElement("th");
 th.textContent=activeDay;
 th.dataset.day=activeDay;

 dayHeader.appendChild(th);
}


/* ================================
   BUILD TABLE
================================ */

function buildMeasurementTableFromExcel(rows){

 measureBody.innerHTML="";

 let counters={
  appearance:0,
  dimension:0,
  function:0
 };

 rows.forEach(r=>{

  const tr=document.createElement("tr");

  /* CATEGORY ROW */
  if(r.type==="category"){

   const td=document.createElement("td");
   td.colSpan=6;
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
   <td>${r.std||""}</td>
   <td>${r.minus||""}</td>
   <td>${r.plus||""}</td>
  `;

  const td=document.createElement("td");
  td.dataset.day=activeDay;

  const box=document.createElement("div");

  if(r.type==="dimension"){

   for(let i=0;i<3;i++){
    const inp=document.createElement("input");
    inp.type="number";
    inp.addEventListener("input",()=>evaluateCell(td,r));
    box.appendChild(inp);
   }

  }else{

   for(let i=0;i<3;i++){
    const sel=document.createElement("select");
    sel.innerHTML=`<option>OK</option><option>NG</option>`;
    sel.addEventListener("change",()=>evaluateCell(td,r));
    box.appendChild(sel);
   }
  }

  td.appendChild(box);
  tr.appendChild(td);

  measureBody.appendChild(tr);

 });

}

function buildTableHeader(){

 const thead=document.querySelector("#measureTable thead");
 thead.innerHTML="";

 const tr=document.createElement("tr");

 tr.innerHTML=`
  <th>No</th>
  <th>Item</th>
  <th>Std</th>
  <th>-</th>
  <th>+</th>
  <th>${activeDay||""}</th>
 `;

 thead.appendChild(tr);
}



/* ================================
   CELL EVALUATION
================================ */

function evaluateCell(td,m){

 const inputs=td.querySelectorAll("input,select");
 let red=false;

 if(m.type==="dimension"){

  const std=parseFloat(m.std);
  const minus=parseFloat(m.minus||0);
  const plus=parseFloat(m.plus||0);

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
   ENABLE / DISABLE
================================ */

function setInputsDisabled(state){

 document.querySelectorAll("td[data-day] input, td[data-day] select")
   .forEach(i=>i.disabled=state);

}


/* ================================
   COLLECT MEASUREMENTS
================================ */

function collectMeasurements(){

 const result=[];
 const rows=document.querySelectorAll("#measureBody tr");

 rows.forEach(tr=>{

  if(tr.querySelector("td")?.colSpan) return;

  const td=tr.querySelector(`td[data-day="${activeDay}"]`);
  if(!td) return;

  const inputs=td.querySelectorAll("input,select");
  result.push([...inputs].map(i=>i.value));

 });

 return result;
}


/* ================================
   FILL SAVED DATA
================================ */

function fillMeasurements(saved){

 const rows=document.querySelectorAll("#measureBody tr");

 let index=0;

 rows.forEach(tr=>{

  if(tr.querySelector("td")?.colSpan) return;

  const td=tr.querySelector(`td[data-day="${activeDay}"]`);
  if(!td) return;

  const inputs=td.querySelectorAll("input,select");

  if(saved[index]){
   saved[index].forEach((val,i)=>{
    if(inputs[i]) inputs[i].value=val;
   });
  }

  index++;

 });

}


/* ================================
   LOAD EXISTING RECEIVING
================================ */

async function loadReceivingForSelectedDay(){

 try{

  const partId=localStorage.getItem("active_part_id");
  if(!partId) return;

  const res=await fetch(`${API_URL}/receiving/history/${partId}`);
  const data=await res.json();

  if(!Array.isArray(data)) {
   setInputsDisabled(false);
   return;
  }

  const record=data.find(r=>r.day===activeDay);

  if(!record){
   setInputsDisabled(false);
   return;
  }

  fillMeasurements(record.measurements);
  setInputsDisabled(true);

 }catch(e){
  console.log("Load error",e);
 }

}



/* ================================
   SAVE RECEIVING
================================ */

async function saveReceiving(){

 if(!activeDay) return alert("Select inspection date");

 const payload={
  part_id: localStorage.getItem("active_part_id"),
  day: activeDay,
  measurements: collectMeasurements()
 };

 await fetch(`${API_URL}/receiving/save`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify(payload)
 });

 setInputsDisabled(true);
 lockedDays.push(activeDay);

 alert("Saved & Locked");

}


/* ================================
   DATE SELECTION
================================ */

inspectionDate.addEventListener("change", async ()=>{

 const date=new Date(inspectionDate.value);
 activeDay=date.getDate();

 if(!dynamicMeasurements.length){
  alert("Load Excel first");
  return;
 }

 buildTableHeader();
 buildMeasurementTableFromExcel(dynamicMeasurements);

 await loadReceivingForSelectedDay();

});



/* ================================
   EXCEL IMPORT
================================ */

async function loadExcel(){

 const file=document.getElementById("excelUpload").files[0];
 if(!file) return alert("Select Excel file");

 const data=await file.arrayBuffer();
 const workbook=XLSX.read(data);
 const sheet=workbook.Sheets[workbook.SheetNames[0]];
 const rows=XLSX.utils.sheet_to_json(sheet,{header:1});

 applyExcelHeader(rows);

 dynamicMeasurements=[];

 let currentSection=null;

 for(let i=11;i<rows.length;i++){

  const row=rows[i];
  if(!row) continue;

  /* SECTION HEADER DETECT FROM COLUMN A */
  if(row[0]){

   const section=row[0].toString().trim().toLowerCase();

   if(section.includes("appearance") ||
      section.includes("dimens") ||
      section.includes("function")){

      currentSection=section.includes("dimens") ? "dimension"
                     : section.includes("function") ? "function"
                     : "appearance";

      dynamicMeasurements.push({
        type:"category",
        item: row[0]
      });

      continue;
   }
  }

  /* SKIP EMPTY */
  if(!row[2]) continue;

  if(!currentSection) continue;

  dynamicMeasurements.push({
   type: currentSection,
   item: row[2],     // Column C = Item
   std: row[3]||"",  // Column D
   minus: row[5]||"",// Column F (TOL -)
   plus: row[4]||""  // Column E (TOL +)
  });

 }

 alert("Excel Loaded. Select Date.");
localStorage.setItem("active_part_id", "8123-0987");

}



/* ================================
   HEADER APPLY (FIXED COLUMN C)
================================ */

function applyExcelHeader(rows){

 rows.forEach(r=>{

  if(!r[0]) return;

  const key=r[0].toString().trim().toLowerCase();

  if(key==="part name")
   document.querySelector(".static-header tr:nth-child(1) td:nth-child(2)").innerText=r[2]||"";

  if(key==="type")
   document.querySelector(".static-header tr:nth-child(2) td:nth-child(2)").innerText=r[2]||"";

  if(key==="vendor")
   document.querySelector(".static-header tr:nth-child(3) td:nth-child(2)").innerText=r[2]||"";

 });

}

