let quantity = 1;
let productPrice = 0;
let productId = 0;

function initProductDetail(price, id) {
    productPrice = price;
    productId = id;
}

function increaseQuantity() {
    quantity++;
    updateQuantity();
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
    document.getElementById('totalPrice').textContent = new Intl.NumberFormat('vi-VN').format(totalPrice) + ' VND';
}

function addToCart() {
    try {
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
            cart[existingItemIndex].quantity += quantity;
            cart[existingItemIndex].total = cart[existingItemIndex].quantity * cart[existingItemIndex].price;
        } else {
            cart.push(cartItem);
        }
        
        sessionStorage.setItem('cart', JSON.stringify(cart));
        showNotification('Đã thêm ' + quantity + ' sản phẩm vào giỏ hàng!', 'success');
        window.location.href = '/Home/Cart';
    } catch (error) {
        showNotification('Có lỗi xảy ra khi thêm vào giỏ hàng!', 'error');
    }
}

function buyNow() {
    try {
        const checkoutItem = {
            id: productId,
            name: document.querySelector('[data-product-name]')?.textContent || 'Sản phẩm',
            price: productPrice,
            quantity: quantity,
            image: document.querySelector('[data-product-image]')?.src || '/images/aka.jpg',
            total: productPrice * quantity
        };
        
        sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
        showNotification('Chuyển đến trang thanh toán...', 'info');
        window.location.href = '/Home/Checkout';
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
    
    if (priceElement && idElement) {
        initProductDetail(
            parseInt(priceElement.textContent.replace(/[^\d]/g, '')),
            parseInt(idElement.textContent)
        );
    }
});