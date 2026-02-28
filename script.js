// ==========================================
// ========== SHOPEASE ENHANCED JS ==========
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all enhanced features
  initSlider();
  initTouchSwipe();
  initKeyboardNav();
  initSearch();
  initDealsScroll();
  initProfileDropdown();
  initAnimations();
  initCartAnimations();

  // Cart functionality
  initCart();
});

// ==========================================
// ========== ENHANCED SLIDER ==============
// ==========================================

let currentSlide = 0;
let slides = [];
let dots = [];
let sliderInterval;
let isPaused = false;

function initSlider() {
  const slidesContainer = document.getElementById('slides');
  const dotsContainer = document.getElementById('dots');

  if (!slidesContainer) return;

  slides = document.querySelectorAll('.slide');

  if (slides.length === 0) return;

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.onclick = () => goToSlide(index);
    dotsContainer.appendChild(dot);
  });

  dots = document.querySelectorAll('.dot');

  // Attach arrow event listeners
  const prevArrow = document.getElementById('prevArrow');
  const nextArrow = document.getElementById('nextArrow');

  if (prevArrow) {
    prevArrow.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
      // Optional: Restart auto-play interval on manual click
      clearInterval(sliderInterval);
      startSlider();
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
      // Optional: Restart auto-play interval on manual click
      clearInterval(sliderInterval);
      startSlider();
    });
  }

  // Initial active slide
  slides[0].classList.add('active-slide');

  // Start auto-play
  startSlider();

  // Pause on hover
  const slider = document.querySelector('.slider');
  if (slider) {
    slider.addEventListener('mouseenter', () => {
      isPaused = true;
      clearInterval(sliderInterval);
    });

    slider.addEventListener('mouseleave', () => {
      isPaused = false;
      startSlider();
    });
  }
}

function startSlider() {
  sliderInterval = setInterval(() => {
    if (!isPaused) {
      nextSlide();
    }
  }, 4000); // Auto-advance every 4 seconds
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlide();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlide();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlide();
}

function updateSlide() {
  const slidesContainer = document.getElementById('slides');
  if (!slidesContainer) return;

  slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Update dots
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });

  // Update slide classes for advanced animation
  slides.forEach((slide, index) => {
    slide.classList.toggle('active-slide', index === currentSlide);
  });
}

// Make functions globally available
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;



// ==========================================
// ========== TOUCH/SWIPE SUPPORT ===========
// ==========================================

function initTouchSwipe() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
}

// ==========================================
// ========== KEYBOARD NAVIGATION ==========
// ==========================================

function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    // Slider navigation
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }

    // Search navigation
    const searchInput = document.getElementById('searchInput');
    if (searchInput && document.activeElement === searchInput) {
      const results = document.querySelectorAll('.search-results div');
      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const active = document.querySelector('.search-results .active');
          if (active) {
            active.classList.remove('active');
            active.nextElementSibling?.classList.add('active');
          } else {
            results[0].classList.add('active');
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const active = document.querySelector('.search-results .active');
          if (active) {
            active.classList.remove('active');
            active.previousElementSibling?.classList.add('active');
          } else {
            results[results.length - 1].classList.add('active');
          }
        } else if (e.key === 'Enter') {
          const active = document.querySelector('.search-results .active');
          if (active) {
            active.click();
          }
        } else if (e.key === 'Escape') {
          hideSearchResults();
        }
      }
    }
  });
}

// ==========================================
// ========== ENHANCED SEARCH ===============
// ==========================================

