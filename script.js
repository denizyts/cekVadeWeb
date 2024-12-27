const datesContainer = document.getElementById("datesContainer");
const calculateAverageBtn = document.getElementById("calculateAverage");
const resultDiv = document.getElementById("result");
const dueDateInput = document.getElementById("dueDate");
const addDateBtn = document.getElementById("addDate");

let dates = [];

// Tarihi ekleme
addDateBtn.addEventListener("click", () => {
  const dueDate = dueDateInput.value;

  if (dueDate) {
    dates.push(new Date(dueDate));
    displayDates();
    dueDateInput.value = "";
    calculateAverageBtn.disabled = dates.length < 2;
  }
});

// Tarihleri ekranda gösterme
function displayDates() {
  datesContainer.innerHTML = dates
    .map((date, index) => `<div class="date-item">${index + 1}. ${date.toLocaleDateString()}</div>`)
    .join("");
}

// Ortalama vade hesaplama
calculateAverageBtn.addEventListener("click", () => {
  if (dates.length < 2) {
    resultDiv.textContent = "Ortalama hesaplamak için en az 2 tarih ekleyin.";
    return;
  }

  const totalDays = dates.reduce((sum, date) => sum + date.getTime(), 0);
  const averageDate = new Date(totalDays / dates.length);

  resultDiv.textContent = `Ortalama Vade Tarihi: ${averageDate.toLocaleDateString()}`;
});
