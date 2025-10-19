let cartItems = [
    { id: 1, name: 'iPhone 15 Pro Max 256GB', price: 29990000, oldPrice: 32990000, quantity: 1, inStock: true },
    { id: 2, name: 'Logitech MX Master 3S', price: 2490000, oldPrice: 2990000, quantity: 2, inStock: true },
    { id: 3, name: 'MacBook Pro 14" M3 Pro', price: 45990000, oldPrice: null, quantity: 1, inStock: false }
];

let savedItems = [
    { id: 4, name: 'AirPods Pro 2nd Gen', price: 5490000, oldPrice: 6490000, quantity: 1 }
];

function updateQuantity(itemId, change) {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.inStock) {
        item.quantity = Math.max(1, item.quantity + change);
        updateQuantityDisplay(itemId);
        updateTotals();
    }
}

function updateQuantityDisplay(itemId) {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
        document.getElementById(`qty-${itemId}`).textContent = item.quantity;
        document.getElementById(`total-${itemId}`).textContent = formatPrice(item.price * item.quantity);
    }
}

function removeItem(itemId) {
    const itemElement = event.target.closest('.row');
    itemElement.classList.add('slide-out');
    
    setTimeout(() => {
        cartItems = cartItems.filter(item => item.id !== itemId);
        updateCartDisplay();
    }, 300);
}

function saveForLater(itemId) {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
        savedItems.push(item);
        cartItems = cartItems.filter(cartItem => cartItem.id !== itemId);
        updateCartDisplay();
    }
}

function addToCart(itemId) {
    const item = savedItems.find(item => item.id === itemId);
    if (item) {
        cartItems.push(item);
        savedItems = savedItems.filter(savedItem => savedItem.id !== itemId);
        updateCartDisplay();
    }
}

function removeSaved(itemId) {
    savedItems = savedItems.filter(item => item.id !== itemId);
    updateCartDisplay();
}

function updateCartDisplay() {
    if (cartItems.length === 0) {
        document.getElementById('cartContent').style.display = 'none';
        document.getElementById('emptyCart').style.display = 'block';
    } else {
        document.getElementById('cartContent').style.display = 'block';
        document.getElementById('emptyCart').style.display = 'none';
        updateTotals();
    }
}

function updateTotals() {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = cartItems.reduce((total, item) => {
        return total + (item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0);
    }, 0);
    const shipping = subtotal >= 500000 ? 0 : 50000;
    const total = subtotal - discount + shipping;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('discount').textContent = '-' + formatPrice(discount);
    document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    document.getElementById('total').textContent = formatPrice(total);
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

function proceedToCheckout() {
    window.location.href = '/Home/Checkout';
}

function continueShopping() {
    window.location.href = '/Home/Index';
}

document.addEventListener('DOMContentLoaded', function() {
    updateTotals();
});
