import { redirect } from "next/navigation";
import React from "react";

const page = () => {
  redirect("/tournament_page");
  return <div>redirect</div>;
};

export default page;