let searchTimeout;

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (!searchInput) return;

  // Sample search data - in production, this would come from an API
  const products = [
    'Mobile Phones', 'Laptops', 'Tablets', 'Headphones', 'Smart Watches',
    'Fashion', 'Men\'s Clothing', 'Women\'s Clothing', 'Kids Fashion',
    'Home & Furniture', 'Kitchen Appliances', 'Beauty Products',
    'Grocery', 'Books', 'Sports Equipment', 'Toys', 'Electronics',
    'Cameras', 'Gaming', 'Accessories'
  ];

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      hideSearchResults();
      return;
    }

    // Debounce search
    searchTimeout = setTimeout(() => {
      const filtered = products.filter(p =>
        p.toLowerCase().includes(query.toLowerCase())
      );

      if (filtered.length > 0) {
        showSearchResults(filtered);
      } else {
        searchResults.innerHTML = '<div>No results found</div>';
        searchResults.style.display = 'block';
      }
    }, 300);
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.pro-search')) {
      hideSearchResults();
    }
  });
}

function showSearchResults(results) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;

  searchResults.innerHTML = results
    .map(r => `<div onclick="selectSearch('${r}')">${r}</div>`)
    .join('');
  searchResults.style.display = 'block';

  // Add animation
  searchResults.style.animation = 'fadeInUp 0.3s ease';
}

function hideSearchResults() {
  const searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.style.display = 'none';
  }
}

function selectSearch(value) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = value;
  }
  hideSearchResults();
  showToast(`Searching for: ${value}`, 'info');
}

window.selectSearch = selectSearch;

// ==========================================
// ========== DEALS AUTO SCROLL ============
// ==========================================

let dealsScrollInterval;

function initDealsScroll() {
  const dealsContainer = document.getElementById('deals');
  if (!dealsContainer) return;

  // Add hover pause for deals
  dealsContainer.addEventListener('mouseenter', () => {
    dealsContainer.style.animationPlayState = 'paused';
  });

  dealsContainer.addEventListener('mouseleave', () => {
    dealsContainer.style.animationPlayState = 'running';
  });

  // Add "Add to Cart" buttons on hover
  const dealItems = document.querySelectorAll('.deal-item');
  dealItems.forEach(item => {
    const addBtn = document.createElement('button');
    addBtn.className = 'add-cart-btn';
    addBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      const productName = item.querySelector('h3')?.textContent || 'Product';
      addToCart(productName);
    };
    item.appendChild(addBtn);
  });
}

function scrollDeals(direction) {
  const dealsContainer = document.getElementById('deals');
  if (!dealsContainer) return;

  const scrollAmount = 200;
  dealsContainer.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

window.scrollDeals = scrollDeals;

// ==========================================
// ========== PROFILE DROPDOWN =============
// ==========================================

function initProfileDropdown() {
  const profileWrapper = document.querySelector('.profile-wrapper');
  const profileBtn = document.querySelector('.profile-btn');
  const profileMenu = document.querySelector('.profile-menu');

  if (!profileWrapper || !profileMenu) return;

  // Keep dropdown behavior on hover (via CSS), but ensure click navigates
  profileBtn?.addEventListener('click', (e) => {
    // Navigate directly since href is 'profile.html' on the anchor element
    if (profileBtn.tagName === 'A' && profileBtn.getAttribute('href')) {
      window.location.href = profileBtn.getAttribute('href');
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!profileWrapper.contains(e.target)) {
      profileMenu.style.display = 'none';
    }
  });
}

// ==========================================
// ========== ENHANCED ANIMATIONS ==========
// ==========================================

function initAnimations() {
  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe deal items
  document.querySelectorAll('.deal-item').forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
    observer.observe(item);
  });

  // App Promo section animation
  const appPromoText = document.querySelector('.app-promo-text');
  if (appPromoText) {
    appPromoText.style.animation = 'fadeInLeft 1s ease forwards';
  }

  const appPromoImage = document.querySelector('.app-promo-image');
  if (appPromoImage) {
    appPromoImage.style.animation = 'fadeInRight 1s ease 0.3s forwards';
    appPromoImage.style.opacity = '0';
  }
}

// ==========================================
// ========== CART FUNCTIONALITY ===========
// ==========================================

