export default function NoSchoolList({
  modalRef,
  closeUnsupportedModal,
  admissionSchool,
}: {
  modalRef: React.RefObject<HTMLDivElement | null>;
  closeUnsupportedModal: () => void;
  admissionSchool: string;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div
      ref={modalRef}
      className="absolute top-0 left-0 w-full h-full bg-white flex flex-col
                     justify-center items-center px-4"
    >
      <div className="mt-2 text-sm text-center">
        <p>스마트학생복에 방문해주셔서 감사합니다</p>
        <p>
          아쉽지만,
          <br />
          {currentYear}년 {admissionSchool} 교복 공동구매는
          <br />
          저희 매장에서 진행하지 않습니다.
        </p>
        <p>
          내년에는 스마트학생복을 통해
          <br />
          진행할 수 있도록 준비해보겠습니다.
        </p>
        <p className="mt-1">
          매장에 있는 상품을 구입하기 원하신다면, 직원에게 말씀해주세요.
        </p>
      </div>

      <button
        onClick={closeUnsupportedModal}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md"
      >
        처음으로
      </button>
    </div>
  );
}
