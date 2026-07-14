// Construction et téléchargement d'un fichier .ics (iCalendar) universel :
// compatible Google Agenda, Apple Calendar et Outlook.

function pad(n) { return String(n).padStart(2, "0"); }

function toICSDate(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

function escapeICS(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// `event` : { title, start (ISO string yyyy-mm-dd or Date), durationMin, description, location, url }
export function buildICS(event) {
  const start = new Date(event.start);
  const end = new Date(start.getTime() + (event.durationMin || 45) * 60000);
  const now = new Date();
  const uid = `thelabforge-${now.getTime()}-${start.getTime()}@thelabforge`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Lab Forge//Programme//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(now)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);
  if (event.url) lines.push(`URL:${escapeICS(event.url)}`);
  lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Rappel séance The Lab Forge", "TRIGGER:-PT30M", "END:VALARM");
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(event, filename) {
  const ics = buildICS(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "seance-thelabforge.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}