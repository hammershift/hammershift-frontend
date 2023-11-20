import connectToDB from "@/lib/mongoose";
import Cars from "@/models/car.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 12;
    let completed = req.nextUrl.searchParams.get('completed') || [1, 2];
    let make: string | string[] = req.nextUrl.searchParams.get('make') || "All";
    let location: string | string[] = req.nextUrl.searchParams.get('location') || "All";

    if (completed) {
      if (completed === 'true') {
        completed = [2];
      }
      if (completed === 'false') {
        completed = [1];
      }
    }

    if (make === "All") {
      make = [...makeFilters]
    } else {
      make = make.split("%")
    }

    const filteredCars = await Cars.find({ status: { $in: completed }, make: { $in: [...make] } }).limit(limit).skip(offset);
    return NextResponse.json(filteredCars);

  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' })
  }
}

const makeFilters = [
  "Acura",
  "Audi",
  "BMW",
  "Alfa Romeo",
  "Aston Martin",
  "Honda",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Chrysler",
  "Chevrolet",
  "Cadillac",
  "Buick",
  "Bugatti",
  "Bentley",
  "Hyundai",
  "Lincoln",
  "Lotus",
  "Lucid",
  "Maserati",
  "Mazda",
  "McLaren",
  "Genesis",
  "GMX",
  "Ford",
  "Fiat",
  "Ferrari",
  "Dodge",
  "Infiniti",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Polestar",
  "Porsche"
]