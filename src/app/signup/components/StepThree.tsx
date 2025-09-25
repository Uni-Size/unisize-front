export default function StepThree({
  back,
  formData,
  submit,
  handleInputChange,
}: {
  back: () => void;
  submit: () => void;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  formData: {
    previousSchool: string;
    admissionYear: number;
    admissionGrade: number;
    admissionSchool: string;
    name: string;
    studentPhone: string;
    guardianPhone: string;
    birthDate: string;
    gender: string;
    privacyConsent: boolean;
    body: {
      height: number;
      weight: number;
      shoulder: number;
      waist: number;
    };
  };
}) {
  return (
    <section className="rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {formData.admissionSchool}에{" "}
        {formData.admissionGrade === 1 ? "입학하는" : "전학오는"}
        학생의 정보를 알려주세요
      </h2>
      <div>
        <label
          htmlFor="height"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          키
        </label>
        <input
          min={130}
          max={200}
          id="height"
          type="number"
          value={formData.body.height}
          onChange={(e) => handleInputChange("height", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
          placeholder="키"
        />
      </div>
      <div>
        <label
          htmlFor="height"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          몸무게
        </label>
        <input
          id="weight"
          type="number"
          value={formData.body.weight}
          onChange={(e) => handleInputChange("weight", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
          placeholder="몸무게"
        />
      </div>{" "}
      <div>
        <label
          htmlFor="height"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          어깨넓이
        </label>
        <input
          min={130}
          max={200}
          id="shoulder"
          type="number"
          value={formData.body.shoulder}
          onChange={(e) => handleInputChange("shoulder", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
          placeholder="어깨넓이"
        />
      </div>{" "}
      <div>
        <label
          htmlFor="waist"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          허리둘레
        </label>
        <input
          id="허리둘레"
          type="number"
          value={formData.body.waist}
          onChange={(e) => handleInputChange("waist", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
          placeholder="허리둘레"
        />
      </div>
      {/* 버튼들 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={back}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium
                       py-2 px-4 rounded-md transition duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-gray-500
                       focus:ring-offset-2 mt-6"
        >
          학생 정보 변경하기
        </button>
        <button
          type="submit"
          onClick={submit}
          className={`w-full font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-offset-2 mt-6  bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
                    }`}
        >
          다음
        </button>
      </div>
    </section>
  );
}
