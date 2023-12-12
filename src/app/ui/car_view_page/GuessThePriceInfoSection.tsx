import Image from 'next/image';
import LiveGamesIcon from '../../../../public/images/currency-dollar-circle.svg';

export default function GuessThePriceInfoSection() {
  return (
    <div>
      <div className='tw-mt-8 lg:tw-mt-16 tw-p-6 tw-bg-[#172431]'>
        <Image src={LiveGamesIcon} width={68} height={68} alt='car' className='tw-w-[68px] tw-h-[68px]' />
        <div className='tw-text-2xl tw-font-bold tw-mt-6'>What is Guess the Price</div>
        <div className='tw-my-4'>
          Wager on the car auction and guess the final hammer price. Closest player wins the prize. Duis anim adipisicing minim nisi elit quis. Cillum ullamco qui dolore non
          incididunt incididunt non. Aute adipisicing et esse exercitation sunt irure proident enim eu esse nulla. Est excepteur est non. Adipisicing occaecat minim ex duis
          excepteur.
        </div>
        <div className='tw-text-[#42A0FF]'>View Auctions</div>
      </div>
    </div>
  );
}
