import type { BulkImportClientItem } from "../redux/api/clientsApi";
import type { ParsedClientRow } from "./parseClientsFromCsv";
import {
  GENDER_VALUES,
  LIVING_SITUATION_VALUES,
  MENTAL_HEALTH_SERVICE_VALUES,
  PAYMENT_METHOD_VALUES,
  HEAR_ABOUT_US_VALUES,
} from "./clientImportTemplate";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FieldError {
  field: string;
  message: string;
}

export interface RowValidationResult {
  rowNumber: number;
  valid: boolean;
  errors: FieldError[];
  /** The coerced, valid client item — only present when valid is true. */
  client?: BulkImportClientItem;
}

export interface ValidationSummary {
  validRows: BulkImportClientItem[];
  invalidRows: RowValidationResult[];
  /** All rows (valid and invalid) with their result. */
  allResults: RowValidationResult[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]+$/;
const COUNTRY_CODE_RE = /^\+?[0-9]{1,4}$/;

const err = (field: string, message: string): FieldError => ({
  field,
  message,
});

const isValidDate = (value: string): boolean => {
  if (!ISO_DATE_RE.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
};

const isDateInFuture = (value: string): boolean => {
  return new Date(value) > new Date();
};

// ─── Per-field validators ─────────────────────────────────────────────────────

/**
 * Validates a single parsed client row against the bulk import Joi schema rules.
 * Mirrors: bulkImportClientItem in client.validation.ts
 */
const validateRow = (row: ParsedClientRow): RowValidationResult => {
  const errors: FieldError[] = [];
  const d = row.data;

  // ── Required fields ────────────────────────────────────────────────────────

  if (!d.firstName || d.firstName.trim().length === 0) {
    errors.push(err("firstName", "First name is required"));
  } else if (d.firstName.length > 100) {
    errors.push(err("firstName", "First name cannot exceed 100 characters"));
  }

  if (!d.lastName || d.lastName.trim().length === 0) {
    errors.push(err("lastName", "Last name is required"));
  } else if (d.lastName.length > 100) {
    errors.push(err("lastName", "Last name cannot exceed 100 characters"));
  }

  if (!d.email || d.email.trim().length === 0) {
    errors.push(err("email", "Email is required"));
  } else if (!EMAIL_RE.test(d.email)) {
    errors.push(err("email", "Email must be a valid email address"));
  }

  // ── Date of birth ──────────────────────────────────────────────────────────

  if (d.dateOfBirth !== undefined) {
    const dobStr = String(d.dateOfBirth);
    if (!isValidDate(dobStr)) {
      errors.push(
        err(
          "dateOfBirth",
          "Date of birth must be a valid date in YYYY-MM-DD format",
        ),
      );
    } else if (isDateInFuture(dobStr)) {
      errors.push(err("dateOfBirth", "Date of birth cannot be in the future"));
    }
  }

  // ── Gender ─────────────────────────────────────────────────────────────────

  if (d.gender !== undefined) {
    const validGenders: readonly string[] = GENDER_VALUES;
    if (!validGenders.includes(d.gender)) {
      errors.push(
        err("gender", `Gender must be one of: ${GENDER_VALUES.join(", ")}`),
      );
    }
  }

  if (d.gender === "Prefer to self-describe") {
    if (!d.genderSelfDescribe || d.genderSelfDescribe.trim().length === 0) {
      errors.push(
        err(
          "genderSelfDescribe",
          'genderSelfDescribe is required when gender is "Prefer to self-describe"',
        ),
      );
    }
  }

  if (d.genderSelfDescribe && d.genderSelfDescribe.length > 255) {
    errors.push(
      err(
        "genderSelfDescribe",
        "Gender self-description cannot exceed 255 characters",
      ),
    );
  }

  // ── Phone ──────────────────────────────────────────────────────────────────

  if (d.phoneNumber !== undefined) {
    if (!PHONE_RE.test(d.phoneNumber)) {
      errors.push(
        err(
          "phoneNumber",
          "Phone number must contain only numbers and valid characters (+, -, space, parentheses)",
        ),
      );
    } else if (d.phoneNumber.replace(/\D/g, "").length < 7) {
      errors.push(err("phoneNumber", "Phone number must be at least 7 digits"));
    } else if (d.phoneNumber.length > 20) {
      errors.push(
        err("phoneNumber", "Phone number cannot exceed 20 characters"),
      );
    }

    // countryCode is required when phoneNumber is provided
    if (!d.countryCode || d.countryCode.trim().length === 0) {
      errors.push(
        err(
          "countryCode",
          "Country code is required when phone number is provided",
        ),
      );
    }
  }

  if (d.countryCode !== undefined && d.phoneNumber === undefined) {
    errors.push(
      err(
        "countryCode",
        "Country code should not be provided without a phone number",
      ),
    );
  }

  if (d.countryCode !== undefined) {
    if (!COUNTRY_CODE_RE.test(d.countryCode)) {
      errors.push(
        err(
          "countryCode",
          "Country code must be a valid format (e.g., +1, +44)",
        ),
      );
    }
  }

  // ── Address ────────────────────────────────────────────────────────────────

  if (d.addressStreet && d.addressStreet.length > 255) {
    errors.push(
      err("addressStreet", "Street address cannot exceed 255 characters"),
    );
  }
  if (d.addressCity && d.addressCity.length > 100) {
    errors.push(err("addressCity", "City cannot exceed 100 characters"));
  }
  if (d.addressPostcode && d.addressPostcode.length > 30) {
    errors.push(err("addressPostcode", "Postcode cannot exceed 30 characters"));
  }

  // ── Living situation ───────────────────────────────────────────────────────

  if (d.livingSituation !== undefined) {
    const validValues: readonly string[] = LIVING_SITUATION_VALUES;
    const invalidValues = d.livingSituation.filter(
      (v) => !validValues.includes(v),
    );
    if (invalidValues.length > 0) {
      errors.push(
        err(
          "livingSituation",
          `Invalid living situation value(s): ${invalidValues.join(", ")}. Accepted: ${LIVING_SITUATION_VALUES.join(", ")}`,
        ),
      );
    }

    if (d.livingSituation.includes("Other")) {
      if (
        !d.livingSituationOther ||
        d.livingSituationOther.trim().length === 0
      ) {
        errors.push(
          err(
            "livingSituationOther",
            'livingSituationOther is required when livingSituation includes "Other"',
          ),
        );
      }
    }
  }

  if (d.livingSituationOther && d.livingSituationOther.length > 255) {
    errors.push(
      err(
        "livingSituationOther",
        "Living situation other cannot exceed 255 characters",
      ),
    );
  }

  // ── Mental health services ─────────────────────────────────────────────────

  if (d.mentalHealthServices !== undefined) {
    const validValues: readonly string[] = MENTAL_HEALTH_SERVICE_VALUES;
    const invalidValues = d.mentalHealthServices.filter(
      (v) => !validValues.includes(v),
    );
    if (invalidValues.length > 0) {
      errors.push(
        err(
          "mentalHealthServices",
          `Invalid mental health service value(s): ${invalidValues.join(", ")}. Accepted: ${MENTAL_HEALTH_SERVICE_VALUES.join(", ")}`,
        ),
      );
    }

    if (d.mentalHealthServices.includes("Other (e.g. religious / community)")) {
      if (
        !d.mentalHealthServicesOther ||
        d.mentalHealthServicesOther.trim().length === 0
      ) {
        errors.push(
          err(
            "mentalHealthServicesOther",
            'mentalHealthServicesOther is required when mentalHealthServices includes "Other (e.g. religious / community)"',
          ),
        );
      }
    }
  }

  if (d.mentalHealthServicesOther && d.mentalHealthServicesOther.length > 255) {
    errors.push(
      err(
        "mentalHealthServicesOther",
        "Mental health services other cannot exceed 255 characters",
      ),
    );
  }

  if (
    d.mentalHealthServicesDetails &&
    d.mentalHealthServicesDetails.length > 5000
  ) {
    errors.push(
      err(
        "mentalHealthServicesDetails",
        "Mental health services details cannot exceed 5000 characters",
      ),
    );
  }

  // ── Medication ─────────────────────────────────────────────────────────────

  if (d.takesMedication !== undefined) {
    if (d.takesMedication !== "Yes" && d.takesMedication !== "No") {
      errors.push(
        err("takesMedication", 'takesMedication must be "Yes" or "No"'),
      );
    }

    if (d.takesMedication === "Yes") {
      if (!d.medicationDetails || d.medicationDetails.trim().length === 0) {
        errors.push(
          err(
            "medicationDetails",
            'medicationDetails is required when takesMedication is "Yes"',
          ),
        );
      }
    }
  }

  if (d.medicationDetails && d.medicationDetails.length > 5000) {
    errors.push(
      err(
        "medicationDetails",
        "Medication details cannot exceed 5000 characters",
      ),
    );
  }

  // ── Clinical ───────────────────────────────────────────────────────────────

  if (d.presentingProblem && d.presentingProblem.length > 5000) {
    errors.push(
      err(
        "presentingProblem",
        "Presenting problem cannot exceed 5000 characters",
      ),
    );
  }

  if (d.safetyRisk !== undefined) {
    if (d.safetyRisk !== "Yes" && d.safetyRisk !== "No") {
      errors.push(err("safetyRisk", 'safetyRisk must be "Yes" or "No"'));
    }

    if (d.safetyRisk === "Yes") {
      if (!d.safetyDetails || d.safetyDetails.trim().length === 0) {
        errors.push(
          err(
            "safetyDetails",
            'safetyDetails is required when safetyRisk is "Yes"',
          ),
        );
      }
    }
  }

  if (d.safetyDetails && d.safetyDetails.length > 5000) {
    errors.push(
      err("safetyDetails", "Safety details cannot exceed 5000 characters"),
    );
  }

  // ── GP / Surgery ───────────────────────────────────────────────────────────

  if (d.gpName && d.gpName.length > 255) {
    errors.push(err("gpName", "GP name cannot exceed 255 characters"));
  }
  if (d.surgeryName && d.surgeryName.length > 255) {
    errors.push(
      err("surgeryName", "Surgery name cannot exceed 255 characters"),
    );
  }
  if (d.surgeryStreet && d.surgeryStreet.length > 255) {
    errors.push(
      err("surgeryStreet", "Surgery street cannot exceed 255 characters"),
    );
  }
  if (d.surgeryCity && d.surgeryCity.length > 100) {
    errors.push(
      err("surgeryCity", "Surgery city cannot exceed 100 characters"),
    );
  }
  if (d.surgeryPostcode && d.surgeryPostcode.length > 30) {
    errors.push(
      err("surgeryPostcode", "Surgery postcode cannot exceed 30 characters"),
    );
  }

  // ── Payment ────────────────────────────────────────────────────────────────

  if (d.paymentMethod !== undefined) {
    const validPayment: readonly string[] = PAYMENT_METHOD_VALUES;
    if (!validPayment.includes(d.paymentMethod)) {
      errors.push(
        err(
          "paymentMethod",
          `Payment method must be one of: ${PAYMENT_METHOD_VALUES.join(", ")}`,
        ),
      );
    }

    if (d.paymentMethod === "Other") {
      if (!d.paymentOtherDetails || d.paymentOtherDetails.trim().length === 0) {
        errors.push(
          err(
            "paymentOtherDetails",
            'paymentOtherDetails is required when paymentMethod is "Other"',
          ),
        );
      }
    }

    const requiresInsurance =
      d.paymentMethod === "Health insurance" ||
      d.paymentMethod === "Employee Assistance Programme (EAP)";

    if (requiresInsurance) {
      if (!d.insurerName || d.insurerName.trim().length === 0) {
        errors.push(
          err(
            "insurerName",
            'insurerName is required when paymentMethod is "Health insurance" or "Employee Assistance Programme (EAP)"',
          ),
        );
      }
      if (!d.authorizationCode || d.authorizationCode.trim().length === 0) {
        errors.push(
          err(
            "authorizationCode",
            'authorizationCode is required when paymentMethod is "Health insurance" or "Employee Assistance Programme (EAP)"',
          ),
        );
      }
    }
  }

  if (d.paymentOtherDetails && d.paymentOtherDetails.length > 255) {
    errors.push(
      err(
        "paymentOtherDetails",
        "Payment other details cannot exceed 255 characters",
      ),
    );
  }
  if (d.insurerName && d.insurerName.length > 255) {
    errors.push(
      err("insurerName", "Insurer name cannot exceed 255 characters"),
    );
  }
  if (d.authorizationCode && d.authorizationCode.length > 255) {
    errors.push(
      err(
        "authorizationCode",
        "Authorization code cannot exceed 255 characters",
      ),
    );
  }

  // ── Insurance ──────────────────────────────────────────────────────────────

  if (d.insuranceProvider && d.insuranceProvider.length > 200) {
    errors.push(
      err(
        "insuranceProvider",
        "Insurance provider cannot exceed 200 characters",
      ),
    );
  }
  if (d.insuranceNumber && d.insuranceNumber.length > 100) {
    errors.push(
      err("insuranceNumber", "Insurance number cannot exceed 100 characters"),
    );
  }
  if (
    d.insuranceAuthorizationNumber &&
    d.insuranceAuthorizationNumber.length > 100
  ) {
    errors.push(
      err(
        "insuranceAuthorizationNumber",
        "Insurance authorization number cannot exceed 100 characters",
      ),
    );
  }

  // ── Hear about us ──────────────────────────────────────────────────────────

  if (d.hearAboutUs !== undefined) {
    const validValues: readonly string[] = HEAR_ABOUT_US_VALUES;
    const invalidValues = d.hearAboutUs.filter((v) => !validValues.includes(v));
    if (invalidValues.length > 0) {
      errors.push(
        err(
          "hearAboutUs",
          `Invalid hear about us value(s): ${invalidValues.join(", ")}. Accepted: ${HEAR_ABOUT_US_VALUES.join(", ")}`,
        ),
      );
    }
  }

  if (d.hearAboutUsDetails && d.hearAboutUsDetails.length > 5000) {
    errors.push(
      err(
        "hearAboutUsDetails",
        "Hear about us details cannot exceed 5000 characters",
      ),
    );
  }

  // ── Note ───────────────────────────────────────────────────────────────────

  if (d.note && d.note.length > 1000) {
    errors.push(err("note", "Note cannot exceed 1000 characters"));
  }

  // ── Result ─────────────────────────────────────────────────────────────────

  const valid = errors.length === 0;

  return {
    rowNumber: row.rowNumber,
    valid,
    errors,
    client: valid ? (d as BulkImportClientItem) : undefined,
  };
};

// ─── Batch validator ──────────────────────────────────────────────────────────

/**
 * Validates all parsed rows and returns a summary with valid clients
 * and per-row error details for invalid ones.
 */
export const validateImportedClients = (
  rows: ParsedClientRow[],
): ValidationSummary => {
  const allResults = rows.map(validateRow);
  const validRows = allResults.filter((r) => r.valid).map((r) => r.client!);
  const invalidRows = allResults.filter((r) => !r.valid);

  return {
    validRows,
    invalidRows,
    allResults,
    totalRows: rows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
  };
};
