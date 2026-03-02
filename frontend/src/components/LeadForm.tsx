import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { LeadStatus } from "../types/lead";
import Select, { type SelectOption } from "./ui/Select";

export const LEAD_STATUS_OPTIONS: SelectOption[] = [
  { value: "novo", label: "Novo" },
  { value: "contactado", label: "Contactado" },
  { value: "qualificado", label: "Qualificado" },
  { value: "convertido", label: "Convertido" },
  { value: "perdido", label: "Perdido" },
];

export interface LeadFormValues {
  name: string;
  company: string;
  contact: SelectOption;
  status: SelectOption;
}

export interface LeadFormSubmitData {
  name: string;
  company: string;
  contactId: string;
  status: LeadStatus;
}

interface LeadFormProps {
  initialValues?: { name: string; company: string; contactId: string; status: LeadStatus } | null;
  contactOptions: SelectOption[];
  onSubmit: (data: LeadFormSubmitData) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  loading?: boolean;
}

const defaultValues: LeadFormValues = {
  name: "",
  company: "",
  contact: { value: "", label: "Selecione um contato" },
  status: LEAD_STATUS_OPTIONS[0],
};

const inputBaseClass =
  "bg-mocha-card border rounded-xl px-4 py-2.5 w-full h-11 min-h-[44px] box-border shadow-input-inner focus:outline-none focus:ring-2 transition";
const inputErrorClass = "border-danger focus:ring-danger focus:border-danger";
const inputOkClass = "border-mocha-border-input focus:ring-orange-focus focus:border-orange-focus";

const labelClass = "block text-sm font-medium text-mocha-medium mb-1.5";
const requiredMessage = "Campo obrigatório";

export default function LeadForm({
  initialValues,
  contactOptions,
  onSubmit,
  onCancel,
  onDirtyChange,
  loading = false,
}: LeadFormProps) {
  const contactOptionsWithPlaceholder =
    contactOptions.length > 0 ? contactOptions : [defaultValues.contact];
  const resolvedContactOption = contactOptionsWithPlaceholder.find(
    (o) => o.value === initialValues?.contactId
  );
  const initialContact =
    initialValues != null
      ? resolvedContactOption ?? { value: initialValues.contactId, label: "Carregando..." }
      : contactOptionsWithPlaceholder[0];
  const initialStatus =
    initialValues
      ? LEAD_STATUS_OPTIONS.find((o) => o.value === initialValues.status) ?? LEAD_STATUS_OPTIONS[0]
      : LEAD_STATUS_OPTIONS[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, errors },
  } = useForm<LeadFormValues>({
    defaultValues,
    values: initialValues
      ? {
          name: initialValues.name,
          company: initialValues.company,
          contact: initialContact,
          status: initialStatus,
        }
      : {
          ...defaultValues,
          contact: contactOptionsWithPlaceholder[0],
          status: LEAD_STATUS_OPTIONS[0],
        },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const canSubmit = isDirty && !loading;

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          name: data.name,
          company: data.company,
          contactId: data.contact.value,
          status: data.status.value as LeadStatus,
        })
      )}
      className="space-y-5"
    >
      <div>
        <label htmlFor="lead-name" className={labelClass}>
          Nome
        </label>
        <input
          id="lead-name"
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
        <label htmlFor="lead-company" className={labelClass}>
          Empresa
        </label>
        <input
          id="lead-company"
          type="text"
          {...register("company", { required: requiredMessage })}
          className={`${inputBaseClass} ${errors.company ? inputErrorClass : inputOkClass}`}
        />
        {errors.company && (
          <p className="mt-1 text-sm text-danger" role="alert">
            {errors.company.message}
          </p>
        )}
      </div>
      <Controller
        name="contact"
        control={control}
        rules={{ validate: (v) => (v?.value ? true : "Selecione um contato") }}
        render={({ field, fieldState }) => (
          <div>
            <Select
              label="Contato"
              labelClassName={labelClass}
              fullWidth
              options={contactOptionsWithPlaceholder}
              value={field.value}
              onChange={field.onChange}
            />
            {fieldState.error && (
              <p className="mt-1 text-sm text-danger" role="alert">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <div>
            <Select
              label="Status"
              labelClassName={labelClass}
              fullWidth
              options={LEAD_STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          </div>
        )}
      />
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
