// src/data/page/dashboard/projectsClient.data.js

/**
 * Maps intake workflow status codes to `Badge` variants used in the client
 * projects view. The mapping keeps visual feedback consistent with the rest of
 * the dashboard components.
 *
 * @type {Record<string, string>}
 */
export const clientIntakeStatusBadgeVariants = {
  REVIEW_PENDING: "warning",
  RETURNED_FOR_INFO: "warning",
  APPROVED_FOR_ESTIMATE: "inProgress",
  ESTIMATE_IN_PROGRESS: "inProgress",
  ESTIMATE_SENT: "primary",
  CLIENT_SCOPE_APPROVED: "success",
  CLIENT_SCOPE_DECLINED: "error",
  ARCHIVED: "default",
};

/** @module data/page/dashboard/projectsClient */
