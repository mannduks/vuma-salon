"use client";

export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length || typeof window === "undefined") {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCsvCell(String(row[header] ?? "")))
        .join(",")
    )
  ];

  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;"
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string) {
  const escaped = value.replaceAll('"', '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}
