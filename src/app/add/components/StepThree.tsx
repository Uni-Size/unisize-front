import { useState } from "react";
import { useStudentFormStore } from "@/stores/useStudentFormStore";
import Button from "@/components/ui/Button";
import Image from "next/image";

const VALIDATION_RANGES = {
  height: { min: 130, max: 200 },
  weight: { min: 30, max: 150 },
  shoulder: { min: 30, max: 60 },
  waist: { min: 20, max: 40 },
};

export default function StepThree({
  submit,
  prev,
}: {
  submit: () => void;
  prev: () => void;
}) {
  const [subStep, setSubStep] = useState(0);
  const { formData, setBodyMeasurements } = useStudentFormStore();

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    formData.body.height > 0 &&
    formData.body.weight > 0 &&
    formData.body.shoulder > 0 &&
    formData.body.waist > 0;

  // 첫 번째 화면: 온보딩
  if (subStep === 0) {
    return (
      <section>
        <h2 className="title2 text-center mb-4">
          학생의 신체 사이즈를 측정해주세요
        </h2>
        <p className="title3 text-center mb-8 text-gray-800">
          정확한 교복 사이즈를 위해, <br /> 두꺼운 옷은 벗고 측정해주세요.
        </p>

        <Image
          src="/student/body.svg"
          alt="logo"
          width={200}
          height={100}
          className="mx-auto"
        />

        <div className="m-2 text-gray-500 text-center">
          시착 시, 얇은 반팔이 필요하신 경우 <br /> 교복용 반팔을 구매하실 수
          있습니다.
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            onClick={prev}
            variant="secondary"
            className="flex-1"
          >
            이전
          </Button>
          <Button
            type="button"
            onClick={() => setSubStep(1)}
            className="flex-1"
          >
            다음
          </Button>
        </div>
      </section>
    );
  }

  // 두 번째 화면: 측정값 입력
  return (
    <section>
      <h2 className="title2 text-center mb-2">
        학생의 신체 사이즈를 측정해주세요
      </h2>
      <p className="title3 text-center mb-14 text-gray-800">
        두꺼운 옷을 입으신 경우,
        <br />
        교복 반팔을 매장에서 구매 후 착용하시면 <br /> 더 편리하게 측정할 수
        있습니다.
      </p>
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
            min={VALIDATION_RANGES.height.min}
            max={VALIDATION_RANGES.height.max}
            id="height"
            type="number"
            value={formData.body.height || ""}
            onChange={(e) =>
              setBodyMeasurements("height", Number(e.target.value))
            }
            className="w-full"
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
            min={VALIDATION_RANGES.weight.min}
            max={VALIDATION_RANGES.weight.max}
            id="weight"
            type="number"
            value={formData.body.weight || ""}
            onChange={(e) =>
              setBodyMeasurements("weight", Number(e.target.value))
            }
            className="w-full"
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
            min={VALIDATION_RANGES.shoulder.min}
            max={VALIDATION_RANGES.shoulder.max}
            id="shoulder"
            type="number"
            value={formData.body.shoulder || ""}
            onChange={(e) =>
              setBodyMeasurements("shoulder", Number(e.target.value))
            }
            className="w-full"
            placeholder="어깨넓이를 입력하세요"
          />
        </div>

        {/* 허리둘레 */}
        <div>
          <label
            htmlFor="waist"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            허리둘레 (cm)
          </label>
          <input
            min={VALIDATION_RANGES.waist.min}
            max={VALIDATION_RANGES.waist.max}
            id="waist"
            type="number"
            value={formData.body.waist || ""}
            onChange={(e) =>
              setBodyMeasurements("waist", Number(e.target.value))
            }
            className="w-full"
            placeholder="허리둘레를 입력하세요"
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 mt-6">
        <Button
          type="button"
          onClick={() => setSubStep(0)}
          variant="secondary"
          className="flex-1"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={submit}
          disabled={!isFormValid}
          className="flex-1"
        >
          제출하기
        </Button>
      </div>
    </section>
  );
}
