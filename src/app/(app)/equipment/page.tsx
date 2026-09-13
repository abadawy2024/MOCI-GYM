import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  CARDIO: "Cardio",
  STRENGTH: "Strength",
  FUNCTIONAL: "Functional training",
  RECOVERY: "Recovery & wellness",
  GROUP_TRAINING: "Group training",
};

const CATEGORY_ICON: Record<string, string> = {
  CARDIO: "🏃",
  STRENGTH: "🏋️",
  FUNCTIONAL: "🤸",
  RECOVERY: "🧘",
  GROUP_TRAINING: "👥",
};

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany({ orderBy: { category: "asc" } });

  const grouped = equipment.reduce<Record<string, typeof equipment>>((acc, eq) => {
    (acc[eq.category] ??= []).push(eq);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">The MOCI gym, fully equipped by Technogym</h1>
        <p className="text-gray-500">
          Everything below is available right now in the staff gym. No excuses — come see it for yourself.
        </p>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <span>{CATEGORY_ICON[category] ?? "🏋️"}</span>
            {CATEGORY_LABEL[category] ?? category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((eq) => (
              <div key={eq.id} className="card">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{eq.name}</h3>
                  <span className="rounded-full bg-moci-50 px-2 py-0.5 text-xs font-medium text-moci-700">
                    {eq.brand}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{eq.description}</p>
                <p className="mt-2 text-xs text-gray-400">Qty available: {eq.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {equipment.length === 0 && (
        <p className="text-sm text-gray-500">Equipment list coming soon.</p>
      )}
    </div>
  );
}
