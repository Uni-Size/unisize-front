import { formatDateTime } from '@/utils/dateUtils';

export interface DeletedStudentBannerProps {
  /** 서버의 deleted_at (RFC3339) */
  deletedAt?: string | null;
  /** 서버의 delete_reason */
  reason?: string | null;
  /** 감사로그 student.delete 항목의 actor.employee_name */
  processedBy?: string | null;
}

export const DeletedStudentBanner = ({
  deletedAt,
  reason,
  processedBy,
}: DeletedStudentBannerProps) => (
  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 bg-red-050 border border-red-200 rounded-lg">
    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-red-700 text-bg-050 text-xs font-medium whitespace-nowrap">
      삭제됨
    </span>
    <span className="text-13 text-red-700 whitespace-nowrap">{formatDateTime(deletedAt) || '-'}</span>
    <span className="text-13 text-red-700/40">·</span>
    <span className="text-13 text-red-700 break-all">사유: {reason || '-'}</span>
    <span className="text-13 text-red-700/40">·</span>
    <span className="text-13 text-red-700 whitespace-nowrap">처리자: {processedBy || '-'}</span>
  </div>
);
