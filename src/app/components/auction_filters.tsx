import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./badge";

interface IFilter {
  make: string;
  priceRange: string;
  status: string;
}
interface IProps {
  filters: IFilter;
  setFilters: (filter: IFilter) => void;
}
export const AuctionFilters = ({ filters, setFilters }: IProps) => {
  const makes = [
    "All Makes",
    "Porsche",
    "Ferrari",
    "Aston Martin",
    "BMW",
    "Mercedes-Benz",
  ];
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $50k", value: "0-50000" },
    { label: "$50k - $100k", value: "50000-100000" },
    { label: "$100k - $250k", value: "100000-250000" },
    { label: "$250k+", value: "250000+" },
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
            <SelectItem key={make} value={make.toLowerCase()}>
              {make}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priceRange}
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
        <Badge
          variant={filters.status === "active" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilters({ ...filters, status: "active" })}
        >
          Active
        </Badge>
        <Badge
          variant={filters.status === "ending_soon" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilters({ ...filters, status: "ending_soon" })}
        >
          Ending Soon
        </Badge>
        <Badge
          variant={filters.status === "ended" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilters({ ...filters, status: "ended" })}
        >
          Ended
        </Badge>
      </div>
    </div>
  );
};
