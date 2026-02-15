"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { GeoResult } from "@/lib/types";
import { encodeSlug } from "@/lib/slugs";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(data.results?.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (result: GeoResult) => {
    setOpen(false);
    setQuery(result.place_name);
    const slug = encodeSlug(result.lat, result.lng, result.place_name);
    router.push(`/address/${slug}`);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 600 }}>
      <TextField
        fullWidth
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search for an address..."
        variant="outlined"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white",
            borderRadius: 3,
          },
        }}
      />
      {open && results.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            mt: 0.5,
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          <List dense>
            {results.map((r, i) => (
              <ListItemButton key={i} onMouseDown={() => handleSelect(r)}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LocationOnIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={r.place_name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}
