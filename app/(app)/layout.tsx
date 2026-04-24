import { Sidebar } from "@/components/sidebar";
import { RouteGuard } from "@/components/route-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex min-h-[100dvh]">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </RouteGuard>
  );
}
