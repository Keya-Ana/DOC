
// Backend Simulation
let medicalData = [];

// DOM Elements
const themeToggler = document.querySelector('.theme-toggler');
const articlesContainer = document.getElementById('articlesContainer');
const loadingElement = document.getElementById('loading');

// API Configuration - Using FDA API (no CORS proxy needed)
const API_URL = 'https://api.fda.gov/drug/event.json?limit=5';
const FALLBACK_DATA = [
  {
    "title": "Adverse Event Report",
    "description": "Report of adverse events related to medication use",
    "url": "https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program",
    "date": "2023-08-15"
  },
  {
    "title": "Drug Safety Communication",
    "description": "Important safety information about prescription medications",
    "url": "https://www.fda.gov/drugs/drug-safety-and-availability/drug-safety-communications",
    "date": "2023-07-22"
  },
  {
    "title": "Medication Guide",
    "description": "Patient information for safe medication use",
    "url": "https://www.fda.gov/drugs/drug-information-consumers/medication-guides",
    "date": "2023-06-10"
  }
];

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Theme Toggler
function toggleTheme() {
    document.body.classList.toggle('dark-theme-variables');
    const togglerSpans = document.querySelectorAll('.theme-toggler span');
    togglerSpans.forEach(span => span.classList.remove('active'));
    if (document.body.classList.contains('dark-theme-variables')) {
        togglerSpans[1].classList.add('active'); // 🌙
    } else {
        togglerSpans[0].classList.add('active'); // 🌞
    }
    localStorage.setItem('theme', document.body.classList.contains('dark-theme-variables') ? 'dark' : 'light');
}

// Backend Integration
async function fetchMedicalData() {
    try {
        showLoading();
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error('Failed to fetch FDA data');
        
        const data = await response.json();
        
        // Transform FDA API response to our format
        medicalData = data.results.map(item => ({
            title: `FDA Report ${item.safetyreportid}`,
            description: `${item.patient.drug[0].medicinalproduct || 'unknown product'}`,
            url: `https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program`,
            date: item.receive_date || new Date().toISOString().split('T')[0]
        }));
        
        saveToLocalStorage();
        displayArticles();
    } catch (error) {
        showNotification(`Error: ${error.message} - Using fallback data`, 'error');
        useFallbackData();
    } finally {
        hideLoading();
    }
}

async function fetchDrugData(drugName) {
  try {
    const response = await fetch(`/api/drug-info?name=${encodeURIComponent(drugName)}`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        alert(data.error || "Drug not found.");
      } else {
        alert("An error occurred: " + (data.error || response.statusText));
      }
      return;
    }

    // ✅ Success — display data
    console.log("Drug Info:", data);
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Failed to connect to the server.");
  }
}



function useFallbackData() {
    const cachedData = loadFromLocalStorage();
    if (cachedData && cachedData.length > 0) {
        medicalData = cachedData;
        displayArticles();
    } else {
        medicalData = FALLBACK_DATA;
        displayArticles();
        // Save fallback data to localStorage for next time
        saveToLocalStorage();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('medicalData', JSON.stringify(medicalData));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('medicalData');
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

function displayArticles() {
    articlesContainer.innerHTML = '';
    
    medicalData.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        // Extract medicinal product from description if possible (fallback to description)
        let drugParam = '';
        const match = article.description.match(/Report for ([^<]+)/);
        if (match && match[1]) {
            drugParam = match[1].trim();
        } else {
            drugParam = article.description;
        }
        articleCard.innerHTML = `
            <h2 class="article-title">${article.title}</h2>
            <div class="article-meta">${article.date}</div>
            <div class="article-body">
                <a href="/drug-detail?drug=${encodeURIComponent(drugParam)}" class="desc-link">${article.description}</a>
            </div>
            <a href="${article.url}" class="read-more" target="_blank" rel="noopener noreferrer">
                Read More →
            </a>
        `;
        articlesContainer.appendChild(articleCard);
    });
}

// Show loading for drug info card
function showDrugInfoLoading() {
    removeDrugInfoModal();
    const container = document.getElementById('drugInfoCardContainer');
    if (container) {
        container.innerHTML = '<div class="loading">Searching for drug info...</div>';
    }
}

