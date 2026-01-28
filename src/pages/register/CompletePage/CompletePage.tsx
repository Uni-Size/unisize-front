import { useState } from 'react';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';
import './CompletePage.css';

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
      <section className="complete-page">
        <div className="complete-page__loading">
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
    <div className="complete-page__table">
      <h3 className="complete-page__table-title">{season}</h3>

      <div className="complete-page__table-header">
        <div>품목</div>
        <div>추천사이즈</div>
        <div>지원개수</div>
      </div>

      {tableData.map((row, idx) => (
        <div key={idx} className="complete-page__table-row">
          <div>
            <div>{row.item}</div>
            {row.selectableWith && row.selectableWith.length > 0 && (
              <div className="complete-page__selectable">
                {row.selectableWith.join(', ')}로 변경 가능
              </div>
            )}
          </div>
          <div>{row.size}</div>
          <div>
            {row.count === 0 ? (
              <span className="complete-page__excluded">지원제외품목</span>
            ) : (
              row.count
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="complete-page">
      <div className="complete-page__header">
        <p className="complete-page__subtitle">잠시만 기다려주세요.</p>
        <h2 className="complete-page__title">
          {studentData.school_name} {studentData.name}
        </h2>
        <p className="complete-page__description">
          교복 시착을 준비해드리겠습니다.
        </p>
      </div>

      <div className="complete-page__tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`complete-page__tab ${
              activeTab === tab ? 'complete-page__tab--active' : ''
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="complete-page__content">
        <div
          className="complete-page__slider"
          style={{
            transform: `translateX(-${tabs.indexOf(activeTab) * 100}%)`,
          }}
        >
          {tabs.map((season) => (
            <div key={season} className="complete-page__slide">
              <TableView season={season} tableData={data[season]} />
            </div>
          ))}
        </div>
      </div>

      <article className="complete-page__recommendations">
        <h3 className="complete-page__recommendations-title">
          {activeTab}과 함께 입을만한 상품
        </h3>
        <div className="complete-page__products">
          {itemData[activeTab].map((product, idx) => (
            <a
              key={idx}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="complete-page__product"
            >
              <img
                src={product.thumbnail}
                alt={product.item}
                className="complete-page__product-image"
              />
              <p className="complete-page__product-name">{product.item}</p>
            </a>
          ))}
        </div>
      </article>
    </section>
  );
};
