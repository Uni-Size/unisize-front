export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 mt-6">
      <button
        type="button"
        className="min-w-8 h-8 px-2 border border-[#e5e7eb] rounded-md bg-white text-[#374151] text-sm cursor-pointer transition-all duration-200 hover:not-disabled:bg-[#f3f4f6] hover:not-disabled:border-[#d1d5db] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        &lt;
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              type="button"
              className={`min-w-8 h-8 px-2 border rounded-md text-sm cursor-pointer transition-all duration-200 ${
                currentPage === page
                  ? 'bg-[#2563eb] border-[#2563eb] text-white hover:not-disabled:bg-[#1d4ed8] hover:not-disabled:border-[#1d4ed8]'
                  : 'border-[#e5e7eb] bg-white text-[#374151] hover:not-disabled:bg-[#f3f4f6] hover:not-disabled:border-[#d1d5db]'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="min-w-8 h-8 flex items-center justify-center text-[#6b7280] text-sm">{page}</span>
          )
        ))}
      </div>

      <button
        type="button"
        className="min-w-8 h-8 px-2 border border-[#e5e7eb] rounded-md bg-white text-[#374151] text-sm cursor-pointer transition-all duration-200 hover:not-disabled:bg-[#f3f4f6] hover:not-disabled:border-[#d1d5db] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        &gt;
      </button>
    </nav>
  );
};
