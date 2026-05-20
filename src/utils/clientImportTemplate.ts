/**
 * Fixed-layout CSV template for bulk client import.
 *
 * COLUMN ORDER IS FIXED — do not reorder. The parser reads by position.
 * Array fields use pipe-separated values e.g. "Living alone|Living with partner"
 * Boolean fields accept: true / false / yes / no / 1 / 0
 */

// ─── Valid enum values (mirrors backend Joi schema) ───────────────────────────

export const GENDER_VALUES = [
  "Female",
  "Male",
  "Non-binary",
  "Prefer to self-describe",
  "Prefer not to say",
] as const;

export const LIVING_SITUATION_VALUES = [
  "Living alone",
  "Living with partner",
  "Caring for children under 5",
  "Caring for children over 5",
  "Living with parents / guardian",
  "Living with other relatives / friends",
  "Full-time carer",
  "Living in shared accommodation",
  "Living in temporary accommodation",
  "Living in institution / hospital",
  "Other",
] as const;

export const MENTAL_HEALTH_SERVICE_VALUES = [
  "GP",
  "Psychologist",
  "Psychiatrist",
  "Counsellor / Therapist",
  "Hospital inpatient",
  "Other (e.g. religious / community)",
] as const;

export const PAYMENT_METHOD_VALUES = [
  "Self-paying",
  "Health insurance",
  "Employee Assistance Programme (EAP)",
  "Other",
] as const;

export const HEAR_ABOUT_US_VALUES = [
  "Google / online search",
  "Psychology Today",
  "Counselling Directory",
  "Word of mouth / recommendation",
  "Social media",
  "GP referral",
  "Other website",
] as const;

// ─── Column definitions ───────────────────────────────────────────────────────

/**
 * Each entry defines a column at a fixed position in the CSV.
 * `field` maps to BulkImportClientItem keys.
 * `header` is the exact string used in the CSV header row.
 * `description` appears in the template comment row.
 */
export interface CsvColumnDefinition {
  field: string;
  header: string;
  required: boolean;
  description: string;
  example: string;
}

