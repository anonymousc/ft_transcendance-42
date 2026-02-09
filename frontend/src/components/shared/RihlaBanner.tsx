import Rihlaimg from '../../assets/Frame 1.png';
import DiscoverBtn from "./DiscoverBtn";

function RIhlaBanner( {rihlaRef} : {rihlaRef: React.RefObject<HTMLElement | null>}) {
  return (
    <section className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center py-16 px-8" ref={rihlaRef}>
      <img src={Rihlaimg} alt="Rihla" className="w-full max-w-[1000px] block px-16 h-auto object-contain rounded-lg" />
      <DiscoverBtn />
    </section>
  );
}

export default RIhlaBanner;
