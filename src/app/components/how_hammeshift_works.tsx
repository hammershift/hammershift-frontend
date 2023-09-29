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
        <div className='tw-bg-[#DCE0D9] tw-text-[#0F1923] tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-py-40'>
            <header>
                <h1 className='tw-text-5xl tw-font-bold'>How HammerShift Works</h1>
            </header>

            <section>
                <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-16'>
                    {articleData.map((data) => {
                        return <div key={data.id} className='tw-flex tw-py-8 tw-justify-between tw-w-full'>
                            <div>
                                <div className='tw-text-[#53944F] tw-font-bold'>Topic</div>
                                <div>{data.title}</div>
                            </div>
                            <img src={data.url} width={80} height={80} alt='car' className='tw-w-20 tw-h-20 tw-object-cover tw-ml-6' />

                        </div>
                    })}

                </div>
            </section>
        </div>
    )
}

export default HowHammerShiftWorks