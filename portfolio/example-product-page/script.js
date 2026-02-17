const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const addProductBtn = document.getElementById('addProductBtn');
const noResults = document.getElementById('noResults');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const retryBtn = document.getElementById('retryBtn');
const readmeBtn = document.getElementById('readmeBtn');
const readmeModal = document.getElementById('readmeModal');
const readmeOverlay = document.getElementById('readmeOverlay');
const closeReadmeBtn = document.getElementById('closeReadmeBtn');
const readmeBody = document.getElementById('readmeBody');

let cart = [];
let allProducts = [];
let displayedProducts = [];
let nextProductIndex = 0;

const API_BASE_URL = 'https://fakestoreapi.com';
const INITIAL_PRODUCTS_COUNT = 3;
const LIMIT_PRODUCTS_COUNT = 20;

async function fetchProducts() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/products?limit=${LIMIT_PRODUCTS_COUNT}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allProducts = data.map(transformProduct);
        displayedProducts = allProducts.slice(0, INITIAL_PRODUCTS_COUNT);
        nextProductIndex = INITIAL_PRODUCTS_COUNT;

        displayProducts(displayedProducts);
        hideLoading();

    } catch (error) {
        console.error('Error fetching products:', error);
        showError();
    }
}

function transformProduct(apiProduct) {
    return {
        id: apiProduct.id,
        title: apiProduct.title,
        description: truncateText(apiProduct.description, 100),
        price: `$${apiProduct.price.toFixed(2)}`,
        image: apiProduct.image,
        category: apiProduct.category,
        badge: getCategoryBadge()
    };
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function getCategoryBadge() {
    const badges = ['New', 'Premium', 'Trending', 'Featured', 'Sale', 'Hot'];
    const randomChance = Math.random();

    if (randomChance < 0.3) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * badges.length);
    return badges[randomIndex];
}

function displayProducts(products) {
    productGrid.innerHTML = '';

    products.forEach((product, index) => {
        const card = createProductCard(product);
        card.style.animationDelay = `${index * 100}ms`;
        productGrid.appendChild(card);
    });

    displayedProducts = products;
}

function showLoading() {
    loadingState.classList.remove('hidden');
    productGrid.style.display = 'none';
    errorState.classList.add('hidden');
    noResults.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
    productGrid.style.display = '';
}

function showError() {
    loadingState.classList.add('hidden');
    productGrid.style.display = 'none';
    errorState.classList.remove('hidden');
}

function hideError() {
    errorState.classList.add('hidden');
    productGrid.style.display = '';
}

function handleCartClick(event) {
    const button = event.target.closest('.btn-cart');
    if (!button) return;

    const card = button.closest('.product-card');
    const title = card.querySelector('.product-title').textContent;
    const price = card.querySelector('.product-price').textContent;
    const image = card.querySelector('.product-image').src;

    if (card.classList.contains('added')) {
        removeFromCart(title);
        card.classList.remove('added');
        button.textContent = 'Add to Cart';
    } else {
        addToCart({ title, price, image });
        card.classList.add('added');
        button.textContent = 'Added';
    }
}

function addToCart(product) {
    cart.push(product);
    updateCartUI();
}

function removeFromCart(productTitle) {
    const index = cart.findIndex(item => item.title === productTitle);
    if (index !== -1) {
        cart.splice(index, 1);
    }
    updateCartUI();
    updateProductCardStates();
}

function updateCartUI() {
    const count = cart.length;

    if (count > 0) {
        cartCount.textContent = count;
        cartCount.classList.remove('hidden');
        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
    } else {
        cartCount.classList.add('hidden');
        cartEmpty.style.display = 'flex';
        cartItems.style.display = 'none';
    }

    renderCartItems();
}

function renderCartItems() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price}</div>
            </div>
            <button class="cart-item-remove" data-product="${item.title}">Remove</button>
        </div>
    `).join('');

    const removeButtons = cartItems.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(btn.dataset.product);
        });
    });
}

function updateProductCardStates() {
    const cards = productGrid.querySelectorAll('.product-card');
    cards.forEach(card => {
        const title = card.querySelector('.product-title').textContent;
        const button = card.querySelector('.btn-cart');
        const isInCart = cart.some(item => item.title === title);

        if (isInCart) {
            card.classList.add('added');
            button.textContent = 'Added';
        } else {
            card.classList.remove('added');
            button.textContent = 'Add to Cart';
        }
    });
}

function openCart() {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const cards = productGrid.querySelectorAll('.product-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();

        if (title.includes(searchTerm)) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (visibleCount === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

function createProductCard(product) {
    const article = document.createElement('article');
    article.className = 'product-card';

    article.innerHTML = `
        <div class="product-image-container">
            <img 
                src="${product.image}" 
                alt="${product.title}" 
                class="product-image"
                loading="lazy"
            >
            ${product.badge ? `<span class="product-badge${product.badge === 'Featured' ? ' feature' : ''}">${product.badge}</span>` : ''}
        </div>
        <div class="product-content">
            <h2 class="product-title">${product.title}</h2>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <span class="product-price">${product.price}</span>
                <button class="btn-cart" aria-label="Add ${product.title} to cart">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    return article;
}

function addSampleProduct() {
    if (allProducts.length === 0) {
        console.warn('No products available from API');
        return;
    }

    if (nextProductIndex >= allProducts.length) {
        nextProductIndex = 0;
    }

    const product = allProducts[nextProductIndex];
    nextProductIndex++;

    const newCard = createProductCard(product);
    productGrid.appendChild(newCard);

    newCard.style.opacity = '0';
    newCard.style.transform = 'translateY(20px)';

    setTimeout(() => {
        newCard.style.transition = 'all 300ms ease-out';
        newCard.style.opacity = '1';
        newCard.style.transform = 'translateY(0)';
    }, 10);

    if (searchInput.value.trim()) {
        filterProducts();
    }

    addProductBtn.textContent = 'Added!';
    addProductBtn.style.background = 'hsl(142, 71%, 45%)';

    setTimeout(() => {
        addProductBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Sample Product
        `;
        addProductBtn.style.background = '';
    }, 1500);
}

productGrid.addEventListener('click', handleCartClick);

let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterProducts, 150);
});

addProductBtn.addEventListener('click', addSampleProduct);

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

readmeBtn.addEventListener('click', openReadme);
closeReadmeBtn.addEventListener('click', closeReadme);
readmeOverlay.addEventListener('click', closeReadme);

retryBtn.addEventListener('click', () => {
    hideError();
    fetchProducts();
});


fetchProducts();