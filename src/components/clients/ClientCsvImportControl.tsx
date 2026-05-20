import { useRef, type ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "../ui/Button";
import type { BulkImportClientItem } from "../../redux/api/clientsApi";
import { getClientImportTemplateCsv } from "../../utils/clientImportTemplate";
import { parseClientsFromCsv } from "../../utils/parseClientsFromCsv";
import { validateImportedClients } from "../../utils/Validateimportedclients";

type BulkImportResponseLike = {
  message?: string;
  response?: {
    data?: {
      importedCount?: number;
      failedCount?: number;
    };
  };
};

type ClientCsvImportControlProps = {
  existingEmails: Set<string>;
  isImporting: boolean;
  onImportClients: (clients: BulkImportClientItem[]) => Promise<BulkImportResponseLike>;
  onImported: () => Promise<void> | void;
};

export function ClientCsvImportControl({
  existingEmails,
  isImporting,
  onImportClients,
  onImported,
}: ClientCsvImportControlProps) {
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportButtonClick = () => {
    csvInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([getClientImportTemplateCsv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "clients_import_template.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }

    try {
      const csvText = await file.text();
      const { rows, skippedRows } = parseClientsFromCsv(csvText);
      const validation = validateImportedClients(rows);
      const clients = validation.validRows;

      if (clients.length === 0) {
        const invalidMsg =
          validation.invalidCount > 0
            ? ` ${validation.invalidCount} row${validation.invalidCount === 1 ? "" : "s"} failed validation.`
            : "";
        alert(
          "No valid client rows found. CSV must include First Name, Surname/Last Name, and Email columns." +
            invalidMsg
        );
        return;
      }

      const clientsToImport = clients.filter(
        (client) => !existingEmails.has(String(client.email || "").trim().toLowerCase())
      );
      const duplicateRows = clients.length - clientsToImport.length;

      if (clientsToImport.length === 0) {
        alert(
          `No new clients to import. ${duplicateRows} row${duplicateRows === 1 ? "" : "s"} already exist${duplicateRows === 1 ? "s" : ""} by email.`
        );
        return;
      }

      const response = await onImportClients(clientsToImport);
      const importedCount = response?.response?.data?.importedCount;
      const failedCount = response?.response?.data?.failedCount;
      const importedSummary =
        typeof importedCount === "number" || typeof failedCount === "number"
          ? ` Imported: ${importedCount ?? 0}, Failed: ${failedCount ?? 0}.`
          : ` Sent: ${clientsToImport.length}.`;
      const skippedSummary = skippedRows > 0 ? ` Skipped rows: ${skippedRows}.` : "";
      const duplicateSummary = duplicateRows > 0 ? ` Existing emails skipped: ${duplicateRows}.` : "";
      const invalidSummary =
        validation.invalidCount > 0 ? ` Invalid rows: ${validation.invalidCount}.` : "";

      alert(
        (response?.message || "Clients imported successfully.") +
          importedSummary +
          skippedSummary +
          duplicateSummary +
          invalidSummary
      );
      await onImported();
    } catch (importError: any) {
      alert(importError?.data?.message || "Failed to import clients. Please check your CSV and try again.");
    }
  };

  return (
    <>
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleCsvImport}
      />
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleImportButtonClick}
        disabled={isImporting}
      >
        <Upload className="h-4 w-4" />
        {isImporting ? "Importing..." : "Import CSV"}
      </Button>
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleDownloadTemplate}
      >
        <Download className="h-4 w-4" />
        Template
      </Button>
    </>
  );
}
