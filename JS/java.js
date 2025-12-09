// Cart functions using sessionStorage
function getCart() {
    const cart = sessionStorage.getItem('shoppingCart');
    console.log("[Cart] Retrieved cart:", cart ? JSON.parse(cart) : []);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    sessionStorage.setItem('shoppingCart', JSON.stringify(cart));
    console.log("[Cart] Saved cart:", cart);
}

function addToCart(product) {
    let cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
        console.log(`[addToCart] Increased quantity for ${product.name}. New quantity: ${cart[existingProductIndex].quantity}`);
    } else {
        product.quantity = 1;
        cart.push(product);
        console.log(`[addToCart] Added new product to cart: ${product.name}`);
    }
    saveCart(cart);

    Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: `${product.name} has been added to your cart.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}

function updateQuantity(productId, change) {
    let cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex > -1) {
        cart[productIndex].quantity += change;
        if (cart[productIndex].quantity <= 0) {
            cart.splice(productIndex, 1);
            console.log(`[updateQuantity] Removed ${productId} from cart.`);
        } else {
            console.log(`[updateQuantity] Updated quantity for ${productId}. New quantity: ${cart[productIndex].quantity}`);
        }
        saveCart(cart);
        renderCart();
    }
}

function removeItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCart();
    console.log(`[removeItem] Removed item with ID: ${productId}`);
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    const subtotalSpan = document.getElementById('subtotal');
    const shippingSpan = document.getElementById('shipping');
    const taxSpan = document.getElementById('tax');
    const totalSpan = document.getElementById('total');

    if (!cartItemsContainer || !emptyCartMessage || !cartSummary || !subtotalSpan || !shippingSpan || !taxSpan || !totalSpan) {
        console.log("[renderCart] Cart elements not found on this page. Skipping cart rendering.");
        return;
    }

    const cart = getCart();
    cartItemsContainer.innerHTML = ''; // Clear existing items

    let subtotal = 0;
    const shipping = 5.00;
    const taxRate = 0.00;

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartSummary.style.display = 'none';
        console.log("[renderCart] Cart is empty. Displaying empty cart message.");
    } else {
        emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';
        console.log("[renderCart] Cart has items. Displaying cart items and summary.");

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.dataset.id = item.id;

            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                </div>
                <span class="item-price">$${itemTotal.toFixed(2)}</span>
                <button class="remove-item-btn" data-id="${item.id}"><i class="bi bi-x-lg"></i></button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
    }

    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    shippingSpan.textContent = `$${shipping.toFixed(2)}`;
    taxSpan.textContent = `$${tax.toFixed(2)}`;
    totalSpan.textContent = `$${total.toFixed(2)}`;

    // Attach click listeners for quantity and remove buttons only once
    const existingListener = cartItemsContainer.dataset.listenerAdded;
    if (!existingListener) {
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const productId = target.dataset.id || target.closest('[data-id]')?.dataset.id;

            if (!productId) return;

            if (target.classList.contains('increase-quantity')) {
                updateQuantity(productId, 1);
            } else if (target.classList.contains('decrease-quantity')) {
                updateQuantity(productId, -1);
            } else if (target.classList.contains('remove-item-btn') || target.closest('.remove-item-btn')) {
                removeItem(productId);
            }
        });
        cartItemsContainer.dataset.listenerAdded = 'true';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("[DOMContentLoaded] Initializing event listeners.");

    const addToCartButtons = document.querySelectorAll('.addToCart');
    if (addToCartButtons.length > 0) {
        console.log(`[DOMContentLoaded] Found ${addToCartButtons.length} 'Add to Cart' buttons.`);
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                console.log("[DOMContentLoaded] 'Add to Cart' button clicked.");
                const productId = event.currentTarget.dataset.id;
                const productName = event.currentTarget.dataset.name;
                const productPrice = parseFloat(event.currentTarget.dataset.price);
                const productImage = event.currentTarget.dataset.image;

                if (!productId || !productName || isNaN(productPrice) || !productImage) {
                    console.error("[DOMContentLoaded] Missing or invalid product data attributes for 'Add to Cart' button:", event.currentTarget);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Could not add item to cart due to missing product information.',
                    });
                    return;
                }

                const product = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                };
                addToCart(product);
            });
        });
    } else {
        console.log("[DOMContentLoaded] No 'Add to Cart' buttons found on this page.");
    }

    if (window.location.pathname.includes('realcart.html')) {
        console.log("[DOMContentLoaded] On realcart.html. Rendering cart.");
        renderCart(); // Initial rendering of the cart

        // Add event listener for the checkout button on realcart.html
        const checkoutBtn = document.getElementById('checkoutBtn');
        console.log("[DOMContentLoaded] Checkout button element:", checkoutBtn); // Log the button element
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                console.log("[Checkout Button] Clicked!"); // Log when the button is clicked
                // Show success notification
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed!',
                    text: 'Your order has been successfully placed. Thank you for your purchase!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                }).then(() => {
                    console.log("[Checkout Button] SweetAlert closed. Clearing cart and re-rendering.");
                    // Clear the cart after the notification closes
                    sessionStorage.removeItem('shoppingCart');
                    // Re-render the cart to show it's empty
                    renderCart();
                });
            });
        } else {
            console.log("[DOMContentLoaded] Checkout button with ID 'checkoutBtn' not found.");
        }
    }

    const searchInput = document.getElementById('search-input');

    if (searchInput) { // Only add keyup listener if searchInput exists
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                console.log("[DOMContentLoaded] Enter key pressed in search bar.");
                const currentPath = window.location.pathname;
                const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
                console.log(`[DOMContentLoaded] Detected current page: "${currentPage}"`);
                performSearch(searchInput.value.trim(), currentPage);
            }
        });
    } else {
        console.log("[DOMContentLoaded] Search input element not found. Search functionality is not active.");
    }
    // --- End of Search Bar functionality ---


    // --- Other functionalities (modals, popups) ---

    // Coffee Modal logic
    const coffeeModalOverlay = document.querySelector('.coffee-modal-overlay');
    const closeCoffeeModalButton = document.querySelector('.close-coffee-modal-button');
    const coffeeModalImage = document.getElementById('coffeeModalImage');
    const coffeeModalTitle = document.getElementById('coffeeModalTitle');
    const coffeeModalDescription = document.getElementById('coffeeModalDescription');
    const coffeeModalTestingNotes = document.getElementById('coffeeModalTestingNotes');
    const coffeeModalBrewingMethods = document.getElementById('coffeeModalBrewingMethods');
    const coffeeModalPrice = document.getElementById('coffeeModalPrice');

    const viewDetailsButtons = document.querySelectorAll('.viewDetailsBtn');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log("View Details button clicked (CoffeeSelection).");
            const title = button.dataset.title;
            const image = button.dataset.image;
            const description = button.dataset.description;
            const tasteNotes = button.dataset.tastenotes ? button.dataset.tastenotes.split(',') : [];
            const brewingMethods = button.dataset.brewingmethods ? button.dataset.brewingmethods.split(',') : [];
            const price = button.dataset.price;

            if (coffeeModalImage) coffeeModalImage.src = image;
            if (coffeeModalTitle) coffeeModalTitle.textContent = title;
            if (coffeeModalDescription) coffeeModalDescription.textContent = description;
            if (coffeeModalPrice) coffeeModalPrice.textContent = price;

            if (coffeeModalTestingNotes) {
                coffeeModalTestingNotes.innerHTML = '';
                tasteNotes.forEach(note => {
                    const li = document.createElement('li');
                    li.textContent = note.trim();
                    coffeeModalTestingNotes.appendChild(li);
                });
            }

            if (coffeeModalBrewingMethods) {
                coffeeModalBrewingMethods.innerHTML = '';
                brewingMethods.forEach(method => {
                    const li = document.createElement('li');
                    li.textContent = method.trim();
                    coffeeModalBrewingMethods.appendChild(li);
                });
            }

            if (coffeeModalOverlay) coffeeModalOverlay.classList.add('show-modal');
        });
    });

    if (closeCoffeeModalButton) {
        closeCoffeeModalButton.addEventListener('click', () => {
            if (coffeeModalOverlay) coffeeModalOverlay.classList.remove('show-modal');
        });
    }

    if (coffeeModalOverlay) {
        coffeeModalOverlay.addEventListener('click', (e) => {
            if (e.target === coffeeModalOverlay) {
                if (coffeeModalOverlay) coffeeModalOverlay.classList.remove('show-modal');
            }
        });
    }

    // Equipment Modal logic
    const equipmentModalOverlay = document.getElementById('equipmentModal');
    const closeEquipmentModalButton = document.querySelector('.close-equipment-modal-button');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalUsageTips = document.getElementById('modalUsageTips');

    const learnMoreButtons = document.querySelectorAll('.learnMoreBtn');
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log("Learn More button clicked (Equipment/Event).");
            const title = button.dataset.title;
            const image = button.dataset.image;
            const description = button.dataset.description;
            const usageTips = button.dataset.usageTips;

            if (modalImage) modalImage.src = image;
            if (modalTitle) modalTitle.textContent = title;
            if (modalDescription) modalDescription.textContent = description;
            if (modalUsageTips) modalUsageTips.textContent = usageTips;

            if (equipmentModalOverlay) equipmentModalOverlay.classList.add('show-modal');
        });
    });

    if (closeEquipmentModalButton) {
        closeEquipmentModalButton.addEventListener('click', () => {
            console.log("Close equipment modal button clicked.");
            if (equipmentModalOverlay) equipmentModalOverlay.classList.remove('show-modal');
        });
    }

    if (equipmentModalOverlay) {
        equipmentModalOverlay.addEventListener('click', (e) => {
            if (e.target === equipmentModalOverlay) {
                if (equipmentModalOverlay) equipmentModalOverlay.classList.remove('show-modal');
            }
        });
    }

    // Email Subscription Popup logic
    const emailPopup = document.getElementById('emailPopup');
    const closePopupButton = document.querySelector('.popup-overlay .close-button');
    setTimeout(() => {
        if (emailPopup) {
            emailPopup.classList.add('show');
        }
    }, 3000);

    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            if (emailPopup) {
                emailPopup.classList.remove('show');
            }
        });
    }

    if (emailPopup) {
        emailPopup.addEventListener('click', (event) => {
            if (event.target === emailPopup) {
                emailPopup.classList.remove('show');
            }
        });
    }

    // Event listener for Register Form submission
    const eventRegisterForm = document.getElementById('eventRegisterForm');
    const successModalOverlay = document.getElementById('successModalOverlay');
    const closeSuccessModalButtons = document.querySelectorAll('.close-success-modal-button, .close-success-button');

    if (eventRegisterForm) {
        eventRegisterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (successModalOverlay) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: 'Thank you for registering. We look forward to seeing you!',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
            eventRegisterForm.reset();
        });
    }

    closeSuccessModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (successModalOverlay) {
                successModalOverlay.classList.remove('show-modal');
            }
        });
    });

    if (successModalOverlay) {
        successModalOverlay.addEventListener('click', (e) => {
            if (e.target === successModalOverlay) {
                if (successModalOverlay) successModalOverlay.classList.remove('show-modal');
            }
        });
    }
});

// Function to perform the search based on the current page
function performSearch(query, currentPage) {
    console.log(`[performSearch] Function called. Query: "${query}", Current Page: "${currentPage}"`);

    const lowerCaseQuery = query.toLowerCase();

    let cards = [];
    let titleSelector = '';

    if (currentPage === 'CoffeeSelection.html') {
        cards = document.querySelectorAll('.menuGrid .smallCard');
        titleSelector = '.UndersmallCard h2';
    } else if (currentPage === 'specialoffers.html') {
        cards = document.querySelectorAll('.info-card-container .smallCard');
        titleSelector = '.UndersmallCard h2';
    } else if (currentPage === 'Equipments.html') {
        cards = document.querySelectorAll('.equipmentGrid .equipmentCard');
        titleSelector = '.textBlock h2';
    } else if (currentPage === 'Store.html') {
        cards = [
            ...document.querySelectorAll('.menuGrid .smallCard'),
            ...document.querySelectorAll('.equipmentGrid .smallCard')
        ];
        titleSelector = '.UndersmallCard h2';
    } else {
        console.log(`[performSearch] No specific search logic for page: ${currentPage}.`);
        return;
    }

    let resultsFound = false;

    if (cards.length === 0) {
        console.log(`[performSearch] No relevant cards found on ${currentPage}.`);
    }

    cards.forEach(card => {
        const titleElement = card.querySelector(titleSelector);
        if (titleElement) {
            const cardTitle = titleElement.textContent.toLowerCase();
            console.log(`[performSearch] Checking card: "${cardTitle}" against query: "${lowerCaseQuery}"`);
            if (cardTitle.includes(lowerCaseQuery)) {
                card.style.display = '';
                resultsFound = true;
                console.log(`[performSearch] Showing card: "${cardTitle}"`);
            } else {
                card.style.display = 'none';
                console.log(`[performSearch] Hiding card: "${cardTitle}"`);
            }
        } else {
            console.log(`[performSearch] Card found but no title element with selector "${titleSelector}".`);
        }
    });

    if (!resultsFound && cards.length > 0) {
        console.log(`[performSearch] No matching results found on ${currentPage}.`);
    }
}
