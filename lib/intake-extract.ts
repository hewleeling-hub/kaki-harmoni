import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  HEALTH_CONDITIONS,
  HEALTH_GOALS,
  AROMA_OILS,
  SPA_SALTS,
  WATER_LEVELS,
  WATER_TEMPS,
  INTENSITIES,
  DURATIONS,
  MAX_AROMA_OILS,
} from "@/config/intake";

/**
 * Reading a photographed SPA SURVEY FORM into the fields the dashboard holds.
 *
 * A SUGGESTION, never a save. What comes back fills the boxes on screen and a
 * member of staff checks it before anything reaches the database. These are
 * health answers and an IC number on a form somebody signed — the cost of a
 * confidently wrong tick is a guest treated on the strength of it, so a person
 * confirms every time.
 *
 * The core intake screen works with this switched off. If no API key is set the
 * route says so and the form is keyed in by hand exactly as before.
 */

/** z.enum wants a non-empty literal tuple; the config arrays are `as const`. */
const enumOf = <T extends readonly string[]>(values: T) =>
  z.enum(values as unknown as [string, ...string[]]);

/**
 * Every value is constrained to the lists in config/intake.ts, so the model
 * cannot invent an oil the shop doesn't stock or a temperature the dial won't
 * do. Anything it can't place comes back null rather than as a near-miss.
 */
export const ExtractedForm = z.object({
  guest_name: z.string().nullable(),
  contact_no: z.string().nullable(),
  ic_passport_no: z.string().nullable(),
  sponsor_name: z.string().nullable(),
  voucher_no: z.string().nullable(),
  server_name: z.string().nullable(),
  /** ISO yyyy-mm-dd. The form is handwritten in D/M/YYYY. */
  survey_date: z.string().nullable(),

  health_conditions: z.array(enumOf(HEALTH_CONDITIONS)),
  health_goals: z.array(enumOf(HEALTH_GOALS)),

  water_level: enumOf(WATER_LEVELS).nullable(),
  water_temp: enumOf(WATER_TEMPS).nullable(),
  intensity: enumOf(INTENSITIES).nullable(),
  duration_min: enumOf(DURATIONS).nullable(),
  aroma_oils: z.array(enumOf(AROMA_OILS)),
  recommended_oils: z.array(enumOf(AROMA_OILS)),
  salt_used: enumOf(SPA_SALTS).nullable(),
  recommended_salt: enumOf(SPA_SALTS).nullable(),

  notes: z.string().nullable(),

  /** Is there a signature in the guest's box? The consent record depends on it. */
  signature_present: z.boolean(),

  /**
   * Anything the handwriting left genuinely ambiguous, named so staff know
   * where to look. Far more useful than a confidence score nobody acts on.
   */
  unclear: z.array(z.string()),
});

export type ExtractedForm = z.infer<typeof ExtractedForm>;

const SYSTEM = `You read photographs of a signed paper spa intake form and return what is written on them. You are helping a member of staff key in a form; they will check everything you return before it is saved.

THE FORM
It is a bilingual Chinese/English "SPA SURVEY FORM" from the machine supplier. Its printed labels do not always match the field names you are filling in, so map them:

- 水量 WATER LEVEL: "七分满 70%" -> "${WATER_LEVELS[0]}", "不要过胸部 BELOW CHEST" -> "${WATER_LEVELS[1]}"
- 水温 TEMPERATURE: 35°C / 38°C / 40°C, exactly as printed
- 强度 INTENSITY: 小 LOW -> "Low", 中 MEDIUM -> "Medium", 大 HIGH -> "High"
- 时间 TIME: "5 分钟 MIN" -> "5", "10 分钟 MIN" -> "10", "15 分钟 MIN" -> "15"
- 精油 AROMA OIL: the seven numbered oils are Pine, Juniper, Rosemary, Hayseed, Lavender, Camomile, Eucalyptus. At most ${MAX_AROMA_OILS} may be ticked.
- 健康状况 HEALTH CONDITION: map each ticked box onto the closest option offered. "心脏，血管问题 HEART PROBLEMS" is "Heart or blood vessel problems"; "怀孕 PREGNANCY" is "Pregnancy (4 months & below)".

The form has no section for goals and no section for salts. Leave those empty unless something is genuinely written there.

RULES
- Report only boxes that are actually ticked, crossed or marked. An empty box is not a tick. Most forms come back with very few ticks, and returning an empty list is the correct answer when nothing is marked.
- Never guess. A field that is blank, or handwriting you cannot read, is null — not your best attempt at a name.
- Dates are handwritten Malaysian style, DAY/MONTH/YEAR. "11/9/2026" is 11 September 2026, so return "2026-09-11". If the order is genuinely ambiguous, return null and say so in "unclear".
- Copy names, IC numbers and phone numbers exactly as written, including spacing. Do not correct or reformat them.
- Handwriting that could plausibly be read more than one way: give your best reading AND name the field in "unclear".
- "notes" is for anything handwritten that has no field of its own — a word above a section, a remark in a margin. Not for your own commentary.
- signature_present is about the guest's signature box only.`;

/** Whether the feature can run at all. The screen hides the button when false. */
export function extractionAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Reads one photographed form.
 *
 * Throws on an API failure rather than returning a half-filled object — a
 * partial read that looks like a successful one is worse than none, because
 * the blanks read as "the guest left it blank".
 */
export async function extractIntakeForm(
  image: Buffer,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
): Promise<ExtractedForm> {
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 4000,
    system: SYSTEM,
    // Reading faint pencil ticks and Malaysian handwriting is exactly the kind
    // of careful looking that thinking helps with, and one form is cheap.
    thinking: { type: "adaptive" },
    output_config: { format: zodOutputFormat(ExtractedForm) },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: image.toString("base64") },
          },
          {
            type: "text",
            text: "Read this signed intake form. Return only what is actually written or ticked on it.",
          },
        ],
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("Could not read a form from that image.");
  }

  // Belt and braces on the blending limit: the schema can't express "at most
  // three", and a form with four ticks would otherwise arrive as four.
  const parsed = response.parsed_output;
  return {
    ...parsed,
    aroma_oils: parsed.aroma_oils.slice(0, MAX_AROMA_OILS),
    recommended_oils: parsed.recommended_oils.slice(0, MAX_AROMA_OILS),
  };
}
