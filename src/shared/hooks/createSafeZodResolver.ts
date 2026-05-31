/**
 * Resolver Zod sans rejet — compatible Zod v4 + react-hook-form.
 */

import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { z } from "zod";

export const createSafeZodResolver = <T extends FieldValues>(
  schema: z.ZodType<T>,
): Resolver<T> => {
  return (values) => {
    const parsed = schema.safeParse(values);

    if (parsed.success) {
      return { values: parsed.data, errors: {} };
    }

    const errors: FieldErrors<T> = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field !== "string") continue;
      if (errors[field as keyof T]) continue;

      errors[field as keyof T] = {
        type: issue.code,
        message: issue.message,
      } as FieldErrors<T>[keyof T];
    }

    return { values: {} as Record<string, never>, errors };
  };
};
