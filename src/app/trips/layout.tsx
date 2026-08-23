import AuthGuard from "@/components/auth/AuthGuard";

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
