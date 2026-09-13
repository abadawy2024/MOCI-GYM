import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plans", label: "Plans" },
  { href: "/log/new", label: "Log activity" },
  { href: "/history", label: "History" },
  { href: "/equipment", label: "Equipment" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-moci-700">
          <span>🏛️</span>
          <span>MOCI Gym</span>
        </Link>
        <nav className="hidden gap-5 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-moci-700">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-moci-700">
            {session?.user?.name ?? "Profile"}
          </Link>
          <SignOutButton />
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-gray-100 px-4 py-2 text-sm md:hidden">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap font-medium text-gray-600">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
