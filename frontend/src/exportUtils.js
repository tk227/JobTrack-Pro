
export function exportJobsToCSV(jobs) {
  if (!jobs || jobs.length === 0) {
    alert("No job applications available to export.");
    return;
  }

  const columns = [
    { key: "company", label: "Company" },
    { key: "role", label: "Job Title" },
    { key: "location", label: "Location" },
    { key: "jobType", label: "Job Type" },
    { key: "salary", label: "Salary" },
    { key: "status", label: "Status" },
    { key: "appliedDate", label: "Applied Date" },
    { key: "jobUrl", label: "Job URL" },
  ];

  // Escape CSV values safely.
  function escapeCSV(value) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  const header = columns
    .map((column) => escapeCSV(column.label))
    .join(",");

  const rows = jobs.map((job) =>
    columns
      .map((column) => escapeCSV(job[column.key]))
      .join(",")
  );

  const csvContent = [header, ...rows].join("\n");

  // Add BOM so Excel handles UTF-8 correctly.
  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "JobTrack_Applications.csv";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
