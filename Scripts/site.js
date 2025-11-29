document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initSmoothScrolling();
    initNavbarScroll();
    initScrollAnimations();
    initSearchFunctionality();
    initProductInteractions();
    initContactForm();
    initMobileMenu();
    loadInitialProducts();
}

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                updateActiveNavLink(this);
            }
        });
    });
}

function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    activeLink.classList.add('active');
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .about-text, .contact-form');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelector('.hero-buttons');
    
    if (heroTitle) {
        heroTitle.classList.add('slide-in-left');
        observer.observe(heroTitle);
    }
    
    if (heroSubtitle) {
        heroSubtitle.classList.add('slide-in-left');
        observer.observe(heroSubtitle);
    }
    
    if (heroButtons) {
        heroButtons.classList.add('slide-in-left');
        observer.observe(heroButtons);
    }
}

function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value);
            }
        });
    }
}

function performSearch(query) {
    if (query.trim()) {
        // Redirect to search page with query parameter
        window.location.href = '/Home/Search?query=' + encodeURIComponent(query.trim());
    }
}

function showSearchResults(query) {
    // This function is no longer needed, but kept for compatibility
}

function initProductInteractions() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            const productIdElement = card.querySelector('[data-product-id]');
            if (productIdElement) {
                const productId = productIdElement.getAttribute('data-product-id');
                window.location.href = `/Home/ProductDetail/${productId}`;
            }
        });
    });
}

function addToCart(productId, stayOnPage = false) {
    if (!window.isUserLoggedIn) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
        loginModal.show();
        return;
    }
    
    if (typeof productId === 'number') {
        const productElement = document.querySelector(`[data-product-id="${productId}"]`);
        let productName = 'Sản phẩm';
        let productPrice = 0;
        let productImage = '/images/aka.jpg';
        let stock = 999;
        
        if (productElement) {
            productName = productElement.getAttribute('data-product-name') || 
                         productElement.querySelector('[data-product-name]')?.textContent?.trim() || 
                         productElement.querySelector('.product-name')?.textContent?.trim() || 
                         'Sản phẩm';
            
            const priceAttr = productElement.getAttribute('data-product-price');
            if (priceAttr) {
                productPrice = parseInt(priceAttr) || 0;
            } else {
                const priceElement = productElement.querySelector('[data-product-price]');
                if (priceElement) {
                    const priceText = priceElement.textContent.replace(/[^\d]/g, '');
                    productPrice = parseInt(priceText) || 0;
                }
            }
            
            const imageElement = productElement.querySelector('[data-product-image]') || productElement.querySelector('img');
            if (imageElement) {
                productImage = imageElement.getAttribute('data-product-image') || 
                              imageElement.src || 
                              imageElement.getAttribute('src') || 
                              '/images/aka.jpg';
            }
            
            const stockAttr = productElement.getAttribute('data-product-stock');
            if (stockAttr) {
                stock = parseInt(stockAttr) || 999;
            } else {
                const stockElement = productElement.querySelector('[data-product-stock]');
                if (stockElement) {
                    stock = parseInt(stockElement.getAttribute('data-product-stock') || stockElement.textContent.replace(/[^\d]/g, '')) || 999;
                }
            }
        }
        
        const cartItem = {
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1,
            image: productImage,
            stock: stock,
            total: productPrice
        };
        
        let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            const newQuantity = cart[existingItemIndex].quantity + 1;
            if (newQuantity > stock) {
                if (typeof showNotification === 'function') {
                    showNotification(`Số lượng không được vượt quá ${stock} sản phẩm!`, 'error');
                } else {
                    alert(`Số lượng không được vượt quá ${stock} sản phẩm!`);
                }
                return;
            }
            cart[existingItemIndex].quantity = newQuantity;
            cart[existingItemIndex].total = cart[existingItemIndex].price * newQuantity;
        } else {
            cart.push(cartItem);
        }
        
        sessionStorage.setItem('cart', JSON.stringify(cart));
        
        let stockData = JSON.parse(sessionStorage.getItem('productStock') || '{}');
        stockData[productId] = stock;
        sessionStorage.setItem('productStock', JSON.stringify(stockData));
        
        if (stayOnPage) {
            if (typeof showNotification === 'function') {
                showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
            } else {
                alert('Đã thêm sản phẩm vào giỏ hàng!');
            }
            updateCartCount();
        } else {
            window.location.href = '/Home/Cart';
        }
    } else if (productId && productId.getAttribute) {
        const id = productId.getAttribute('data-product-id') || productId.closest('[data-product-id]')?.getAttribute('data-product-id');
        if (id) {
            addToCart(parseInt(id), stayOnPage);
        } else {
            window.location.href = '/Home/Cart';
        }
    } else {
    window.location.href = '/Home/Cart';
    }
}

