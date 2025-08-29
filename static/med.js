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
    document.querySelectorAll('.theme-toggler span').forEach(span => {
        span.classList.toggle('active');
    });
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

// Display drug info in a modal above the card
function displayDrugInfoCard(data) {
    removeDrugInfoModal();
    const container = document.getElementById('drugInfoCardContainer');
    if (container) container.innerHTML = '';
    if (!data || data.error) {
        if (container) {
            container.innerHTML = `<div class="notification error">${data && data.error ? data.error : 'No data found.'}</div>`;
        }
        return;
    }
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'drug-info-modal';
    modal.id = 'drugInfoModal';
    modal.innerHTML = `
        <button class="close-modal" title="Close">&times;</button>
        <h2 class="article-title">${data.brand_name || 'Drug Info'}</h2>
        <div class="article-meta">Manufacturer: ${data.manufacturer || 'Unknown'}</div>
        <div class="article-body">
            <strong>Usage:</strong> <span>${data.usage || 'N/A'}</span><br>
            <strong>Side Effects:</strong> <span>${data.side_effects || 'N/A'}</span><br>
            <strong>Warnings:</strong> <span>${data.warnings || 'N/A'}</span><br>
        </div>
        <div class="article-body">
            <strong>Interactions:</strong>
            <ul>
                ${(data.interactions && data.interactions.length > 0) ? data.interactions.map(i => `<li><b>${i.interacts_with}</b>: ${i.description}</li>`).join('') : '<li>None found</li>'}
            </ul>
        </div>
    `;
    // Add close functionality
    modal.querySelector('.close-modal').onclick = function() {
        modal.remove();
    };
    document.body.appendChild(modal);
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
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme-variables');
        document.querySelector('.theme-toggler span:nth-child(2)').classList.add('active');
    }

    // Load data
    fetchMedicalData();

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
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
if (themeToggler) {
    themeToggler.addEventListener('click', toggleTheme);
}