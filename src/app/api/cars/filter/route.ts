import connectToDB from "@/lib/mongoose";
import Cars from "@/models/car.model";
import { SortOrder } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

interface SortQuery {
  createdAt?: number,
  "sort.price"?: number,
  "sort.deadline"?: number,
  "sort.bids"?: number
}

const categoryFilter = [
  "Others",
  "All",
  "Coupes",
  "Crossovers",
  "EVs and Hybrids",
  "Hatchbacks",
  "Luxury Cars",
  "Minivans & Vans",
  "Pickup Trucks",
  "SUVs",
  "Sedans",
  "Small Cars",
  "Sports Cars",
  "Station Wagons",
]

const eraFilter = [
  "2020s",
  "2010s",
  "2000s",
  "1990s",
  "1980s",
  "1970s",
  "1960s",
  "1950s",
  "1940s",
  "1930s",
  "1920s",
  "1910s",
  "1900 and older",
]

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

const locationFilter = [
  "Alabama",
  "Alaska",
  "Idaho",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georia",
  "Hawaii",
  "Illinois",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
]

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0;
    const limit = Number(req.nextUrl.searchParams.get('limit'));
    const searchedKeyword = req.nextUrl.searchParams.get('search');
    let completed = req.nextUrl.searchParams.get('completed') || [1, 2];
    let era: string | string[] = req.nextUrl.searchParams.get('era') || "All";
    let category: string | string[] = req.nextUrl.searchParams.get('category') || "All";
    let make: string | string[] = req.nextUrl.searchParams.get('make') || "All";
    let location: string | string[] = req.nextUrl.searchParams.get('location') || "All";
    let sort: string | SortQuery = req.nextUrl.searchParams.get('sort') || "Newly Listed";

    if (completed) {
      if (completed === 'true') {
        completed = [2];
      }
      if (completed === 'false') {
        completed = [1];
      }
    }

    // SEARCH is NOT used in combination with other filters EXCEPT completed filter (completed=true === status: 2 and vice versa)
    //api/cars/filter?search=911 Coupe or api/cars/filter?search=911%20Coupe
    //api/cars/filter?search=911%20Coupe&completed=true
    //(search queries are case insensitive) api/cars/filter?search=land%20cruiser&completed=true
    // if (searchedKeyword) {
    //   const searchedCars = await Cars.find({
    //     status: { $in: completed },
    //     $text: { $search: `"${searchedKeyword}"`, $caseSensitive: false },
    //   })
    //     .limit(limit)
    //     .skip(offset);

    //   return NextResponse.json(searchedCars);
    // }

    if (searchedKeyword) {
      const searchedCars = await Cars.find({
        $and: [
          { "attributes": { $elemMatch: { "key": "status", "value": { $in: completed } } } },
          {
            $or: [
              { "attributes": { $elemMatch: { "key": "make", "value": { $regex: searchedKeyword, $options: "i" } } } },
              { "attributes": { $elemMatch: { "key": "model", "value": { $regex: searchedKeyword, $options: "i" } } } },
              { "attributes": { $elemMatch: { "key": "location", "value": { $regex: searchedKeyword, $options: "i" } } } },
              { "attributes": { $elemMatch: { "key": "year", "value": { $regex: searchedKeyword, $options: "i" } } } }
            ]
          }
        ]
      })
        .limit(limit)
        .skip(offset)

      return NextResponse.json(searchedCars);
    }

    if (make === "All") {
      make = [...makeFilters]
    } else {
      make = make.split("$")
    }

    if (era === "All") {
      era = [...eraFilter]
    } else {
      era = era.split("$")
    }

    if (category === "All") {
      category = [...categoryFilter]
    } else {
      category = category.split("$")
    }

    if (location === "All") {
      location = [...locationFilter]
    } else {
      location = location.split("$")
    }

    if (sort) {
      switch (sort) {
        case "Newly Listed":
          sort = { createdAt: -1 }
          break;
        case "Ending Soon":
          sort = { "sort.deadline": 1 }
          break;
        case "Most Expensive":
          sort = { "sort.price": -1 }
          break;
        case "Least Expensive":
          sort = { "sort.price": 1 }
          break;
        case "Most Bids":
          sort = { "sort.bids": -1 }
          break;
        case "Least Bids":
          sort = { "sort.bids": 1 }
          break;
        //other sorts here
        default:
          break;
      }
    }

    //ALL filters can be used in combination with other filters including sort (filters and sort are case sensitive)
    //use the delimiter "$" when filter mutiple makes, era, category or location
    //use "%20" or " " for 2-word queries
    //for ex. api/cars/filter?make=Porsche$Ferrari&location=New%20York$North%20Carolina&sort=Most%20Bids
    //if you don't add a sort query, it automatically defaults to sorting by Newly Listed for now
    // const totalCars = await Cars.find({
    //   status: { $in: completed },
    //   make: { $in: [...make] },
    //   era: { $in: [...era] },
    //   category: { $in: [...category] },
    //   state: { $in: [...location] }
    // })
    const totalCars = await Cars.find({
      $and: [
        { "attributes": { $elemMatch: { "key": "make", "value": { $in: make } } } },
        { "attributes": { $elemMatch: { "key": "state", "value": { $in: location } } } },
        { "attributes": { $elemMatch: { "key": "era", "value": { $in: era } } } },
        { "attributes": { $elemMatch: { "key": "category", "value": { $in: category } } } },
        { "attributes": { $elemMatch: { "key": "status", "value": { $in: completed } } } },
      ]
    })

    const filteredCars = await Cars.find({
      $and: [
        { "attributes": { $elemMatch: { "key": "make", "value": { $in: make } } } },
        { "attributes": { $elemMatch: { "key": "state", "value": { $in: location } } } },
        { "attributes": { $elemMatch: { "key": "era", "value": { $in: era } } } },
        { "attributes": { $elemMatch: { "key": "category", "value": { $in: category } } } },
        { "attributes": { $elemMatch: { "key": "status", "value": { $in: completed } } } },
      ]
    })
      .limit(limit)
      .skip(offset)
      .sort(sort as { [key: string]: SortOrder | { $meta: any; }; })

    return NextResponse.json({ total: totalCars.length, cars: filteredCars });

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal server error' })
  }
}