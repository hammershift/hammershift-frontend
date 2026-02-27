import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_API =
  process.env.BACKEND_API_URL ??
  "https://main.d3bje0ak6q49bm.amplifyapp.com";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? "active";
    const make = req.nextUrl.searchParams.get("make") ?? "all";
    const priceRange = Number(req.nextUrl.searchParams.get("priceRange") ?? "0");
    const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "0");

    // Fetch all auctions from backend — we apply filtering + pagination here
    // so the backend doesn't need to understand status/make/priceRange params.
    const backendUrl = new URL(`${BACKEND_API}/api/auctions/filter`);
    backendUrl.searchParams.set("publicOnly", "true");
    backendUrl.searchParams.set("limit", "500");

    const res = await fetch(backendUrl.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`Backend API error: ${res.status} ${backendUrl}`);
      return NextResponse.json(
        { message: "Backend API error", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    let cars: any[] = data.cars ?? [];

    const now = new Date();

    // --- Status filtering ---
    if (status === "ending_soon") {
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      cars = cars.filter((car) => {
        const d = car.sort?.deadline;
        if (!d) return false;
        const deadline = new Date(d);
        return deadline > now && deadline <= in24h;
      });
    } else if (status === "starting_soon") {
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      cars = cars.filter((car) => {
        const d = car.sort?.deadline;
        if (!d) return false;
        return new Date(d) > in24h;
      });
    } else if (status === "ended") {
      cars = cars.filter((car) => {
        const d = car.sort?.deadline;
        return d && new Date(d) <= now;
      });
    } else {
      // "active" / live now: future deadline or no deadline set
      cars = cars.filter((car) => {
        const d = car.sort?.deadline;
        if (!d) return true;
        return new Date(d) > now;
      });
    }

    // --- Make filtering ---
    if (make && make !== "all") {
      cars = cars.filter((car) =>
        car.attributes?.some(
          (attr: any) => attr.key === "make" && attr.value === make
        )
      );
    }

    // --- Price range filtering ---
    if (priceRange !== 0) {
      cars = cars.filter((car) => {
        const price =
          car.sort?.price ??
          car.attributes?.find((attr: any) => attr.key === "price")?.value ??
          0;
        switch (priceRange) {
          case 1: return price < 50000;
          case 2: return price >= 50000 && price < 100000;
          case 3: return price >= 100000 && price < 250000;
          case 4: return price >= 250000;
          default: return true;
        }
      });
    }

    // --- Sorting ---
    if (status === "ending_soon" || status === "starting_soon") {
      // Soonest deadline first
      cars.sort((a, b) => {
        const da = new Date(a.sort?.deadline ?? 0).getTime();
        const db = new Date(b.sort?.deadline ?? 0).getTime();
        return da - db;
      });
    } else {
      // Latest deadline first (ended: most recently ended first)
      cars.sort((a, b) => {
        const da = new Date(a.sort?.deadline ?? 0).getTime();
        const db = new Date(b.sort?.deadline ?? 0).getTime();
        return db - da;
      });
    }

    // --- Pagination ---
    const total = limit > 0 ? Math.ceil(cars.length / limit) : 1;
    const paginated = limit > 0 ? cars.slice(offset, offset + limit) : cars;

    return NextResponse.json(
      { total, cars: paginated },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("auctions/filter proxy error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