function initCart() {
  const cartItemsContainer = document.getElementById('cart-items');

  // Example function to add a dummy item
  function addCartItem(name, price, img) {
    const item = document.createElement('div');
    item.classList.add('cart-item');
    item.innerHTML = `
      <img src="${img}" alt="${name}">
      <h3>${name}</h3>
      <p>₹${price}</p>
      <button class="remove">Remove</button>
    `;

    // Attach remove event
    item.querySelector('.remove').addEventListener('click', () => removeCartItem(item));

    cartItemsContainer?.appendChild(item);
  }

  // Animate remove
  function removeCartItem(item) {
    item.classList.add('removing');
    setTimeout(() => {
      item.remove();
      updateTotals();
    }, 400);
  }

  // Update totals (dummy for now)
  function updateTotals() {
    console.log('Update total price logic here...');
  }

  // Add sample items for testing
  addCartItem("Samsung Galaxy S24", 79999, "https://via.placeholder.com/100");
  addCartItem("iPhone 15 Pro", 149999, "https://via.placeholder.com/100");
}

// ==========================================
// ========== ADD TO CART ==================
// ==========================================

function addToCart(productName) {
  // Add cart animation
  const cartIcon = document.querySelector('.pro-icon .fa-shopping-cart');
  if (cartIcon) {
    cartIcon.classList.add('bounce');
    setTimeout(() => {
      cartIcon.classList.remove('bounce');
    }, 500);
  }

  showToast(`${productName} added to cart! 🛒`, 'success');
}

window.addToCart = addToCart;

// ==========================================
// ========== CART BADGE ANIMATION ==========
// ==========================================

function initCartAnimations() {
  const cartIcon = document.querySelector('.pro-icon');

  cartIcon?.addEventListener('click', () => {
    // Add click animation
    cartIcon.style.transform = 'scale(0.9)';
    setTimeout(() => {
      cartIcon.style.transform = 'scale(1)';
    }, 150);
  });
}

// ==========================================
// ========== TOAST NOTIFICATIONS ==========
// ==========================================

function showToast(message, type = 'info') {
  // Remove existing container if any
  let container = document.querySelector('.toast-container');

  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Add icon based on type
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeInUp 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

window.showToast = showToast;

// ==========================================
// ========== VOICE SEARCH =================
// ==========================================

function initVoiceSearch() {
  const voiceBtn = document.getElementById('voiceBtn');
  if (!voiceBtn) return;

  voiceBtn.addEventListener('click', () => {
    // Check if SpeechRecognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        showToast('Listening... 🎤', 'info');
        voiceBtn.classList.add('listening');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.value = transcript;
          searchInput.dispatchEvent(new Event('input'));
        }
        showToast(`Heard: ${transcript}`, 'success');
      };

      recognition.onerror = (event) => {
        showToast('Voice recognition error', 'error');
        voiceBtn.classList.remove('listening');
      };

      recognition.onend = () => {
        voiceBtn.classList.remove('listening');
      };

      recognition.start();
    } else {
      showToast('Voice search not supported in this browser', 'warning');
    }
  });
}

// Initialize voice search
initVoiceSearch();

// ==========================================
// ========== LANGUAGE SELECTION ============
// ==========================================

function initLanguageSelector() {
  const langSelect = document.getElementById('langChange');
  if (!langSelect) return;

  const translations = {
    en: { search_placeholder: 'Search products...', signin: 'Login', orders: 'My Orders', wishlist: 'Wishlist', account: 'Account Settings', logout: 'Logout' },
    hi: { search_placeholder: 'उत्पाद खोजें...', signin: 'लॉगिन', orders: 'मेरे ऑर्डर', wishlist: 'विशलिस्ट', account: 'खाता सेटिंग्स', logout: 'लॉगआउट' },
    te: { search_placeholder: 'ఉత్పత్తులు వెతకండి...', signin: 'లాగిన్', orders: 'నా ఆర్డర్‌లు', wishlist: 'ิชลิสต์', account: 'खाता समायोजन', logout: 'लॉगआउट' },
    ta: { search_placeholder: 'தயாரிப்புகளைத் தேடுங்கள்...', signin: 'உள்நுழை', orders: 'என் ஆர்டர்கள்', wishlist: 'விஷ்லிஸ்ட்', account: 'கணக்கு அமைப்புகள்', logout: 'வெளியேறு' }
  };

  langSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    const trans = translations[lang];

    // Update placeholders
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.getAttribute('data-lang');
      if (trans[key]) {
        if (el.tagName === 'INPUT') {
          el.placeholder = trans[key];
        } else {
          el.textContent = trans[key];
        }
      }
    });

    showToast(`Language changed to ${lang.toUpperCase()} 🌐`, 'success');
  });
}

