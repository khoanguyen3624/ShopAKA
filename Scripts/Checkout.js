let currentStep = 1;
let checkoutItems = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutData();
    updateStepDisplay();
    updateProgressSteps();
    updateOrderSummary();
    checkEmptyCart();
});

function checkEmptyCart() {
    if (checkoutItems.length === 0) {
        // Ẩn tất cả các nút thanh toán
        const nextBtn = document.getElementById('nextStep1Btn');
        const confirmBtn = document.getElementById('confirmOrderBtn');
        
        if (nextBtn) nextBtn.style.display = 'none';
        if (confirmBtn) confirmBtn.style.display = 'none';
        
        // Hiển thị thông báo
        const step1Content = document.getElementById('step1-content');
        if (step1Content) {
            const emptyCartMsg = document.createElement('div');
            emptyCartMsg.className = 'alert alert-warning';
            emptyCartMsg.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Giỏ hàng trống! Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.';
            step1Content.querySelector('.checkout-card .card-body').prepend(emptyCartMsg);
        }
    }
}

function loadCheckoutData() {
    try {
        const checkoutData = sessionStorage.getItem('checkoutItems');
        if (checkoutData) {
            checkoutItems = JSON.parse(checkoutData);
        } else {
            checkoutItems = [];
        }
        
        if (checkoutItems.length === 0) {
            // Nếu giỏ hàng rỗng, redirect về giỏ hàng
            alert('Giỏ hàng trống!');
            window.location.href = '/Home/Cart';
            return;
        }
        
        updateOrderSummary();
    } catch (error) {
        console.error('Error loading checkout data:', error);
        checkoutItems = [];
    }
}

function nextStep(step) {
    if (step === 2) {
        if (!validateDeliveryInfo()) {
            return;
        }
    } else if (step === 3) {
        if (!validatePaymentMethod()) {
            return;
        }
        updateConfirmationStep();
    }
    
    currentStep = step;
    updateStepDisplay();
    updateProgressSteps();
}

function prevStep(step) {
    currentStep = step;
    updateStepDisplay();
    updateProgressSteps();
}

function updateStepDisplay() {
    for (let i = 1; i <= 4; i++) {
        const stepContent = document.getElementById(`step${i}-content`);
        if (stepContent) {
            if (i === currentStep) {
                stepContent.style.display = 'block';
            } else {
                stepContent.style.display = 'none';
            }
        }
    }
}

function updateProgressSteps() {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step) {
            step.classList.remove('active', 'completed');
            
            if (i < currentStep) {
                step.classList.add('completed');
            } else if (i === currentStep) {
                step.classList.add('active');
            }
        }
    }
}

function validateDeliveryInfo() {
    const customerName = document.querySelector('input[name="customerName"]');
    const customerPhone = document.querySelector('input[name="customerPhone"]');
    const customerAddress = document.querySelector('input[name="customerAddress"]');
    
    let isValid = true;
    
    if (!customerName || !customerName.value.trim()) {
        isValid = false;
        if (customerName) customerName.classList.add('is-invalid');
    } else {
        if (customerName) customerName.classList.remove('is-invalid');
    }
    
    if (!customerPhone || !customerPhone.value.trim()) {
        isValid = false;
        if (customerPhone) customerPhone.classList.add('is-invalid');
    } else {
        if (customerPhone) customerPhone.classList.remove('is-invalid');
    }
    
    if (!customerAddress || !customerAddress.value.trim()) {
        isValid = false;
        if (customerAddress) customerAddress.classList.add('is-invalid');
    } else {
        if (customerAddress) customerAddress.classList.remove('is-invalid');
    }
    
    if (!isValid) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
    }
    
    return isValid;
}

function validatePaymentMethod() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedMethod) {
        alert('Vui lòng chọn phương thức thanh toán!');
        return false;
    }
    return true;
}

function selectPaymentMethod(element) {
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('selected');
        method.querySelector('input[type="radio"]').checked = false;
    });
    
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
}

