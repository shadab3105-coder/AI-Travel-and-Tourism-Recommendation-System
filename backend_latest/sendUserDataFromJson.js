const https = require('https');
// URL of the JSON file
const user_json_url = "URL_OF_YOUR_JSON_FILE";

https.get(user_json_url, (res) => {
  let data = '';

  // A chunk of data has been received.
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received.
  res.on('end', () => {
    const jsonData = JSON.parse(data);

    // Access user_country_code and user_phone_number
    const user_country_code = jsonData.user_country_code;
    const user_phone_number = jsonData.user_phone_number;
    const user_first_name = jsonData.user_first_name;
    const user_last_name = jsonData.user_last_name;

    console.log("User Country Code:", user_country_code);
    console.log("User Phone Number:", user_phone_number);
    console.log("User First Name:", user_first_name);
    console.log("User Last name:", user_last_name);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
