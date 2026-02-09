const API_URL = "https://https://receiving-inspection-system-production.up.railway.app/";

const dayHeader=document.getElementById("dayHeader");
const measureBody=document.getElementById("measureBody");
const inspectionDate=document.getElementById("inspectionDate");

let activeDay=null;
let daysWithData=[];
let stampedDays={};

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
   if(!isNaN(v)&&(v<min||v>max)) red=true;
  });

 }else{
  inputs.forEach(i=>{
   if(i.value==="NG") red=true;
  });
 }

 td.style.backgroundColor=red?"#ffb3b3":"";
}

/* BUILD MEASUREMENTS */
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

/* BOTTOM STRUCTURE */
function addBottomRow(label,id){

 const tr=document.createElement("tr");
 tr.dataset.role=id;

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

addBottomRow("Vendor Production Date","vendor");
addBottomRow("Inspection Date","inspection");
addBottomRow("PIC Stamp","PIC");
addBottomRow("Checker Stamp","Checker");
addBottomRow("Approver Stamp","Approver");

/* APPLY STAMP */
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

/* DAY VISIBILITY */
function updateVisibleDays(){

 const visible=[...new Set([...daysWithData,activeDay])];

 document.querySelectorAll("[data-day]").forEach(el=>{
  const d=parseInt(el.dataset.day);
  el.style.display=visible.includes(d)?"":"none";
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
