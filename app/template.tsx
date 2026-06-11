// Re-rendered on every navigation, so the wrapped page fades in smoothly.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
