interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-4 mt-6">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="border border-mocha-border-input rounded-lg px-4 py-2 text-sm text-mocha-medium hover:bg-mocha-bg-subtle disabled:opacity-50 transition-colors"
      >
        Anterior
      </button>
      <span className="text-sm text-mocha-medium">
        Página <span className="font-medium text-orange-burnt">{page}</span> de {totalPages || 1}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || totalPages === 0}
        className="border border-mocha-border-input rounded-lg px-4 py-2 text-sm text-mocha-medium hover:bg-mocha-bg-subtle disabled:opacity-50 transition-colors"
      >
        Próximo
      </button>
    </div>
  );
}
