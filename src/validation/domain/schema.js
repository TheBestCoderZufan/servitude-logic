// src/validation/domain/schema.js
import { z } from "zod";

/**
 * @description Zod schema for environment variables.
 * Validates the structure and types of environment variables required for the application.
 */
export const EnvSchema = z.object({
  DYNADOT_PRODUCTION_BASE_URL: z.string().url(),
  DYNADOT_PRODUCTION_KEY: z.string().min(1),
});

/**
 * @description Zod schema for a domain name.
 * Ensures the string is a valid-looking domain name format.
 */
export const DomainNameSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^(?!-)[A-Za-z0-9-]{1,63}\.[A-Za-z0-9.-]{2,}$/, "Invalid domain name");

/**
 * A Zod schema that accepts a number or a string that can be parsed into a number.
 * It transforms the string representation into a number.
 */
const NumberLike = z.union([
  z.number(),
  z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform((v) => Number(v)),
]);

/**
 * @description Zod schema for a domain's price tier.
 * This represents the pricing information for various domain operations.
 */
export const PriceTierSchema = z.object({
  currency: z.string().min(1),
  unit: z.string().min(1), // e.g. "(price/1 year)"
  registration: NumberLike.optional(),
  renewal: NumberLike.optional(),
  transfer: NumberLike.optional(),
  restore: NumberLike.optional(),
});

/**
 * @description Zod schema for the envelope of the domain search API response.
 * This validates the top-level structure of the response from the domain search endpoint.
 */
export const DomainSearchEnvelopeSchema = z.object({
  code: z.string(), // "200"
  message: z.string(), // "Success"
  data: z.object({
    domain_name: DomainNameSchema,
    available: z.enum(["Yes", "No"]),
    premium: z.enum(["YES", "NO"]).optional(),
    price_list: z.array(PriceTierSchema).default([]),
  }),
});

/**
 * @description Zod schema for the domain search API response.
 * This is an alias for `DomainSearchEnvelopeSchema`.
 * @see DomainSearchEnvelopeSchema
 */
export const DomainSearchResponseSchema = DomainSearchEnvelopeSchema;
