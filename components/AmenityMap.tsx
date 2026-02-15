"use client";
import { useState, useCallback } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Amenity } from "@/lib/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: "#e53935",
  cafe: "#8d6e63",
  bar: "#9c27b0",
  grocery: "#43a047",
  park: "#2e7d32",
  school: "#1565c0",
  pharmacy: "#00838f",
  transit: "#ef6c00",
  shopping: "#ad1457",
};

interface AmenityMapProps {
  lat: number;
  lng: number;
  amenities: Amenity[];
}

export default function AmenityMap({ lat, lng, amenities }: AmenityMapProps) {
  const [selected, setSelected] = useState<Amenity | null>(null);

  const handleMarkerClick = useCallback((amenity: Amenity) => {
    setSelected(amenity);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <Box
        sx={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#e0e0e0",
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary">
          Map unavailable — set NEXT_PUBLIC_MAPBOX_TOKEN
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, borderRadius: 2, overflow: "hidden" }}>
      <Map
        initialViewState={{
          latitude: lat,
          longitude: lng,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* Address pin */}
        <Marker latitude={lat} longitude={lng} anchor="bottom">
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: "#3f51b5",
              border: "3px solid white",
              borderRadius: "50%",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          />
        </Marker>

        {/* Amenity markers */}
        {amenities.map((a, i) => (
          <Marker
            key={i}
            latitude={a.lat}
            longitude={a.lng}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(a);
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: CATEGORY_COLORS[a.category] || "#757575",
                borderRadius: "50%",
                border: "2px solid white",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </Marker>
        ))}

        {selected && (
          <Popup
            latitude={selected.lat}
            longitude={selected.lng}
            anchor="bottom"
            onClose={() => setSelected(null)}
            closeOnClick={false}
          >
            <div>
              <strong>{selected.name}</strong>
              <br />
              <small>
                {selected.category} &middot; {selected.distance_mi} mi
              </small>
            </div>
          </Popup>
        )}
      </Map>
    </Box>
  );
}
