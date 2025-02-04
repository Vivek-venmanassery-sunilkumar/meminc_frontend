import BannerCarousel from "@/components/commoncomponents/Carousalcommon";
import Footer from "@/components/commoncomponents/Footer";
import Header from "@/components/landingpagecomponents/Header";
import ProductListing from "@/components/landingpagecomponents/Productlisting";



export default function Landingpage(){
    return(
        <>
            <Header/>
            <main className="pt-[120px]">
                <BannerCarousel/>
                <ProductListing/>
                <Footer/>
            </main>
        </>
    )
}