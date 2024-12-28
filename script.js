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
  

  if (amountInput.value === "" || amountInput.value === "0" || amountInput.value[0] === "0" || amountInput.value === ","){
    alert("Lütfen Tutar Giriniz");
    return;
  }

  const dueDate = dueDateInput.value;
  const amount = formatAmountToFloat(amountInput.value);


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
        ${index + 1}. Vade: ${formatDate(date)} - Tutar: ${formatFloatToAmount(amounts[index])} TL
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
  resultDiv.innerHTML = `Ortalama Vade Tarihi: ${formatDate(averageMaturityDate)}
  <br>Ortalama Vade: ${Math.round(averageDaysSinceReference)} Gün
  <br>Toplam Tutar: ${formatFloatToAmount(totalAmount)} TL`;

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
      `${index + 1}. Vade: ${formatDate(date)} - Tutar: ${formatFloatToAmount(amounts[index])} TL`,
      10,
      yPosition
    );
    yPosition += 10; // Move down for the next line
  });

  pdf.setFontSize(14);
  pdf.setFont("courier");
  pdf.text("---------------------------------------------------", 10, yPosition);
  
  // Add summary (average maturity and total amount)
  calculateAverageMaturity(); // Ensure calculation is up to date
  const resultText = resultDiv.textContent;
  const summaryLines = resultText

  yPosition += 10; // Add some space

  if (yPosition > pageHeight - 10) {
    pdf.addPage(); // Add new page
    yPosition = 10; // Reset Y-coordinate for the new page
  }
  pdf.text(summaryLines, 10, yPosition);


  // Save the PDF
  pdf.save("cek_vade_hesaplama.pdf");
});


document.getElementById("amount").addEventListener("input", function (event) {
  let input = event.target;
  let value = input.value;

  // Remove invalid characters (anything except digits and commas)
  value = value.replace(/[^0-9,]/g, "");

  // Handle comma for floating point
  let parts = value.split(",");

  if (parts.length > 2) {
      // If there are multiple commas, keep the first part and the first decimal part
      value = parts[0] + "," + parts[1];
  }

  // Format the integer part with dots as thousand separators
  let integerPart = parts[0];
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Reassemble the value
  if (parts.length > 1) {
      value = integerPart + "," + parts[1];
  } else {
      value = integerPart;
  }

  // Set the formatted value back to the input
  input.value = value;
});

function formatAmountToFloat(text) {
  if (!text) return 0;
  // Replace all dots (thousand separators) and then replace the comma (decimal separator) with a dot
  const normalized = text.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized) || 0;
}

function formatFloatToAmount(float) {
  if (isNaN(float)) return "0,00";

  // Convert the float to a string with two decimal places
  const [integerPart, decimalPart] = float
    .toFixed(2)
    .split("."); // Separate integer and decimal parts

  // Add thousand separators to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Combine the integer and decimal parts with a comma
  return `${formattedInteger},${decimalPart}`;
}


