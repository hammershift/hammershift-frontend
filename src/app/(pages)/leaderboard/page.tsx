"use client";
import Footer from "@/app/components/footer";
import { LatestNews } from "@/app/components/how_it_works";
import { SubscribeSmall } from "@/app/components/subscribe";
import { getWinnersRank } from "@/lib/getWinners";
import React, { useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";

interface DataItem {
  rank: number;
  user: string;
  numberOfWinnings: number;
}

const LeaderBoardPage = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getWinners = async () => {
      setLoading(true);
      const res = await getWinnersRank();
      if (!res) return;
      setData(res.winners);
      setLoading(false);
    };
    getWinners();
  }, []);

  return (
    <div className="page-container">
      <div className="section-container grid gap-8 pb-16">
        <div className="font-bold text-3xl md:text-5xl">
          Top Winners
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full md:table-fixed">
            <thead className="text-xl md:text-2xl text-black bg-[#F2CA16]">
              <tr className="leading-10">
                <th className="sm:w-1/3">RANK</th>
                <th className="sm:w-1/3">USER</th>
                <th className="sm:w-1/3">WINS</th>
              </tr>
            </thead>
            <tbody className="text-center space-y-1">
              {data.length > 0 &&
                (data as DataItem[]).map((item, index) => (
                  <tr
                    key={index + "LDB"}
                    className={`leading-10 ${index % 2 === 1 ? "bg-white/5" : ""
                      }`}
                  >
                    <td className="sm:w-1/3">{item.rank}</td>
                    <td className="sm:w-1/3">{item.user}</td>
                    <td className="sm:w-1/3">{item.numberOfWinnings}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
      <LatestNews />
      <SubscribeSmall />
      <Footer />
    </div>
  );
};

export default LeaderBoardPage;

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-[50vh]">
      <BounceLoader color="#F2CA16" />
    </div>
  );
};
