/**
 * Utility hook to integrate react-hook-form with Zod validation
 */

import { useCallback } from "react";
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  FieldErrors,
} from "react-hook-form";
import { z } from "zod";
import { createSafeZodResolver } from "./createSafeZodResolver";

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
    resolver: createSafeZodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: true,
    ...formProps,
  });

  const onSubmit = useCallback(
    (callback: (data: T) => Promise<void> | void) => {
      return methods.handleSubmit(async (data) => {
        await callback(data);
      });
    },
    [methods],
  );

  return {
    ...methods,
    onSubmit,
  };
};
