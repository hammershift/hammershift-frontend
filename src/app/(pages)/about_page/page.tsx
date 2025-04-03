"use client";
import Image from "next/image";
import Footer from "../../components/footer";
import HowHammerShiftWorks from "../../components/how_hammeshift_works";
import { SubscribeSmall } from "../../components/subscribe";

import AboutImage from "../../../../public/images/about-image.svg";
import RickDeacon from "../../../../public/images/rick-deacon.svg";
import RyanTurri from "../../../../public/images/ryan-turri.svg";

const AboutPage = () => {
    return (
        <div className="page-container pt-16 gap-16">
            <div className="section-container flex flex-col sm:flex-row justify-between pb-8 gap-6">
                <div className="w-full md:w-[640px] text-5xl md:text-6xl font-bold">
                    We are building a<br />
                    vibrant community for{" "}
                    <span className="text-[#F2CA16]">car enthusiasts</span>
                </div>
                <div className="w-full md:w-[528px] opacity-80 self-end">
                    Whether you&apos;re passionate about classic cars,
                    modern sports cars, or anything in between,
                    our platform is the perfect place to connect with like-minded individuals.
                    Join us and fuel your passion for cars!
                </div>
            </div>
            <Image
                src={AboutImage}
                width={1440}
                height={495}
                alt="smiling people"
                className="sm:w-[1440px] h-[495px] object-cover"
            />
            <div className="section-container pt-8 flex flex-col sm:flex-row justify-between gap-6">
                <div className="font-bold text-5xl">
                    Passion for <br />
                    automobiles
                </div>
                <div className=" text-2xl max-w-[752px]">
                    <div className="font-bold ">
                        Founded by experienced entrepreneurs{" "}
                        <span className="text-[#F2CA16]">Rick Deacon</span>{" "}
                        and{" "}
                        <span className="text-[#F2CA16]">Ryan Turri</span>,
                        Hammershift is not just a company; {"it's"} a vibrant
                        community for car enthusiasts.
                    </div>
                    <br />
                    <div>
                        We foster a space where individuals can engage with the
                        thrill and prestige of car auctions, yet without the
                        pressure of committing substantial finances.Our team
                        leverages a deep - rooted passion for automobiles and an
                        innovative mindset to bring an inclusive, exciting, and
                        affordable experience to every car lover out there.
                    </div>
                </div>
            </div>
            <div className="w-screen xl:px-16 pt-8 md:pt-16 2xl:w-[1440px] flex flex-col sm:flex-row gap-16 pt-8">
                <div>
                    <Image
                        src={RyanTurri}
                        width={624}
                        height={640}
                        alt="ryan turri"
                        className="w-[624px] h-[360px] md:h-[480px] xl:h-[640px] object-cover"
                    />
                    <div className="ml-4 xl:ml-0">
                        <div className="text-xl mt-6">Ryan Turri</div>
                        <div className="text-lg opacity-80">
                            Designation
                        </div>
                    </div>
                </div>
                <div>
                    <Image
                        src={RickDeacon}
                        width={624}
                        height={640}
                        alt="rick deacon"
                        className="w-[624px] h-[360px] md:h-[480px] xl:h-[640px] object-cover"
                    />
                    <div className="ml-4 xl:ml-0">
                        <div className="text-xl mt-6">Rick Deacon</div>
                        <div className="text-lg opacity-80">
                            Designation
                        </div>
                    </div>
                </div>
            </div>
            <div className="section-container pt-8 flex flex-col sm:flex-row justify-between gap-6">
                <div className="font-bold text-5xl">
                    Passion for <br />
                    automobiles
                </div>
                <div className=" text-2xl max-w-[752px]">
                    <div className="font-bold">
                        We believe in empowering individuals to be part of the
                        dynamic world of car auctions, regardless of their
                        budget.
                    </div>
                    <br />
                    <div>
                        By blending technology, industry insights, and an
                        unwavering dedication to community, we make the
                        inaccessible accessible, and the extraordinary ordinary.
                    </div>
                    <br />
                    <div>
                        Our vision is to create a platform that democratizes the
                        car auction experience, fostering an inclusive community
                        that thrives on shared passion and collective growth.
                    </div>
                    <br />
                    <div>
                        With Hammershift, every car enthusiast can enjoy the
                        exhilaration of auctions and the sheer joy of the
                        automobile world.
                    </div>
                    <br />
                </div>
            </div>
            <div className="w-full">
                <HowHammerShiftWorks />
                <SubscribeSmall />
            </div>
            <Footer />
        </div>
    );
};

export default AboutPage;
