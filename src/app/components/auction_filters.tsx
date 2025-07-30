import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./badge";
import { Button } from "./ui/button";

interface IFilter {
  make: string;
  priceRange: string;
  status: "active" | "ending_soon" | "ended";
}
interface IProps {
  filters: IFilter;
  setFilters: (filter: IFilter) => void;
}
export const AuctionFilters = ({ filters, setFilters }: IProps) => {
  // const makes = [
  //   "All Makes",
  //   "Porsche",
  //   "Ferrari",
  //   "Aston Martin",
  //   "BMW",
  //   "Mercedes-Benz",
  // ];
  const makes = [
    { label: "All Makes", value: "all" },
    { label: "Porsche", value: "Porsche" },
    { label: "Ferrari", value: "Ferrari" },
    { label: "Aston Martin", value: "Aston Martin" },
    { label: "BMW", value: "BMW" },
    { label: "Mercedes-Benz", value: "Mercedes-Benz" },
  ];
  const priceRanges = [
    { label: "All Prices", value: "0" },
    { label: "Under $50k", value: "1" },
    { label: "$50k - $100k", value: "2" },
    { label: "$100k - $250k", value: "3" },
    { label: "$250k+", value: "4" },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={filters.make}
        onValueChange={(value: string) =>
          setFilters({ ...filters, make: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Make" />
        </SelectTrigger>
        <SelectContent>
          {makes.map((make) => (
            <SelectItem key={make.value} value={make.value}>
              {make.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priceRange.toString()}
        onValueChange={(value: string) =>
          setFilters({ ...filters, priceRange: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent>
          {priceRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button
          variant={filters.status === "active" ? "default" : "outline"}
          className={`w-24 cursor-pointer px-4 py-2 transition-colors ${filters.status === "active" ? "bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90" : ""} `}
          onClick={() => setFilters({ ...filters, status: "active" })}
        >
          Active
        </Button>
        {/* <Badge
          variant={filters.status === "active" ? "default" : "outline"}
          className="cursor-pointer"
          // onClick={() => setFilters({ ...filters, status: "active" })}
        >
          <button onClick={() => setFilters({ ...filters, status: "active" })}>
            Active
          </button>
        </Badge> */}
        <Button
          variant={filters.status === "ending_soon" ? "default" : "outline"}
          className={`w-24 cursor-pointer px-4 py-2 transition-colors ${filters.status === "ending_soon" ? "bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90" : ""} `}
          onClick={() => setFilters({ ...filters, status: "ending_soon" })}
        >
          Ending Soon
        </Button>
        <Button
          variant={filters.status === "ended" ? "default" : "outline"}
          className={`w-24 cursor-pointer px-4 py-2 transition-colors ${filters.status === "ended" ? "bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90" : ""} `}
          onClick={() => setFilters({ ...filters, status: "ended" })}
        >
          Ended
        </Button>
      </div>
    </div>
  );
};
