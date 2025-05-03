"use client";
import { Badge } from "@/app/components/badge";
import { Card, CardContent } from "@/app/components/card_component";
import { Button } from "@/app/components/ui/button";
import { createPageUrl } from "@/app/components/utils";
import { usePrediction } from "@/app/context/predictionContext";
import { getCarData } from "@/lib/data";
import { Car } from "@/models/auction.model";
import { Prediction } from "@/models/predictions.model";
import {
  CheckCircle,
  Home,
  RefreshCw
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FreePlaySuccessPage() {
  const navigate = useRouter();
  const { latestPrediction } = usePrediction();
  const [prediction, setPrediction] = useState<Prediction>();
  const [car, setCar] = useState<Car>();
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();

  useEffect(() => {
    loadPredictionData();
  }, [session, status]);

  const loadPredictionData = async () => {
    try {

      if (latestPrediction) {
        setPrediction(latestPrediction);

        if (latestPrediction.carId) {
          const carDetails = await getCarData(latestPrediction.carId);
          setCar(carDetails);
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading prediction data:", error);
      setLoading(false)
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#F2CA16]"></div>
          <p className="text-gray-400">Loading your prediction...</p>
        </div>
      </div>
    );
  }

  if (!prediction || !car) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">No Recent Prediction Found</h1>
        <p className="mb-8 text-gray-400">
          {"We couldn't find a recent prediction. Try making a new one!"}
        </p>
        <Link href={createPageUrl("free_play")}>
          <Button className="bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90">
            Make a Prediction
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F2CA16]/10">
          <CheckCircle className="h-10 w-10 text-[#F2CA16]" />
        </div>

        <h1 className="mb-2 text-3xl font-bold">Prediction Submitted!</h1>
        <p className="mb-8 text-lg text-gray-400">
          {
            "Your Free Play prediction has been recorded. We'll let you know when the auction ends!"
          }
        </p>

        <Card className="mb-8 border-[#1E2A36] bg-[#13202D]">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{car.title}</h2>
              <Badge className="bg-[#F2CA16]/10 text-[#F2CA16]">
                FREE PLAY
              </Badge>
            </div>

            <div className="grid gap-6 text-left md:grid-cols-2">
              <div>
                <p className="mb-1 text-sm text-gray-400">Current Bid</p>
                <p className="text-2xl font-bold">
                  {car.sort!.bids.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-400">Your Prediction</p>
                <p className="text-2xl font-bold text-[#F2CA16]">
                  ${prediction.predictedPrice?.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-center gap-4 md:flex-row">
          <Link href={createPageUrl("")}>
            <Button
              variant="outline"
              className="border-[#1E2A36] hover:bg-[#1E2A36]"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <Link href={createPageUrl("free_play")}>
            <Button
              variant="outline"
              className="border-[#1E2A36] hover:bg-[#1E2A36]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Make Another Prediction
            </Button>
          </Link>

          {/* <Button
            className="bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90"
            onClick={() => navigate.push(createPageUrl("Leaderboard"))}
          >
            <BarChart className="mr-2 h-4 w-4" />
            View Leaderboard
          </Button> */}
        </div>
      </div>
    </div>
  );
}