function removeDrugInfoModal() {
    const oldModal = document.getElementById('drugInfoModal');
    if (oldModal) oldModal.remove();
}


// Display drug info inline (not modal)
function displayDrugInfoCard(data) {
    const container = document.getElementById('drugInfoCardContainer');
    if (container) container.innerHTML = '';
    if (!data || data.error) {
        if (container) {
            container.innerHTML = `<div class="notification error">${data && data.error ? data.error : 'No data found.'}</div>`;
        }
        return;
    }
    // Try to get a real drug image using RxImage API (fallback to OpenFDA or placeholder)
    let drugImgHtml = '';
    if (data.brand_name) {
        drugImgHtml = `<div id="drug-image-container"></div>`;
    } else {
        drugImgHtml = `<div class="no-image">No image available for this drug.</div>`;
    }
    container.innerHTML = `
        <div class="drug-info-inline">
            ${drugImgHtml}
            <h2 class="article-title">${data.brand_name || 'Drug Info'}</h2>
            <div class="article-meta">Manufacturer: ${data.manufacturer || 'Unknown'}</div>
            <div class="article-body">
                <strong>Usage:</strong> <span>${data.usage || 'N/A'}</span><br>
                <strong>Directions:</strong> <span>${data.directions || 'N/A'}</span><br>
                <strong>Side Effects:</strong> <span>${data.side_effects || 'N/A'}</span><br>
                <strong>Warnings:</strong> <span>${data.warnings || 'N/A'}</span><br>
            </div>
            <div class="article-body">
                <strong>Interactions:</strong>
                <ul>
                    ${(data.interactions && data.interactions.length > 0) ? data.interactions.map(i => `<li><b>${i.interacts_with}</b>: ${i.description}</li>`).join('') : '<li>None found</li>'}
                </ul>
            </div>
        </div>
    `;
    // Fetch and display RxImage if possible, else fallback to Wikimedia Commons
    if (data.brand_name) {
        fetch(`https://rximage.nlm.nih.gov/api/rximage/1/rxnav?name=${encodeURIComponent(data.brand_name)}`)
            .then(resp => resp.json())
            .then(imgData => {
                const imgContainer = document.getElementById('drug-image-container');
                if (imgData.nlmRxImages && imgData.nlmRxImages.length > 0) {
                    imgContainer.innerHTML = `<img src="${imgData.nlmRxImages[0].imageUrl}" alt="${data.brand_name}" style="max-width:120px;max-height:120px;border-radius:1rem;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.10);margin-bottom:1rem;">`;
                } else {
                    // Fallback to Wikimedia Commons
                    fetchWikimediaDrugImage(data.brand_name);
                }
            })
            .catch(() => {
                fetchWikimediaDrugImage(data.brand_name);
            });
    }

// Fallback: fetch drug image from Wikimedia Commons
function fetchWikimediaDrugImage(drugName) {
    const imgContainer = document.getElementById('drug-image-container');
    // Wikimedia Commons API: search for images related to the drug name
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&generator=search&gsrsearch=file:${encodeURIComponent(drugName)}|${encodeURIComponent(drugName)}%20pill|${encodeURIComponent(drugName)}%20tablet|${encodeURIComponent(drugName)}%20drug&gsrlimit=1&piprop=thumbnail&pithumbsize=300`;
    fetch(apiUrl)
        .then(resp => resp.json())
        .then(data => {
            if (data.query && data.query.pages) {
                const pages = Object.values(data.query.pages);
                if (pages.length > 0 && pages[0].thumbnail && pages[0].thumbnail.source) {
                    imgContainer.innerHTML = `<img src="${pages[0].thumbnail.source}" alt="${drugName}" style="max-width:120px;max-height:120px;border-radius:1rem;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.10);margin-bottom:1rem;">`;
                    return;
                }
            }
            // If Wikimedia fails, show a generic pharmacy image
            imgContainer.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Prescription_medication.png" alt="Pharmacy" style="max-width:120px;max-height:120px;border-radius:1rem;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.10);margin-bottom:1rem;">`;
        })
        .catch(() => {
            imgContainer.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Prescription_medication.png" alt="Pharmacy" style="max-width:120px;max-height:120px;border-radius:1rem;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.10);margin-bottom:1rem;">`;
        });
}
}

