import MushafClient from './MushafClient';

export function generateStaticParams() {
  return Array.from({ length: 604 }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}

export default function MushafPage() {
  return <MushafClient />;
}
