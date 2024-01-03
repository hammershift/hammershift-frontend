// import { useEffect, useState, useRef } from "react";

// const useIntersectionObserver = (ref: any, threshold = 0.5) => {
//   const [isIntersecting, setIntersecting] = useState(false);
//   const observerRef = useRef<IntersectionObserver | null>(null);

//   useEffect(() => {
//     observerRef.current = new IntersectionObserver((entries) => {
//       entries.forEach(
//         (entry) => {
//           setIntersecting(entry.isIntersecting);
//           if (entry.isIntersecting) {
//             observerRef.current && observerRef.current.unobserve(ref.current);
//           }
//         },
//         { threshold }
//       );
//     });

//     if (ref.current) {
//       observerRef.current && observerRef.current.observe(ref.current);
//     }

//     return () => {
//       if (ref.current) {
//         observerRef.current && observerRef.current.unobserve(ref.current);
//       }
//     };
//   }, [ref, threshold]);

//   return isIntersecting;
// };

// export default useIntersectionObserver;
