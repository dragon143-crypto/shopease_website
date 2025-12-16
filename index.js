/* INDEX PAGE JS */

function addProductToCart(product) {
  addToCart(product);
  alert("Added to cart!");
}

function addProductToWishlist(product) {
  addWishlist(product);
  alert("Added to wishlist!");
}
addProductToCart({
  id: "PRD-1",
  title: "Mobile Phone",
  price: "₹12,999",
  img: "mobile.jpg"
});
