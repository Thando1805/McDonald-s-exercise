// Global variables
let cart = [];
let total = 0;
let discountApplied = false;
let currentUser = "Guest";

// Meal combos for suggestion feature
const mealCombos = [
    "Big Mac + Fries + Coke",
    "Quarter Pounder + Fries + McFlurry",
    "McChicken + Nuggets + Apple Pie",
    "Filet-O-Fish + Fries + Coke",
    "Cheeseburger + Fries + Milkshake"
];

// Check which page we're on and run appropriate functions
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    if (document.getElementById('loginForm')) {
        setupLoginPage();
    }
    
    // Check if we're on the menu page
    if (document.getElementById('menuGrid')) {
        setupMenuPage();
    }
});

// LOGIN PAGE FUNCTIONS
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const messageArea = document.getElementById('messageArea');
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        validateLogin();
    });
    
    // Also allow button click
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        validateLogin();
    });
}

function validateLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageArea = document.getElementById('messageArea');
    
    // Clear previous messages
    messageArea.textContent = '';
    messageArea.className = 'message-area';
    
    // Check if both fields are filled
    if (!username.trim() || !password.trim()) {
        messageArea.textContent = 'Please enter username and password';
        messageArea.classList.add('error');
        return;
    }
    
    // For demo purposes, accept any username/password
    // But check for the demo credentials specifically
    const isDemoCredential = (username === 'admin' && password === '1234');
    
    // Store username for use on menu page
    sessionStorage.setItem('mcdUsername', username);
    
    // Show success message
    messageArea.textContent = `Welcome back, ${username}! Redirecting...`;
    messageArea.classList.add('success');
    
    // Redirect to menu page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'menu.html';
    }, 1500);
}

// MENU PAGE FUNCTIONS
function setupMenuPage() {
    // Get username from session storage or use default
    currentUser = sessionStorage.getItem('mcdUsername') || 'Guest';
    
    // Display username in header
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser;
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('mcdUsername');
            window.location.href = 'index.html';
        });
    }
    
    // Setup "Add to Cart" buttons
    setupAddToCartButtons();
    
    // Setup discount button
    const applyDiscountBtn = document.getElementById('applyDiscountBtn');
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', applyDiscount);
    }
    
    // Setup meal suggestion button
    const suggestMealBtn = document.getElementById('suggestMealBtn');
    if (suggestMealBtn) {
        suggestMealBtn.addEventListener('click', suggestMeal);
    }
    
    // Setup confirm order button
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', confirmOrder);
    }
    
    // Highlight special items (under R30) - already done in HTML
    highlightSpecials();
}

function setupAddToCartButtons() {
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            addToCart(id, name, price);
        });
    });
}

