import { useState } from 'react';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';

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

export const CompletePage = () => {
  const { studentData } = useStudentResponseStore();
  const [activeTab, setActiveTab] = useState<SeasonType>('동복');

  const tabs: SeasonType[] = ['동복', '하복'];

  if (!studentData) {
    return (
      <section className="max-w-[24rem] mx-auto p-4 min-h-screen">
        <div className="flex justify-center items-center min-h-[50vh] text-[#4b5563]">
          <p>데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  const data: Record<SeasonType, UniformData[]> = {
    동복:
      studentData.recommended_uniforms?.winter?.map((item) => ({
        item: item.product,
        size: item.recommended_size,
        count: item.quantity,
        selectableWith: item.selectable_with,
        gender: item.gender,
      })) || [],
    하복:
      studentData.recommended_uniforms?.summer?.map((item) => ({
        item: item.product,
        size: item.recommended_size,
        count: item.quantity,
        selectableWith: item.selectable_with,
        gender: item.gender,
      })) || [],
  };

  const TableView = ({
    season,
    tableData,
  }: {
    season: string;
    tableData: UniformData[];
  }) => (
    <div className="w-full bg-[#f5f6fd] p-4 rounded-lg font-semibold">
      <h3 className="text-sm mb-6 text-[#1f2937]">{season}</h3>

      <div className="grid grid-cols-3 pb-2 text-center text-[#4b5563] border-b border-[#a3a3a3] text-sm">
        <div>품목</div>
        <div>추천사이즈</div>
        <div>지원개수</div>
      </div>

      {tableData.map((row, idx) => (
        <div key={idx} className="grid grid-cols-3 py-2 text-center text-sm">
          <div>
            <div>{row.item}</div>
            {row.selectableWith && row.selectableWith.length > 0 && (
              <div className="text-xs text-[#525a8d] mt-1">
                {row.selectableWith.join(', ')}로 변경 가능
              </div>
            )}
          </div>
          <div>{row.size}</div>
          <div>
            {row.count === 0 ? (
              <span className="text-xs text-[#525a8d]">지원제외품목</span>
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
        <p className="text-base font-semibold text-[#4c4c4c]">잠시만 기다려주세요.</p>
        <h2 className="text-2xl font-bold my-2 text-[#262626]">
          {studentData.school_name} {studentData.name}
        </h2>
        <p className="text-lg font-medium text-[#4c4c4c]">
          교복 시착을 준비해드리겠습니다.
        </p>
      </div>

      <div className="flex bg-[#e1e1e1] rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium bg-none border-none cursor-pointer transition-all duration-200 ease-in-out ${
              activeTab === tab
                ? 'bg-white text-[#525a8d] shadow-sm'
                : 'text-[#4b5563] hover:text-[#1f2937]'
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

      <article className="mt-8">
        <h3 className="text-base font-semibold text-[#1f2937] mb-4">
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
              <p className="text-sm mt-2 text-[#1f2937]">{product.item}</p>
            </a>
          ))}
        </div>
      </article>
    </section>
  );
};
