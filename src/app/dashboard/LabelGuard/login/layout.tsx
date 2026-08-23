// Login page layout — overrides the parent LabelGuard layout
// by using a standalone dark page without the AppShell sidebar
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ll-root min-h-screen bg-[#0F1117]" style={{ colorScheme: 'dark' }}>
      {children}
    </div>
  );
}
