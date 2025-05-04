import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import PlantButton from '../components/PlantButton';
import CircularProgress from '@mui/material/CircularProgress';

// Factors for calculation (simplified for user-friendliness)
const TRANSPORT_MODES = [
  { label: 'Car (Petrol)', value: 'car_petrol', factor: 0.21 }, // kg CO2/km
  { label: 'Car (Diesel)', value: 'car_diesel', factor: 0.17 },
  { label: 'Bus', value: 'bus', factor: 0.10 },
  { label: 'Train', value: 'train', factor: 0.04 },
  { label: 'Bicycle/Walk', value: 'bike_walk', factor: 0 },
  { label: 'Flight (Economy)', value: 'flight', factor: 0.15 },
];
const DIET_TYPES = [
  { label: 'Vegan', value: 'vegan', factor: 1.5 }, // tons CO2/year
  { label: 'Vegetarian', value: 'vegetarian', factor: 1.7 },
  { label: 'Omnivore', value: 'omnivore', factor: 2.5 },
  { label: 'Heavy Meat Eater', value: 'meat', factor: 3.3 },
];
const ENERGY_FACTORS = {
  electricity: 0.233, // kg CO2/kWh (global avg)
  naturalGas: 2.2,    // kg CO2/m3
};

// Add new constants for additional fields and factors
const WASTE_FACTOR = 0.373; // kg CO2/person/day (EPA avg, ~136 kg/year)
const WATER_FACTOR = 0.298; // kg CO2/m3 (EPA avg, ~0.298 kg per 1000L)
const FUEL_OIL_FACTOR = 2.68; // kg CO2/L (EPA)
const PROPANE_FACTOR = 1.51; // kg CO2/L (EPA)

// Add/Update constants for Indian context and metric units
const LPG_FACTOR = 2.98; // kg CO2/kg LPG (India avg)
const PNG_FACTOR = 1.89; // kg CO2/m³ PNG (India avg)
const COAL_FACTOR = 2.42; // kg CO2/kg coal (India avg)
const WOOD_FACTOR = 0.1; // kg CO2/kg wood (biomass, net zero if sustainably sourced)
const AC_FACTOR = 0.82; // kg CO2/kWh (India avg grid emission factor)
const APPLIANCE_FACTOR = 0.82; // kg CO2/kWh (India avg grid emission factor)
const FOOD_WASTE_FACTOR = 1.9; // kg CO2/kg food waste (FAO, India)
const SHOPPING_FACTOR = 0.0005; // kg CO2/₹ (estimate, India)

// Add constants for Indian and global average footprints (monthly, in kg)
const INDIA_AVG_MONTHLY = 150; // 1.8 tCO2/year = 150 kg/month
const WORLD_AVG_MONTHLY = 333; // 4 tCO2/year = 333 kg/month

interface Calculation {
  date: string;
  transport: string;
  distance: number;
  homeElectricity: number;
  homeGas: number;
  lpg: number;
  coal: number;
  wood: number;
  ac: number;
  appliances: number;
  foodWaste: number;
  shoppingInr: number;
  diet: string;
  householdSize: number;
  waste: number;
  water: number;
  recycling: boolean;
  result: number;
}

// Add AI feedback logic
function getFootprintFeedback(user: number) {
  if (user < INDIA_AVG_MONTHLY && user < WORLD_AVG_MONTHLY) {
    return {
      message: "🌱 Excellent! Your carbon footprint is below both the Indian and global averages. Keep up your sustainable lifestyle!",
      color: "success"
    };
  } else if (user > INDIA_AVG_MONTHLY && user < WORLD_AVG_MONTHLY) {
    return {
      message: "👍 Your footprint is below the global average, but above the Indian average. Consider small changes like reducing energy use, using public transport, or minimizing waste to lower it further.",
      color: "warning"
    };
  } else if (user >= WORLD_AVG_MONTHLY) {
    return {
      message: "⚠️ Your carbon footprint is above both the Indian and global averages. Try tips like switching to LED bulbs, using public transport, eating more plant-based meals, and recycling more to reduce your impact.",
      color: "error"
    };
  } else {
    return {
      message: "Your carbon footprint is close to the average. Every small step helps!",
      color: "info"
    };
  }
}

