const dayHeader = document.getElementById("dayHeader");
const measureBody = document.getElementById("measureBody");

/* =========================
   GENERATE DAYS 1–31
========================= */

for(let d=1; d<=31; d++){
  const th = document.createElement("th");
  th.textContent = d;
  dayHeader.appendChild(th);
}

/* =========================
   SAMPLE MEASUREMENT DATA
   (Later comes from Excel upload)
========================= */

const measurements = [
  {no:1, item:"Appearance - Scratch", std:"OK"},
  {no:2, item:"Appearance - Dent", std:"OK"},
  {no:3, item:"Appearance - Color", std:"OK"},
  {no:4, item:"Dimension - Length", std:"60", minus:"4", plus:"5"},
  {no:5, item:"Dimension - Width", std:"60", minus:"4", plus:"5"},
  {no:6, item:"Function - Fit", std:"OK"}
];

/* =========================
   GENERATE ROWS
========================= */

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
    td.textContent = "";
    tr.appendChild(td);
  }

  measureBody.appendChild(tr);
});
