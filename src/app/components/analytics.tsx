"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

export default function Analytics() {
    const pathname = usePathname();
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
    const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV;

    useEffect(() => {
        if (!window.gtag) return;
        if (NODE_ENV === 'development') {
            window.gtag("config", GA_MEASUREMENT_ID, {
                page_path: pathname,
                debug_mode: true,
            });
        }
        else {
            window.gtag("config", GA_MEASUREMENT_ID, {
                page_path: pathname,
            });
        }
    }, [pathname]);

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
            </Script>
        </>
    );
}
