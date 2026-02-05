const dayHeader = document.getElementById("dayHeader");
const measureBody = document.getElementById("measureBody");
const inspectionDate = document.getElementById("inspectionDate");

let activeDay = null;
let daysWithData = []; // history days

/* ======================
   CREATE DAYS 1–31
====================== */
for(let d=1; d<=31; d++){
  const th = document.createElement("th");
  th.textContent = d;
  th.dataset.day = d;
  dayHeader.appendChild(th);
}

/* ======================
   SAMPLE MEASUREMENT DATA
====================== */
const measurements = [
  {type:"appearance", no:1, item:"Appearance - Scratch"},
  {type:"appearance", no:2, item:"Appearance - Dent"},
  {type:"appearance", no:3, item:"Appearance - Color"},
  {type:"dimension", no:4, item:"Dimension - Length", std:60, minus:4, plus:5},
  {type:"dimension", no:5, item:"Dimension - Width", std:60, minus:4, plus:5},
  {type:"function", no:6, item:"Function - Fit"}
];

/* ======================
   BUILD TABLE ROWS
====================== */
measurements.forEach(m=>{
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${m.no}</td>
    <td>${m.item}</td>
    <td>${m.std||""}</td>
    <td>${m.minus||""}</td>
    <td>${m.plus||""}</td>
  `;

  for(let d=1; d<=31; d++){
    const td = document.createElement("td");
    td.dataset.day = d;

    const box = document.createElement("div");

    if(m.type === "dimension"){
      for(let i=0;i<3;i++){
        const inp = document.createElement("input");
        inp.type="number";
        inp.disabled=true;
        box.appendChild(inp);
      }
    } else {
      for(let i=0;i<3;i++){
        const sel=document.createElement("select");
        sel.disabled=true;

        const ok=document.createElement("option");
        ok.value="OK"; ok.text="OK";

        const ng=document.createElement("option");
        ng.value="NG"; ng.text="NG";

        sel.appendChild(ok);
        sel.appendChild(ng);

        box.appendChild(sel);
      }
    }

    td.appendChild(box);
    tr.appendChild(td);
  }

  measureBody.appendChild(tr);
});

/* ======================
   UPDATE VISIBLE DAYS
====================== */
function updateVisibleDays(){

  const visibleDays = [...new Set([...daysWithData, activeDay])];

  document.querySelectorAll("[data-day]").forEach(el=>{
    const d = parseInt(el.dataset.day);

    if(visibleDays.includes(d)){
      el.style.display="";
    }else{
      el.style.display="none";
    }
  });
}

/* ======================
   EDITABLE DAY LOGIC
====================== */
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

/* ======================
   SIMULATE HISTORY
   (Later comes from backend)
====================== */
// example history
daysWithData = [3,6,11];
updateVisibleDays();
