import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 modules don't have __dirname, so we need to recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your .env file
const envPath = path.resolve(__dirname, '../.env');

// Backend URLs based on the environment
const backendUrls = {
    localhost: 'http://localhost:8000',
    ngrok: 'https://1d2c-203-128-16-121.ngrok-free.app'  // Replace this with your actual Ngrok URL
};

// Get the environment from the command-line argument
const env = process.argv[2];

if (!env || !backendUrls[env]) {
    console.error(`Invalid or missing environment argument. Use 'localhost' or 'ngrok'.`);
    process.exit(1);
}

const newBackendUrl = backendUrls[env];

// Read the .env file
fs.readFile(envPath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading the .env file: ${err}`);
        process.exit(1);
    }

    // Replace the existing REACT_APP_BACKEND_URL with the new one
    const updatedEnv = data.replace(
        /^REACT_APP_BACKEND_URL=.*$/m, // Match the REACT_APP_BACKEND_URL line
        `REACT_APP_BACKEND_URL=${newBackendUrl}` // Replace with the new URL
    );

    // Write the updated content back to the .env file
    fs.writeFile(envPath, updatedEnv, 'utf8', (err) => {
        if (err) {
            console.error(`Error writing to the .env file: ${err}`);
            process.exit(1);
        }
        console.log(`Successfully updated REACT_APP_BACKEND_URL to ${newBackendUrl}`);
    });
});
