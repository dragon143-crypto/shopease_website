document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');

  // Example function to add a dummy item
  function addCartItem(name, price, img) {
    const item = document.createElement('div');
    item.classList.add('cart-item');
    item.innerHTML = `
      <img src="${img}" alt="${name}">
      <h3>${name}</h3>
      <p>₹${price}</p>
      <button class="remove">Remove</button>
    `;

    // Attach remove event
    item.querySelector('.remove').addEventListener('click', () => removeCartItem(item));

    cartItemsContainer.appendChild(item);
  }

  // Animate remove
  function removeCartItem(item) {
    item.classList.add('removing');
    setTimeout(() => {
      item.remove();
      updateTotals();
    }, 400); // Matches animation duration
  }

  // Update totals (dummy for now)
  function updateTotals() {
    console.log('Update total price logic here...');
  }

  // Add sample items for testing
  addCartItem("Samsung Galaxy S24", 79999, "https://via.placeholder.com/100");
  addCartItem("iPhone 15 Pro", 149999, "https://via.placeholder.com/100");
});

// Save item to localStorage
function saveItem(name, price, img) {
  let savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];

  // Prevent duplicate save
  if (!savedItems.some(item => item.name === name)) {
    savedItems.push({ name, price, img });
    localStorage.setItem("savedItems", JSON.stringify(savedItems));
    alert(name + " added to Saved Items ❤️");
  } else {
    alert(name + " is already in Saved Items!");
  }
}

// Show and Hide Feedback Popup
function openFeedback() {
  document.getElementById("feedback-popup").classList.remove("hidden");
}
document.getElementById("close-feedback").onclick = function() {
  document.getElementById("feedback-popup").classList.add("hidden");
};

// Handle Submit
document.getElementById("send-feedback").onclick = function() {
  const feedback = document.getElementById("feedback-text").value.trim();
  if (feedback) {
    alert("Thank you for your feedback! 💙");
    // Save feedback to backend (optional)
    // fetch("/api/feedback", { method: "POST", body: JSON.stringify({ feedback }) });
    document.getElementById("feedback-popup").classList.add("hidden");
    document.getElementById("feedback-text").value = "";
  } else {
    alert("Please write your feedback before submitting!");
  }
};

// 🧠 Auto-open form if user asks for 'feedback' in AI chat
function checkFeedbackTrigger(text) {
  if (text.toLowerCase().includes("feedback")) {
    openFeedback();
  }
}

// Modify your AI send message function to call checkFeedbackTrigger(text)
const oldSendAI = sendAIMessage;
sendAIMessage = function() {
  const text = aiInput.value.trim();
  if (!text) return;
  checkFeedbackTrigger(text);
  oldSendAI();
};


