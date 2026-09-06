export default function RuangSosmedLayout({ children }: { children: React.ReactNode }) {
  // Public Webinar routes use a separate route tree. This layout deliberately
  // does not perform browser-side identity checks or render a legacy shell.
  return children;
}
