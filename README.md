# GreenWays 🌱

GreenWays is a modern, eco-friendly route planning web application that empowers users to make sustainable travel choices. By integrating with Google Maps and providing real-time carbon emission calculations, GreenWays helps you compare routes, save your journeys, and track your environmental impact over time. The app also features a dedicated Carbon Footprint Calculator for a holistic view of your lifestyle's carbon emissions.

---

## 🌟 Features

- **Route Comparison**: Compare multiple transportation modes (driving, transit, biking, walking) for any route.
- **Carbon Emission Calculation**: View the CO₂ emissions for each route option, based on official emission factors.
- **Personalized Route Suggestions**: Get recommendations to reduce your carbon footprint.
- **User Accounts**: Register and log in to save your favorite routes and track your history.
- **Route History**: Review your saved routes and monitor your environmental impact over time.
- **Carbon Footprint Calculator**: Calculate your monthly carbon footprint based on travel, home energy use, diet, waste, water, shopping, household size, fuel oil, propane, and recycling. View and manage your calculation history locally.
- **Responsive Design**: Enjoy a seamless experience on desktop, tablet, and mobile devices.
- **Dark Mode**: Switch between light and dark themes for comfortable viewing.

---

## 📚 Official Documentation & References

### Core Technologies
- [React](https://react.dev/) (Frontend library)
- [TypeScript](https://www.typescriptlang.org/) (Type safety)
- [Material UI (MUI)](https://mui.com/) (UI components)
- [Framer Motion](https://www.framer.com/motion/) (Animations)
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) (Backend server)
- [MongoDB](https://www.mongodb.com/) (Database)
- [Google Maps Platform](https://developers.google.com/maps/documentation) (Directions, Geocoding, Places APIs)

### Carbon Footprint Calculation References
- [UK Government GHG Conversion Factors](https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting) (Transport, energy, and fuel emission factors)
- [Our World in Data: Carbon Footprint of Foods](https://ourworldindata.org/carbon-footprint-food-methane) (Diet emission factors)
- [EPA: Greenhouse Gas Equivalencies Calculator](https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator)
- [IEA: Emissions Factors](https://www.iea.org/data-and-statistics/data-product/emissions-factors-2022)

### Other Resources
- [Google Cloud Console](https://console.cloud.google.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Material UI, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (Atlas or local)
- **APIs**: Google Maps Platform (Directions, Geocoding, Places)

---

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a Pull Request. For major changes, open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

# 🚀 Getting Started

## Prerequisites

- **Node.js and npm** (v14+ recommended)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google Maps API Key**

## API Keys Required

1. **Google Maps API Key**
   - Visit the [Google Cloud Platform Console](https://console.cloud.google.com/)
   - Enable:
     - Directions API
     - Maps JavaScript API
     - Geocoding API
     - Places API
   - Create an API key and set up HTTP referrer restrictions for security

## Environment Setup

### Server Setup
```bash
cd server
npm install
```
Create/edit the `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greenways
GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
```

### Client Setup
```bash
cd client
npm install
```
Create/edit the `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
```

## Running the Application

1. **Start the Backend**
   ```bash
   cd server
   npm run dev
   ```
2. **Start the Frontend**
   ```bash
   cd client
   npm start
   ```
3. **Access the Application**
   - Open your browser and go to: [http://localhost:3000](http://localhost:3000)

## Troubleshooting

- **API Connection Issues**: Check your API keys and enabled APIs. Use `/api/check` to verify server config.
- **Backend Connection Issues**: Ensure MongoDB is running and the URI is correct.
- **Mock Data Mode**: If MongoDB is unavailable, the app uses mock data (set `MOCK_API=true` in `client/src/services/api.ts` for testing).

---

## 🧮 Carbon Footprint Calculator: Field Instructions & References

The calculator uses the following fields. For each, you can use your actual data (recommended) or the average value provided if you don't know your own. Emission factors and averages are based on the [US EPA Household Carbon Footprint Calculator](https://www.epa.gov/ghgemissions/carbon-footprint-calculator), [Our World in Data](https://ourworldindata.org/co2/country/india), [India GHG Platform](https://ghgplatform-india.org/), and other official sources. Indian averages are used where available.

| Field | How to Find/Estimate | Average Value (if unknown, India) | Reference |
|-------|---------------------|----------------------------|-----------|
| **Primary Transport Mode & Distance** | Use your main mode of transport and estimate total km/month (use odometer, apps, or map tools). | Urban: 600 km/month/person (car), 200 km/month (bus), 100 km/month (train) | [NSSO, India GHG Platform](https://ghgplatform-india.org/) |
| **Car Fuel Efficiency** | Check your car manual or fuel receipts. | 18 km/litre (petrol), 22 km/litre (diesel) | [SIAM India](https://www.siam.in/statistics.aspx) |
| **Home Electricity Use (kWh/month)** | Check your electricity bill for kWh used per month. | 90 kWh/month/person (urban), 40 kWh/month/person (rural) | [CEA India](https://cea.nic.in/), [NSSO] |
| **Home Gas Use (PNG, m³/month)** | Check your gas bill for m³ used per month. | 15 m³/month/person (urban PNG) | [Indraprastha Gas](https://www.iglonline.net/) |
| **LPG Cylinder Use (kg/month)** | Check your LPG cylinder usage (14.2 kg/cylinder). | 1.2 cylinders/month/household (urban), 0.7 (rural) | [PPAC India](https://www.ppac.gov.in/) |
| **Coal Use (kg/month)** | Estimate or check purchase receipts. | 10 kg/month/person (rural, if used) | [India GHG Platform] |
| **Wood Use (kg/month)** | Estimate or check purchase receipts. | 20 kg/month/person (rural, if used) | [India GHG Platform] |
| **Propane/Bottled Gas (kg/month)** | Check your bill or estimate. | 0 (rare in India, use LPG field) | |
| **Fuel Oil Use (L/month)** | Check your bill or estimate. | 0 (rare in India, use LPG/PNG) | |
| **Air Conditioning (kWh/month)** | Check your bill or estimate hours used × power rating. | 60 kWh/month/AC (urban avg, 1.5 ton unit, 4 hrs/day) | [BEE India](https://beeindia.gov.in/) |
| **Appliances (kWh/month)** | Estimate based on appliance ratings and usage. | 30 kWh/month/person | [BEE India] |
| **Water Use (litres/month)** | Check your water bill or estimate. | 6,000 litres/month/person (urban) | [NITI Aayog] |
| **Diet Type** | Choose based on your eating habits: vegan, vegetarian, non-veg, heavy meat. | Veg: 0.7 tCO2/yr, Non-veg: 1.2 tCO2/yr | [Our World in Data], [India GHG Platform] |
| **Food Waste (kg/month)** | Estimate or check local waste data. | 4 kg/month/person | [FAO India] |
| **Shopping (Goods/Services, ₹/month)** | Estimate your monthly spend on goods/services. | ₹3,000/month/person (urban avg) | [NSSO] |
| **Household Size** | Number of people in your home. | 4.3 (urban), 4.8 (rural) | [Census 2011] |
| **Waste Generated (kg/month)** | Check your local waste bill or estimate. | 30 kg/month/person (urban), 15 kg/month (rural) | [MoHUA India] |
| **Recycling** | Do you recycle most household waste? | - | [MoHUA India] |

**Tips:**
- If you don't have a bill, use the average value for your country or region.
- For transport, you can use Google Maps or your car's odometer to estimate distance.
- For LPG, 1 cylinder = 14.2 kg. PNG is usually metered in m³.
- For shopping, include all goods and services you purchase in a month.
- For electricity, check the kWh on your bill, not the amount paid.
- For air conditioning, multiply hours used × power rating (in kW) × days/month.
- Recycling reduces your waste emissions by about 10%.
- Indian per capita carbon footprint: 1.8 tCO2/year (urban: 1.3–2.0, rural: 0.6–1.0) ([Our World in Data](https://ourworldindata.org/co2/country/india), [TOI](https://timesofindia.indiatimes.com/blogs/voices/importance-of-understanding-your-carbon-emissions/)).

**References:**
- [US EPA Household Carbon Footprint Calculator](https://www.epa.gov/ghgemissions/carbon-footprint-calculator)
- [Our World in Data: India CO2 Profile](https://ourworldindata.org/co2/country/india)
- [India GHG Platform](https://ghgplatform-india.org/)
- [CEA India Power Statistics](https://cea.nic.in/)
- [PPAC India LPG Data](https://www.ppac.gov.in/)
- [BEE India](https://beeindia.gov.in/)
- [MoHUA India Solid Waste Data](https://mohua.gov.in/)
- [NITI Aayog Water Data](https://niti.gov.in/)
- [Census 2011 Household Size](https://censusindia.gov.in/2011census/hlo/hlo_highlights.html)
- [Times of India: Carbon Emissions in India](https://timesofindia.indiatimes.com/blogs/voices/importance-of-understanding-your-carbon-emissions/)

For more details, see the official documentation links above.