"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import NoSchoolList from "./NoSchoolList";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { useStudentFormStore } from "@/stores/useStudentFormStore";

export default function FormStepper({
  handleSubmit,
}: {
  handleSubmit: () => void;
}) {
  const { formData } = useStudentFormStore();

  const [step, setStep] = useState(1);
  const [showUnsupportedSchool, setShowUnsupportedSchool] = useState(false);

  const closeUnsupportedModal = () => setShowUnsupportedSchool(false);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showUnsupportedSchool && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: "100%", opacity: 1 },
        { y: "0%", opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [showUnsupportedSchool]);

  return (
    <form>
      <div className="bg-white p-6 rounded-xl shadow">
        {step === 1 && (
          <StepOne
            next={next}
            setShowUnsupportedSchool={setShowUnsupportedSchool}
          />
        )}
        {step === 2 && <StepTwo back={back} next={next} />}
        {step === 3 && <StepThree back={back} submit={handleSubmit} />}
      </div>
      {showUnsupportedSchool && (
        <NoSchoolList
          modalRef={modalRef}
          closeUnsupportedModal={closeUnsupportedModal}
          admissionSchool={formData.admissionSchool}
        />
      )}
    </form>
  );
}
