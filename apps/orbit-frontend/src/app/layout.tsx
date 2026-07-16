import './global.css';

export const metadata = {
  title: 'Orbit',
  description: 'Orbit — a microservices-based social network.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
