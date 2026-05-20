import type { BulkImportClientItem } from "../redux/api/clientsApi";

export const CLIENT_IMPORT_TEMPLATE_HEADERS: Array<keyof BulkImportClientItem> = [
  "firstName",
  "lastName",
  "email",
  "dateOfBirth",
  "gender",
  "phoneNumber",
  "mobileNumber",
  "countryCode",
  "mobileCountryCode",
  "addressStreet",
  "addressCity",
  "addressPostcode",
  "presentingProblem",
  "note",
];

export const CLIENT_IMPORT_TEMPLATE_SAMPLE: string[] = [
  "Jane",
  "Doe",
  "jane@example.com",
  "1990-01-01",
  "female",
  "02070000000",
  "07123456789",
  "+44",
  "+44",
  "10 Downing Street",
  "London",
  "SW1A 2AA",
  "Anxiety symptoms",
  "Initial import sample row",
];

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const csvHeaderAliases: Array<{
  field: keyof BulkImportClientItem;
  aliases: string[];
}> = [
  { field: "firstName", aliases: ["firstname", "givenname"] },
  { field: "lastName", aliases: ["lastname", "surname", "familyname"] },
  { field: "email", aliases: ["email"] },
  { field: "dateOfBirth", aliases: ["dob", "dateofbirth"] },
  { field: "gender", aliases: ["gender"] },
  { field: "genderSelfDescribe", aliases: ["genderselfdescribe"] },
  { field: "phoneNumber", aliases: ["phonenumber", "phone", "homephone"] },
  { field: "mobileNumber", aliases: ["mobilenumber", "mobilephone", "mobile"] },
  { field: "countryCode", aliases: ["countrycode"] },
  { field: "mobileCountryCode", aliases: ["mobilecountrycode"] },
  { field: "address", aliases: ["address"] },
  { field: "addressStreet", aliases: ["street", "addressstreet"] },
  { field: "addressCity", aliases: ["city", "addresscity"] },
  { field: "addressPostcode", aliases: ["postcode", "zipcode", "addresspostcode"] },
  { field: "livingSituation", aliases: ["livingsituation"] },
  { field: "livingSituationOther", aliases: ["livingsituationother"] },
  { field: "mentalHealthServices", aliases: ["mentalhealthservices"] },
  { field: "mentalHealthServicesOther", aliases: ["mentalhealthservicesother"] },
  { field: "mentalHealthServicesDetails", aliases: ["mentalhealthservicesdetails"] },
  { field: "takesMedication", aliases: ["takesmedication"] },
  { field: "medicationDetails", aliases: ["medicationdetails"] },
  { field: "presentingProblem", aliases: ["presentingproblem"] },
  { field: "safetyRisk", aliases: ["safetyrisk"] },
  { field: "safetyDetails", aliases: ["safetydetails"] },
  { field: "gpName", aliases: ["gpname"] },
  { field: "surgeryName", aliases: ["surgeryname"] },
  { field: "surgeryStreet", aliases: ["surgerystreet"] },
  { field: "surgeryCity", aliases: ["surgerycity"] },
  { field: "surgeryPostcode", aliases: ["surgerypostcode"] },
  { field: "paymentMethod", aliases: ["paymentmethod"] },
  { field: "paymentOtherDetails", aliases: ["paymentotherdetails"] },
  { field: "insurerName", aliases: ["insurername"] },
  { field: "authorizationCode", aliases: ["authorizationcode"] },
  { field: "hearAboutUs", aliases: ["hearaboutus"] },
  { field: "hearAboutUsDetails", aliases: ["hearaboutusdetails"] },
  { field: "declarationAccepted", aliases: ["declarationaccepted"] },
  { field: "declarationFullName", aliases: ["declarationfullname"] },
  { field: "declarationSignature", aliases: ["declarationsignature"] },
  { field: "declarationDate", aliases: ["declarationdate"] },
  { field: "guardianName", aliases: ["guardianname"] },
  { field: "guardianSignature", aliases: ["guardiansignature"] },
  { field: "submittedAt", aliases: ["submittedat"] },
  { field: "insuranceProvider", aliases: ["insuranceprovider"] },
  { field: "insuranceNumber", aliases: ["insurancenumber", "nationalhealth"] },
  { field: "insuranceAuthorizationNumber", aliases: ["insuranceauthorizationnumber"] },
  { field: "note", aliases: ["note"] },
];

