"use client";

import { useState } from "react";
import { RadarDimension } from "@/types/decision";

interface RadarChartProps {
  dimensions: RadarDimension[];
  onSelectDimension?: (category: string) => void;
  selectedCategory?: string | null;
}

export default function RadarChart({
  dimensions,
  onSelectDimension,
  selectedCategory
}: RadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const size = 320;
  const center = size / 2;
  const maxRadius = 110;
  const total = dimensions.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (Math.max(15, Math.min(100, value)) / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const levels = [25, 50, 75, 100];
  const points = dimensions.map((d, i) => getCoordinates(d.score, i));
  const pointsString = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const getColor = (status: string) => {
    switch (status) {
      case "explored":
        return "#4eff8c";
      case "partially_explored":
        return "#ffb84e";
      case "needs_attention":
      default:
        return "#ff5555";
    }
  };

  const activeDim = hoveredIndex !== null ? dimensions[hoveredIndex] : dimensions.find(d => d.category === selectedCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: "visible" }}
          role="img"
          aria-label="Blind Spot Radar Chart"
        >
          {/* Circular Webs */}
          {levels.map(level => {
            const levelPoints = dimensions
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
                const r = (level / 100) * maxRadius;
                return `${(center + r * Math.cos(angle)).toFixed(1)},${(center + r * Math.sin(angle)).toFixed(1)}`;
              })
              .join(" ");

            return (
              <polygon
                key={level}
                points={levelPoints}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray={level === 100 ? "none" : "3 3"}
                opacity={0.7}
              />
            );
          })}

          {/* Radial Axis Lines */}
          {dimensions.map((dim, i) => {
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
            const edgeX = center + maxRadius * Math.cos(angle);
            const edgeY = center + maxRadius * Math.sin(angle);
            const isHovered = hoveredIndex === i || selectedCategory === dim.category;

            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={edgeX}
                y2={edgeY}
                stroke={isHovered ? "var(--primary)" : "var(--border)"}
                strokeWidth={isHovered ? 1.5 : 1}
                opacity={0.8}
              />
            );
          })}

          {/* Radar Filled Area */}
          <polygon
            points={pointsString}
            fill="rgba(78, 131, 255, 0.22)"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ transition: "all 0.5s ease" }}
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const dim = dimensions[i];
            const isHovered = hoveredIndex === i || selectedCategory === dim.category;
            const ptColor = getColor(dim.status);

            return (
              <g
                key={`pt-${i}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectDimension && onSelectDimension(dim.category)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 5}
                  fill={ptColor}
                  stroke="#0a0a0c"
                  strokeWidth="2"
                  style={{ transition: "all 0.2s ease" }}
                />
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill="none"
                    stroke={ptColor}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}

          {/* Category Labels */}
          {dimensions.map((dim, i) => {
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
            const labelRadius = maxRadius + 24;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);
            const isSelected = selectedCategory === dim.category || hoveredIndex === i;

            return (
              <text
                key={`label-${i}`}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? "#ffffff" : "var(--muted)"}
                fontSize={isSelected ? "11.5px" : "11px"}
                fontWeight={isSelected ? 600 : 500}
                style={{ cursor: "pointer", transition: "all 0.2s ease", userSelect: "none" }}
                onClick={() => onSelectDimension && onSelectDimension(dim.category)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {dim.category}
              </text>
            );
          })}
        </svg>

        {/* Center Indicator */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--primary)",
            boxShadow: "0 0 16px var(--primary)",
            pointerEvents: "none"
          }}
        />
      </div>

      {/* Explanatory Info Card */}
      {activeDim && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.85rem 1rem",
            background: "var(--surface)",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${getColor(activeDim.status)}`,
            width: "100%",
            maxWidth: "320px",
            fontSize: "0.85rem",
            animation: "fadeIn 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
            <span style={{ fontWeight: 600, color: "#fff" }}>{activeDim.category}</span>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                color: getColor(activeDim.status),
                fontWeight: 600
              }}
            >
              {activeDim.statusLabel} ({activeDim.score}%)
            </span>
          </div>
          <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
            {activeDim.whyNeedsAttention}
          </p>
        </div>
      )}
    </div>
  );
}
