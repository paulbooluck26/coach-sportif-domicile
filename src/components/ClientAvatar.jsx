import React from "react";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ClientAvatar({ name, photoUrl, size = 48, className = "", ring = false }) {
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center bg-secondary/15 text-secondary font-heading font-semibold flex-shrink-0 select-none ${ring ? "ring-2 ring-border" : ""} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name || ""} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}