const CarbonFootprintCalculator: React.FC = () => {
  const theme = useTheme();
  // Form state
  const [transport, setTransport] = useState('car_petrol');
  const [distance, setDistance] = useState('');
  const [homeElectricity, setHomeElectricity] = useState('');
  const [homeGas, setHomeGas] = useState('');
  const [diet, setDiet] = useState('omnivore');
  const [householdSize, setHouseholdSize] = useState('1');
  const [waste, setWaste] = useState('');
  const [water, setWater] = useState('');
  const [lpg, setLpg] = useState('');
  const [coal, setCoal] = useState('');
  const [wood, setWood] = useState('');
  const [ac, setAc] = useState('');
  const [appliances, setAppliances] = useState('');
  const [foodWaste, setFoodWaste] = useState('');
  const [shoppingInr, setShoppingInr] = useState('');
  const [recycling, setRecycling] = useState(false);
  // Results
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<Calculation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  // Add Gemini feedback state (must be inside component)
  const [geminiFeedback, setGeminiFeedback] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Calculate carbon footprint
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(distance) || 0;
    const elec = parseFloat(homeElectricity) || 0;
    const gas = parseFloat(homeGas) || 0;
    const lpgVal = parseFloat(lpg) || 0;
    const coalVal = parseFloat(coal) || 0;
    const woodVal = parseFloat(wood) || 0;
    const acVal = parseFloat(ac) || 0;
    const appliancesVal = parseFloat(appliances) || 0;
    const foodWasteVal = parseFloat(foodWaste) || 0;
    const shoppingVal = parseFloat(shoppingInr) || 0;
    const wasteVal = parseFloat(waste) || 0;
    const waterVal = parseFloat(water) || 0;
    const household = parseInt(householdSize) || 1;
    const transportFactor = TRANSPORT_MODES.find(m => m.value === transport)?.factor || 0;
    const dietFactor = DIET_TYPES.find(d => d.value === diet)?.factor || 0;
    // Calculation (annualized for diet/shopping, monthly for others)
    const transportCO2 = dist * transportFactor;
    const electricityCO2 = elec * AC_FACTOR; // Use Indian grid factor
    const gasCO2 = gas * PNG_FACTOR;
    const lpgCO2 = lpgVal * LPG_FACTOR;
    const coalCO2 = coalVal * COAL_FACTOR;
    const woodCO2 = woodVal * WOOD_FACTOR;
    const acCO2 = acVal * AC_FACTOR;
    const appliancesCO2 = appliancesVal * APPLIANCE_FACTOR;
    const foodWasteCO2 = foodWasteVal * FOOD_WASTE_FACTOR;
    const shoppingCO2 = shoppingVal * SHOPPING_FACTOR;
    const wasteCO2 = wasteVal > 0 ? wasteVal : household * 30; // 30 kg/month/person
    const waterCO2 = waterVal * WATER_FACTOR;
    const dietCO2 = (dietFactor * 1000) / 12; // monthly
    let total = transportCO2 + electricityCO2 + gasCO2 + lpgCO2 + coalCO2 + woodCO2 + acCO2 + appliancesCO2 + foodWasteCO2 + shoppingCO2 + wasteCO2 + waterCO2 + dietCO2;
    if (recycling) total *= 0.9; // 10% reduction for recycling
    setResult(total);
    setHistory(prev => [{
      date: new Date().toLocaleString(),
      transport,
      distance: dist,
      homeElectricity: elec,
      homeGas: gas,
      lpg: lpgVal,
      coal: coalVal,
      wood: woodVal,
      ac: acVal,
      appliances: appliancesVal,
      foodWaste: foodWasteVal,
      shoppingInr: shoppingVal,
      diet,
      householdSize: household,
      waste: wasteVal,
      water: waterVal,
      recycling,
      result: total,
    }, ...prev]);
  };

  // When result changes, fetch Gemini feedback
  useEffect(() => {
    if (result !== null) {
      // Build breakdown object
      const breakdown: Record<string, number> = {
        Transport: parseFloat(distance) * (TRANSPORT_MODES.find(m => m.value === transport)?.factor || 0),
        Electricity: parseFloat(homeElectricity) * AC_FACTOR,
        PNG: parseFloat(homeGas) * PNG_FACTOR,
        LPG: parseFloat(lpg) * LPG_FACTOR,
        Coal: parseFloat(coal) * COAL_FACTOR,
        Wood: parseFloat(wood) * WOOD_FACTOR,
        AC: parseFloat(ac) * AC_FACTOR,
        Appliances: parseFloat(appliances) * APPLIANCE_FACTOR,
        FoodWaste: parseFloat(foodWaste) * FOOD_WASTE_FACTOR,
        Shopping: parseFloat(shoppingInr) * SHOPPING_FACTOR,
        Waste: parseFloat(waste) > 0 ? parseFloat(waste) : (parseInt(householdSize) || 1) * 30,
        Water: parseFloat(water) * WATER_FACTOR,
        Diet: (DIET_TYPES.find(d => d.value === diet)?.factor || 0) * 1000 / 12,
      };
      fetchGeminiFeedback(result, breakdown);
    } else {
      setGeminiFeedback(null);
    }
    // eslint-disable-next-line
  }, [result]);

  // Add Gemini feedback function
  async function fetchGeminiFeedback(footprint: number, breakdown: Record<string, number>) {
    setGeminiLoading(true);
    setGeminiError(null);
    setGeminiFeedback(null);
    const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `You are a world-class sustainability coach. Given the following user's monthly carbon footprint and breakdown, compare it to the Indian average (150 kg/month) and world average (333 kg/month). Give:
- A short, motivating summary (compliment if below both, encouragement if above, tips if high)
- 2-3 actionable, practical tips to reduce their footprint, referencing their highest categories
- Use only plain text, no markdown, no formatting
- Make it friendly, positive, and easy to read

USER FOOTPRINT: ${footprint.toFixed(1)} kg CO2/month
INDIA AVG: 150 kg/month
WORLD AVG: 333 kg/month
BREAKDOWN:
${Object.entries(breakdown).map(([k, v]) => `${k}: ${v} kg`).join('\n')}
`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await response.json();
      setGeminiFeedback(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback available.');
    } catch (error) {
      setGeminiError('Could not fetch personalized feedback at this time.');
    } finally {
      setGeminiLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mt: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
          Carbon Footprint Calculator
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Estimate your monthly carbon footprint based on your travel, home energy, and diet. All data stays on this page.
        </Typography>
        <Box component="form" onSubmit={handleCalculate}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                label="Primary Transport Mode"
                value={transport}
                onChange={e => setTransport(e.target.value)}
                fullWidth
                required
                helperText="Select your main mode of transport. India avg: Car (urban): 600 km/month, Bus: 200 km/month, Train: 100 km/month."
              >
                {TRANSPORT_MODES.map(mode => (
                  <MenuItem key={mode.value} value={mode.value}>{mode.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Distance Travelled per Month (km)"
                value={distance}
                onChange={e => setDistance(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                required
                inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                helperText="Enter total km travelled per month. India avg: Car (urban): 600 km/month/person. Use Google Maps or odometer if unsure."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Home Electricity Use per Month (kWh)"
                value={homeElectricity}
                onChange={e => setHomeElectricity(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                required
                inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                helperText="Check your electricity bill for kWh used per month. India avg: 90 kWh/month/person (urban), 40 (rural)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Home Gas Use per Month (m³, PNG)"
                value={homeGas}
                onChange={e => setHomeGas(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                required
                inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                helperText="Check your piped gas bill for m³ used per month. India avg: 15 m³/month/person (urban PNG)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Diet Type"
                value={diet}
                onChange={e => setDiet(e.target.value)}
                fullWidth
                required
                helperText="Choose based on your eating habits. India avg: Veg: 0.7 tCO2/yr, Non-veg: 1.2 tCO2/yr."
              >
                {DIET_TYPES.map(d => (
                  <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Household Size"
                value={householdSize}
                onChange={e => setHouseholdSize(e.target.value.replace(/[^\d]/g, ''))}
                fullWidth
                required
                helperText="Number of people in your household. India avg: 4.3 (urban), 4.8 (rural)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Waste Generated per Month (kg)"
                value={waste}
                onChange={e => setWaste(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Check your local waste bill or estimate. If unsure, EPA avg: 136 kg/year/person."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Water Use per Month (m³)"
                value={water}
                onChange={e => setWater(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Check your water bill for monthly usage in m³. If unsure, EPA avg: 9.5 m³/month/person."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="LPG Use per Month (kg)"
                value={lpg}
                onChange={e => setLpg(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Check your LPG cylinder usage. 1 cylinder = 14.2 kg. India avg: 1.2 cylinders/month/household (urban)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Coal Use per Month (kg)"
                value={coal}
                onChange={e => setCoal(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Estimate or check purchase receipts. India avg: 10 kg/month/person (rural, if used)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Wood Use per Month (kg)"
                value={wood}
                onChange={e => setWood(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Estimate or check purchase receipts. India avg: 20 kg/month/person (rural, if used)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Air Conditioning Use per Month (kWh)"
                value={ac}
                onChange={e => setAc(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Estimate hours used × power rating (in kW) × days/month. India avg: 60 kWh/month/AC (urban, 1.5 ton, 4 hrs/day)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Appliance Use per Month (kWh)"
                value={appliances}
                onChange={e => setAppliances(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Estimate based on appliance ratings and usage. India avg: 30 kWh/month/person."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Food Waste per Month (kg)"
                value={foodWaste}
                onChange={e => setFoodWaste(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Estimate or check local waste data. India avg: 4 kg/month/person."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Shopping per Month (₹)"
                value={shoppingInr}
                onChange={e => setShoppingInr(e.target.value.replace(/[^\d.]/g, ''))}
                fullWidth
                helperText="Estimate your monthly spend on goods/services. India avg: ₹3,000/month/person (urban)."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Do you recycle most household waste?"
                value={recycling ? 'yes' : 'no'}
                onChange={e => setRecycling(e.target.value === 'yes')}
                fullWidth
                helperText="Recycling reduces your waste emissions by about 10% (EPA)."
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <PlantButton type="submit" size="large">
                Calculate
              </PlantButton>
              <IconButton color="primary" onClick={() => setShowHistory(true)} aria-label="Show previous calculations">
                <HistoryIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                View History
              </Typography>
            </Grid>
          </Grid>
        </Box>
        {result !== null && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.dark }}>
              Estimated Monthly Carbon Footprint
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: theme.palette.secondary.main, mt: 1 }}>
              {result.toFixed(1)} kg CO₂
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              (Includes travel, home energy, and lifestyle)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              India avg: ~150 kg/month | World avg: ~333 kg/month
            </Typography>
            <Box sx={{ mt: 3 }}>
              {geminiLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
              {geminiError && <Typography color="error" sx={{ mt: 2 }}>{geminiError}</Typography>}
              {geminiFeedback && !geminiLoading && (
                <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>{geminiFeedback}</Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>
      {/* History Modal */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Previous Calculations
          <IconButton onClick={() => setShowHistory(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {history.length === 0 ? (
            <Typography color="text.secondary">No previous calculations yet.</Typography>
          ) : (
            history.map((item, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 2, background: theme.palette.background.default }}>
                <Typography variant="subtitle2" color="text.secondary">{item.date}</Typography>
                <Typography variant="body2">
                  <b>Transport:</b> {TRANSPORT_MODES.find(m => m.value === item.transport)?.label} ({item.distance} km/month)
                </Typography>
                <Typography variant="body2">
                  <b>Electricity:</b> {item.homeElectricity} kWh/month, <b>Gas:</b> {item.homeGas} m³/month
                </Typography>
                <Typography variant="body2">
                  <b>Diet:</b> {DIET_TYPES.find(d => d.value === item.diet)?.label}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <b>Total:</b> {item.result.toFixed(1)} kg CO₂/month
                </Typography>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <PlantButton onClick={() => setShowHistory(false)} size="medium">
            Close
          </PlantButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarbonFootprintCalculator; 