const csvHeaderToFieldMap: Record<string, keyof BulkImportClientItem> =
  csvHeaderAliases.reduce(
    (acc, { field, aliases }) => {
      aliases.forEach((alias) => {
        acc[alias] = field;
      });
      return acc;
    },
    {} as Record<string, keyof BulkImportClientItem>
  );

const arrayFields = new Set<keyof BulkImportClientItem>([
  "livingSituation",
  "mentalHealthServices",
  "hearAboutUs",
]);
const booleanFields = new Set<keyof BulkImportClientItem>(["declarationAccepted"]);
const phoneFields = new Set<keyof BulkImportClientItem>([
  "phoneNumber",
  "mobileNumber",
  "countryCode",
  "mobileCountryCode",
]);

const splitCsvLine = (line: string, delimiter: string) => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
};

export const parseClientsFromCsv = (csvText: string) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return { clients: [] as BulkImportClientItem[], skippedRows: 0 };
  }

  const delimiter =
    (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length
      ? ";"
      : ",";
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const fieldToColumnIndex = new Map<keyof BulkImportClientItem, number>();
  headers.forEach((header, index) => {
    const field = csvHeaderToFieldMap[header];
    if (field && !fieldToColumnIndex.has(field)) {
      fieldToColumnIndex.set(field, index);
    }
  });

  const firstNameIndex = fieldToColumnIndex.get("firstName") ?? -1;
  const lastNameIndex = fieldToColumnIndex.get("lastName") ?? -1;
  const emailIndex = fieldToColumnIndex.get("email") ?? -1;

  if (firstNameIndex === -1 || lastNameIndex === -1 || emailIndex === -1) {
    return { clients: [] as BulkImportClientItem[], skippedRows: lines.length - 1 };
  }

  const clients: BulkImportClientItem[] = [];
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i += 1) {
    const columns = splitCsvLine(lines[i], delimiter);
    const firstName = (columns[firstNameIndex] || "").trim();
    const lastName = (columns[lastNameIndex] || "").trim();
    const email = (columns[emailIndex] || "").trim();

    if (!firstName && !lastName && !email) continue;

    if (!firstName || !lastName || !email) {
      skippedRows += 1;
      continue;
    }

    const clientItem: BulkImportClientItem = { firstName, lastName, email };

    fieldToColumnIndex.forEach((columnIndex, field) => {
      if (field === "firstName" || field === "lastName" || field === "email") return;

      const rawValue = (columns[columnIndex] || "").trim();
      if (!rawValue) return;

      if (booleanFields.has(field)) {
        const normalized = rawValue.toLowerCase();
        clientItem[field] = (normalized === "true" || normalized === "yes" || normalized === "1") as never;
        return;
      }

      if (arrayFields.has(field)) {
        clientItem[field] = rawValue.split("|").map((part) => part.trim()).filter(Boolean) as never;
        return;
      }

      if (phoneFields.has(field)) {
        clientItem[field] = rawValue.replace(/[^\d+]/g, "") as never;
        return;
      }

      if (field === "address") {
        clientItem.address = { street: rawValue };
        return;
      }

      clientItem[field] = rawValue as never;
    });

    if (typeof clientItem.address === "string" && !clientItem.addressStreet) {
      clientItem.addressStreet = clientItem.address;
    }

    clients.push(clientItem);
  }

  return { clients, skippedRows };
};

export const getClientImportTemplateCsv = () =>
  `${CLIENT_IMPORT_TEMPLATE_HEADERS.join(",")}\n${CLIENT_IMPORT_TEMPLATE_SAMPLE.join(",")}\n`;
