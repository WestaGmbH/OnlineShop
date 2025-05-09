let vocabulary= getVocabulary();
function getMiniCartUrls() {
  const metaTag = document.querySelector('meta[name="mini-cart-urls"]');
  if (metaTag) {
    try {
      return JSON.parse(metaTag.getAttribute("content"));
    } catch (e) {
      console.error("Error while parsing mini-cart-urls", e);
    }
  } else {
    console.error('Meta tag "django-urls" has not been found');
  }
  return {};
}
const miniCartUrls = getMiniCartUrls();
document.getElementById('cartBtnMobile').addEventListener('click', miniCartPanel);
document.getElementById('cartBtn').addEventListener('click', miniCartPanel);
function miniCartPanel() {
    let cartPanel = document.getElementById('cartPanel');
    let overlay = document.getElementById('overlay');
    if (cartPanel.classList.contains('open')) {
        cartPanel.classList.remove('open');
        overlay.style.display = 'none'; // Hide the overlay when the cart is closed
    }
    else {
        let sum1 = 0;
        document.getElementById('subtotalValue').textContent = currency+`${sum1.toFixed(2)}`;
        const emptyCartContainer = document.querySelector('.empty-cart-container');
        if (emptyCartContainer) {
            emptyCartContainer.style.display = 'none';
            emptyCartContainer.classList.remove('show-empty-cart');
        }

        // Open the cart panel and overlay
        document.getElementById('cartPanel').classList.add('open');
        document.getElementById('overlay').style.display = 'block';

        // Load cart data
        fetch(miniCartUrls.getCartUrl)
            .then(response => response.json())
            .then(data => {
                const cartItemsContainer = document.getElementById('cartPanel').querySelector('.cart-items');
                cartItemsContainer.innerHTML = ''; // Clear existing items

                let cart = data.cart;
                if (cart.length === 0) {
                    showCartIsEmpty(cartItemsContainer);
                } else {

                cartItemsContainer.classList.remove('cart-items-container');
                const checkoutBtn = document.querySelector('.checkout-btn');
                checkoutBtn.textContent = vocabulary['Proceed to checkout'];
                checkoutBtn.onclick = function() {
                    location.href = miniCartUrls.cartUrl;
                };
                    // Populate cart items and ensure the empty cart container is not displayed
                let sum = 0;
                cart.sort((a, b) => a.number - b.number);
                cart.forEach(item => {
                    sum+=parseFloat(item.sum);
                    const itemElement = document.createElement('div');
                    itemElement.setAttribute('data-item-name', item.name);
                    itemElement.classList.add('mini-cart-product');
                    itemElement._cartItem = item;

                    const img_column = document.createElement('div');
                    const img = document.createElement('img');
                    img.src = item.image_url;
                    img.width= `64`;
                    img_column.appendChild(img);


                    const attributes = document.createElement('div');
                    attributes.classList.add('attrs-container');

                    const attrs_column_first = document.createElement('p');
                    attrs_column_first.classList.add('cart-first-attrs-column');

                    const name = document.createElement('span');
                    name.textContent = `${item.category + " "+item.product_name}`;
                    name.classList.add('cart-product-name');

                    const crystal_color = document.createElement('span');
                    crystal_color.textContent = `${vocabulary["Crystal color"]}: ${item.stone}`;
                    const plating = document.createElement('span');
                    plating.textContent = `${vocabulary['Plating']}: ${item.plating}`;
                    const base = document.createElement('span');
                    base.textContent = `${vocabulary["Base material"]}: ${item.material}`;

                    attrs_column_first.appendChild(name);
                    attrs_column_first.appendChild(crystal_color);
                    attrs_column_first.appendChild(plating);
                    attrs_column_first.appendChild(base);


                    const attrs_column_second = document.createElement('span');
                    attrs_column_second.classList.add('cart-second-attrs-column');

                    const price = document.createElement('span');
                    price.textContent = currency+`${item.price.toFixed(2)}`;
                    price.classList.add('mini-cart-product-price');

                    const quantity = document.createElement('span');
                    quantity.textContent = `${vocabulary["Quantity"]}: ${item.quantity}`;
                    quantity.classList.add('mini-cart-product-quantity');

                    attrs_column_second.appendChild(price);
                    attrs_column_second.appendChild(quantity);

                    attributes.appendChild(attrs_column_first);
                    attributes.appendChild(attrs_column_second);

                    itemElement.appendChild(img_column);
                    itemElement.appendChild(attributes);
                    const deletePanel = document.createElement('div');
                    deletePanel.classList.add('delete-panel');

                    // Create the delete icon
                    const deleteIcon = document.createElement('i');
                    deleteIcon.classList.add('fa-solid', 'fa-trash', 'delete-icon');

                    // Append the delete icon and tooltip to the delete panel
                    deletePanel.appendChild(deleteIcon);
                    deleteIcon.addEventListener('mouseover', function(event) {
                        showTooltip(event, vocabulary['Remove from cart'])
                    });

                    // Mouseout event to hide tooltip
                    deleteIcon.addEventListener('mouseout', function() {
                        removeTooltip();
                        // Reset position if necessary
                    });

                    // Append the delete panel to the img_column or itemElement
                    img_column.appendChild(deletePanel); // This places the delete panel over the image
                    function removeCartItem(itemEl, itemObj) {
                        if(isCheckout){
                            alert(vocabulary['You cant delete items during checkout. Go back to shop pages to change your cart']);
                            return;
                        }

                        itemEl.classList.add('item-deleting');

                        itemEl.addEventListener('transitionend', function onEnd(e) {
                            console.log(e.propertyName);
                            if (e.propertyName === 'max-height') {
                              itemEl.removeEventListener('transitionend', onEnd);
                              deleteFromCart(itemObj.name);
                              itemEl.remove();

                              let newSum = 0;
                              cart = cart.filter(ci => ci.name !== itemObj.name);
                              cart.forEach(ci => newSum += parseFloat(ci.sum));
                              document.getElementById('subtotalValue').textContent = currency + newSum.toFixed(1);

                              if (cart.length === 0) {
                                showCartIsEmpty(cartItemsContainer);
                              }
                            }
                        }, { once: true });
                    }
                    // Event listener for delete icon click
                    deleteIcon.addEventListener('click', function(event) {
                        event.stopPropagation();
                        removeCartItem(itemElement, item);

                    });
                    // Add more details as needed
                    cartItemsContainer.appendChild(itemElement);
                });

                // Update subtotal
                document.getElementById('subtotalValue').textContent = currency+`${sum.toFixed(2)}`;
                const emptyCartContainer = document.querySelector('.empty-cart-container');
                if (emptyCartContainer) {
                    emptyCartContainer.style.display = 'none';
                    emptyCartContainer.classList.remove('show-empty-cart');
                }
            }
                // Open the cart panel and overlay
                document.getElementById('cartPanel').classList.add('open');
                document.getElementById('overlay').style.display = 'block';
                console.log(data);
            })
            .catch(error => console.error('Error loading cart:', error));
        }

};


