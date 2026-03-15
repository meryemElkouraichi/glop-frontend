const axios = require('axios');

// Simulate moving an athlete along the Seine river
const startLat = 48.8350;
const startLon = 2.3730;
const endLat = 48.8650;
const endLon = 2.2950;

const totalSteps = 100;
let currentStep = 0;

const ATHLETE_ID = 'b7d03a55-2a62-4b2a-8dcd-2a1c87a53f09'; // UUID factice

const simulateStep = async () => {
    if (currentStep > totalSteps) {
        currentStep = 0; // Loop back
    }

    const progress = currentStep / totalSteps;
    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLon = startLon + (endLon - startLon) * progress;

    const payload = {
        athleteId: ATHLETE_ID,
        nom: 'Léon Marchand (Simulation)',
        latitude: currentLat + (Math.random() - 0.5) * 0.001, // add tiny jitter
        longitude: currentLon + (Math.random() - 0.5) * 0.001
    };

    try {
        await axios.post('http://localhost:8080/api/tracking/update', payload);
        console.log(`[${new Date().toLocaleTimeString()}] Sent position: ${currentLat.toFixed(4)}, ${currentLon.toFixed(4)}`);
    } catch (error) {
        console.error('Failed to send tracking update:', error.message);
    }

    currentStep++;
};

console.log("Starting athlete tracking simulation...");
setInterval(simulateStep, 2000); // Update every 2 seconds
