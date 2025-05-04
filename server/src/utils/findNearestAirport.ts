import axios from 'axios';
import path from 'path';
import fs from 'fs';

const airportsPath = path.resolve(__dirname, '../../data/airports.json');
const airports = JSON.parse(fs.readFileSync(airportsPath, 'utf-8'));

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeLocation(location: string): Promise<{ lat: number; lng: number }> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    location
  )}&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await axios.get(url);
  if (
    res.data.status === 'OK' &&
    res.data.results &&
    res.data.results.length > 0
  ) {
    const { lat, lng } = res.data.results[0].geometry.location;
    return { lat, lng };
  }
  throw new Error('Could not geocode location');
}

export default async function findNearestAirport(location: string) {
  const { lat, lng } = await geocodeLocation(location);
  let minDist = Infinity;
  let nearest = null;
  for (const airport of airports) {
    const dist = getDistance(lat, lng, airport.lat, airport.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = airport;
    }
  }
  return nearest;
} 