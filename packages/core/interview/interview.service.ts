import {
  getInterviewByApplicationId,
  createInterview,
  updateInterview,
  updateApplicationStatus,
} from "@ddd/db";
import { ERRORS, AppError } from "../errors";

export async function scheduleInterview(
  applicationId: string,
  scheduledAt: string,
  interviewedBy?: string
) {
  const existing = await getInterviewByApplicationId(applicationId);
  if (existing) throw new AppError(ERRORS.INTERVIEW_ALREADY_EXISTS);

  return createInterview({
    applicationId,
    scheduledAt: new Date(scheduledAt),
    interviewedBy,
  });
}

export async function recordResult(
  interviewId: string,
  score: number,
  memo: string,
  result: "PASS" | "FAIL"
) {
  const updated = await updateInterview(interviewId, { score, memo, result });
  if (!updated) throw new AppError(ERRORS.INTERVIEW_NOT_FOUND);

  // Interview 결과를 Application status에 반영
  const status = result === "PASS" ? "PASSED" : "FAILED";
  await updateApplicationStatus(updated.applicationId, status);

  return updated;
}
