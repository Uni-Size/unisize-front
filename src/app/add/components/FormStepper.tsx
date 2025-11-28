"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [showUnsupportedSchool, setShowUnsupportedSchool] = useState(false);

  const closeUnsupportedModal = () => setShowUnsupportedSchool(false);

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);
  const back = () => {
    if (step === 1 || step === 3) {
      router.push("/");
    } else {
      setStep((s) => s - 1);
    }
  };

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
      <div className=" mb-7">
        <button
          type="button"
          onClick={back}
          className="flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">뒤로</span>
        </button>
      </div>
      <div>
        {step === 1 && <StepOne next={next} />}
        {step === 2 && <StepTwo next={next} prev={prev} />}
        {step === 3 && <StepThree submit={handleSubmit} prev={prev} />}
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
