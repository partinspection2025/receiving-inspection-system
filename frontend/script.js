const dayHeader=document.getElementById("dayHeader");
const measureBody=document.getElementById("measureBody");
const inspectionDate=document.getElementById("inspectionDate");

let activeDay=null;
let daysWithData=[3,6,11];

/* CREATE DAYS */
for(let d=1;d<=31;d++){
 const th=document.createElement("th");
 th.textContent=d;
 th.dataset.day=d;
 dayHeader.appendChild(th);
}

/* MEASUREMENTS */
const measurements=[
 {type:"appearance",no:1,item:"Appearance - Scratch"},
 {type:"appearance",no:2,item:"Appearance - Dent"},
 {type:"appearance",no:3,item:"Appearance - Color"},
 {type:"dimension",no:4,item:"Dimension - Length",std:60,minus:4,plus:5},
 {type:"dimension",no:5,item:"Dimension - Width",std:60,minus:4,plus:5},
 {type:"function",no:6,item:"Function - Fit"}
];

function evaluateCell(td,m){

 const inputs=td.querySelectorAll("input,select");
 let red=false;

 if(m.type==="dimension"){
  const min=m.std-m.minus;
  const max=m.std+m.plus;

  inputs.forEach(i=>{
   const v=parseFloat(i.value);
   if(!isNaN(v)&& (v<min||v>max)) red=true;
  });

 }else{
  inputs.forEach(i=>{
   if(i.value==="NG") red=true;
  });
 }

 td.style.backgroundColor=red?"#ffb3b3":"";
}

/* BUILD MEASUREMENT ROWS */
measurements.forEach(m=>{

 const tr=document.createElement("tr");

 tr.innerHTML=`
 <td>${m.no}</td>
 <td>${m.item}</td>
 <td>${m.std||""}</td>
 <td>${m.minus||""}</td>
 <td>${m.plus||""}</td>`;

 for(let d=1;d<=31;d++){

  const td=document.createElement("td");
  td.dataset.day=d;

  const box=document.createElement("div");

  if(m.type==="dimension"){
   for(let i=0;i<3;i++){
    const inp=document.createElement("input");
    inp.type="number";
    inp.disabled=true;
    inp.addEventListener("input",()=>evaluateCell(td,m));
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

    sel.addEventListener("change",()=>evaluateCell(td,m));
    box.appendChild(sel);
   }
  }

  td.appendChild(box);
  tr.appendChild(td);
 }

 measureBody.appendChild(tr);
});

/* ADD LOWER STRUCTURE ROWS */
function addBottomRow(label){

 const tr=document.createElement("tr");

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

addBottomRow("Vendor Production Date");
addBottomRow("Inspection Date");
addBottomRow("PIC Stamp");
addBottomRow("Checker Stamp");
addBottomRow("Approver Stamp");

/* DAY VISIBILITY */
function updateVisibleDays(){

 const visible=[...new Set([...daysWithData,activeDay])];

 document.querySelectorAll("[data-day]").forEach(el=>{
  const d=parseInt(el.dataset.day);

  if(visible.includes(d)) el.style.display="";
  else el.style.display="none";
 });
}

/* DATE SELECT */
inspectionDate.addEventListener("change",()=>{

 const date=new Date(inspectionDate.value);
 activeDay=date.getDate();

 updateVisibleDays();

 document.querySelectorAll("td[data-day]").forEach(td=>{
  const inputs=td.querySelectorAll("input,select");

  if(parseInt(td.dataset.day)===activeDay){
   inputs.forEach(i=>i.disabled=false);
  }else{
   inputs.forEach(i=>i.disabled=true);
  }
 });
});

updateVisibleDays();
