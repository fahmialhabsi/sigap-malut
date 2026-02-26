import React, { useState } from "react";
import Step1Metadata from "./Step1Metadata";
import Step2Schema from "./Step2Schema";
import Step3Permissions from "./Step3Permissions";
import Step4Template from "./Step4Template";
import Step5Generate from "./Step5Generate";

const steps = [
  { label: "Metadata", component: Step1Metadata },
  { label: "Schema", component: Step2Schema },
  { label: "Permissions", component: Step3Permissions },
  { label: "Print Template", component: Step4Template },
  { label: "Generate & Review", component: Step5Generate },
];

export default function WizardModuleCreator() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const StepComponent = steps[step].component;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <div className="flex gap-2 mb-4">
        {steps.map((s, i) => (
          <span
            key={s.label}
            className={`px-3 py-1 rounded-full text-xs ${i === step ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {i + 1}. {s.label}
          </span>
        ))}
      </div>
      <StepComponent form={form} setForm={setForm} />
      <div className="flex justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={goNext}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Lanjut
          </button>
        ) : null}
      </div>
    </div>
  );
}
