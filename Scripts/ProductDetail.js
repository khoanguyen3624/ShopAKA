let quantity = 1;
let productPrice = 0;
let productId = 0;
let maxStock = 999;

function initProductDetail(price, id, stock) {
    productPrice = price;
    productId = id;
    if (stock !== undefined && stock !== null) {
        maxStock = parseInt(stock);
    }
}

function increaseQuantity() {
    if (quantity < maxStock) {
        quantity++;
        updateQuantity();
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Số lượng không được vượt quá số lượng tồn kho!', 'error');
        } else {
            alert('Số lượng không được vượt quá số lượng tồn kho!');
        }
    }
}

function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
        updateQuantity();
    }
}

function updateQuantity() {
    document.getElementById('quantity').textContent = quantity;
    const totalPrice = productPrice * quantity;
    document.getElementById('totalPrice').textContent = new Intl.NumberFormat('vi-VN').format(totalPrice) + '₫';
}

function addToCart() {
    if (!window.isUserLoggedIn) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
        loginModal.show();
        return;
    }
    
    try {
        if (quantity > maxStock) {
            showNotification('Số lượng không được vượt quá số lượng tồn kho!', 'error');
            return;
        }
        
        if (quantity <= 0) {
            showNotification('Số lượng phải lớn hơn 0!', 'error');
            return;
        }
        
        const cartItem = {
            id: productId,
            name: document.querySelector('[data-product-name]')?.textContent || 'Sản phẩm',
            price: productPrice,
            quantity: quantity,
            image: document.querySelector('[data-product-image]')?.src || '/images/aka.jpg',
            total: productPrice * quantity
        };
        
        let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            const newQuantity = cart[existingItemIndex].quantity + quantity;
            if (newQuantity > maxStock) {
                showNotification('Tổng số lượng trong giỏ hàng không được vượt quá số lượng tồn kho!', 'error');
                return;
            }
            cart[existingItemIndex].quantity = newQuantity;
            cart[existingItemIndex].total = cart[existingItemIndex].quantity * cart[existingItemIndex].price;
        } else {
            cart.push(cartItem);
        }
        
        sessionStorage.setItem('cart', JSON.stringify(cart));
        
        let stockData = JSON.parse(sessionStorage.getItem('productStock') || '{}');
        stockData[productId] = maxStock;
        sessionStorage.setItem('productStock', JSON.stringify(stockData));
        
        showNotification('Đã thêm ' + quantity + ' sản phẩm vào giỏ hàng!', 'success');
        
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        
        setTimeout(function() {
            window.location.href = '/Home/Cart';
        }, 1000);
    } catch (error) {
        showNotification('Có lỗi xảy ra khi thêm vào giỏ hàng!', 'error');
    }
}

function buyNow() {
    if (!window.isUserLoggedIn) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
        loginModal.show();
        return;
    }
    
    try {
        if (quantity > maxStock) {
            showNotification('Số lượng không được vượt quá số lượng tồn kho!', 'error');
            return;
        }
        
        if (quantity <= 0) {
            showNotification('Số lượng phải lớn hơn 0!', 'error');
            return;
        }
        
        const checkoutItem = {
            id: productId,
            name: document.querySelector('[data-product-name]')?.textContent || 'Sản phẩm',
            price: productPrice,
            quantity: quantity,
            image: document.querySelector('[data-product-image]')?.src || '/images/aka.jpg',
            total: productPrice * quantity
        };
        
        sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
        
        let stockData = JSON.parse(sessionStorage.getItem('productStock') || '{}');
        stockData[productId] = maxStock;
        sessionStorage.setItem('productStock', JSON.stringify(stockData));
        
        showNotification('Chuyển đến trang thanh toán...', 'info');
        
        setTimeout(function() {
            window.location.href = '/Home/Checkout';
        }, 500);
    } catch (error) {
        showNotification('Có lỗi xảy ra khi chuyển đến thanh toán!', 'error');
    }
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

document.addEventListener('DOMContentLoaded', function() {
    const priceElement = document.querySelector('[data-product-price]');
    const idElement = document.querySelector('[data-product-id]');
    const stockElement = document.querySelector('[data-product-stock]');
    
    if (priceElement && idElement) {
        const priceText = priceElement.textContent.replace(/[^\d]/g, '');
        const productId = parseInt(idElement.getAttribute('data-product-id') || idElement.textContent);
        const stock = stockElement ? parseInt(stockElement.getAttribute('data-product-stock') || stockElement.textContent.replace(/[^\d]/g, '')) : 999;
        
        if (priceText && productId) {
            initProductDetail(parseInt(priceText), productId, stock);
        }
    }
});