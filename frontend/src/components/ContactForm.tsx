import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Contact } from "../types/contact";

/** Formata telefone como (DDD) 00000-0000 — até 11 dígitos. */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
}

interface ContactFormProps {
  initialValues?: Pick<Contact, "name" | "email" | "phone"> | null;
  onSubmit: (data: ContactFormValues) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  loading?: boolean;
}

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
};

const inputBaseClass =
  "bg-mocha-card border rounded-xl px-4 py-2.5 w-full shadow-input-inner focus:outline-none focus:ring-2 transition";
const inputErrorClass = "border-danger focus:ring-danger focus:border-danger";
const inputOkClass = "border-mocha-border-input focus:ring-orange-focus focus:border-orange-focus";

const requiredMessage = "Campo obrigatório";

export default function ContactForm({
  initialValues,
  onSubmit,
  onCancel,
  onDirtyChange,
  loading = false,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, errors },
  } = useForm<ContactFormValues>({
    defaultValues,
    values: initialValues
      ? {
          name: initialValues.name,
          email: initialValues.email,
          phone: formatPhone(initialValues.phone),
        }
      : defaultValues,
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const canSubmit = isDirty && !loading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-mocha-medium mb-1.5">
          Nome
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: requiredMessage })}
          className={`${inputBaseClass} ${errors.name ? inputErrorClass : inputOkClass}`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-danger" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-mocha-medium mb-1.5">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          {...register("email", { required: requiredMessage })}
          className={`${inputBaseClass} ${errors.email ? inputErrorClass : inputOkClass}`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-danger" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-mocha-medium mb-1.5">
          Telefone
        </label>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: requiredMessage,
            validate: (value) => {
              const digits = (value ?? "").replace(/\D/g, "");
              return digits.length === 11 || "Telefone deve ter 11 dígitos: (DDD) 00000-0000";
            },
          }}
          render={({ field }) => (
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              {...field}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
              className={`${inputBaseClass} ${errors.phone ? inputErrorClass : inputOkClass}`}
            />
          )}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-danger" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="border border-mocha-border-input text-mocha-medium px-5 py-2.5 rounded-xl hover:bg-mocha-bg-subtle transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-orange-burnt hover:bg-orange-burnt-hover text-white px-5 py-2.5 rounded-xl disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