function buyNow(productId) {
    if (!window.isUserLoggedIn) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
        loginModal.show();
        return;
    }
    
    if (typeof productId === 'number') {
        // Tìm phần tử sản phẩm dựa trên productId
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        
        if (productCard) {
            const productName = productCard.getAttribute('data-product-name') || 
                               productCard.querySelector('[data-product-name]')?.textContent?.trim() || 
                               'Sản phẩm';
            const productPrice = parseFloat(productCard.getAttribute('data-product-price')) || 0;
            const productStock = parseInt(productCard.getAttribute('data-product-stock')) || 0;
            
            const productImage = productCard.querySelector('[data-product-image]')?.getAttribute('data-product-image') ||
                                productCard.querySelector('img')?.src ||
                                '/images/aka.jpg';
            
            const checkoutItem = {
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1,
                image: productImage,
                stock: productStock,
                total: productPrice
            };
            
            sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
            
            let stockData = JSON.parse(sessionStorage.getItem('productStock') || '{}');
            stockData[productId] = productStock;
            sessionStorage.setItem('productStock', JSON.stringify(stockData));
            
            window.location.href = '/Home/Checkout';
        } else {
            const checkoutItem = {
                id: productId,
                name: 'Sản phẩm',
                price: 0,
                quantity: 1,
                image: '/images/aka.jpg',
                stock: 0,
                total: 0
            };
            sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
            window.location.href = '/Home/Checkout';
        }
    } else if (productId && productId.getAttribute) {
        const id = productId.getAttribute('data-product-id') || productId.closest('[data-product-id]')?.getAttribute('data-product-id');
        if (id) {
            buyNow(parseInt(id));
        } else {
            window.location.href = '/Home/Checkout';
        }
    } else {
        window.location.href = '/Home/Checkout';
    }
}

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        const offsetTop = productsSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}



function updateCartCount() {
    try {
        const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const cartBadge = document.getElementById('cartBadge');
        
    if (cartBadge) {
            if (totalQuantity > 0) {
                cartBadge.textContent = totalQuantity;
                cartBadge.style.display = 'block';
        cartBadge.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            cartBadge.style.animation = '';
        }, 500);
            } else {
                cartBadge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Load cart count when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

function initContactForm() {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmit(this);
        });
    }
}

function handleContactFormSubmit(form) {
    const formData = new FormData(form);
    const formObject = {};
    
    for (let [key, value] of formData.entries()) {
        formObject[key] = value;
    }
    
    if (validateContactForm(formObject)) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="loading"></span> Đang gửi...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            showNotification('Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.', 'success');
            form.reset();
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 2000);
    }
}

function validateContactForm(data) {
    const requiredFields = ['name', 'email', 'message'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.querySelector(`input[name="${field}"], textarea[name="${field}"]`);
        if (input && !input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else if (input) {
            input.classList.remove('is-invalid');
        }
    });
    
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        }
    }
    
    return isValid;
}

function initMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    navbarCollapse.classList.remove('show');
                }
            });
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

let productData = {};

