let currentRotation = 0;
let activeShoeId = 1; 
const slider = document.getElementById('main-slider');
const panel = document.getElementById('detail-panel');
const gallery = document.getElementById('full-gallery');

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

function rotateSlider(dir) {
    slider.style.animation = "none"; 
    dir === 'next' ? currentRotation -= 72 : currentRotation += 72;
    slider.style.transform = `rotateY(${currentRotation}deg)`;
}

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

// ==========================================
//  CORRECTED GALLERY LOGIC (Matching your filenames)
// ==========================================
function openFullGallery() {
    console.log("Gallery triggered for Shoe ID:", activeShoeId); 

    const mainImg = document.getElementById('gallery-main-img');
    const thumbContainer = document.getElementById('thumb-container');
    const gallery = document.getElementById('full-gallery');

    // Matches: 1shoe0.1.png
    const mainPath = `image/${activeShoeId}shoe0.1.png`;
    mainImg.src = mainPath;

    thumbContainer.innerHTML = '';
    
    // Generate thumbnails: 1shoe0.1.png to 1shoe0.3.png
    for (let i = 1; i <= 3; i++) {
        const imgPath = `image/${activeShoeId}shoe0.${i}.png`; 
        const img = document.createElement('img');
        img.src = imgPath;
        img.className = 'thumb';
        img.onclick = () => { mainImg.src = imgPath; };
        img.onerror = function() { 
            console.error("Missing image:", imgPath);
            this.style.display = 'none'; 
        };
        thumbContainer.appendChild(img);
    }

    // Force display logic
    gallery.style.display = 'flex'; 
    setTimeout(() => { gallery.classList.add('active'); }, 10);
}

function closeFullGallery() {
    const gallery = document.getElementById('full-gallery');
    gallery.classList.remove('active');
    setTimeout(() => { gallery.style.display = 'none'; }, 200); 
}

function addToCart() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        alert("Please login first.");
        window.location.href = "auth.html";
        return;
    }

    const shoeName = document.getElementById('detail-name').innerText;
    const price = document.getElementById('detail-price').innerText;
    const address = document.getElementById('shipping-address').value;
    const userName = localStorage.getItem('userName') || 'Customer';

    if (!address.trim()) { alert("Enter address!"); return; }
    
    let size = "Not Selected";
    document.querySelectorAll('.opt-btn').forEach(b => {
        if (b.classList.contains('active')) size = b.innerText;
    });

    const accessKey = "7a869d7c-5138-41e1-9038-b9038cc6b730"; 
    alert("Sending order...");

    const formData = new FormData();
    formData.append("access_key", accessKey);
    formData.append("Customer", userName);
    formData.append("Shoe", shoeName);
    formData.append("Price", price);
    formData.append("Size", size);
    formData.append("Address", address);
    formData.append("Date", new Date().toLocaleString());

    fetch("https://api.web3forms.com/submit", { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            saveOrderToHistory({ date: new Date().toLocaleDateString(), shoeName, price, size, address });
            alert("Order Placed!");
            document.getElementById('shipping-address').value = '';
            closeDetails();
        } else { alert("Error: " + data.message); }
    })
    .catch(err => { alert("Error."); console.log(err); });
}

function saveOrderToHistory(order) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(order); 
    localStorage.setItem('orders', JSON.stringify(orders));
}

document.addEventListener('click', e => {
    if (e.target.classList.contains('opt-btn')) {
        const p = e.target.parentElement;
        p.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    }
});