function addToCart(id, name, price) {
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    // Update total
    total += price;
    
    // Update cart display
    updateCartDisplay();
    
    // Show fun message
    showMessage(`${name} added to your order!`, 'success');
    
    // Enable confirm order button if cart has items
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    if (confirmOrderBtn && cart.length > 0) {
        confirmOrderBtn.disabled = false;
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (!cartItems) return;
    
    // Clear cart display
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
                <p>Add items from the menu above</p>
            </div>
        `;
        
        // Update totals
        if (subtotalElement) subtotalElement.textContent = 'R 0.00';
        if (totalPriceElement) totalPriceElement.textContent = 'R 0.00';
        
        return;
    }
    
    // Calculate subtotal
    let subtotal = 0;
    
    // Create cart items
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name} x${item.quantity}</h4>
                <div class="cart-item-price">R ${itemTotal.toFixed(2)}</div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
    
    // Apply discount if applicable
    let discountAmount = 0;
    if (discountApplied) {
        discountAmount = subtotal * 0.5; // 50% discount
    }
    
    const finalTotal = subtotal - discountAmount;
    
    // Update totals display
    if (subtotalElement) subtotalElement.textContent = `R ${subtotal.toFixed(2)}`;
    
    const discountAmountElement = document.getElementById('discountAmount');
    if (discountAmountElement) {
        discountAmountElement.textContent = `R -${discountAmount.toFixed(2)}`;
    }
    
    if (totalPriceElement) totalPriceElement.textContent = `R ${finalTotal.toFixed(2)}`;
}

function removeFromCart(id) {
    // Find item in cart
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        const item = cart[itemIndex];
        
        // Subtract item total from overall total
        total -= item.price * item.quantity;
        
        // Remove item from cart
        cart.splice(itemIndex, 1);
        
        // Update cart display
        updateCartDisplay();
        
        // Show message
        showMessage(`${item.name} removed from cart`, 'info');
    }
    
    // Disable confirm order button if cart is empty
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    if (confirmOrderBtn && cart.length === 0) {
        confirmOrderBtn.disabled = true;
    }
}

function confirmOrder() {
    if (cart.length === 0) {
        showMessage("Your cart is empty! Add items before confirming.", 'error');
        return;
    }
    
    // Array of random confirmation messages
    const messages = [
        `Thank you for your order, ${currentUser}!`,
        "Your food is being prepared!",
        "Order confirmed! Your meal will be ready shortly.",
        "Yay! Your McDonald's order is on its way!",
        "Thank you! Enjoy your meal!"
    ];
    
    // Select random message
    const randomIndex = Math.floor(Math.random() * messages.length);
    const confirmationMessage = messages[randomIndex];
    
    // Show confirmation message
    showMessage(confirmationMessage, 'success');
    
    // Clear the cart
    cart = [];
    total = 0;
    discountApplied = false;
    
    // Update cart display
    updateCartDisplay();
    
    // Reset discount display
    const discountAmountElement = document.getElementById('discountAmount');
    if (discountAmountElement) {
        discountAmountElement.textContent = 'R 0.00';
    }
    
    // Disable confirm order button
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    if (confirmOrderBtn) {
        confirmOrderBtn.disabled = true;
    }
    
    // Reset discount code input
    const discountCodeInput = document.getElementById('discountCode');
    if (discountCodeInput) {
        discountCodeInput.value = '';
    }
}

function applyDiscount() {
    const discountCodeInput = document.getElementById('discountCode');
    const discountCode = discountCodeInput.value.trim();
    
    if (!discountCode) {
        showMessage("Please enter a discount code", 'error');
        return;
    }
    
    // Check if discount code is valid
    if (discountCode.toUpperCase() === 'MCD50') {
        discountApplied = true;
        showMessage("Discount applied! 50% off your order!", 'success');
        updateCartDisplay();
    } else {
        showMessage("Invalid discount code. Try 'MCD50'", 'error');
    }
}

function suggestMeal() {
    // Select random meal combo
    const randomIndex = Math.floor(Math.random() * mealCombos.length);
    const randomMeal = mealCombos[randomIndex];
    
    // Update suggestion display
    const suggestionTitle = document.getElementById('suggestionTitle');
    const suggestedMealText = document.getElementById('suggestedMealText');
    
    if (suggestionTitle) {
        suggestionTitle.textContent = "Today's Special Combo";
    }
    
    if (suggestedMealText) {
        suggestedMealText.innerHTML = `<strong>${randomMeal}</strong>`;
    }
    
    // Show message
    showMessage(`Today's combo suggestion: ${randomMeal}`, 'info');
}

function highlightSpecials() {
    // Special items are already highlighted in HTML with class "special"
    // Items under R30 have the "special" class
    console.log("Special items (under R30) are highlighted in gold with a 'SPECIAL' badge");
}

function showMessage(message, type) {
    // For menu page
    const orderMessage = document.getElementById('orderMessage');
    if (orderMessage) {
        orderMessage.textContent = message;
        orderMessage.className = 'order-message';
        
        // Set color based on type
        if (type === 'success') {
            orderMessage.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
            orderMessage.style.color = '#27ae60';
            orderMessage.style.borderColor = '#2ecc71';
        } else if (type === 'error') {
            orderMessage.style.backgroundColor = 'rgba(231, 76, 60, 0.2)';
            orderMessage.style.color = '#c0392b';
            orderMessage.style.borderColor = '#e74c3c';
        } else {
            orderMessage.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
            orderMessage.style.color = '#2980b9';
            orderMessage.style.borderColor = '#3498db';
        }
        
        orderMessage.classList.add('show');
        
        // Hide message after 3 seconds
        setTimeout(() => {
            orderMessage.classList.remove('show');
        }, 3000);
    }
    
    // For login page
    const messageArea = document.getElementById('messageArea');
    if (messageArea && !orderMessage) {
        messageArea.textContent = message;
        messageArea.className = 'message-area';
        
        if (type === 'success') {
            messageArea.classList.add('success');
        } else if (type === 'error') {
            messageArea.classList.add('error');
        }
    }
    
    // Log to console for debugging
    console.log(`${type.toUpperCase()}: ${message}`);
}