// // Selectors
const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDom = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

// Global
let cart = [];
let buttonsDOM = [];

import { productsData } from "./products.js";

// Modal Functions
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}
function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "100%";
}

// Events for modal
cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  const Product = new Products();
  const productsData = Product.getProduct();

  const ui = new UI();
  ui.displayProduct(productsData);
  ui.getAddToCartBtn();
  ui.setupApp();
  ui.cartLogic();

  Storage.saveProduct(productsData);
});

// ===== Classes ===== //
class Products {
  getProduct() {
    return productsData;
  }
}

class UI {
  displayProduct(productList) {
    let result = ``;
    productList.forEach(item => {
      result += `
        <div class="product">
          <div class="img-container">
            <img src=${item.imageUrl} class="product-img" />
          </div>
          <div class="product-desc">
            <p class="product-price">$ ${item.price}</p>
            <p class="product-title">${item.title}</p>
          </div>
          <button class="btn add-to-cart" data-id=${item.id}>
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
        </div>`;
    });
    productsDom.innerHTML = result;
  }

  getAddToCartBtn() {
    const addToCartBtn = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtn;

    addToCartBtn.forEach(btn => {
      const id = btn.dataset.id;
      const isInCart = cart.find(item => item.id === parseInt(id));

      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", event => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        cart = [...cart, addedProduct];

        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(addedProduct);
      });
    });
  }

  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img class="cart-item-img" src=${cartItem.imageUrl} />
      <div class="cart-item-desc">
        <h4>${cartItem.title}</h4>
        <h5>$ ${cartItem.price}</h5>
      </div>
      <div class="cart-item-controller">
        <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
        <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
      </div>
      <i class="far fa-trash-alt" data-id=${cartItem.id}></i>`;
    cartContent.appendChild(div);
  }

  setCartValue(cart) {
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);

    cartTotal.innerText = `Total: ${totalPrice.toFixed(2)} $`;
    cartItems.innerText = tempCartItems;
  }

  setupApp() {
    cart = Storage.getCart() || [];
    cart.forEach(cartItem => this.addCartItem(cartItem));
    this.setCartValue(cart);
   
  }

  removeItem(id) {
    cart = cart.filter(item => item.id != id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    this.singleButton(id);
  }

  singleButton(id) {
    const button = buttonsDOM.find(btn => parseInt(btn.dataset.id) === parseInt(id));
    if (button) {
      button.innerText = "Add to Cart";
      button.disabled = false;
    }
  }

  cartLogic() {
    clearCart.addEventListener("click", () => this.clearCart());

    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("fa-chevron-up")) {
        const addQuantity = event.target;
        const addedItem = cart.find(item => item.id == addQuantity.dataset.id);
        addedItem.quantity++;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } 
      else if (event.target.classList.contains("fa-trash-alt")) {
        const removeItem = event.target;
        const _removeItem = cart.find(item => item.id == removeItem.dataset.id);
        this.removeItem(_removeItem.id);
        Storage.saveCart(cart);
        removeItem.parentElement.remove();
      } 
 else if (event.target.classList.contains("fa-chevron-down")) {
  const subQuantity = event.target;
  const subtractedItem = cart.find(
    (c) => c.id == subQuantity.dataset.id
  );

  if (subtractedItem.quantity === 1) {
    this.removeItem(subtractedItem.id);
    
    subQuantity.closest(".cart-item").remove();
    return;
  }

  subtractedItem.quantity--;
  this.setCartValue(cart);
  Storage.saveCart(cart);
  subQuantity.previousElementSibling.innerText = subtractedItem.quantity;
}

    });
  }

  clearCart() {
    cart.forEach(item => this.removeItem(item.id));
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }
}

class Storage {
  static saveProduct(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find(p => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}
