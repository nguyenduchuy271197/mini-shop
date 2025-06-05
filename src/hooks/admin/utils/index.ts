// Utils query hooks
export { useGenerateSlug } from "./use-generate-slug";
export { useValidateSKU } from "./use-validate-sku";
export { useGenerateSKUSuggestions } from "./use-generate-sku-suggestions";
export { useCheckSKUAvailability } from "./use-check-sku-availability";
export { useSanitizeContent } from "./use-sanitize-content";
export { useGetEmailStatus } from "./use-get-email-status";
export { useGetSMSStatus } from "./use-get-sms-status";

// Utils mutation hooks
export { useSendEmail } from "./use-send-email";
export { useSendSMS } from "./use-send-sms";
export { useSendBulkSMS } from "./use-send-bulk-sms";

// Export types - Slug generation
export type { 
  GenerateSlugParams, 
  GenerateSlugResponse,
  UseGenerateSlugOptions 
} from "./use-generate-slug";

// Export types - SKU validation
export type { 
  ValidateSKUParams, 
  ValidateSKUResponse,
  UseValidateSKUOptions 
} from "./use-validate-sku";

// Export types - SKU suggestions
export type { 
  GenerateSKUSuggestionsParams, 
  GenerateSKUSuggestionsResponse,
  UseGenerateSKUSuggestionsOptions 
} from "./use-generate-sku-suggestions";

// Export types - SKU availability
export type { 
  CheckSKUAvailabilityParams, 
  CheckSKUAvailabilityResponse,
  UseCheckSKUAvailabilityOptions 
} from "./use-check-sku-availability";

// Export types - Content sanitization
export type { 
  SanitizeContentParams, 
  SanitizeContentResponse,
  UseSanitizeContentOptions 
} from "./use-sanitize-content";

// Export types - Email services
export type { 
  SendEmailResponse,
  UseSendEmailOptions 
} from "./use-send-email";

export type { 
  GetEmailStatusParams, 
  GetEmailStatusResponse,
  UseGetEmailStatusOptions 
} from "./use-get-email-status";

// Export types - SMS services
export type { 
  SendSMSData,
  SendSMSResponse,
  UseSendSMSOptions 
} from "./use-send-sms";

export type { 
  GetSMSStatusParams, 
  GetSMSStatusResponse,
  UseGetSMSStatusOptions 
} from "./use-get-sms-status";

export type { 
  SendBulkSMSData,
  SendBulkSMSResponse,
  UseSendBulkSMSOptions 
} from "./use-send-bulk-sms"; 