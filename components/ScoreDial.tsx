"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function getColor(score: number): string {
  if (score >= 70) return "#4caf50";
  if (score >= 40) return "#ff9800";
  return "#f44336";
}

interface ScoreDialProps {
  score: number;
  label: string;
}

export default function ScoreDial({ score, label }: ScoreDialProps) {
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getColor(score);

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth={stroke}
          />
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <Typography
          variant="h4"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontWeight: 700,
            color,
          }}
        >
          {score}
        </Typography>
      </Box>
      <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}
