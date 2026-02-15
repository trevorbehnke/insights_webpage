export function encodeSlug(lat: number, lng: number, address: string): string {
  const addressPart = address
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${lat.toFixed(4)},${lng.toFixed(4)},${encodeURIComponent(addressPart)}`;
}

export function decodeSlug(slug: string): {
  lat: number;
  lng: number;
  address: string;
} {
  const decoded = decodeURIComponent(slug);
  const firstComma = decoded.indexOf(",");
  const secondComma = decoded.indexOf(",", firstComma + 1);

  const lat = parseFloat(decoded.slice(0, firstComma));
  const lng = parseFloat(decoded.slice(firstComma + 1, secondComma));
  const address = decoded.slice(secondComma + 1).replace(/-/g, " ");

  return { lat, lng, address };
}
