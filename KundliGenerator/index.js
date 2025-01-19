const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const User = require('../models/userSchema');

async function fetchHorroscopeChart(){
    const options = {
        method: 'post',
        url: 'https://json.freeastrologyapi.com/horoscope-chart-svg-code',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY_ASTRO_APP,
        },
        data: {
            year: 2022,
            month: 8,
            date: 11,
            hours: 6,
            minutes: 0,
            seconds: 0,
            latitude: 17.38333,
            longitude: 78.4666,
            timezone: 5.5,
            config: {
            observation_point: 'topocentric',
            ayanamsha: 'lahiri',
            },
        },
        };
        try {
          const response = await axios(options);
          return response
        } catch(error){
            console.error(error);
            return;
        }
}

async function fetchNavamsaChart(){
    const options = {
        method: 'post',
        url: 'https://json.freeastrologyapi.com/navamsa-chart-svg-code',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY_ASTRO_APP,
        },
        data: {
          "year": 2022,
          "month": 8,
          "date": 11,
          "hours": 6,
          "minutes": 0,
          "seconds": 0,
          "latitude": 17.38333,
          "longitude": 78.4666,
          "timezone": 5.5,
          "config": {
            "observation_point": "topocentric",
            "ayanamsha": "lahiri"
          }
        }
      }
      try {
        const response = await axios(options);
        return response
      } catch(error){
          console.error(error);
          return;
      }
}

module.exports = async function convertPngToPdf(id) {
  let response;
  try {
    response = await User.findById({_id: id})
  } catch(error){
    console.log(error);
    return;
  }
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  const HorroscopeChart = await fetchHorroscopeChart();
  const NavamsaChart = await fetchNavamsaChart();
  
  const user = response;
  const Name = user.name, DOB = user.dateOfBirth, TOB = user.timeOfBirth, Gender = user.gender, City = user.city, State = user.state, Country = user.country, zodiacSign = user.zodiacSign;
  const data = {
    Name: Name,
    DOB: DOB,
    TOB: TOB,
    Gender: Gender,
    City: City,
    State: State,
    Country: Country,
    zodiacSign: zodiacSign,
    HorroscopeChart: `${JSON.stringify(HorroscopeChart.data.output)}`,
    NavamsaChart: `${JSON.stringify(NavamsaChart.data.output)}`
  }
  return (data);
//   const htmlContent = `
//     <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Astrological Data</title>
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       margin: 0;
//       padding: 20px;
//       background-color: #f9f9f9;
//       color: #333;
//     }
//     .details {
//       margin-bottom: 20px;
//       padding: 15px;
//       background: #ffffff;
//       border: 1px solid #ddd;
//       border-radius: 8px;
//       box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//     }
//     .details p {
//       margin: 5px 0;
//       font-size: 16px;
//     }
//     .charts {
//       display: flex;
//       flex-direction: column;
//       gap: 20px;
//     }
//     .chart {
//       padding: 15px;
//       background: #ffffff;
//       border: 1px solid #ddd;
//       border-radius: 8px;
//       box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//     }
//   </style>
// </head>
// <body>
//   <div class="details">
//     <p><strong>Name:</strong> ${Name}</p>
//     <p><strong>Date of Birth:</strong> ${DOB}</p>
//     <p><strong>Time of Birth:</strong> ${TOB}</p>
//     <p><strong>Gender:</strong> ${Gender}</p>
//     <p><strong>City:</strong> ${City}</p>
//     <p><strong>State:</strong> ${State}</p>
//     <p><strong>Country:</strong> ${Country}</p>
//     <p><strong>Zodiac Sign:</strong> ${zodiacSign}</p>
//   </div>

//   <div class="charts">
//     <div class="chart">
//       ${HorroscopeChart.data.output}
//     </div>
//     <div class="chart">
//       ${NavamsaChart.data.output}
//     </div>
//   </div>
// </body>
// </html>
//     `;
    
  // Set the HTML content for the page
  // await page.setContent(htmlContent);

  // // Generate the PDF from the HTML
  // await page.pdf({ path: `${id}.pdf`, format: 'A4' });

  // await browser.close();
  // console.log('PDF created successfully!');
}

