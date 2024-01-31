import { redirect } from "next/navigation";
import React from "react";

const page = () => {
  redirect("/auctions");
  return <div>redirect</div>;
};

export default page;
