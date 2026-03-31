import JsonLd from './JsonLd';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://www.velocity-markets.com${item.href}`,
    })),
  };
  return <JsonLd data={data} />;
}
