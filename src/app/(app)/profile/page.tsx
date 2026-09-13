import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "@/lib/actions";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, badgeCount, logCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userBadge.count({ where: { userId } }),
    prisma.workoutLog.count({ where: { userId } }),
  ]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-gray-500">
          {logCount} sessions logged &middot; {badgeCount}/{BADGE_DEFINITIONS.length} badges earned
        </p>
      </div>

      <form action={updateProfile} className="card space-y-4">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" defaultValue={user.name} required className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input value={user.email} disabled className="input bg-gray-100 text-gray-500" />
        </div>
        <div>
          <label className="label" htmlFor="department">Department</label>
          <input id="department" name="department" defaultValue={user.department ?? ""} className="input" />
        </div>
        <button type="submit" className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}