function showCartIsEmpty(cartItemsContainer){
    cartItemsContainer.classList.add('cart-items-container');
    let emptyCartContainer = document.querySelector('.empty-cart-container');
    if (!emptyCartContainer) {
        emptyCartContainer = document.createElement('div');
        emptyCartContainer.classList.add('empty-cart-container');

        // Create an SVG element
        const svgNS = "http://www.w3.org/2000/svg";
        const noItemsSvg = document.createElementNS(svgNS, 'svg');
        noItemsSvg.setAttribute('width', '150px');
        noItemsSvg.setAttribute('height', '150px');
        noItemsSvg.setAttribute('style', 'margin-top: 5px');
        noItemsSvg.setAttributeNS(null, 'viewBox', '0 0 28 28'); // Optionally add viewBox if needed

        // Create the first path element
        const path1 = document.createElementNS(svgNS, 'path');
        path1.setAttribute('d', 'M21.46,26H6.54C4,26,4,23.86,4,22.46V2H24V22.46C24,23.86,24,26,21.46,26Z');
        path1.setAttribute('fill', 'none');
        path1.setAttribute('stroke', '#c1c1c1');
        path1.setAttribute('stroke-miterlimit', '10');
        path1.setAttribute('stroke-width', '2');

        // Create the second path element
        const path2 = document.createElementNS(svgNS, 'path');
        path2.setAttribute('d', 'M10,8v.78c0,2.68,1.8,4.88,4,4.88s4-2.19,4-4.88V8');
        path2.setAttribute('fill', 'none');
        path2.setAttribute('stroke', '#c1c1c1');
        path2.setAttribute('stroke-miterlimit', '10');
        path2.setAttribute('stroke-width', '2');

        // Append paths to the SVG element
        noItemsSvg.appendChild(path1);
        noItemsSvg.appendChild(path2);

        // Append SVG to the empty cart container
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = vocabulary['Cart is empty'];
        emptyMessage.classList.add("empty-message");

        emptyCartContainer.appendChild(emptyMessage);
        emptyCartContainer.appendChild(noItemsSvg);
        cartItemsContainer.appendChild(emptyCartContainer);
    }

    // Show the container with a smooth transition
    requestAnimationFrame(() => {
        emptyCartContainer.style.display = 'block';
        requestAnimationFrame(() => {
            emptyCartContainer.classList.add('show-empty-cart');
        });
    });

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.textContent = vocabulary['Back to shop'];
    checkoutBtn.onclick = closeCart;
}

function deleteFromCart(documentId) {
    fetch(miniCartUrls.deleteDocumentUrl, { // Replace with the actual URL as needed
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: documentId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            console.log('Document deleted successfully');
            // Optionally, update UI here
        } else {
            console.error('Error in deletion');
            // Optionally, provide user feedback here
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Optionally, provide user feedback here
    });
}

function deleteAllFromCart() {
    document
        .querySelectorAll('.mini-cart-product .delete-icon')
        .forEach(icon => icon.click());
}
document.getElementById('clear-cart').addEventListener('click', deleteAllFromCart);

document.getElementById('closeCartBtn').onclick = closeCart;
function closeCart(){
    let cartPanel = document.getElementById('cartPanel');
    let overlay = document.getElementById('overlay');
    cartPanel.classList.remove('open');
    overlay.style.display = 'none';
}