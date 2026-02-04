const https = require('https');
const fs = require('fs');

const API_KEY = "23561375701e4fb2a27f25900526233a";
const REPLICA_ID = "rfe12d8b9597"; // Mark

const postData = JSON.stringify({
    "persona_name": "Mark - Tech Lead",
    "default_replica_id": REPLICA_ID,
    "system_prompt": "You are Mark, a Senior Technology Lead and professional interviewer. You are conducting a mock technical interview. You are professional, structured, and technically sharp. Keep answers concise and spoken naturally. Do not use markdown. Do not mention being an AI.",
    "context": "Professional mock interview setting. Assessment of technical skills."
});

const options = {
    hostname: 'tavusapi.com',
    port: 443,
    path: '/v2/personas',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Content-Length': postData.length
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            console.log("Response Status:", res.statusCode);
            const jsonData = JSON.parse(data);
            if (jsonData.persona_id) {
                fs.writeFileSync('c:/Users/shree/opecs/frontend/new_persona_id.txt', jsonData.persona_id);
                console.log("SUCCESS: ID written to file.");
            } else {
                fs.writeFileSync('c:/Users/shree/opecs/frontend/new_persona_id.txt', "ERROR_NO_ID: " + JSON.stringify(jsonData));
            }
        } catch (e) {
            fs.writeFileSync('c:/Users/shree/opecs/frontend/new_persona_id.txt', "ERROR_PARSE: " + e.message + " | Data: " + data);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
    fs.writeFileSync('c:/Users/shree/opecs/frontend/new_persona_id.txt', "ERROR_REQ: " + e.message);
});

req.write(postData);
req.end();
