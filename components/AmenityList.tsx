"use client";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Amenity } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurants",
  cafe: "Cafes & Coffee",
  bar: "Bars & Nightlife",
  grocery: "Grocery & Supermarkets",
  park: "Parks & Recreation",
  school: "Schools & Education",
  pharmacy: "Pharmacies & Medical",
  transit: "Public Transit",
  shopping: "Shopping & Retail",
};

interface AmenityListProps {
  amenities: Amenity[];
}

export default function AmenityList({ amenities }: AmenityListProps) {
  const grouped = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {});

  // Sort each group by distance
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a, b) => a.distance_mi - b.distance_mi);
  }

  const categories = Object.keys(grouped).sort();

  if (categories.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No amenities found nearby.
      </Typography>
    );
  }

  return (
    <>
      {categories.map((cat) => (
        <Accordion key={cat} defaultExpanded={grouped[cat].length <= 5}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 500 }}>
              {CATEGORY_LABELS[cat] || cat}
            </Typography>
            <Chip
              label={grouped[cat].length}
              size="small"
              sx={{ ml: 1 }}
              color="primary"
              variant="outlined"
            />
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <List dense disablePadding>
              {grouped[cat].map((a, i) => (
                <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={a.name}
                    secondary={`${a.distance_mi} mi`}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
