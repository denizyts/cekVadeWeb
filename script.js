const datesContainer = document.getElementById("datesContainer");
const resultDiv = document.getElementById("result");
const dueDateInput = document.getElementById("dueDate");
const addDateBtn = document.getElementById("addDate");
const amountInput = document.getElementById("amount");
const generatePDFBtn = document.getElementById("generatePDF");
const image = document.getElementById("image");


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
  resultDiv.innerHTML = `Ortalama Vade Tarihi: ${formatDate(averageMaturityDate)}<br>\nToplam Tutar: ${totalAmount.toFixed(2)} TL`;

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



// PDF oluşturma
generatePDFBtn.addEventListener("click", () => {
  if (dates.length === 0) {
    alert("Lütfen önce çek ekleyin.");
    return;
  }

  // Initialize jsPDF
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFont("courier" );

  // Add title
  pdf.setFontSize(16);
  pdf.text("Ortalama Vade", 80, 10);

  // Add details for each check
  pdf.setFontSize(12);
  let yPosition = 20; // Y-coordinate for text
  const pageHeight = pdf.internal.pageSize.height;

  dates.forEach((date, index) => {

    if (yPosition > pageHeight - 10) {
      pdf.addPage(); // Add new page
      yPosition = 10; // Reset Y-coordinate for the new page
    }

    pdf.text(
      `${index + 1}. Vade: ${formatDate(date)} - Tutar: ${amounts[index].toFixed(2)} TL`,
      10,
      yPosition
    );
    yPosition += 10; // Move down for the next line
  });

  // Add summary (average maturity and total amount)
  calculateAverageMaturity(); // Ensure calculation is up to date
  const resultText = resultDiv.textContent;
  const summaryLines = resultText.split("\n"); // Split multi-line summary

  yPosition += 10; // Add some space
  summaryLines.forEach((line) => {

    if (yPosition > pageHeight - 10) {
      pdf.addPage(); // Add new page
      yPosition = 10; // Reset Y-coordinate for the new page
    }

    pdf.text(line, 10, yPosition);
    yPosition += 5; // Move down for each line
  });

  // Save the PDF
  pdf.save("cek_vade_hesaplama.pdf");
});





