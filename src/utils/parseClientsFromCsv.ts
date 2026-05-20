import type { BulkImportClientItem } from "../redux/api/clientsApi";
import { parseClientsFromCsv as parseRawClientsFromCsv } from "./clientImport";

export interface ParsedClientRow {
  rowNumber: number;
  data: BulkImportClientItem;
}

export interface ParsedClientCsvResult {
  rows: ParsedClientRow[];
  skippedRows: number;
}

export const parseClientsFromCsv = (csvText: string): ParsedClientCsvResult => {
  const { clients, skippedRows } = parseRawClientsFromCsv(csvText);
  const rows: ParsedClientRow[] = clients.map((client, index) => ({
    // +2 because CSV data starts on line 2 (after header row)
    rowNumber: index + 2,
    data: client,
  }));

  return { rows, skippedRows };
};

