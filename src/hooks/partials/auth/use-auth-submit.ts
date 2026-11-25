import { useState } from "react";
import { z } from "zod";

export const useAuthSubmit = <T extends z.ZodTypeAny>(
  schema: T,
  extractPayload: (formData: FormData) => z.input<T>,
  onValid: (parsed: Required<z.output<T>>) => Promise<void>,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});

    setIsLoading(true);

    try {
      const raw = extractPayload(new FormData(e.currentTarget));
      const parsed = schema.parse(raw) as Required<z.output<T>>;
      await onValid(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};

        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });

        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, errors, handleSubmit };
};
