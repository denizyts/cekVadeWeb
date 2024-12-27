const datesContainer = document.getElementById("datesContainer");
const resultDiv = document.getElementById("result");
const dueDateInput = document.getElementById("dueDate");
const addDateBtn = document.getElementById("addDate");
const amountInput = document.getElementById("amount");

let dates = [];
let amounts = [];

// Tarihi ekleme
addDateBtn.addEventListener("click", () => {
  

  if (amountInput.value === ""){
    alert("Lütfen Tutar Giriniz");
    return;
  }
  const dueDate = dueDateInput.value;
  const amount = amountInput.value;

  if (checkDateValidity(new Date(dueDate).getTime()) === false){
    alert("Geçmiş Tarih Ekleyemezsiniz");
    return;
  }

  if (dueDate) {
    dates.push(new Date(dueDate));
    amounts.push(parseFloat(amount));
    displayDatesAndAmounts();
    dueDateInput.value = "";
    calculateAverageMaturity();
  }
});

// Tarihleri ekranda gösterme
function displayDatesAndAmounts() {
  datesContainer.innerHTML = dates
    .map((date, index) => `
      <div class="date-item">
        ${index + 1}. Vade: ${formatDate(date)} - Tutar: ${amounts[index].toFixed(2)} TL
        <button class="delete-btn" data-index="${index}">Sil</button>
      </div>
    `)
    .join("");

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      deleteEntry(index);
      calculateAverageMaturity();
    });
  });
}

function deleteEntry(index) {
  // Remove the date and amount at the specified index
  dates.splice(index, 1);
  amounts.splice(index, 1);

  // Re-display the updated list
  displayDatesAndAmounts();

}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0'); // Ensure two digits for the day
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits for the month
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Ortalama vade hesaplama
// Calculate the average maturity date
function calculateAverageMaturity() {
  

  if (dates.length === 0) {
    resultDiv.textContent = "Lütfen Çek Ekleyin.";
    return;
  }

  dueDateInput.value = currentDate();

  // Use today's date as the reference
  const referenceDate = new Date().getTime(); // Current date in milliseconds

  // Calculate the weighted sum of days and total amount
  let weightedDaysSum = 0;
  let totalAmount = 0;

  dates.forEach((date, index) => {
    const daysSinceReference = (date.getTime() - referenceDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
    weightedDaysSum += amounts[index] * daysSinceReference;
    totalAmount += amounts[index];
  });

  // Calculate the average maturity in days
  const averageDaysSinceReference = weightedDaysSum / totalAmount;

  // Calculate the average maturity date
  const averageMaturityDate = new Date(referenceDate + averageDaysSinceReference * (1000 * 60 * 60 * 24));

  // Display the result
  resultDiv.textContent = `Ortalama Vade Tarihi: ${formatDate(averageMaturityDate)}  \nToplam Tutar: ${totalAmount.toFixed(2)} TL`;
}

function checkDateValidity(date){

  if (date < new Date().getTime()){
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const dueDateInput = document.getElementById("dueDate");

  // Get current date
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  // Format the date as yyyy-MM-dd
  const formattedDate = currentDate.toISOString().split("T")[0];

  // Set the initial value of the date input
  dueDateInput.value = formattedDate;
});

function currentDate(){
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  const formattedDate = currentDate.toISOString().split("T")[0];
  return formattedDate;
}

