let cartItems = [];
let productStockData = {}; // Lưu thông tin số lượng tồn kho của sản phẩm

// Load cart từ sessionStorage
function loadCartFromStorage() {
    try {
        const cartData = sessionStorage.getItem('cart');
        if (cartData) {
            cartItems = JSON.parse(cartData);
            // Load stock data nếu có
            const stockData = sessionStorage.getItem('productStock');
            if (stockData) {
                productStockData = JSON.parse(stockData);
            }
        } else {
            cartItems = [];
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        cartItems = [];
    }
}

// Save cart vào sessionStorage
function saveCartToStorage() {
    try {
        sessionStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartBadge();
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Update cart badge trong header
function updateCartBadge() {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        if (totalQuantity > 0) {
            badge.textContent = totalQuantity;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    updateCartDisplay();
    updateCartBadge();
});

function updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartItems.length === 0) {
        if (cartContent) cartContent.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }
    
    if (cartContent) cartContent.style.display = 'block';
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartItemCount = document.getElementById('cartItemCount');
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        cartItems.forEach(item => {
            const itemElement = createCartItemElement(item);
            cartItemsContainer.appendChild(itemElement);
        });
    }
    
    if (cartItemCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCount.textContent = `(${totalItems} sản phẩm)`;
    }
    
    updateTotals();
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.setAttribute('data-product-id', item.id);
    
    const maxStock = productStockData[item.id] || item.stock || 999;
    const inStock = maxStock > 0;
    const canIncrease = item.quantity < maxStock;
    
    div.innerHTML = `
        <div class="item-checkbox">
            <input type="checkbox" class="form-check-input" checked>
        </div>
        <div class="item-image">
            <img src="${item.image || '/images/aka.jpg'}" alt="${item.name}" class="product-image">
        </div>
        <div class="item-details">
            <h5 class="item-name">${item.name}</h5>
            <div class="item-price">
                <span class="current-price">${formatPrice(item.price)}</span>
            </div>
            ${!inStock ? '<span class="badge out-of-stock">Hết hàng</span>' : ''}
            ${inStock && maxStock < 10 ? `<p style="color: #dc3545; font-size: 12px; margin: 4px 0 0 0;">Còn lại: ${maxStock} sản phẩm</p>` : ''}
        </div>
        <div class="item-quantity">
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" ${!inStock || item.quantity <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display" id="qty-${item.id}">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)" ${!inStock || !canIncrease ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        <div class="item-total">
            <span class="total-price" id="total-${item.id}">${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="item-actions">
            <button class="action-btn remove" onclick="removeItem(${item.id})" title="Xóa khỏi giỏ hàng">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function updateQuantity(itemId, change) {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    const maxStock = productStockData[item.id] || item.stock || 999;
    const inStock = maxStock > 0;
    
    if (!inStock) {
        showNotification('Sản phẩm đã hết hàng!', 'error');
        return;
    }
    
    const newQuantity = item.quantity + change;
    
    // Kiểm tra số lượng không được < 1
    if (newQuantity < 1) {
        showNotification('Số lượng phải lớn hơn 0!', 'error');
        return;
    }
    
    // Kiểm tra số lượng không được > số lượng tồn
    if (newQuantity > maxStock) {
        showNotification(`Số lượng không được vượt quá ${maxStock} sản phẩm!`, 'error');
        return;
    }
    
    item.quantity = newQuantity;
    item.total = item.price * item.quantity;
    
    saveCartToStorage();
    updateQuantityDisplay(itemId);
    updateTotals();
    updateCartDisplay();
}

function updateQuantityDisplay(itemId) {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
        const qtyElement = document.getElementById(`qty-${itemId}`);
        const totalElement = document.getElementById(`total-${itemId}`);
        if (qtyElement) qtyElement.textContent = item.quantity;
        if (totalElement) totalElement.textContent = formatPrice(item.price * item.quantity);
    }
}

function removeItem(itemId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        const itemElement = document.querySelector(`[data-product-id="${itemId}"]`);
        if (itemElement) {
            itemElement.classList.add('slide-out');
        }
        
        setTimeout(() => {
            cartItems = cartItems.filter(item => item.id !== itemId);
            saveCartToStorage();
            updateCartDisplay();
            showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
        }, 300);
    }
}

function updateTotals() {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 500000 ? 0 : 50000;
    const total = subtotal + shipping;

    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const discountElement = document.getElementById('discount');
    
    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }
    if (discountElement) {
        discountElement.textContent = '0₫';
    }
    if (shippingElement) {
        shippingElement.textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    }
    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function proceedToCheckout() {
    if (cartItems.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    // Lưu cart vào checkoutItems để trang checkout có thể sử dụng
    sessionStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    window.location.href = '/Home/Checkout';
}

function continueShopping() {
    window.location.href = '/Home/Index';
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl transform transition-all duration-500 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} text-xl"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }, 3000);
}

// Export function để các file khác có thể gọi
if (typeof window !== 'undefined') {
    window.updateCartBadge = updateCartBadge;
}
