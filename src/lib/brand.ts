export const APP_SHORT_NAME = "Ruang Campus";
export const APP_FULL_NAME = "Ruang Campus - Platform Edukasi LMS Sosmed";
export const APP_DESCRIPTION = "Platform Edukasi LMS Sosmed.";

const LEGACY_APP_NAMES = new Set([
  "mentorhipers",
  "mentorhipers | mentoring & content planning",
]);

/**
 * Keep old app_settings/localStorage values from bringing the retired brand
 * back into the UI while preserving intentionally customized app names.
 */
export function resolveAppName(value?: string | null): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue || LEGACY_APP_NAMES.has(normalizedValue.toLowerCase())) {
    return APP_FULL_NAME;
  }

  return normalizedValue;
}
