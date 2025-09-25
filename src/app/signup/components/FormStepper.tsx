"use client";
import { useEffect, useRef, useState } from "react";

import NoSchoolList from "./NoSchoolList";
import gsap from "gsap";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepWaiting from "./StepWaiting";

export default function FormStepper() {
  const [step, setStep] = useState(1);
  const [showUnsupportedSchool, setShowUnsupportedSchool] = useState(false);

  const [formData, setFormData] = useState({
    previousSchool: "서울증학교",
    admissionYear: new Date().getFullYear(),
    admissionGrade: 1,
    admissionSchool: "서울고등학교",
    name: "테스터",
    studentPhone: "111-1111-1111",
    guardianPhone: "222-2222-2222",
    birthDate: "2025-09-09",
    gender: "boy",
    privacyConsent: false,
    body: {
      height: 170,
      weight: 70,
      shoulder: 44,
      waist: 28,
    },
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleBodyInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        [field]: value,
      },
    }));
  };

  const closeUnsupportedModal = () => setShowUnsupportedSchool(false);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    console.log(formData);
    if (
      !formData.previousSchool ||
      !formData.admissionYear ||
      !formData.admissionGrade ||
      !formData.admissionSchool ||
      !formData.name ||
      !formData.studentPhone ||
      !formData.guardianPhone ||
      !formData.birthDate ||
      !formData.gender ||
      !formData.body.height ||
      !formData.body.weight ||
      !formData.body.shoulder ||
      !formData.body.waist
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    alert("폼이 제출되었습니다!");
    setStep(999);
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
            handleInputChange={handleInputChange}
            formData={formData}
            setShowUnsupportedSchool={setShowUnsupportedSchool}
          />
        )}
        {step === 2 && (
          <StepTwo
            back={back}
            next={next}
            submit={handleSubmit}
            handleInputChange={handleInputChange}
            formData={formData}
          />
        )}
        {step === 3 && (
          <StepThree
            back={back}
            submit={handleSubmit}
            handleInputChange={handleBodyInputChange}
            formData={formData}
          />
        )}
        {step === 999 && <StepWaiting formData={formData} />}
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
