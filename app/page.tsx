import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import SearchBar from "@/components/SearchBar";
import SearchHistory from "@/components/SearchHistory";

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}
        >
          Address Insights
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center" }}
        >
          Explore walking scores, driving scores, and neighborhood insights for
          any address.
        </Typography>
        <SearchBar />
        <SearchHistory />
      </Box>
    </Container>
  );
}
