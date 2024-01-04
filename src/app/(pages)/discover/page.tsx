"use client";
import React, { useState } from "react";
import FiltersAndSort from "@/app/components/filter_and_sort";
import DiscoverPage from "../discover_page/page";

const filtersInitialState = {
  make: ["All"],
  category: ["All"],
  era: ["All"],
  location: ["All"],
  sort: "Newly Listed",
};

const Discover = () => {
  const [filters, setFilters] = useState(filtersInitialState);
  return (
    <div className="section-container">
      <FiltersAndSort filters={filters} setFilters={setFilters} />
      <DiscoverPage />
    </div>
  );
};

export default Discover;
