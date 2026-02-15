"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { decodeSlug } from "@/lib/slugs";
import {
  calcWalkingScore,
  calcDrivingScore,
  calcUrbanIndex,
} from "@/lib/scoring";
import { addToHistory } from "@/lib/history";
import { Amenity } from "@/lib/types";
import ScoreDial from "@/components/ScoreDial";
import UrbanIndex from "@/components/UrbanIndex";
import AmenityMap from "@/components/AmenityMap";
import AmenityList from "@/components/AmenityList";

export default function InsightsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { lat, lng, address } = decodeSlug(slug);

  const [walking, setWalking] = useState<Amenity[]>([]);
  const [driving, setDriving] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/amenities?lat=${lat}&lng=${lng}`
        );
        const data = await res.json();
        setWalking(data.walking || []);
        setDriving(data.driving || []);
      } catch {
        // API error — scores will show as 0
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    addToHistory({ address, lat, lng, slug, timestamp: Date.now() });
  }, [lat, lng, address, slug]);

  const walkingScore = calcWalkingScore(walking);
  const drivingScore = calcDrivingScore(driving);
  const { label: urbanLabel, density } = calcUrbanIndex(walking);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 1 }}
        >
          Back to Search
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {address}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {lat}, {lng}
        </Typography>
      </Box>

      {/* Score Cards */}
      {loading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Skeleton variant="circular" width={130} height={130} sx={{ mx: "auto" }} />
                <Skeleton width="60%" sx={{ mx: "auto", mt: 1 }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <ScoreDial score={walkingScore} label="Walking Score" />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <ScoreDial score={drivingScore} label="Driving Score" />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UrbanIndex label={urbanLabel} density={density} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Map */}
      <Paper sx={{ mb: 4, overflow: "hidden" }}>
        <AmenityMap lat={lat} lng={lng} amenities={loading ? [] : driving} />
      </Paper>

      {/* Amenity Details */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Nearby Amenities
      </Typography>
      {loading ? (
        <Box>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={60} sx={{ mb: 1 }} />
          ))}
        </Box>
      ) : (
        <AmenityList amenities={driving} />
      )}
    </Container>
  );
}
