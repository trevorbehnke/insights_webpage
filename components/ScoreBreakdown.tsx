"use client";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Amenity } from "@/lib/types";
import { WALKING_IDEALS, CATEGORY_WEIGHTS } from "@/lib/scoring";

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurants",
  cafe: "Cafes & Coffee",
  bar: "Bars & Nightlife",
  grocery: "Grocery",
  park: "Parks",
  school: "Schools",
  pharmacy: "Pharmacy",
  transit: "Transit",
  shopping: "Shopping",
  gym: "Gyms",
  bank: "Banks & ATMs",
  entertainment: "Entertainment",
  medical: "Medical",
};

interface ScoreBreakdownProps {
  walking: Amenity[];
  driving: Amenity[];
  walkingScore: number;
  drivingScore: number;
}

export default function ScoreBreakdown({
  walking,
  driving,
  walkingScore,
  drivingScore,
}: ScoreBreakdownProps) {
  // Walking: count-based
  const walkingCounts: Record<string, number> = {};
  for (const a of walking) {
    walkingCounts[a.category] = (walkingCounts[a.category] || 0) + 1;
  }

  // Driving: nearest distance per category
  const nearest: Record<string, number> = {};
  for (const a of driving) {
    if (nearest[a.category] === undefined || a.distance_mi < nearest[a.category]) {
      nearest[a.category] = a.distance_mi;
    }
  }

  const categories = Object.keys(CATEGORY_WEIGHTS).sort(
    (a, b) => CATEGORY_WEIGHTS[b] - CATEGORY_WEIGHTS[a]
  );

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 600 }}>Score Breakdown</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* Walking Breakdown */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Walking Score ({walkingScore}/100)
        </Typography>
        <Box sx={{ mb: 3 }}>
          {categories.map((cat) => {
            const count = walkingCounts[cat] || 0;
            const ideal = WALKING_IDEALS[cat] || 1;
            const weight = CATEGORY_WEIGHTS[cat];
            const earned = Math.round(Math.min(count / ideal, 1.0) * weight * 10) / 10;
            const pct = (earned / weight) * 100;
            return (
              <Box key={cat} sx={{ display: "flex", alignItems: "center", mb: 0.75, gap: 1 }}>
                <Typography variant="body2" sx={{ width: 110, flexShrink: 0 }}>
                  {CATEGORY_LABELS[cat] || cat}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" sx={{ width: 70, textAlign: "right", flexShrink: 0 }}>
                  {count}/{ideal} found
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 55, textAlign: "right", flexShrink: 0 }}>
                  {earned}/{weight}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Driving Breakdown */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Driving Score ({drivingScore}/100)
        </Typography>
        <Box>
          {categories.map((cat) => {
            const dist = nearest[cat];
            const weight = CATEGORY_WEIGHTS[cat];
            const earned =
              dist !== undefined
                ? Math.round(Math.max(0, 1 - dist / 5) * weight * 10) / 10
                : 0;
            const pct = (earned / weight) * 100;
            return (
              <Box key={cat} sx={{ display: "flex", alignItems: "center", mb: 0.75, gap: 1 }}>
                <Typography variant="body2" sx={{ width: 110, flexShrink: 0 }}>
                  {CATEGORY_LABELS[cat] || cat}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" sx={{ width: 70, textAlign: "right", flexShrink: 0 }}>
                  {dist !== undefined ? `${dist} mi` : "none"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 55, textAlign: "right", flexShrink: 0 }}>
                  {earned}/{weight}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
