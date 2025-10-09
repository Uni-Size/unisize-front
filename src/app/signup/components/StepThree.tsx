import { useStudentFormStore } from "@/stores/useStudentFormStore";

export default function StepThree({
  back,
  submit,
}: {
  back: () => void;
  submit: () => void;
}) {
  const { formData, setBodyMeasurements } = useStudentFormStore();

  return (
    <section className="rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {formData.admissionSchool}에{" "}
        {formData.admissionGrade === 1 ? "입학하는" : "전학오는"}
        학생의 신체 정보를 알려주세요
      </h2>

      <div className="space-y-4">
        {/* 키 */}
        <div>
          <label
            htmlFor="height"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            키 (cm)
          </label>
          <input
            min={130}
            max={200}
            id="height"
            type="number"
            value={formData.body.height || ""}
            onChange={(e) =>
              setBodyMeasurements("height", Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent"
            placeholder="키를 입력하세요"
          />
        </div>

        {/* 몸무게 */}
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            몸무게 (kg)
          </label>
          <input
            min={30}
            max={150}
            id="weight"
            type="number"
            value={formData.body.weight || ""}
            onChange={(e) =>
              setBodyMeasurements("weight", Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent"
            placeholder="몸무게를 입력하세요"
          />
        </div>

        {/* 어깨넓이 */}
        <div>
          <label
            htmlFor="shoulder"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            어깨넓이 (cm)
          </label>
          <input
            min={30}
            max={60}
            id="shoulder"
            type="number"
            value={formData.body.shoulder || ""}
            onChange={(e) =>
              setBodyMeasurements("shoulder", Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent"
            placeholder="어깨넓이를 입력하세요"
          />
        </div>

        {/* 허리둘레 */}
        <div>
          <label
            htmlFor="waist"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            허리둘레 (inch)
          </label>
          <input
            min={20}
            max={40}
            id="waist"
            type="number"
            value={formData.body.waist || ""}
            onChange={(e) =>
              setBodyMeasurements("waist", Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent"
            placeholder="허리둘레를 입력하세요"
          />
        </div>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                     py-2 px-4 rounded-md transition duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:ring-offset-2 mt-6"
        >
          제출하기
        </button>
      </div>
    </section>
  );
}
