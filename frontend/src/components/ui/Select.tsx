import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  labelClassName?: string;
  options: SelectOption[];
  value: SelectOption;
  onChange: (option: SelectOption) => void;
  fullWidth?: boolean;
}

export default function Select({ label, labelClassName, options, value, onChange, fullWidth }: SelectProps) {
  const labelClass = labelClassName ?? "text-sm font-medium text-terracota-dark";
  const rootClass = fullWidth
    ? "relative w-full flex flex-col gap-1.5"
    : "relative inline-block w-56 flex flex-col gap-1.5";

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={rootClass}>
        {label && (
          <Listbox.Label className={labelClass}>
            {label}
          </Listbox.Label>
        )}

        <Listbox.Button className="relative w-full h-11 min-h-[44px] bg-mocha-card border border-mocha-border-input rounded-xl px-4 py-2.5 text-left text-sm text-mocha-medium shadow-input-inner transition focus:outline-none focus:ring-2 focus:ring-orange-focus focus:border-orange-focus hover:border-mocha-icon cursor-pointer flex items-center box-border">
          <span className="block whitespace-nowrap pr-8">{value.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronUpDownIcon className="h-4 w-4 text-mocha-icon" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute left-0 top-full z-10 mt-2 w-full bg-mocha-card rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-mocha-border-card py-2 max-h-60 overflow-auto focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option}
                className={({ active, selected }) =>
                  `relative cursor-pointer select-none px-4 py-3 text-sm tracking-tight transition whitespace-nowrap ${
                    active ? "bg-table-row-hover" : selected ? "bg-mocha-bg-subtle" : ""
                  } ${selected ? "text-terracota-dark font-medium" : "text-mocha-medium"}`
                }
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
