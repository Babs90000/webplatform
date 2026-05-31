/**
 * Utility hook to integrate react-hook-form with Zod validation
 */

import { useCallback } from "react";
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createLogger } from "@/lib/logger";

const logger = createLogger("useZodForm");

interface UseZodFormOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, "resolver"> {
  schema: z.ZodType<T>;
}

export const useZodForm = <T extends FieldValues>({
  schema,
  ...formProps
}: UseZodFormOptions<T>): UseFormReturn<T> & {
  onSubmit: (
    callback: (data: T) => Promise<void> | void,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
} => {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    ...formProps,
  });

  const onSubmit = useCallback(
    (callback: (data: T) => Promise<void> | void) => {
      return methods.handleSubmit(async (data) => {
        try {
          await callback(data);
        } catch (error) {
          logger.error({ error, message: "Form submission failed" });
          throw error;
        }
      });
    },
    [methods],
  );

  return {
    ...methods,
    onSubmit,
  };
};
