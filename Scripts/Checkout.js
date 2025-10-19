let currentStep = 1;

document.addEventListener('DOMContentLoaded', function() {
    updateStepDisplay();
    updateTotals();
});
function nextStep(step) {
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

function validateCurrentStep() {
    return true;
}

function validateDeliveryInfo() {
    const requiredFields = [
        'input[type="text"]',
        'input[type="tel"]',
        'select'
    ];
    
    let isValid = true;
    let errorMessages = [];
    
    requiredFields.forEach(selector => {
        const fields = document.querySelectorAll(selector);
        fields.forEach(field => {
            if (field.hasAttribute('required')) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    
                    if (field.tagName === 'SELECT') {
                        const label = field.previousElementSibling;
                        if (label && label.textContent) {
                            errorMessages.push(label.textContent.replace('*', '').trim());
                        }
                    }
                } else {
                    field.classList.remove('is-invalid');
                }
            }
        });
    });
    
    if (!isValid) {
        if (errorMessages.length > 0) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc:\n- ' + errorMessages.join('\n- '));
        } else {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        }
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

function updateTotals() {
    const subtotal = 19970000;
    const shipping = 0;
    const total = subtotal + shipping;
    
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.querySelector('.total');
    
    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }
    
    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateCurrentStep()) {
                if (currentStep < 4) {
                    nextStep(currentStep + 1);
                } else {
                    alert('Đơn hàng đã được đặt thành công!');
                }
            }
        });
    });
});

function goBack() {
    window.location.href = '/Home/Cart';
}

function placeOrder() {
    nextStep(4);
}