let currentRotation = 0;
let activeShoeId = 1; 
const slider = document.getElementById('main-slider');
const panel = document.getElementById('detail-panel');
const gallery = document.getElementById('full-gallery');

// --- Check Login Status on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    const navLink = document.getElementById('nav-link');
    if (navLink) { 
        if (localStorage.getItem('isLoggedIn') === 'true') {
            navLink.innerText = "MY ACCOUNT";
            navLink.href = "account.html";
        } else {
            navLink.innerText = "LOGIN / SIGN UP";
            navLink.href = "auth.html";
        }
    }
});

// Handle Manual Slider Rotation
function rotateSlider(dir) {
    slider.style.animation = "none"; 
    dir === 'next' ? currentRotation -= 72 : currentRotation += 72;
    slider.style.transform = `rotateY(${currentRotation}deg)`;
}

// Open Detail Panel and Populate Data
function showDetails(id, name, price) {
    activeShoeId = id; 
    document.getElementById('detail-img').src = `image/shoe${id}.png`;
    document.getElementById('detail-name').innerText = name;
    document.getElementById('detail-price').innerText = price;
    panel.classList.add('active');
    slider.style.animationPlayState = "paused";
}

function closeDetails() {
    panel.classList.remove('active');
    if (slider.style.animation !== "none") slider.style.animationPlayState = "running";
}

// Multi-Angle Gallery Logic
function openFullGallery() {
    const mainImg = document.getElementById('gallery-main-img');
    const thumbContainer = document.getElementById('thumb-container');
    mainImg.src = `image/shoe${activeShoeId}.png`;
    thumbContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
        const imgPath = `image/${activeShoeId}shoe0.${i}.png`; 
        const img = document.createElement('img');
        img.src = imgPath; img.className = 'thumb';
        img.onclick = () => { mainImg.src = imgPath; };
        thumbContainer.appendChild(img);
    }
    gallery.classList.add('active');
}

function closeFullGallery() { gallery.classList.remove('active'); }

// ==========================================
//  UPDATED ORDER SYSTEM
// ==========================================
function addToCart() {
    // 1. Check Login
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        alert("Please login or sign up to place an order.");
        window.location.href = "auth.html";
        return;
    }

    // 2. Collect Data
    const shoeName = document.getElementById('detail-name').innerText;
    const price = document.getElementById('detail-price').innerText;
    const address = document.getElementById('shipping-address').value;
    const userName = localStorage.getItem('userName') || 'Valued Customer';

    // Validate Address
    if (!address.trim()) {
        alert("Please enter your shipping address.");
        return;
    }
    
    let size = "Not Selected";
    document.querySelectorAll('.opt-btn').forEach(btn => {
        if (btn.classList.contains('active')) size = btn.innerText;
    });

    // -----------------------------------------------------------
    // YOUR API KEY
    // -----------------------------------------------------------
    const accessKey = "7a869d7c-5138-41e1-9038-b9038cc6b730"; 
    // -----------------------------------------------------------

    alert("Processing your order... please wait.");

    // 3. Send Data to Web3Forms
    const formData = new FormData();
    formData.append("access_key", accessKey);
    formData.append("Customer Name", userName);
    formData.append("Shoe Name", shoeName);
    formData.append("Price", price);
    formData.append("Size", size);
    formData.append("Shipping Address", address);
    formData.append("Date", new Date().toLocaleString());

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 4. Save to History
            saveOrderToHistory({
                date: new Date().toLocaleDateString(),
                shoeName: shoeName,
                price: price,
                size: size,
                address: address
            });

            alert("SUCCESS! Order placed. Check your email.");
            document.getElementById('shipping-address').value = '';
            closeDetails();
        } else {
            alert("ERROR: " + data.message);
        }
    })
    .catch(error => {
        alert("ERROR: Something went wrong.");
        console.log(error);
    });
}

function saveOrderToHistory(order) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(order); 
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Size Button Interaction
document.addEventListener('click', e => {
    if (e.target.classList.contains('opt-btn')) {
        const parent = e.target.parentElement;
        parent.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    }
});