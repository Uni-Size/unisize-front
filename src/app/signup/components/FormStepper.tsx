"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import NoSchoolList from "./NoSchoolList";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { signupApi } from "@/api/signupApi";

export default function FormStepper() {
  const router = useRouter();

  const { formData, setFormData, setBodyMeasurements } = useStudentFormStore();

  const [step, setStep] = useState(1);
  const [showUnsupportedSchool, setShowUnsupportedSchool] = useState(false);

  const closeUnsupportedModal = () => setShowUnsupportedSchool(false);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    console.log(formData);

    try {
      const result = await signupApi.registerStudent(formData);
      alert(result.message);
      console.log("생성된 학생 ID:", result.studentId);
      router.push("/waiting");
    } catch (error) {
      console.error("학생 등록 실패:", error);
      const errorMessage = error instanceof Error ? error.message : "학생 정보 등록에 실패했습니다.";
      alert(errorMessage);
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
    <>
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
    </>
  );
}
