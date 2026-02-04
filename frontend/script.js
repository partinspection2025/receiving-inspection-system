// DAY SELECTION LOGIC (EXCEL-LIKE)

const dateInput = document.getElementById("inspectionDate");
const dayInfo = document.getElementById("selectedDayInfo");
const dayCells = document.querySelectorAll(".day-cell");

dateInput.addEventListener("change", () => {
  const date = new Date(dateInput.value);
  const day = date.getDate();

  dayInfo.textContent = ` → Editable Day: ${day}`;

  dayCells.forEach(cell => {
    const cellDay = cell.getAttribute("data-day");
    const inputs = cell.querySelectorAll("input, select");

    if (parseInt(cellDay) === day) {
      inputs.forEach(el => el.disabled = false);
      cell.style.background = "#e8f4ff";
    } else {
      inputs.forEach(el => el.disabled = true);
      cell.style.background = "";
    }
  });
});
