"use client";

import { useEffect, useState } from "react";

const useIntersectionObserver = (ref: any) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        observer.unobserve(ref.current);
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.unobserve(ref.current);
    };
  }, [ref]);

  return isIntersecting;
};

export default useIntersectionObserver;
