import React from "react";
import Image from "next/image";
import articleImageOne from "../../../public/images/howhammershiftworks/article-image-one.svg";
import articleImageTwo from "../../../public/images/howhammershiftworks/article-image-two.svg";
import articleImageThree from "../../../public/images/howhammershiftworks/article-image-three.svg";
import articleImageFour from "../../../public/images/howhammershiftworks/article-image-four.svg";

// interface ArticleData {
//     id: string;
//     title: string;
//     url: string;
// }

// interface HowHammerShiftWorksProps {
//     articleData: ArticleData[];
// }

const HowHammerShiftWorks = () => {
    return (
        <div className="tw-bg-[#DCE0D9] tw-text-[#0F1923] tw-w-full tw-flex tw-justify-center" id="how-hammershift-works">
            <div className=" section-container tw-py-16 md:tw-py-[120px]">
                <header>
                    <h1 className="tw-text-5xl tw-font-bold">
                        How HammerShift Works
                    </h1>
                </header>

                <section className="tw-mt-8">
                    <div className="tw-flex tw-flex-col md:tw-flex-row">
                        <div className="tw-flex tw-flex-wrap">
                            <div className="tw-flex tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px]  tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageOne}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="tw-mx-0 md:tw-mx-4 tw-my-4 md:tw-my-0"
                            />
                            <div className="tw-flex  tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px] tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageTwo}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                        </div>
                        <hr
                            style={{ borderColor: "black", opacity: "10%" }}
                            className="tw-hidden lg:tw-block tw-mx-0 md:tw-mx-4 tw-my-4 md:tw-my-0"
                        />
                        <div className="tw-flex tw-flex-wrap">
                            <div className="tw-flex  tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px] tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8 ">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageThree}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="tw-mx-0 md:tw-mx-4 tw-my-4 md:tw-my-0"
                            />
                            <div className="tw-flex  tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px] tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8 ">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageFour}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HowHammerShiftWorks;

export const LatestNews = () => {
    return (
        <div className="tw-bg-[#DCE0D9] tw-text-[#0F1923] tw-w-full tw-flex tw-justify-center">
            <div className=" section-container tw-py-16 md:tw-py-[120px]">
                <header>
                    <h1 className="tw-text-3xl tw-font-bold">Latest News</h1>
                </header>

                <section className="tw-mt-8">
                    <div className="tw-flex tw-flex-col md:tw-flex-row">
                        <div className="tw-flex tw-flex-wrap">
                            <div className="tw-flex tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px]  tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageOne}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="tw-mx-0 md:tw-mx-4 tw-my-4 md:tw-my-0"
                            />
                            <div className="tw-flex  tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px] tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageTwo}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                        </div>
                        <hr
                            style={{ borderColor: "black", opacity: "10%" }}
                            className="tw-hidden lg:tw-block tw-mx-0 md:tw-mx-4 tw-my-4 md:tw-my-0"
                        />
                        <div className="tw-flex tw-flex-wrap">
                            <div className="tw-flex  tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px] tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8 ">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageThree}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="tw-mx-0 md:tw-mx-4 tw-my-4 md:tw-my-0"
                            />
                            <div className="tw-flex  tw-justify-between tw-w-full tw-min-w-[280px] xl:tw-w-[300px] tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8 ">
                                <div>
                                    <div className="tw-text-[#53944F] tw-font-bold">
                                        Topic
                                    </div>
                                    <div>
                                        Quam temere in vitiis, legem sancimus
                                        haerentia.
                                    </div>
                                </div>
                                <Image
                                    src={articleImageFour}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="tw-w-20 tw-h-20 tw-object-cover tw-ml-6"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