// Fetch drug data and display
async function fetchDrugDataAndDisplay(drugName) {
    try {
        const response = await fetch(`/api/drug-info?name=${encodeURIComponent(drugName)}`);
        const data = await response.json();
        displayDrugInfoCard(data);
    } catch (error) {
        displayDrugInfoCard({ error: 'Failed to connect to the server.' });
    }
}

// UI Functions
function showLoading() {
    console.log("Loading...");
    if (loadingElement) loadingElement.style.display = 'block';
}

function hideLoading() {
    console.log("Done loading");
    if (loadingElement) loadingElement.style.display = 'none';
}

// Initialization
function initializeApp() {
    // Load theme
    const togglerSpans = document.querySelectorAll('.theme-toggler span');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme-variables');
        togglerSpans[1].classList.add('active');
        togglerSpans[0].classList.remove('active');
    } else {
        document.body.classList.remove('dark-theme-variables');
        togglerSpans[0].classList.add('active');
        togglerSpans[1].classList.remove('active');
    }

    // Theme toggler event
    const themeToggler = document.querySelector('.theme-toggler');
    if (themeToggler) {
        themeToggler.addEventListener('click', toggleTheme);
    }

    // Search bar logic
    const drugSearchForm = document.getElementById('drugSearchForm');
    if (drugSearchForm) {
        drugSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const input = document.getElementById('drugSearchInput');
            const drugName = input.value.trim();
            if (!drugName) return;
            showDrugInfoLoading();
            await fetchDrugDataAndDisplay(drugName);
        });
    }

    // Render most searched drugs
    renderMostSearchedDrugs();
}

// Most Searched Drugs Data (static for demo, can be dynamic)
const MOST_SEARCHED = [
    {
        name: "Paracetamol",
        brand: "Tylenol",
        info: "Pain reliever and fever reducer."
    },
    {
        name: "Ibuprofen",
        brand: "Advil",
        info: "Nonsteroidal anti-inflammatory drug (NSAID)."
    },
    {
        name: "Amoxicillin",
        brand: "Amoxil",
        info: "Antibiotic for bacterial infections."
    },
    {
        name: "Metformin",
        brand: "Glucophage",
        info: "Used to treat type 2 diabetes."
    },
    {
        name: "Amlodipine",
        brand: "Norvasc",
        info: "Calcium channel blocker for hypertension."
    }
];

function renderMostSearchedDrugs() {
    const container = document.getElementById('mostSearchedDrugs');
    if (!container) return;
    container.innerHTML = '';
        // Drug images (local mapping, fallback to pharmacy.png)
        const drugImages = {
            Paracetamol: 'static/images/paracetamol.jpg',
            Ibuprofen: 'static/images/ibuprofen.jpg',
            Amoxicillin: 'static/images/amoxicillin.jpg',
            Metformin: 'static/images/metformin.jpg',
            Amlodipine: 'static/images/amlodipine.jpg',
        };
        MOST_SEARCHED.forEach(drug => {
            const card = document.createElement('div');
            card.className = 'advice-card';
            const imgSrc = drugImages[drug.name] || 'static/images/pharmacy.png';
            card.innerHTML = `
                <img src="${imgSrc}" alt="${drug.name}" style="width:100px;height:100px;border-radius:1rem;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.10);margin-bottom:1rem;">
                <div class="advice-title">${drug.name} <span style="color:#2563eb;font-size:0.95rem;">(${drug.brand})</span></div>
                <div class="advice-text">${drug.info}</div>
            `;
            card.addEventListener('click', () => {
                document.getElementById('drugSearchInput').value = drug.name;
                showDrugInfoLoading();
                fetchDrugDataAndDisplay(drug.name);
            });
            container.appendChild(card);
        });
}
// Ensure app initializes after DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
