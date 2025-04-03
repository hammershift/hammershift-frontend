"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getCarsWithFilter, getCarsWithFilterProps } from "@/lib/data";
import { useRouter } from "next/navigation";

import CheckIcon from "../../../public/images/check-black.svg";
import GridIcon from "../../../public/images/grid-01.svg";
import ListIcon from "../../../public/images/list.svg";
import FilterFunnel from "../../../public/images/filter-funnel-02.svg";
import ArrowsDown from "../../../public/images/arrows-down.svg";
import DropdownArrow from "../../../public/images/dropdown.svg";
import ArrowDown from "../../../public/images/arrow-down.svg";
import CancelIcon from "../../../public/images/x-icon.svg";
import MagnifyingGlass from "../../../public/images/magnifying-glass.svg";

export type filtersProps = {
  make: string[];
  category: string[];
  era: string[];
  location: string[];
  sort: string;
};

export interface FiltersAndSortProps {
  filters: filtersProps;
  setFilters: React.Dispatch<React.SetStateAction<filtersProps>>;
}

type DropdownMenuProps =
  | null
  | "Make"
  | "Era"
  | "Category"
  | "Location"
  | "Sort";

const FiltersAndSort = ({
  filters,
  isGridView,
  setIsGridView,
}: {
  filters: any;
  isGridView: boolean;
  setIsGridView: any;
}) => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [dropdownMenuRegular, setDropdownMenuRegular] =
    useState<DropdownMenuProps>(null);

  const [dropdownMenuSmall, setDropdownMenuSmall] =
    useState<DropdownMenuProps>(null);

  const [totalAuctions, setTotalAuctions] = useState(0);
  const [makeDropdown, setMakeDropdown] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [eraDropdown, setEraDropdown] = useState(false);
  const [locationDropdown, setLocationDropdown] = useState(false);

  // get the total auctions
  const fetchData = async () => {
    try {
      const res = await getCarsWithFilter({ limit: 1 });
      if (res) {
        setTotalAuctions(res?.total);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sortButton = document.getElementById("sort-auctions-button");
      const makeFilterButton = document.getElementById("filter-make-button");
      const categoryFilterButton = document.getElementById(
        "filter-category-button"
      );
      const eraFilterButton = document.getElementById("filter-era-button");
      const locationFilterButton = document.getElementById(
        "filter-location-button"
      );
      const makeSearchBar = document.getElementById("make-searchbar");

      if (sortButton && !sortButton.contains(e.target as Node)) {
        setDropdownMenuRegular(null);
      }

      //make drop down, search bar and checkboxes
      if (
        makeFilterButton &&
        !makeFilterButton.contains(e.target as Node) &&
        makeSearchBar &&
        !makeSearchBar.contains(e.target as Node)
      ) {
        setMakeDropdown(false);
      }

      const makeCheckboxes = document.getElementsByClassName(
        "make-checkbox"
      ) as HTMLCollectionOf<HTMLElement>;

      const isMakeCheckboxClicked = Array.from(makeCheckboxes).some(
        (checkbox) => checkbox.contains(e.target as Node)
      );

      if (isMakeCheckboxClicked) {
        setMakeDropdown(true);
      }

      //category drop down and checkboxes
      if (
        categoryFilterButton &&
        !categoryFilterButton.contains(e.target as Node)
      ) {
        setCategoryDropdown(false);
      }

      const categoryCheckboxes = document.getElementsByClassName(
        "category-checkbox"
      ) as HTMLCollectionOf<HTMLElement>;

      const isCategoryCheckboxClicked = Array.from(categoryCheckboxes).some(
        (checkbox) => checkbox.contains(e.target as Node)
      );

      if (isCategoryCheckboxClicked) {
        setCategoryDropdown(true);
      }

      //era drop down and checkboxes
      if (eraFilterButton && !eraFilterButton.contains(e.target as Node)) {
        setEraDropdown(false);
      }

      const eraCheckboxes = document.getElementsByClassName(
        "era-checkbox"
      ) as HTMLCollectionOf<HTMLElement>;

      const isEraCheckboxClicked = Array.from(eraCheckboxes).some((checkbox) =>
        checkbox.contains(e.target as Node)
      );

      if (isEraCheckboxClicked) {
        setEraDropdown(true);
      }

      //location drop down and checkboxes
      if (
        locationFilterButton &&
        !locationFilterButton.contains(e.target as Node)
      ) {
        setLocationDropdown(false);
      }

      const locationCheckboxes = document.getElementsByClassName(
        "location-checkbox"
      ) as HTMLCollectionOf<HTMLElement>;

      const isLocationCheckboxClicked = Array.from(locationCheckboxes).some(
        (checkbox) => checkbox.contains(e.target as Node)
      );

      if (isLocationCheckboxClicked) {
        setLocationDropdown(true);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [
    setDropdownMenuRegular,
    setMakeDropdown,
    setCategoryDropdown,
    setEraDropdown,
    setLocationDropdown,
  ]);

  return (
    <div className="flex justify-between w-screen my-4 xl:my-8 px-4 md:px-16 2xl:w-[1440px]">
      <div className="left-container-marker flex items-center">
        <div>
          Auctions <span className="opacity-50"> {totalAuctions}</span>
        </div>
        <div className="hidden xl:flex">
          {/* Filter Dropdown for regular screens*/}
          {/* Dropdown for Make filter*/}
          <div className=" relative inline-block text-left mx-2">
            <div>
              <button
                id="filter-make-button"
                type="button"
                className="w-[140px] inline-flex justify-between items-center gap-x-1.5 rounded-md px-3 py-2.5  text-white-900 shadow-sm bg-[#172431] hover:bg-[#1A2C3D] truncate"
                style={makeDropdown ? { backgroundColor: "#1A2C3D" } : {}}
                onClick={() => setMakeDropdown((prev) => !prev)}
              >
                {filters.make[0] == "All"
                  ? "Make"
                  : "Make: " + filters.make.join(", ")}
                <Image
                  src={DropdownArrow}
                  width={12}
                  height={12}
                  alt="dropdown arrow"
                  className="w-[12px] h-[12px]"
                />
              </button>
            </div>
            {makeDropdown && <MakeDropdown filters={filters} />}
          </div>
          {/* Dropdown for Category filter*/}
          <div className="relative inline-block text-left mx-2">
            <div>
              <button
                type="button"
                id="filter-category-button"
                className="w-[140px] inline-flex justify-between items-center gap-x-1.5 rounded-md px-3 py-2.5  text-white-900 shadow-sm bg-[#172431] hover:bg-[#1A2C3D] truncate"
                style={categoryDropdown ? { backgroundColor: "#1A2C3D" } : {}}
                onClick={() => setCategoryDropdown((prev) => !prev)}
              >
                {filters.category[0] == "All"
                  ? "Category"
                  : "Category: " + filters.category.join(", ")}
                <Image
                  src={DropdownArrow}
                  width={12}
                  height={12}
                  alt="dropdown arrow"
                  className="w-[12px] h-[12px]"
                />
              </button>
            </div>
            {categoryDropdown && <CategoryDropdown filters={filters} />}
          </div>
          {/* Dropdown for Era filter*/}
          <div className="relative inline-block text-left mx-2">
            <div>
              <button
                type="button"
                id="filter-era-button"
                className="w-[140px] inline-flex justify-between items-center gap-x-1.5 rounded-md px-3 py-2.5  text-white-900 shadow-sm bg-[#172431] hover:bg-[#1A2C3D] truncate"
                style={eraDropdown ? { backgroundColor: "#1A2C3D" } : {}}
                onClick={() => setEraDropdown((prev) => !prev)}
              >
                {filters.era[0] == "All"
                  ? "Era"
                  : "Era: " + filters.era.join(", ")}
                <Image
                  src={DropdownArrow}
                  width={12}
                  height={12}
                  alt="dropdown arrow"
                  className="w-[12px] h-[12px]"
                />
              </button>
            </div>
            {eraDropdown && <EraDropdown filters={filters} />}
          </div>
          {/* Dropdown for Location filter*/}
          <div className="relative inline-block text-left mx-2">
            <div>
              <button
                id="filter-location-button"
                type="button"
                className="w-[140px] inline-flex justify-between items-center gap-x-1.5 rounded-md px-3 py-2.5  text-white-900 shadow-sm bg-[#172431] hover:bg-[#1A2C3D] truncate"
                style={locationDropdown ? { backgroundColor: "#1A2C3D" } : {}}
                onClick={() => setLocationDropdown((prev) => !prev)}
              >
                {filters.location[0] == "All"
                  ? "Location"
                  : "Location: " + filters.location.join(", ")}
                <Image
                  src={DropdownArrow}
                  width={12}
                  height={12}
                  alt="dropdown arrow"
                  className="w-[12px] h-[12px]"
                />
              </button>
            </div>
            {locationDropdown && <LocationDropdown filters={filters} />}
          </div>
        </div>
      </div>
      <div className="right-container-marker flex items-center hidden xl:flex gap-6">
        {/* TODO: */}
        <div className="flex gap-6">
          <div
            className={`p-2 rounded cursor-pointer ${isGridView ? "bg-[#172431]" : ""
              }`}
            onClick={(e) => setIsGridView(true)}
          >
            <Image
              src={GridIcon}
              alt="grid view"
              width={24}
              height={24}
              className={`w-[24px] h-[24px]`}
            />
          </div>
          <div
            className={`p-2 rounded cursor-pointer ${!isGridView ? "bg-[#172431]" : ""
              }`}
            onClick={(e) => setIsGridView(false)}
          >
            <Image
              src={ListIcon}
              alt="grid view"
              width={24}
              height={24}
              className={`w-[24px] h-[24px]  `}
            />
          </div>
        </div>

        {/* Dropdown for Sort*/}
        <div className="relative text-left mx-2">
          <div>
            <button
              id="sort-auctions-button"
              type="button"
              className="w-[240px] inline-flex justify-between items-center gap-x-1.5 rounded-md px-3 py-2.5 text-white-900 shadow-sm bg-[#172431] hover:bg-[#1A2C3D] truncate"
              style={
                dropdownMenuRegular === "Sort"
                  ? { backgroundColor: "#1A2C3D" }
                  : {}
              }
              onClick={() =>
                setDropdownMenuRegular((prev) => {
                  if (prev === "Sort") return null;
                  else return "Sort";
                })
              }
            >
              {filters.category[0] == "Newly Listed"
                ? "Sort by:"
                : "Sort by: " + filters.sort}
              <Image
                src={DropdownArrow}
                width={12}
                height={12}
                alt="dropdown arrow"
                className="w-[12px] h-[12px]"
              />
            </button>
          </div>
          {dropdownMenuRegular === "Sort" && <SortDropdown filters={filters} />}
        </div>
      </div>
      <div className="flex xl:hidden">
        <button onClick={() => setFilterDropdownOpen((prev) => !prev)}>
          <Image
            src={FilterFunnel}
            width={24}
            height={24}
            alt="gift icon"
            className="w-[24px] h-[24px]"
          />
        </button>
        <button onClick={() => setSortDropdownOpen((prev) => !prev)}>
          <Image
            src={ArrowsDown}
            width={24}
            height={24}
            alt="gift icon"
            className="w-[24px] h-[24px] ml-6"
          />
        </button>
      </div>
      {/* Filter Dropdown for small screens*/}
      {filterDropdownOpen && (
        <div className="slide-in-top w-screen h-screen fixed z-40 top-0 left-0 bg-[#1A2C3D] p-4">
          <div className="flex justify-between">
            <div>FILTER</div>
            <button onClick={() => setFilterDropdownOpen((prev) => !prev)}>
              <Image
                src={CancelIcon}
                width={24}
                height={24}
                alt="magnifying glass"
                className="w-6 h-6"
              />
            </button>
          </div>
          <div className="bg-shade-100 flex p-2 rounded mt-8">
            <Image
              src={MagnifyingGlass}
              width={15}
              height={15}
              alt="magnifying glass"
              className="w-auto h-auto"
            />
            <input
              className="ml-2 bg-shade-100 "
              placeholder="Search make, model, year..."
            ></input>
          </div>
          <div>
            {/* Dropdown for MAKE */}
            <button
              className="flex justify-between mt-4 w-full"
              onClick={() =>
                setDropdownMenuSmall((prev) => {
                  if (prev === "Make") return null;
                  else return "Make";
                })
              }
            >
              <div className="font-bold">Make</div>
              <Image
                src={ArrowDown}
                width={32}
                height={32}
                alt="magnifying glass"
                className="w-8 h-8"
              />
            </button>
            {dropdownMenuSmall === "Make" && (
              <div className="absolute left-0 z-50  w-screen origin-top-right rounded-md bg-[#1A2C3D] text-white p-4 h-4/5 overflow-y-auto">
                <MakeContent columns={1} filters={filters} />
              </div>
            )}
            {/* Dropdown for CATEGORY */}
            <button
              className="flex justify-between mt-4 w-full"
              onClick={() =>
                setDropdownMenuSmall((prev) => {
                  if (prev === "Category") return null;
                  else return "Category";
                })
              }
            >
              <div className="font-bold">Category</div>
              <Image
                src={ArrowDown}
                width={32}
                height={32}
                alt="magnifying glass"
                className="w-8 h-8"
              />
            </button>
            {dropdownMenuSmall === "Category" && (
              <div className="absolute left-0 z-50  w-screen origin-top-right rounded-md bg-[#1A2C3D] text-white p-4 h-3/5 overflow-y-auto">
                <CategoryContent columns={1} filters={filters} />
              </div>
            )}
            {/* Dropdown for ERA */}
            <button
              className="flex justify-between mt-4 w-full"
              onClick={() =>
                setDropdownMenuSmall((prev) => {
                  if (prev === "Era") return null;
                  else return "Era";
                })
              }
            >
              <div className="font-bold">Era</div>
              <Image
                src={ArrowDown}
                width={32}
                height={32}
                alt="magnifying glass"
                className="w-8 h-8"
              />
            </button>
            {dropdownMenuSmall === "Era" && (
              <div className="absolute left-0 z-50  w-screen origin-top-right rounded-md bg-[#1A2C3D] text-white p-4 h-3/5 overflow-y-auto">
                <EraContent columns={1} filters={filters} />
              </div>
            )}
            {/* Dropdown for LOCATION */}
            <button
              className="flex justify-between mt-4 w-full"
              onClick={() =>
                setDropdownMenuSmall((prev) => {
                  if (prev === "Location") return null;
                  else return "Location";
                })
              }
            >
              <div className="font-bold">Location</div>
              <Image
                src={ArrowDown}
                width={32}
                height={32}
                alt="magnifying glass"
                className="w-8 h-8"
              />
            </button>
            {dropdownMenuSmall === "Location" && (
              <div className="absolute left-0 z-50  w-screen origin-top-right rounded-md bg-[#1A2C3D] text-white p-4 h-1/2 overflow-y-auto">
                <LocationContent columns={1} filters={filters} />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Sort Dropdown */}
      {sortDropdownOpen && (
        <div className="slide-in-top w-screen h-screen fixed z-50 top-0 left-0 bg-[#1A2C3D] p-4">
          <div className="flex justify-between py-4">
            <div>SORT</div>
            <button onClick={() => setSortDropdownOpen((prev) => !prev)}>
              <Image
                src={CancelIcon}
                width={24}
                height={24}
                alt="magnifying glass"
                className="w-6 h-6"
              />
            </button>
          </div>
          <SortContent filters={filters} />
        </div>
      )}
    </div>
  );
};
export default FiltersAndSort;

// function to add value to filters. This is used in all 4 dropdowns
const addToFilters = (
  value: string,
  key: "make" | "category" | "era" | "location",
  filters: filtersProps,
  router: any
) => {
  let newFilters = { ...filters };
  let queryArray: any = [];

  if (value === "All") {
    newFilters[key] = ["All"];
  } else {
    // If the filter already exists, remove it. Otherwise, add it.
    if (filters[key].includes(value)) {
      if (filters[key].length === 1) {
        newFilters[key] = ["All"];
      } else {
        newFilters[key] = newFilters[key].filter((item) => item !== value);
      }
    } else {
      // If "All" is in the array, remove it
      const allIndex = newFilters[key].indexOf("All");
      if (allIndex > -1) {
        newFilters[key].splice(allIndex, 1);
      }
      newFilters[key].push(value);
    }
  }

  if (!newFilters["make"].includes("All")) {
    newFilters["make"].map((item) => {
      queryArray.push(`make=${item.split(" ").join("%20")}`);
    });
  }

  if (!newFilters["category"].includes("All")) {
    newFilters["category"].map((item) => {
      queryArray.push(`category=${encodeURIComponent(item)}`);
    });
  }

  if (!newFilters["era"].includes("All")) {
    newFilters["era"].map((item) => {
      queryArray.push(`era=${encodeURIComponent(item)}`);
    });
  }

  if (!newFilters["location"].includes("All")) {
    newFilters["location"].map((item) => {
      queryArray.push(`location=${encodeURIComponent(item)}`);
    });
  }

  queryArray.push(`sort=${encodeURIComponent(newFilters["sort"])}`);

  const queryString = queryArray.join("&");
  router.push("/auctions?" + queryString);
};

export interface FiltersDropdownProps {
  filters: filtersProps;
}

const MakeDropdownContent = [
  "All",
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
  "Porsche",
];

const MakeDropdown: React.FC<FiltersDropdownProps> = ({ filters }) => {
  return (
    <div className="absolute left-0 z-10 mt-2 w-[640px] h-[362px] origin-top-right rounded-md bg-[#1A2C3D] text-white shadow-lg">
      <div className="p-4" role="none">
        <div className="flex items-center bg-white/5 rounded py-2 px-3">
          <Image
            src={MagnifyingGlass}
            width={20}
            height={20}
            alt="dropdown arrow"
            className="w-[20px] h-[20px] mr-2"
          />
          <input
            id="make-searchbar"
            className="bg-transparent w-full outline-none"
            placeholder="Search"
          />
        </div>
        <div
          id="make-dropdown"
          className="mt-2 h-[280px] overflow-y-auto"
        >
          <MakeContent columns={3} filters={filters} />
        </div>
      </div>
    </div>
  );
};

interface FiltersContentProps {
  columns?: number;
  filters: filtersProps;
  makeFilters?: string[] | null;
}
const MakeContent: React.FC<FiltersContentProps> = ({ columns, filters }) => {
  const router = useRouter();

  return (
    <div
      className={`h-fit px-2 grid grid-cols-${columns} grid-rows-${columns === 1 ? 39 : 13
        }`}
    >
      {MakeDropdownContent.map((value) => (
        <div className="flex relative items-center p-2" key={value}>
          <div onClick={() => addToFilters(value, "make", filters, router)}>
            <input
              type="checkbox"
              className={` ${filters["make"].includes(value)
                  ? "bg-[#f2ca16] border-[#f2ca16]"
                  : "bg-white/5 border-white/10"
                } relative peer h-5 w-5 cursor-pointer appearance-none rounded-md border transition-opacity make-checkbox`}
            />
            {filters["make"].includes(value) && (
              <div className="pointer-events-none absolute top-5 left-[22px] -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity opacity-100">
                <Image
                  src={CheckIcon}
                  width={10}
                  height={7}
                  alt="dropdown arrow"
                  className="w-[10px] h-[7px] mr-2"
                />
              </div>
            )}
          </div>
          <label className="pl-3">{value}</label>
          <br />
        </div>
      ))}
    </div>
  );
};

const CategoryDropdownContent = [
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
];

const CategoryDropdown: React.FC<FiltersDropdownProps> = ({ filters }) => {
  return (
    <>
      <div
        className="absolute p-4 left-0 z-10 mt-2 w-[400px] h-[312px] origin-top-right rounded-md bg-[#1A2C3D] text-white shadow-lg "
        role="menu"
        aria-labelledby="menu-button"
        tabIndex={-1}
      >
        <CategoryContent columns={2} filters={filters} />
      </div>
    </>
  );
};

const CategoryContent: React.FC<FiltersContentProps> = ({
  columns,
  filters,
}) => {
  const router = useRouter();
  return (
    <div className={`px-2 grid grid-cols-${columns}`}>
      {CategoryDropdownContent.map((value) => (
        <div className="flex relative items-center p-2" key={value}>
          <div onClick={() => addToFilters(value, "category", filters, router)}>
            <input
              type="checkbox"
              className={` ${filters["category"].includes(value)
                  ? "bg-[#f2ca16] border-[#f2ca16]"
                  : "bg-white/5 border-white/10"
                } relative peer h-5 w-5 cursor-pointer appearance-none rounded-md border transition-opacity category-checkbox`}
            />
            {filters["category"].includes(value) && (
              <div className="pointer-events-none absolute top-5 left-[22px] -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity opacity-100">
                <Image
                  src={CheckIcon}
                  width={10}
                  height={7}
                  alt="dropdown arrow"
                  className="w-[10px] h-[7px] mr-2"
                />
              </div>
            )}
          </div>
          <label className="pl-3">{value}</label>
          <br />
        </div>
      ))}
    </div>
  );
};

const EraDropdownContent = [
  "All",
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
];

const EraDropdown: React.FC<FiltersDropdownProps> = ({ filters }) => {
  return (
    <div>
      <div
        className="absolute p-4 left-0 z-10 mt-2 w-[400px] h-[312px] origin-top-right rounded-md bg-[#1A2C3D] text-white shadow-lg "
        role="menu"
        aria-labelledby="menu-button"
        tabIndex={-1}
      >
        <EraContent columns={2} filters={filters} />
      </div>
    </div>
  );
};

const EraContent: React.FC<FiltersContentProps> = ({ columns, filters }) => {
  const router = useRouter();
  return (
    <div className={`px-2 grid grid-cols-${columns}`}>
      {EraDropdownContent.map((value) => (
        <div className="flex relative items-center p-2" key={value}>
          <div onClick={() => addToFilters(value, "era", filters, router)}>
            <input
              type="checkbox"
              className={` ${filters["era"].includes(value)
                  ? "bg-[#f2ca16] border-[#f2ca16]"
                  : "bg-white/5 border-white/10"
                } relative peer h-5 w-5 cursor-pointer appearance-none rounded-md border transition-opacity era-checkbox`}
            />
            {filters["era"].includes(value) && (
              <div className="pointer-events-none absolute top-5 left-[22px] -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity opacity-100">
                <Image
                  src={CheckIcon}
                  width={10}
                  height={7}
                  alt="dropdown arrow"
                  className="w-[10px] h-[7px] mr-2"
                />
              </div>
            )}
          </div>
          <label className="pl-3">{value}</label>
          <br />
        </div>
      ))}
    </div>
  );
};

const LocationDropdownContent = [
  "All",
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
];

const LocationDropdown: React.FC<FiltersDropdownProps> = ({ filters }) => {
  return (
    <div>
      <div className="absolute p-4 left-0 z-10 mt-2 w-[400px] h-[312px] origin-top-right rounded-md bg-[#1A2C3D] text-white shadow-lg ">
        <LocationContent columns={2} filters={filters} />
      </div>
    </div>
  );
};

const LocationContent: React.FC<FiltersContentProps> = ({
  columns,
  filters,
}) => {
  const router = useRouter();
  return (
    <div className={`px-2 grid grid-cols-${columns}`}>
      {LocationDropdownContent.map((value) => {
        return (
          <div
            className="flex relative items-center p-2"
            key={value}
          >
            <div
              onClick={() => addToFilters(value, "location", filters, router)}
            >
              <input
                type="checkbox"
                className={` ${filters["location"].includes(value)
                    ? "bg-[#f2ca16] border-[#f2ca16]"
                    : "bg-white/5 border-white/10"
                  } relative peer h-5 w-5 cursor-pointer appearance-none rounded-md border transition-opacity location-checkbox`}
              />
              {filters["location"].includes(value) && (
                <div className="pointer-events-none absolute top-5 left-[22px] -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity opacity-100">
                  <Image
                    src={CheckIcon}
                    width={10}
                    height={7}
                    alt="dropdown arrow"
                    className="w-[10px] h-[7px] mr-2"
                  />
                </div>
              )}
            </div>
            <label className="pl-3">{value}</label>
            <br />
          </div>
        );
      })}
    </div>
  );
};

const addSortToFilters = (
  value: string,
  filters: filtersProps,
  router: any
) => {
  let newFilters = { ...filters };
  let queryArray: any = [];

  if (!newFilters["make"].includes("All")) {
    newFilters["make"].map((item) => {
      queryArray.push(`make=${item.split(" ").join("%20")}`);
    });
  }

  if (!newFilters["category"].includes("All")) {
    newFilters["category"].map((item) => {
      queryArray.push(`category=${encodeURIComponent(item)}`);
    });
  }

  if (!newFilters["era"].includes("All")) {
    newFilters["era"].map((item) => {
      queryArray.push(`era=${encodeURIComponent(item)}`);
    });
  }

  if (!newFilters["location"].includes("All")) {
    newFilters["location"].map((item) => {
      queryArray.push(`location=${encodeURIComponent(item)}`);
    });
  }

  queryArray.push(`sort=${encodeURIComponent(value)}`);

  const queryString = queryArray.join("&");
  router.push("/auctions?" + queryString);
};

const SortDropdown: React.FC<FiltersDropdownProps> = ({ filters }) => {
  return (
    <div className="absolute right-0 z-10 mt-2 w-[320px] h-[312px]  rounded-md bg-[#1A2C3D] text-white shadow-lg ">
      <div className="p-4">
        <SortContent filters={filters} />
      </div>
    </div>
  );
};

const SortContent: React.FC<FiltersContentProps> = ({ filters }) => {
  const route = useRouter();
  const SortList = [
    "Top Performers",
    "Newly Listed",
    "Most Expensive",
    "Least Expensive",
    "Most Bids",
    "Least Bids",
    "Ending Soon",
  ];

  return (
    <>
      {SortList.map((value) => {
        return (
          <button
            className={`${filters["sort"] === value ? "bg-white/10" : ""
              } hover:bg-white/5 rounded p-2 block w-full text-left`}
            key={value}
            onClick={() => addSortToFilters(value, filters, route)}
          >
            {value}
          </button>
        );
      })}
    </>
  );
};