async function loadProductData() {
    try {
        const response = await fetch('/App_Data/products.json');
        const data = await response.json();
        
        productData = {
            iphone: data.products.filter(p => p.category === 'iPhone'),
            mouse: data.products.filter(p => p.category === 'mouse'),
            laptop: data.products.filter(p => p.category === 'laptop')
        };
        
    } catch (error) {
        productData = {
            iphone: [
                { id: 1, name: 'iPhone 15 Pro Max', price: 32990000, rating: 4.9, image: '/images/Iphone/iphone16promax.jpg', description: 'iPhone 15 Pro Max 256GB Titanium' },
                { id: 2, name: 'iPhone 15 Pro', price: 28990000, rating: 4.8, image: '/images/Iphone/iphone16.jpg', description: 'iPhone 15 Pro 128GB Titanium' },
                { id: 3, name: 'iPhone 15', price: 22990000, rating: 4.7, image: '/images/Iphone/iphone15.jpg', description: 'iPhone 15 128GB' },
                { id: 4, name: 'iPhone 14 Pro', price: 24990000, rating: 4.6, image: '/images/Iphone/iphone14promax.jpg', description: 'iPhone 14 Pro 128GB' },
                { id: 5, name: 'iPhone 15 Plus', price: 25990000, rating: 4.5, image: '/images/Iphone/iphone15promax.jpg', description: 'iPhone 15 Plus 128GB' },
                { id: 6, name: 'iPhone 14', price: 19990000, rating: 4.4, image: '/images/Iphone/iphone14.jpg', description: 'iPhone 14 128GB' },
                { id: 7, name: 'iPhone 13 Pro Max', price: 21990000, rating: 4.3, image: '/images/Iphone/iphonesxmax.jpg', description: 'iPhone 13 Pro Max 128GB' },
                { id: 8, name: 'iPhone 13', price: 17990000, rating: 4.2, image: '/images/Iphone/iphone11.jpg', description: 'iPhone 13 128GB' },
                { id: 9, name: 'iPhone 12 Pro', price: 19990000, rating: 4.1, image: '/images/Iphone/iphonex.jpg', description: 'iPhone 12 Pro 128GB' },
                { id: 10, name: 'iPhone SE 3', price: 12990000, rating: 4.0, image: '/images/Iphone/iphone14pro.jpg', description: 'iPhone SE 3 64GB' }
            ],
            mouse: [
                { id: 11, name: 'Logitech MX Master 3S', price: 2490000, rating: 4.9, image: '/images/ChuotMayTinh/Logitech MX Master 3S.jpg', description: 'Chuột không dây cao cấp' },
                { id: 12, name: 'Razer DeathAdder V3', price: 1890000, rating: 4.8, image: '/images/ChuotMayTinh/Razer DeathAdder V3.jpg', description: 'Chuột gaming chuyên nghiệp' },
                { id: 13, name: 'Apple Magic Mouse 2', price: 2190000, rating: 4.7, image: '/images/ChuotMayTinh/Apple Magic Mouse 2.jpg', description: 'Chuột Apple Magic Mouse 2' },
                { id: 14, name: 'Corsair Dark Core RGB Pro', price: 1590000, rating: 4.6, image: '/images/ChuotMayTinh/Corsair Dark Core RGB Pro.jpg', description: 'Chuột gaming RGB' },
                { id: 15, name: 'Logitech G Pro X Superlight', price: 2290000, rating: 4.5, image: '/images/ChuotMayTinh/Logitech G Pro X Superlight.jpg', description: 'Chuột gaming siêu nhẹ' },
                { id: 16, name: 'SteelSeries Rival 650', price: 1790000, rating: 4.4, image: '/images/ChuotMayTinh/SteelSeries Rival 650.jpg', description: 'Chuột gaming không dây' },
                { id: 17, name: 'Microsoft Surface Precision', price: 1990000, rating: 4.3, image: '/images/ChuotMayTinh/Microsoft Surface Precision.jpg', description: 'Chuột Microsoft Surface' },
                { id: 18, name: 'ASUS ROG Gladius III', price: 1390000, rating: 4.2, image: '/images/ChuotMayTinh/ASUS ROG Gladius III.jpg', description: 'Chuột gaming ASUS ROG' },
                { id: 19, name: 'HyperX Pulsefire Haste', price: 890000, rating: 4.1, image: '/images/ChuotMayTinh/HyperX Pulsefire Haste.jpg', description: 'Chuột gaming giá rẻ' },
                { id: 20, name: 'Zowie EC2-C', price: 1190000, rating: 4.0, image: '/images/ChuotMayTinh/Zowie EC2-C.jpg', description: 'Chuột gaming Zowie' }
            ],
            laptop: [
                { id: 21, name: 'MacBook Pro 16" M3 Max', price: 89990000, rating: 4.9, image: '/images/LapTop/macbook16por.jpg', description: 'MacBook Pro 16 inch M3 Max' },
                { id: 22, name: 'Dell XPS 15', price: 45990000, rating: 4.8, image: '/images/LapTop/DellXPS15.jpg', description: 'Dell XPS 15 9530' },
                { id: 23, name: 'ASUS ROG Strix G15', price: 32990000, rating: 4.7, image: '/images/LapTop/ASUSROGStrixG15.jpg', description: 'Laptop gaming ASUS ROG' },
                { id: 24, name: 'HP Spectre x360', price: 38990000, rating: 4.6, image: '/images/LapTop/HPSpectre.jpg', description: 'Laptop 2-in-1 HP Spectre' },
                { id: 25, name: 'Lenovo ThinkPad X1 Carbon', price: 42990000, rating: 4.5, image: '/images/LapTop/LenovoThinkPadCarbon.jpg', description: 'Laptop doanh nhân Lenovo' },
                { id: 26, name: 'MSI GE76 Raider', price: 55990000, rating: 4.4, image: '/images/LapTop/MSIGE76Raider.jpg', description: 'Laptop gaming MSI' },
                { id: 27, name: 'MacBook Air M3', price: 32990000, rating: 4.3, image: '/images/LapTop/MacBookAijeg.jpg', description: 'MacBook Air 13 inch M3' },
                { id: 28, name: 'Acer Predator Helios 300', price: 27990000, rating: 4.2, image: '/images/LapTop/AcerHelios300.jpg', description: 'Laptop gaming Acer' },
                { id: 29, name: 'Surface Laptop 5', price: 35990000, rating: 4.1, image: '/images/LapTop/SurfaceLaptop5.jpg', description: 'Microsoft Surface Laptop 5' },
                { id: 30, name: 'ASUS ZenBook 14', price: 22990000, rating: 4.0, image: '/images/LapTop/ASUSZenBook14.jpg', description: 'Laptop văn phòng ASUS' }
            ]
        };
    }
}

