"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HouseIcon from "@mui/icons-material/House";
import NatureIcon from "@mui/icons-material/Nature";
import LocationCityIcon from "@mui/icons-material/LocationCity";

const iconMap: Record<string, React.ReactNode> = {
  Urban: <ApartmentIcon sx={{ fontSize: 48, color: "#3f51b5" }} />,
  "Dense Suburban": <LocationCityIcon sx={{ fontSize: 48, color: "#009688" }} />,
  Suburban: <HouseIcon sx={{ fontSize: 48, color: "#ff9800" }} />,
  Rural: <NatureIcon sx={{ fontSize: 48, color: "#4caf50" }} />,
};

interface UrbanIndexProps {
  label: string;
  density: number;
}

export default function UrbanIndex({ label, density }: UrbanIndexProps) {
  return (
    <Card
      elevation={0}
      sx={{
        textAlign: "center",
        bgcolor: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <CardContent>
        {iconMap[label] || iconMap["Suburban"]}
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {density} amenities / sq mi
        </Typography>
      </CardContent>
    </Card>
  );
}