function updateOrderSummary() {
    if (checkoutItems.length === 0) return;
    
    // Cập nhật danh sách sản phẩm trong order summary (tất cả các step)
    const orderItemsContainers = [
        document.getElementById('orderSummaryItems1'),
        document.getElementById('orderSummaryItems2'),
        document.getElementById('orderSummaryItems3'),
        document.getElementById('orderSummaryItems4')
    ];
    
    orderItemsContainers.forEach(container => {
        if (container) {
            container.innerHTML = '';
            checkoutItems.forEach(item => {
                const itemElement = createOrderItemElement(item);
                container.appendChild(itemElement);
            });
        }
    });
    
    // Tính tổng tiền
    updateTotals();
}

function createOrderItemElement(item) {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
        <img src="${item.image || '/images/aka.jpg'}" alt="${item.name}" class="order-item-image">
        <div class="order-item-info">
            <h6 class="order-item-name">${item.name}</h6>
            <div class="order-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="order-item-quantity">Số lượng: ${item.quantity}</div>
    `;
    return div;
}

function updateTotals() {
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 500000 ? 0 : 50000;
    const total = subtotal + shipping;
    
    // Cập nhật tất cả các phần tử subtotal, shipping và total cho tất cả các step
    for (let i = 1; i <= 4; i++) {
        const subtotalEl = document.getElementById(`subtotal${i}`);
        const shippingEl = document.getElementById(`shipping${i}`);
        const totalEl = document.getElementById(`total${i}`);
        
        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
        if (totalEl) totalEl.textContent = formatPrice(total);
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function updateConfirmationStep() {
    // Cập nhật thông tin xác nhận
    const customerName = document.querySelector('input[name="customerName"]')?.value || '';
    const customerPhone = document.querySelector('input[name="customerPhone"]')?.value || '';
    const customerEmail = document.querySelector('input[name="customerEmail"]')?.value || '';
    const customerAddress = document.querySelector('input[name="customerAddress"]')?.value || '';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || '';
    
    // Cập nhật thông tin giao hàng trong step 3
    const infoGrid = document.querySelector('#step3-content .info-grid');
    if (infoGrid) {
        infoGrid.innerHTML = `
            <div class="info-item">
                <span class="info-label">Họ và tên:</span>
                <span class="info-value">${customerName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Số điện thoại:</span>
                <span class="info-value">${customerPhone}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">${customerEmail || 'Không có'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">${customerAddress}</span>
            </div>
        `;
    }
    
    const paymentInfo = document.getElementById('selectedPaymentMethod');
    if (paymentInfo) {
        paymentInfo.textContent = paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thẻ tín dụng/ghi nợ';
    }
    
    const step3OrderItems = document.querySelector('#step3-content .order-items');
    if (step3OrderItems) {
        step3OrderItems.innerHTML = '';
        checkoutItems.forEach(item => {
            const itemElement = createOrderItemElement(item);
            step3OrderItems.appendChild(itemElement);
        });
    }
}

function placeOrder() {
    if (!validateDeliveryInfo() || !validatePaymentMethod()) {
        return;
    }
    
    const customerName = document.querySelector('input[name="customerName"]').value;
    const customerPhone = document.querySelector('input[name="customerPhone"]').value;
    const customerEmail = document.querySelector('input[name="customerEmail"]').value || '';
    const customerAddress = document.querySelector('input[name="customerAddress"]').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const note = document.querySelector('textarea[name="note"]')?.value || '';
    
    document.getElementById('formCustomerName').value = customerName;
    document.getElementById('formCustomerPhone').value = customerPhone;
    document.getElementById('formCustomerEmail').value = customerEmail;
    document.getElementById('formCustomerAddress').value = customerAddress;
    document.getElementById('formPaymentMethod').value = paymentMethod;
    document.getElementById('formNote').value = note;
    document.getElementById('formOrderItems').value = JSON.stringify(checkoutItems);
    
    document.getElementById('checkoutForm').submit();
}

function goBack() {
    window.location.href = '/Home/Cart';
}
