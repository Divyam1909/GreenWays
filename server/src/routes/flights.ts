import express from 'express';
import axios from 'axios';
import findNearestAirport from '../utils/findNearestAirport';

const router = express.Router();
const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;

// GET /api/flights?origin=...&destination=...
router.get('/', async (req, res) => {
  const { origin, destination } = req.query;
  if (!origin || !destination) {
    return res.status(400).json({ message: 'Origin and destination required' });
  }

  try {
    const originAirport = await findNearestAirport(origin as string);
    const destAirport = await findNearestAirport(destination as string);

    if (!originAirport || !destAirport) {
      return res.status(404).json({ message: 'Could not find airports for the given locations.' });
    }

    // Call Aviationstack API
    const url = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&dep_iata=${originAirport.iata}&arr_iata=${destAirport.iata}`;
    const response = await axios.get(url);

    const flights = (response.data.data || []).map((flight: any) => ({
      airline: flight.airline?.name,
      flight_number: flight.flight?.iata,
      departure: flight.departure?.scheduled,
      arrival: flight.arrival?.scheduled,
      dep_airport: flight.departure?.airport,
      arr_airport: flight.arrival?.airport,
      status: flight.flight_status,
    }));

    res.json({ flights, originAirport, destAirport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch flights' });
  }
});

export default router; 