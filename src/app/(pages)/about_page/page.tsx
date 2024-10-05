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
        <div className="page-container tw-pt-16 tw-gap-16">
            <div className="section-container tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-pb-8 tw-gap-6">
                <div className="tw-w-full md:tw-w-[640px] tw-text-5xl md:tw-text-6xl tw-font-bold">
                    We are building a<br />
                    vibrant community for{" "}
                    <span className="tw-text-[#F2CA16]">car enthusiasts</span>
                </div>
                <div className="tw-w-full md:tw-w-[528px] tw-opacity-80 tw-self-end">
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
                className="sm:tw-w-[1440px] tw-h-[495px] tw-object-cover"
            />
            <div className="section-container tw-pt-8 tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-6">
                <div className="tw-font-bold tw-text-5xl">
                    Passion for <br />
                    automobiles
                </div>
                <div className=" tw-text-2xl tw-max-w-[752px]">
                    <div className="tw-font-bold ">
                        Founded by experienced entrepreneurs{" "}
                        <span className="tw-text-[#F2CA16]">Rick Deacon</span>{" "}
                        and{" "}
                        <span className="tw-text-[#F2CA16]">Ryan Turri</span>,
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
            <div className="tw-w-screen xl:tw-px-16 tw-pt-8 md:tw-pt-16 2xl:tw-w-[1440px] tw-flex tw-flex-col sm:tw-flex-row tw-gap-16 tw-pt-8">
                <div>
                    <Image
                        src={RyanTurri}
                        width={624}
                        height={640}
                        alt="ryan turri"
                        className="tw-w-[624px] tw-h-[360px] md:tw-h-[480px] xl:tw-h-[640px] tw-object-cover"
                    />
                    <div className="tw-ml-4 xl:tw-ml-0">
                        <div className="tw-text-xl tw-mt-6">Ryan Turri</div>
                        <div className="tw-text-lg tw-opacity-80">
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
                        className="tw-w-[624px] tw-h-[360px] md:tw-h-[480px] xl:tw-h-[640px] tw-object-cover"
                    />
                    <div className="tw-ml-4 xl:tw-ml-0">
                        <div className="tw-text-xl tw-mt-6">Rick Deacon</div>
                        <div className="tw-text-lg tw-opacity-80">
                            Designation
                        </div>
                    </div>
                </div>
            </div>
            <div className="section-container tw-pt-8 tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-6">
                <div className="tw-font-bold tw-text-5xl">
                    Passion for <br />
                    automobiles
                </div>
                <div className=" tw-text-2xl tw-max-w-[752px]">
                    <div className="tw-font-bold">
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
            <div className="tw-w-full">
                <HowHammerShiftWorks />
                <SubscribeSmall />
            </div>
            <Footer />
        </div>
    );
};

export default AboutPage;
