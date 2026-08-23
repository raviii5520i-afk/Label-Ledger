import GuestGuard from "@/components/auth/GuestGuard";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestGuard>{children}</GuestGuard>;
}
