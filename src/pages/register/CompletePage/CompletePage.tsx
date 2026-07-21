import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';
import { useStudentFormStore } from '@/stores/useStudentFormStore';
import { type RecommendedSizeItem } from '@/api/student';

const itemData = {
  동복: [
    {
      item: '교복 탄성 반팔',
      url: 'https://www.smartzzang.com/look/style?cate=2',
      thumbnail: '/item/2.png',
    },
    {
      item: '냄새제거 스타킹',
      url: 'https://www.smartzzang.com/look/style?cate=1',
      thumbnail: '/item/1.png',
    },
    {
      item: '속바지',
      url: 'https://www.smartzzang.com/look/style?cate=3',
      thumbnail: '/item/3.png',
    },
  ],
  하복: [
    {
      item: '교복 탄성 반팔',
      url: 'https://www.smartzzang.com/look/style?cate=2',
      thumbnail: '/item/2.png',
    },
  ],
};

type SeasonType = '동복' | '하복';

interface UniformData {
  item: string;
  size: string;
  count: number;
  selectableWith?: string[];
  gender: 'male' | 'female' | 'unisex';
}

const toUniformData = (items: RecommendedSizeItem[] | undefined): UniformData[] =>
  items?.map((item) => ({
    item: item.product_name,
    size: item.recommended_size,
    count: item.supported_quantity,
    selectableWith: item.selectable_with,
    gender: item.gender,
  })) ?? [];

const NO_DATA_REDIRECT_DELAY_MS = 3000;

export const CompletePage = () => {
  const navigate = useNavigate();
  const { studentData, checkinData } = useStudentResponseStore();
  const { resetFormData } = useStudentFormStore();
  const [activeTab, setActiveTab] = useState<SeasonType>('동복');
  const hasNoData = !studentData && !checkinData;

  const tabs: SeasonType[] = ['동복', '하복'];

  // 등록 위저드의 formData 초기화는 여기서 한다. 제출 페이지(MeasurementInputPage)에서
  // navigate 직후 리셋하면, 그 페이지가 완전히 언마운트되기 전에 formData 구독이 갱신되어
  // 스텝 가드가 먼저 반응해 엉뚱한 페이지로 밀려나는 문제가 있었다. 도착 페이지가
  // 마운트된 시점에는 그 문제가 없다.
  useEffect(() => {
    resetFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasNoData) return;
    const timer = setTimeout(() => navigate('/register', { replace: true }), NO_DATA_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasNoData, navigate]);

  const name = studentData?.name ?? checkinData?.name ?? '';
  const schoolName = studentData?.school_name ?? checkinData?.school_name ?? '';

  const recommendedUniforms = studentData?.recommended_uniforms ?? checkinData?.recommended_uniforms;
  const hasRecommendations =
    (recommendedUniforms?.winter?.length ?? 0) > 0 ||
    (recommendedUniforms?.summer?.length ?? 0) > 0;

  if (hasNoData) {
    return (
      <section className="max-w-[24rem] mx-auto p-4 min-h-screen">
        <div className="flex flex-col justify-center items-center gap-3 min-h-[50vh] text-center text-slate-600">
          <p>등록 정보를 찾을 수 없습니다.</p>
          <p className="text-sm text-slate-400">잠시 후 처음 화면으로 이동합니다.</p>
          <button
            type="button"
            onClick={() => navigate('/register', { replace: true })}
            className="mt-2 text-sm text-primary-600 underline bg-none border-none cursor-pointer"
          >
            지금 처음으로 이동
          </button>
        </div>
      </section>
    );
  }

  const data: Record<SeasonType, UniformData[]> = {
    동복: toUniformData(recommendedUniforms?.winter),
    하복: toUniformData(recommendedUniforms?.summer),
  };

  const TableView = ({
    season,
    tableData,
  }: {
    season: string;
    tableData: UniformData[];
  }) => (
    <div className="w-full bg-primary-050 p-4 rounded-lg font-semibold">
      <h3 className="text-sm mb-6 text-slate-800">{season}</h3>

      <div className="grid grid-cols-3 pb-2 text-center text-slate-600 border-b border-gray-300 text-sm">
        <div>품목</div>
        <div>추천사이즈</div>
        <div>지원개수</div>
      </div>

      {tableData.map((row, idx) => (
        <div key={idx} className="grid grid-cols-3 py-2 text-center text-sm">
          <div>
            <div>{row.item}</div>
            {row.selectableWith && row.selectableWith.length > 0 && (
              <div className="text-xs text-primary-600 mt-1">
                {row.selectableWith.join(', ')}로 변경 가능
              </div>
            )}
          </div>
          <div>{row.size}</div>
          <div>
            {row.count === 0 ? (
              <span className="text-xs text-primary-600">지원제외품목</span>
            ) : (
              row.count
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="max-w-[24rem] mx-auto p-4 min-h-screen">
      <div className="text-center my-6">
        <p className="text-base font-semibold text-gray-700">잠시만 기다려주세요.</p>
        <h2 className="text-2xl font-bold my-2 text-bg-900">
          {schoolName} {name}
        </h2>
        <p className="text-lg font-medium text-gray-700">
          교복 시착을 준비해드리겠습니다.
        </p>
      </div>

      {hasRecommendations && (
        <>
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium bg-none border-none cursor-pointer transition-all duration-200 ease-in-out ${
                  activeTab === tab
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden w-full">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${tabs.indexOf(activeTab) * 100}%)`,
              }}
            >
              {tabs.map((season) => (
                <div key={season} className="w-full shrink-0">
                  <TableView season={season} tableData={data[season]} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <article className="mt-8">
        <h3 className="text-base font-semibold text-slate-800 mb-4">
          {activeTab}과 함께 입을만한 상품
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {itemData[activeTab].map((product, idx) => (
            <a
              key={idx}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline transition-shadow duration-200 ease-in-out rounded-lg hover:shadow-md"
            >
              <img
                src={product.thumbnail}
                alt={product.item}
                className="w-full h-auto rounded-md"
              />
              <p className="text-sm mt-2 text-slate-800">{product.item}</p>
            </a>
          ))}
        </div>
      </article>
    </section>
  );
};
