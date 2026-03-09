interface FinancialProductJsonLd {
  name: string;
  description: string;
  url: string;
  offers?: {
    price: number;
    priceCurrency: string;
  };
}

interface EventJsonLd {
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  url: string;
}

interface Props {
  financialProduct: FinancialProductJsonLd;
  event?: EventJsonLd;
}

export default function JsonLd({ financialProduct, event }: Props) {
  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: financialProduct.name,
      description: financialProduct.description,
      url: financialProduct.url,
      ...(financialProduct.offers && {
        offers: {
          '@type': 'Offer',
          price: financialProduct.offers.price,
          priceCurrency: financialProduct.offers.priceCurrency,
        },
      }),
    },
  ];

  if (event) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description,
      url: event.url,
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