initLanguageSelector();

// ==========================================
// ========== FOOTER SOCIAL ICONS ==========
// ==========================================

function initSocialIcons() {
  // Add social media hover effects
  document.querySelectorAll('.social-icons a').forEach(icon => {
    icon.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.2) rotate(5deg)';
    });

    icon.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1) rotate(0)';
    });
  });
}

initSocialIcons();

// ==========================================
// ========== LOCAL STORAGE HELPERS ========
// ==========================================

// Save item to localStorage
function saveItem(name, price, img) {
  let savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];

  if (!savedItems.some(item => item.name === name)) {
    savedItems.push({ name, price, img });
    localStorage.setItem("savedItems", JSON.stringify(savedItems));
    showToast(name + " added to Saved Items ❤️", 'success');
  } else {
    showToast(name + " is already in Saved Items!", 'warning');
  }
}

window.saveItem = saveItem;

// ==========================================
// ========== FEEDBACK FUNCTIONS ===========
// ==========================================

function openFeedback() {
  document.getElementById("feedback-popup")?.classList.remove("hidden");
}

function closeFeedback() {
  document.getElementById("feedback-popup")?.classList.add("hidden");
}

function sendFeedback() {
  const feedback = document.getElementById("feedback-text")?.value.trim();
  if (feedback) {
    showToast("Thank you for your feedback! 💙", 'success');
    closeFeedback();
    document.getElementById("feedback-text").value = "";
  } else {
    showToast("Please write your feedback before submitting!", 'warning');
  }
}

// ==========================================
// ========== ENHANCED UTILITIES ==========
// ==========================================

// Back to top button
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  });
}

initBackToTop();

// Add CSS for back-to-top button
const backToTopStyle = document.createElement('style');
backToTopStyle.textContent = `
  .back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2874f0, #1a5fd1);
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(40, 116, 240, 0.4);
    z-index: 9999;
    display: none;
    transition: all 0.3s ease;
  }
  
  .back-to-top:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(40, 116, 240, 0.6);
  }
  
  .add-cart-btn {
    background: #2874f0;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    margin-top: 8px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
  }
  
  .deal-item:hover .add-cart-btn {
    opacity: 1;
    transform: translateY(0);
  }
  
  .add-cart-btn:hover {
    background: #1a5fd1;
  }
  
  .slider .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    cursor: pointer;
    display: inline-block;
    margin: 0 5px;
    transition: all 0.3s ease;
  }
  
  .slider .dot.active {
    background: #fff;
    transform: scale(1.2);
  }
  
  .slider .dots {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .bounce {
    animation: bounce 0.5s ease;
  }
  
  .listening {
    color: #2874f0 !important;
    animation: pulse 1s infinite;
  }
  
  .search-results .active {
    background: #f1f3f6;
    font-weight: 600;
  }
  
  .animate-in {
    animation: fadeInUp 0.6s ease forwards;
  }
  
  .cart-item.removing {
    animation: fadeInUp 0.4s ease reverse forwards;
  }
`;
document.head.appendChild(backToTopStyle);

// Initialize all functions when DOM is ready
console.log('ShopEase Enhanced JS Loaded ✓');
