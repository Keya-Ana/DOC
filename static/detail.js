// detail.js
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function fetchDrugData(drugName) {
    const loader = document.getElementById('loader');
    const detail = document.getElementById('drugDetail');
    const errorDiv = document.getElementById('error');
    loader.style.display = 'block';
    detail.innerHTML = '';
    errorDiv.style.display = 'none';

    try {
        const response = await fetch(`/api/drug-info?name=${encodeURIComponent(drugName)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || response.statusText);
        }

        // Display data beautifully
        detail.innerHTML = `
            <h2>${drugName}</h2>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        loader.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const drug = getQueryParam('drug');
    if (drug) {
        fetchDrugData(drug);
    }
});