const productState = {
    iphone: { loaded: 0, total: 4, expanded: false },
    mouse: { loaded: 0, total: 4, expanded: false },
    laptop: { loaded: 0, total: 4, expanded: false }
};

async function loadInitialProducts() {
    await loadProductData();
    loadInitialProductsForCategory('iphone');
    loadInitialProductsForCategory('mouse');
    loadInitialProductsForCategory('laptop');
}

function loadInitialProductsForCategory(category) {
    const container = document.getElementById(`${category}-products`);
    if (!container) return;
    
    container.innerHTML = '';
    
    const products = productData[category].slice(0, 4);
    products.forEach(product => {
        container.appendChild(createProductCard(product));
    });
    
    productState[category].loaded = 4;
    productState[category].expanded = false;
    
}

function toggleProducts(category) {
    const button = document.getElementById(`${category}-toggle-btn`);
    const loadMoreText = button.querySelector('.load-more-text');
    const loading = button.querySelector('.loading');
    
    if (!productState[category].expanded) {
        loadMoreText.classList.add('d-none');
        loading.classList.remove('d-none');
        button.disabled = true;
                
        setTimeout(() => {
            const container = document.getElementById(`${category}-products`);
            const currentLoaded = productState[category].loaded;
            const nextProducts = productData[category].slice(currentLoaded, currentLoaded + 6);
            
            nextProducts.forEach((product, index) => {
                setTimeout(() => {
                    const productCard = createProductCard(product);
                    productCard.classList.add('fade-in');
                    container.appendChild(productCard);
                    
                    setTimeout(() => {
                        productCard.classList.add('visible');
                    }, 100);
                }, index * 100);
            });
            
            productState[category].loaded += 6;
            productState[category].expanded = true;
            
            setTimeout(() => {
                loadMoreText.textContent = `Thu Gọn`;
                loadMoreText.classList.remove('d-none');
                loading.classList.add('d-none');
                button.disabled = false;
                button.style.display = 'block';
                button.classList.add('collapse-mode');
            }, 500);
        }, 1500);
    } else {
        const container = document.getElementById(`${category}-products`);
        const allProducts = container.querySelectorAll('.col-lg-3');
        
        allProducts.forEach((product, index) => {
            if (index >= 4) {
                setTimeout(() => {
                    product.style.transition = 'all 0.3s ease-out';
                    product.style.transform = 'scale(0.8)';
                    product.style.opacity = '0';
                    setTimeout(() => {
                        product.remove();
                    }, 300);
                }, index * 50);
            }
        });
        
        setTimeout(() => {
            productState[category].loaded = 4;
            productState[category].expanded = false;
            loadMoreText.textContent = `Xem Thêm ${getCategoryName(category)}`;
            button.style.display = 'block';
            button.disabled = false;
            button.classList.remove('collapse-mode');
        }, allProducts.length * 50 + 500);
    }
}

function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-6 mb-4';
    
    const stars = generateStars(product.rating);
    
    
    col.innerHTML = `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" class="img-fluid" onerror="this.src='images/aka.jpg'">
                <div class="product-overlay">
                    <div class="overlay-buttons">
                        <a href="/Home/ProductDetail/${product.id}" class="btn btn-outline-light btn-sm mb-2">
                            <i class="fas fa-eye me-1"></i>Xem chi tiết
                        </a>
                        <button class="btn btn-primary btn-sm" onclick="addToCart(this.closest('.product-card'))">
                            <i class="fas fa-shopping-cart me-1"></i>Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
            <div class="product-info">
                <div class="product-rating">
                    ${stars}
                    <span class="rating-text">(${product.rating})</span>
                </div>
                <h5 class="product-title">${product.name}</h5>
                <p class="product-price">${formatCurrency(product.price)}</p>
            </div>
        </div>
    `;
    
    return col;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

function getCategoryName(category) {
    const names = {
        iphone: 'iPhone',
        mouse: 'Chuột',
        laptop: 'Laptop'
    };
    return names[category] || category;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function viewProductDetails(productId) {
}

window.ShopAKA = {
    addToCart,
    showNotification,
    formatCurrency,
    scrollToProducts
};