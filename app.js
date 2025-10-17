const express = require('express');
const axios = require('axios');
const path = require('path');

// --- Configuration and Constants ---
const app = express();
const PORT = 5000;
const CAT_FACT_API_URL = "https://catfact.ninja/fact";
const EXTERNAL_API_TIMEOUT = 20000; // 20 seconds in milliseconds

// --- Core Profile Data ---
const API_PROFILE_DATA = {
    "email": "eacontent1@gmail.com",
    "name": "Eniola Agboola",
    "stack": "Node.js/Express" 
};

/**
 * Fetches a random cat fact from the external API with robust error handling.
 * @returns {string} The fetched cat fact or a detailed error message.
 */
async function getDynamicCatFact() {
    try {
        console.log("Fetching new cat fact...");

        // Axios request with timeout handling
        const response = await axios.get(CAT_FACT_API_URL, {
            timeout: EXTERNAL_API_TIMEOUT
        });

        // The external API returns { fact: "...", length: ... }
        const factText = response.data.fact;

        if (factText) {
            console.log("Cat fact successfully retrieved.");
            return factText;
        }

        console.warn("Cat Fact API returned a response, but the 'fact' field was empty.");
        return "Fact retrieval failed: Data field missing from external API.";
            
    } catch (error) {
        let errorMessage = "Fact retrieval failed: External API connection error.";
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            errorMessage = `Fact retrieval failed: External API timeout after ${EXTERNAL_API_TIMEOUT / 1000} seconds.`;
        } else if (error.response) {
            // Handle HTTP error status codes (4xx/5xx)
            errorMessage = `Fact retrieval failed: External API returned status ${error.response.status}.`;
        }
        
        console.error(`Error fetching Cat Fact API: ${errorMessage}`, error.message);
        return errorMessage;
    }
}

// --- Required Endpoint: GET /me ---
app.get('/me', async (req, res) => {
    
    // 1. Fetch Dynamic Data
    const catFact = await getDynamicCatFact();
    
    // 2. Generate Dynamic Timestamp (ISO 8601 format ending in 'Z' for UTC)
    const currentUtcTimestamp = new Date().toISOString();
    
    // 3. Construct the Final Response Object (Strict Schema Adherence)
    const finalResponseData = {
        "status": "success",
        "user": API_PROFILE_DATA,
        "timestamp": currentUtcTimestamp,
        "fact": catFact
    };

    // 4. Return the response
    // Setting Content-Type: application/json and status 200 OK
    res.status(200).json(finalResponseData);
});

// --- Simple Root Endpoint ---
app.get('/', (req, res) => {
    res.json({
        "message": "Welcome to the Dynamic Profile API (Node.js/Express).",
        "instructions": "Access the required endpoint for the profile and cat fact data.",
        "endpoint": "/me"
    });
});

// --- Server Startup ---
app.listen(PORT, () => {
    console.log("---------------------------------------------------------------------");
    console.log(`API is running on http://localhost:${PORT}`);
    console.log(`Access the required endpoint at: http://localhost:${PORT}/me`);
    console.log("---------------------------------------------------------------------");
});