export const CSV_COLUMNS: CsvColumnDefinition[] = [
  // ── Required ──────────────────────────────────────────────────────────────
  {
    field: "firstName",
    header: "firstName",
    required: true,
    description: "REQUIRED. Client first name.",
    example: "Jane",
  },
  {
    field: "lastName",
    header: "lastName",
    required: true,
    description: "REQUIRED. Client last name.",
    example: "Doe",
  },
  {
    field: "email",
    header: "email",
    required: true,
    description: "REQUIRED. Valid email address.",
    example: "jane.doe@example.com",
  },

  // ── Personal ──────────────────────────────────────────────────────────────
  {
    field: "dateOfBirth",
    header: "dateOfBirth",
    required: false,
    description:
      "Date of birth. Format: YYYY-MM-DD. Must not be in the future.",
    example: "1990-01-15",
  },
  {
    field: "gender",
    header: "gender",
    required: false,
    description: `Gender. Accepted values: ${GENDER_VALUES.join(" | ")}`,
    example: "Female",
  },
  {
    field: "genderSelfDescribe",
    header: "genderSelfDescribe",
    required: false,
    description: 'Required only when gender is "Prefer to self-describe".',
    example: "",
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  {
    field: "countryCode",
    header: "countryCode",
    required: false,
    description:
      "Country dialling code. Required if phoneNumber is provided. Format: +44",
    example: "+44",
  },
  {
    field: "phoneNumber",
    header: "phoneNumber",
    required: false,
    description: "Phone number digits only. Min 7, max 20 digits.",
    example: "02070000000",
  },

  // ── Address ───────────────────────────────────────────────────────────────
  {
    field: "addressStreet",
    header: "addressStreet",
    required: false,
    description: "Street address.",
    example: "10 Downing Street",
  },
  {
    field: "addressCity",
    header: "addressCity",
    required: false,
    description: "City.",
    example: "London",
  },
  {
    field: "addressPostcode",
    header: "addressPostcode",
    required: false,
    description: "Postcode or ZIP code.",
    example: "SW1A 2AA",
  },

  // ── Living situation ──────────────────────────────────────────────────────
  {
    field: "livingSituation",
    header: "livingSituation",
    required: false,
    description: `Pipe-separated list. Accepted values: ${LIVING_SITUATION_VALUES.join(" | ")}`,
    example: "Living alone",
  },
  {
    field: "livingSituationOther",
    header: "livingSituationOther",
    required: false,
    description: 'Required when livingSituation includes "Other".',
    example: "",
  },

  // ── Mental health ─────────────────────────────────────────────────────────
  {
    field: "mentalHealthServices",
    header: "mentalHealthServices",
    required: false,
    description: `Pipe-separated list. Accepted values: ${MENTAL_HEALTH_SERVICE_VALUES.join(" | ")}`,
    example: "GP|Psychologist",
  },
  {
    field: "mentalHealthServicesOther",
    header: "mentalHealthServicesOther",
    required: false,
    description:
      'Required when mentalHealthServices includes "Other (e.g. religious / community)".',
    example: "",
  },
  {
    field: "mentalHealthServicesDetails",
    header: "mentalHealthServicesDetails",
    required: false,
    description:
      "Additional details about mental health services. Max 5000 characters.",
    example: "",
  },

  // ── Medication ────────────────────────────────────────────────────────────
  {
    field: "takesMedication",
    header: "takesMedication",
    required: false,
    description: "Does the client take medication? Accepted values: Yes | No",
    example: "No",
  },
  {
    field: "medicationDetails",
    header: "medicationDetails",
    required: false,
    description: 'Required when takesMedication is "Yes". Max 5000 characters.',
    example: "",
  },

  // ── Clinical ──────────────────────────────────────────────────────────────
  {
    field: "presentingProblem",
    header: "presentingProblem",
    required: false,
    description: "Description of the presenting problem. Max 5000 characters.",
    example: "Anxiety and low mood",
  },
  {
    field: "safetyRisk",
    header: "safetyRisk",
    required: false,
    description: "Is there a safety risk? Accepted values: Yes | No",
    example: "No",
  },
  {
    field: "safetyDetails",
    header: "safetyDetails",
    required: false,
    description: 'Required when safetyRisk is "Yes". Max 5000 characters.',
    example: "",
  },

  // ── GP / Surgery ──────────────────────────────────────────────────────────
  {
    field: "gpName",
    header: "gpName",
    required: false,
    description: "GP name. Max 255 characters.",
    example: "Dr Smith",
  },
  {
    field: "surgeryName",
    header: "surgeryName",
    required: false,
    description: "Surgery / practice name. Max 255 characters.",
    example: "City Health Centre",
  },
  {
    field: "surgeryStreet",
    header: "surgeryStreet",
    required: false,
    description: "Surgery street address. Max 255 characters.",
    example: "1 Medical Lane",
  },
  {
    field: "surgeryCity",
    header: "surgeryCity",
    required: false,
    description: "Surgery city. Max 100 characters.",
    example: "London",
  },
  {
    field: "surgeryPostcode",
    header: "surgeryPostcode",
    required: false,
    description: "Surgery postcode. Max 30 characters.",
    example: "EC1A 1BB",
  },

  // ── Payment ───────────────────────────────────────────────────────────────
  {
    field: "paymentMethod",
    header: "paymentMethod",
    required: false,
    description: `Payment method. Accepted values: ${PAYMENT_METHOD_VALUES.join(" | ")}`,
    example: "Self-paying",
  },
  {
    field: "paymentOtherDetails",
    header: "paymentOtherDetails",
    required: false,
    description: 'Required when paymentMethod is "Other". Max 255 characters.',
    example: "",
  },
  {
    field: "insurerName",
    header: "insurerName",
    required: false,
    description:
      'Required when paymentMethod is "Health insurance" or "Employee Assistance Programme (EAP)". Max 255 characters.',
    example: "",
  },
  {
    field: "authorizationCode",
    header: "authorizationCode",
    required: false,
    description:
      'Required when paymentMethod is "Health insurance" or "Employee Assistance Programme (EAP)". Max 255 characters.',
    example: "",
  },
  {
    field: "insuranceProvider",
    header: "insuranceProvider",
    required: false,
    description: "Insurance provider name. Max 200 characters.",
    example: "",
  },
  {
    field: "insuranceNumber",
    header: "insuranceNumber",
    required: false,
    description: "Insurance / policy number. Max 100 characters.",
    example: "",
  },
  {
    field: "insuranceAuthorizationNumber",
    header: "insuranceAuthorizationNumber",
    required: false,
    description: "Insurance authorisation number. Max 100 characters.",
    example: "",
  },

  // ── Referral ──────────────────────────────────────────────────────────────
  {
    field: "hearAboutUs",
    header: "hearAboutUs",
    required: false,
    description: `Pipe-separated list. Accepted values: ${HEAR_ABOUT_US_VALUES.join(" | ")}`,
    example: "Google / online search",
  },
  {
    field: "hearAboutUsDetails",
    header: "hearAboutUsDetails",
    required: false,
    description:
      "Additional details about how they heard about us. Max 5000 characters.",
    example: "",
  },

  // ── Notes ─────────────────────────────────────────────────────────────────
  {
    field: "note",
    header: "note",
    required: false,
    description: "Internal note. Max 1000 characters.",
    example: "Referred by colleague",
  },
];

// ─── Template generators ──────────────────────────────────────────────────────

/** Quote a CSV cell value, escaping internal double-quotes. */
const quoteCsvCell = (value: string): string => {
  const needsQuoting =
    value.includes(",") || value.includes('"') || value.includes("\n");
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
};

/**
 * Returns the downloadable CSV template as a string.
 * Row 1: column headers
 * Row 2: descriptions (prefixed with #) so spreadsheet apps show them as a comment row
 * Row 3: example data row
 */
export const getClientImportTemplateCsv = (): string => {
  const headerRow = CSV_COLUMNS.map((col) => quoteCsvCell(col.header)).join(
    ",",
  );
  const descriptionRow = CSV_COLUMNS.map((col) =>
    quoteCsvCell(`# ${col.description}`),
  ).join(",");
  const exampleRow = CSV_COLUMNS.map((col) => quoteCsvCell(col.example)).join(
    ",",
  );

  return [headerRow, descriptionRow, exampleRow, ""].join("\n");
};

/** Returns the ordered list of field names, matching CSV column positions. */
export const CSV_FIELD_ORDER = CSV_COLUMNS.map((col) => col.field);
