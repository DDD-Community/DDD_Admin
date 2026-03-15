import { getMemberById, updateMember } from "@ddd/db";
import type { Member } from "@ddd/db";
import { ERRORS, AppError } from "../errors";

export async function assignTeam(memberId: string, team: Member["team"]) {
  const member = await getMemberById(memberId);
  if (!member) throw new AppError(ERRORS.MEMBER_NOT_FOUND);
  return updateMember(memberId, { team });
}

export async function deactivateMember(memberId: string) {
  const member = await getMemberById(memberId);
  if (!member) throw new AppError(ERRORS.MEMBER_NOT_FOUND);
  if (!member.isActive) throw new AppError(ERRORS.ALREADY_INACTIVE);
  return updateMember(memberId, { isActive: false });
}
