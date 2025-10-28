
let cartItems = [
    { id: 1, name: 'iPhone 15 Pro Max 256GB', price: 29990000, oldPrice: 32990000, quantity: 1, inStock: true, image: '/images/Iphone/iphone16promax.jpg' },
    { id: 2, name: 'Logitech MX Master 3S', price: 2490000, oldPrice: 2990000, quantity: 2, inStock: true, image: '/images/ChuotMayTinh/Logitech MX Master 3S.jpg' },
    { id: 3, name: 'MacBook Pro 14" M3 Pro', price: 45990000, oldPrice: null, quantity: 1, inStock: false, image: '/images/LapTop/macbook16por.jpg' }
];

let savedItems = [
    { id: 4, name: 'AirPods Pro 2nd Gen', price: 5490000, oldPrice: 6490000, quantity: 1, image: '/images/Iphone/iphone16promax.jpg' }
];

document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
});

function updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cartItems.length === 0) {
        cartContent.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }
    
    cartContent.style.display = 'block';
    emptyCart.style.display = 'none';
    
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        cartItems.forEach(item => {
            const itemElement = createCartItemElement(item);
            cartItemsContainer.appendChild(itemElement);
        });
    }
    
    const savedItemsContainer = document.querySelector('.saved-items');
    if (savedItemsContainer) {
        savedItemsContainer.innerHTML = '';
        savedItems.forEach(item => {
            const itemElement = createSavedItemElement(item);
            savedItemsContainer.appendChild(itemElement);
        });
    }
    
    updateTotals();
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
        <div class="item-checkbox">
            <input type="checkbox" class="form-check-input" checked>
        </div>
        <div class="item-image">
            <img src="${item.image || '/images/aka.jpg'}" alt="${item.name}" class="product-image">
        </div>
        <div class="item-details">
            <h5 class="item-name">${item.name}</h5>
            <p class="item-specs">Màu: Titan Xanh | Dung lượng: 256GB</p>
            <div class="item-price">
                <span class="current-price">${formatPrice(item.price)}</span>
                ${item.oldPrice ? `<span class="old-price">${formatPrice(item.oldPrice)}</span>` : ''}
            </div>
            ${!item.inStock ? '<span class="badge out-of-stock">Hết hàng</span>' : ''}
        </div>
        <div class="item-quantity">
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" ${!item.inStock ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display" id="qty-${item.id}">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)" ${!item.inStock ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        <div class="item-total">
            <span class="total-price" id="total-${item.id}">${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="item-actions">
            <button class="action-btn save" onclick="saveForLater(${item.id})" title="Lưu để mua sau">
                <i class="fas fa-heart"></i>
            </button>
            <button class="action-btn remove" onclick="removeItem(${item.id})" title="Xóa khỏi giỏ hàng">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function createSavedItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
        <div class="item-image">
            <img src="${item.image || '/images/aka.jpg'}" alt="${item.name}" class="product-image">
        </div>
        <div class="item-details">
            <h5 class="item-name">${item.name}</h5>
            <p class="item-specs">Màu: Trắng | Kết nối: Lightning</p>
            <div class="item-price">
                <span class="current-price">${formatPrice(item.price)}</span>
                ${item.oldPrice ? `<span class="old-price">${formatPrice(item.oldPrice)}</span>` : ''}
            </div>
        </div>
        <div class="item-quantity">
            <span class="quantity-text">x${item.quantity}</span>
        </div>
        <div class="item-total">
            <span class="total-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="item-actions">
            <button class="btn-add-to-cart" onclick="addToCart(${item.id})">
                <i class="fas fa-shopping-cart me-1"></i>
                Thêm vào giỏ
            </button>
            <button class="action-btn remove" onclick="removeSaved(${item.id})" title="Xóa khỏi danh sách">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

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
    const itemElement = event.target.closest('.cart-item');
    if (itemElement) {
        itemElement.classList.add('slide-out');
    }
    
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

function updateTotals() {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = cartItems.reduce((total, item) => {
        return total + (item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0);
    }, 0);
    const shipping = subtotal >= 500000 ? 0 : 50000;
    const total = subtotal - discount + shipping;

    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = formatPrice(subtotal);
    }
    if (document.getElementById('discount')) {
        document.getElementById('discount').textContent = '-' + formatPrice(discount);
    }
    if (document.getElementById('shipping')) {
        document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    }
    if (document.getElementById('total')) {
        document.getElementById('total').textContent = formatPrice(total);
    }
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

