"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import HistoryIcon from "@mui/icons-material/History";
import { getHistory } from "@/lib/history";
import { HistoryEntry } from "@/lib/types";

export default function SearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <Paper elevation={1} sx={{ mt: 4, width: "100%", maxWidth: 600 }}>
      <Typography
        variant="subtitle2"
        sx={{ px: 2, pt: 2, pb: 1, color: "text.secondary" }}
      >
        Recent Searches
      </Typography>
      <List dense>
        {history.map((entry) => (
          <ListItemButton
            key={entry.slug}
            onClick={() => router.push(`/address/${entry.slug}`)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <HistoryIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
              primary={entry.address}
              secondary={new Date(entry.timestamp).toLocaleDateString()}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
