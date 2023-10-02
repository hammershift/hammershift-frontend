import React from 'react'

const articleData = [{
    id: "r1",
    title: "Quam temere in vitiis, legem sancimus haerentia.",
    url: "https://libn.com/wp-content/blogs.dir/1/files/2013/12/auto-sales-_Edit-972x648.jpg"
},
{
    id: "r2",
    title: "Quam temere in vitiis, legem sancimus haerentia.",
    url: "https://libn.com/wp-content/blogs.dir/1/files/2013/12/auto-sales-_Edit-972x648.jpg"
},
{
    id: "r3",
    title: "Quam temere in vitiis, legem sancimus haerentia.",
    url: "https://libn.com/wp-content/blogs.dir/1/files/2013/12/auto-sales-_Edit-972x648.jpg"
},
{
    id: "r4",
    title: "Quam temere in vitiis, legem sancimus haerentia.",
    url: "https://libn.com/wp-content/blogs.dir/1/files/2013/12/auto-sales-_Edit-972x648.jpg"
}]

const HowHammerShiftWorks = () => {
    return (
        <div className='tw-bg-[#DCE0D9] tw-text-[#0F1923] tw-w-screen tw-flex tw-justify-center'>
            <div className=' tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-16 md:tw-py-[120px]'>
                <header>
                    <h1 className='tw-text-5xl tw-font-bold'>How HammerShift Works</h1>
                </header>

                <section className='tw-mt-8'>
                    <div className='tw-flex tw-flex-col md:tw-flex-row'>
                        <div className='tw-flex tw-justify-between tw-w-full tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8'>
                            <div>
                                <div className='tw-text-[#53944F] tw-font-bold'>Topic</div>
                                <div>{articleData[0].title}</div>
                            </div>
                            <img src={articleData[0].url} width={80} height={80} alt='car' className='tw-w-20 tw-h-20 tw-object-cover tw-ml-6' />
                        </div>
                        <hr />
                        <div className='tw-flex  tw-justify-between tw-w-full tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8'>
                            <div>
                                <div className='tw-text-[#53944F] tw-font-bold'>Topic</div>
                                <div>{articleData[1].title}</div>
                            </div>
                            <img src={articleData[1].url} width={80} height={80} alt='car' className='tw-w-20 tw-h-20 tw-object-cover tw-ml-6' />
                        </div>
                        <hr />
                        <div className='tw-flex  tw-justify-between tw-w-full tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8'>
                            <div>
                                <div className='tw-text-[#53944F] tw-font-bold'>Topic</div>
                                <div>{articleData[2].title}</div>
                            </div>
                            <img src={articleData[2].url} width={80} height={80} alt='car' className='tw-w-20 tw-h-20 tw-object-cover tw-ml-6' />
                        </div>
                        <hr />
                        <div className='tw-flex  tw-justify-between tw-w-full tw-pr-0 md:tw-pr-4 tw-py-4 md:tw-py-8 '>
                            <div>
                                <div className='tw-text-[#53944F] tw-font-bold'>Topic</div>
                                <div>{articleData[3].title}</div>
                            </div>
                            <img src={articleData[3].url} width={80} height={80} alt='car' className='tw-w-20 tw-h-20 tw-object-cover tw-ml-6' />
                        </div>


                    </div>
                </section>
            </div>

        </div>
    )
}

export default HowHammerShiftWorks