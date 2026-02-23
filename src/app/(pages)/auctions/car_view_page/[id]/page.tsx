import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Auctions from "@/models/auction.model";
import { Predictions } from "@/models/predictions.model";
import connectToDB from "@/lib/mongoose";
import { Card, CardContent } from "@/app/components/card_component";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/ui/button";
import CountdownTimer from "@/app/components/CountdownTimer";
import { CommentsSection } from "@/app/components/CommentsSection";
import { Clock, Users, TrendingUp, ChevronLeft } from "lucide-react";
import ClientAuctionTracker from "@/app/components/ClientAuctionTracker";
import PredictionFormClient from "@/app/components/PredictionFormClient";
import RecentPredictionsFeed from "@/app/components/RecentPredictionsFeed";
import { ShareCard } from "@/app/components/ShareCard";
import { PriceDistribution } from "@/app/components/PriceDistribution";
import { CompsTable } from "@/app/components/CompsTable";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// Format currency
const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Server-side data fetching
async function getAuctionData(auctionId: string, userId?: string) {
  try {
    await connectToDB();

    // Main auction data
    const auction = await Auctions.findById(auctionId).lean().exec();

    if (!auction) {
      return null;
    }

    // User's prediction (if logged in)
    const userPrediction = userId
      ? await Predictions.findOne({
          auction_id: auctionId,
          'user.userId': userId
        }).lean().exec()
      : null;

    // Prediction stats
    const predictionStats = await Predictions.aggregate([
      { $match: { auction_id: auction._id } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avg: { $avg: '$predictedPrice' },
          min: { $min: '$predictedPrice' },
          max: { $max: '$predictedPrice' }
        }
      }
    ]);

    // Recent predictions (for live feed)
    const recentPredictions = await Predictions.find({
      auction_id: auction._id
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    // All predicted prices for distribution chart
    const allPredictions = await Predictions.find(
      { auction_id: auction._id },
      { predictedPrice: 1, _id: 0 }
    )
      .lean()
      .exec();
    const predictedPrices: number[] = allPredictions
      .map((p: any) => p.predictedPrice)
      .filter(Boolean);

    // Top 3 predictors for this auction (by score)
    const topPredictors = await Predictions.find({
      auction_id: auction._id,
      score: { $exists: true, $ne: null }
    })
      .sort({ score: -1 })
      .limit(3)
      .lean()
      .exec();

    // Similar auctions (same make + model)
    const auctionMake = auction.attributes?.find((attr: any) => attr.key === 'make')?.value;
    const auctionModel = auction.attributes?.find((attr: any) => attr.key === 'model')?.value;

    const similarAuctions = await Auctions.find({
      $or: [
        { 'attributes.value': auctionMake },
        { 'attributes.value': auctionModel }
      ],
      statusAndPriceChecked: true,
      _id: { $ne: auction._id }
    })
      .sort({ 'sort.deadline': -1 })
      .limit(4)
      .lean()
      .exec();

    return {
      auction: JSON.parse(JSON.stringify(auction)),
      userPrediction: userPrediction ? JSON.parse(JSON.stringify(userPrediction)) : null,
      predictionStats: predictionStats[0] || { count: 0, avg: 0, min: 0, max: 0 },
      recentPredictions: JSON.parse(JSON.stringify(recentPredictions)),
      topPredictors: JSON.parse(JSON.stringify(topPredictors)),
      similarAuctions: JSON.parse(JSON.stringify(similarAuctions)),
      predictedPrices,
    };
  } catch (error) {
    console.error('Error fetching auction data:', error);
    return null;
  }
}

export default async function AuctionDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const data = await getAuctionData(params.id, session?.user?.id);

  if (!data || !data.auction) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Auction Not Found</h2>
          <p className="text-gray-400">This auction may have been removed or does not exist.</p>
          <Link href="/free_play" className="mt-4 inline-block">
            <Button className="bg-[#E94560]">Browse Auctions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { auction, userPrediction, predictionStats, recentPredictions, topPredictors, similarAuctions, predictedPrices } = data;

  // Parse attributes
  const priceAttr = auction.attributes?.find((a: any) => a.key === 'price') || auction.sort?.price || 0;
  const currentBid = typeof priceAttr === 'object' ? priceAttr.value : auction.sort?.price || 0;
  const deadline = auction.sort?.deadline;
  const makeAttr = auction.attributes?.find((a: any) => a.key === 'make')?.value || 'Unknown';
  const modelAttr = auction.attributes?.find((a: any) => a.key === 'model')?.value || '';
  const yearAttr = auction.attributes?.find((a: any) => a.key === 'year')?.value || '';

  // Check if auction is locked (< 1 hour before end)
  const now = new Date();
  const auctionEnd = deadline ? new Date(deadline) : now;
  const timeUntilEnd = auctionEnd.getTime() - now.getTime();
  const isLocked = timeUntilEnd < 3600000; // 1 hour in milliseconds
  const hasEnded = timeUntilEnd <= 0;

  // Calculate suggested price range (±30% of current bid)
  const minSuggested = Math.floor(currentBid * 0.7);
  const maxSuggested = Math.floor(currentBid * 1.3);

  return (
    <div className="flex w-full flex-col">
      {/* Client-side tracking */}
      <ClientAuctionTracker
        auctionId={params.id}
        auctionTitle={auction.title}
        currentBid={currentBid}
        timeRemaining={deadline}
      />

      {/* Back Navigation */}
      <div className="section-container mx-auto mt-4 px-4">
        <Link href="/free_play" className="inline-flex items-center text-gray-400 hover:text-white">
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Back to Auctions</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative mt-4 h-[400px] w-full md:h-[500px]">
        <Image
          src={auction.image || '/images/default-car.jpg'}
          alt={auction.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A] via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="section-container mx-auto">
            <h1 className="mb-4 text-3xl font-bold md:text-5xl">{auction.title}</h1>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-sm text-gray-400">Current Bid</div>
                <div className="font-mono text-2xl font-bold text-[#00D4AA] md:text-3xl">
                  {USDollar.format(currentBid)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Time Remaining</div>
                <div className="flex items-center text-xl font-bold md:text-2xl">
                  <Clock className="mr-2 h-6 w-6 text-[#FFB547]" />
                  <CountdownTimer endTime={new Date(deadline)} size="lg" />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Predictions</div>
                <div className="flex items-center text-xl font-bold md:text-2xl">
                  <Users className="mr-2 h-6 w-6 text-[#E94560]" />
                  <span className="font-mono">{predictionStats.count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Layout */}
      <div className="section-container mx-auto mt-8 flex flex-col gap-8 px-4 lg:flex-row">
        {/* LEFT COLUMN (65%) */}
        <div className="w-full lg:w-2/3">
          {/* Prediction Stats Card */}
          {predictionStats.count > 0 && (
            <Card className="mb-8 border-[#1E2A36] bg-[#13202D]">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Community Predictions</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-gray-400">Average</div>
                    <div className="font-mono text-xl font-bold text-[#00D4AA]">
                      {USDollar.format(predictionStats.avg)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Range</div>
                    <div className="text-sm font-mono text-gray-300">
                      {USDollar.format(predictionStats.min)} - {USDollar.format(predictionStats.max)}
                    </div>
                  </div>
                  {userPrediction && (
                    <div>
                      <div className="text-sm text-gray-400">Your Prediction</div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-xl font-bold text-[#E94560]">
                          {USDollar.format(userPrediction.predictedPrice)}
                        </div>
                        {userPrediction.score && (
                          <Badge className="bg-[#FFB547] text-[#0A0A1A]">
                            {userPrediction.score} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Gallery */}
          <Card className="mb-8 border-[#1E2A36] bg-[#13202D]">
            <CardContent className="p-4">
              <h2 className="mb-4 text-xl font-bold">Photos</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {auction.images_list?.slice(0, 6).map((img: any, idx: number) => (
                  <div key={idx} className="relative h-[150px]">
                    <Image
                      src={img.src}
                      alt={`${auction.title} - Photo ${idx + 1}`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="mb-8 border-[#1E2A36] bg-[#13202D]">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Specifications</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {auction.attributes?.slice(0, 12).map((attr: any, idx: number) => (
                  <div key={idx} className="flex justify-between border-b border-[#1E2A36] pb-2">
                    <span className="text-gray-400">{attr.key}</span>
                    <span className="font-semibold">{attr.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {auction.description && auction.description.length > 0 && (
            <Card className="mb-8 border-[#1E2A36] bg-[#13202D]">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Description</h2>
                <div className="space-y-2 text-gray-300">
                  {auction.description.map((para: string, idx: number) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Similar Results */}
          {similarAuctions.length > 0 && (
            <Card className="mb-8 border-[#1E2A36] bg-[#13202D]">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Similar Auctions</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {similarAuctions.map((similar: any) => (
                    <Link key={similar._id} href={`/auctions/car_view_page/${similar._id}?mode=free_play`}>
                      <Card className="border-[#1E2A36] bg-[#0A0A1A] transition-all hover:border-[#E94560]">
                        <div className="relative h-[120px]">
                          <Image
                            src={similar.image}
                            alt={similar.title}
                            fill
                            className="rounded-t-lg object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h4 className="mb-2 line-clamp-1 text-sm font-bold">{similar.title}</h4>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Final Price</span>
                            <span className="font-mono font-bold text-[#00D4AA]">
                              {USDollar.format(similar.sort?.price || 0)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <div className="mb-8">
            <CommentsSection pageID={params.id} pageType="auction" />
          </div>
        </div>

        {/* RIGHT COLUMN (35% - Sticky) */}
        <div className="w-full lg:sticky lg:top-4 lg:h-fit lg:w-1/3">
          {/* Prediction Form Card */}
          <Card className="mb-8 border-[#E94560]/30 bg-[#13202D]">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Make Your Prediction</h2>

              {isLocked || hasEnded ? (
                <div className="text-center">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-400">
                    {hasEnded ? 'This auction has ended' : 'Predictions locked (less than 1 hour remaining)'}
                  </p>
                </div>
              ) : !session ? (
                <PredictionFormClient
                  auctionId={params.id}
                  minPrice={minSuggested}
                  maxPrice={maxSuggested}
                  currentBid={currentBid}
                  deadline={deadline}
                  isGuest={true}
                />
              ) : userPrediction ? (
                <div className="text-center">
                  <div className="mb-4 rounded-lg bg-[#00D4AA]/10 p-4">
                    <div className="text-sm text-gray-400">Your Prediction</div>
                    <div className="font-mono text-3xl font-bold text-[#00D4AA]">
                      {USDollar.format(userPrediction.predictedPrice)}
                    </div>
                    {userPrediction.bonus_modifiers?.early_bird && (
                      <Badge className="mt-2 bg-[#FFB547] text-[#0A0A1A]">
                        +50 Early Bird Bonus
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Prediction submitted. Good luck!
                  </p>
                  <ShareCard
                    predictionId={String(userPrediction._id)}
                    auctionId={String(auction._id)}
                    auctionTitle={auction.title}
                  />
                </div>
              ) : (
                <PredictionFormClient
                  auctionId={params.id}
                  minPrice={minSuggested}
                  maxPrice={maxSuggested}
                  currentBid={currentBid}
                  deadline={deadline}
                />
              )}
            </CardContent>
          </Card>

          {/* Community Sidebar */}
          <Card className="mb-8 border-[#1E2A36] bg-[#13202D]">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-bold">Recent Predictions</h3>
              <RecentPredictionsFeed
                auctionId={params.id}
                initialPredictions={recentPredictions}
              />
            </CardContent>
          </Card>

          {/* Market Data */}
          <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5 space-y-6 mb-8">
            <h3 className="text-white font-semibold text-base">Market Data</h3>
            <PriceDistribution
              predictions={predictedPrices}
              userPrediction={userPrediction?.predictedPrice}
            />
            <CompsTable
              auctionId={String(auction._id)}
              currentBid={auction.sort?.price}
            />
          </div>

          {/* Top Predictors */}
          {topPredictors.length > 0 && (
            <Card className="border-[#1E2A36] bg-[#13202D]">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold">Top Predictors</h3>
                <div className="space-y-3">
                  {topPredictors.map((predictor: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                          idx === 0 ? 'bg-[#FFB547] text-[#0A0A1A]' :
                          idx === 1 ? 'bg-[#C0C0C0] text-[#0A0A1A]' :
                          'bg-[#CD7F32] text-[#0A0A1A]'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-semibold">{predictor.user?.username}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#00D4AA]">
                        {predictor.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
