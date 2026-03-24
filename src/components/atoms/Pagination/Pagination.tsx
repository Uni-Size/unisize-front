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
        className="min-w-8 h-8 px-2 border border-gray-200 rounded-md bg-white text-bg-800 text-sm cursor-pointer transition-all duration-200 hover:not-disabled:bg-bg-050 hover:not-disabled:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? 'bg-primary-600 border-primary-600 text-white hover:not-disabled:bg-primary-700 hover:not-disabled:border-primary-700'
                  : 'border-gray-200 bg-white text-bg-800 hover:not-disabled:bg-bg-050 hover:not-disabled:border-gray-300'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="min-w-8 h-8 flex items-center justify-center text-bg-400 text-sm">{page}</span>
          )
        ))}
      </div>

      <button
        type="button"
        className="min-w-8 h-8 px-2 border border-gray-200 rounded-md bg-white text-bg-800 text-sm cursor-pointer transition-all duration-200 hover:not-disabled:bg-bg-050 hover:not-disabled:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        &gt;
      </button>
    </nav>
  );
};
