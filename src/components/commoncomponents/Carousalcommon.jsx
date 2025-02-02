import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function BannerCarousel({ banners = ["assets/banner1.jpg", "assets/banner2.jpeg","assets/banner3.jpg"], interval = 5000, height = "300px" }) {
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    const autoplay = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext(); // Scroll to the next banner
      } else {
        api.scrollTo(0); // Loop back to the first banner
      }
    }, interval);

    return () => clearInterval(autoplay);
  }, [api, interval]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden relative"> {/* Add overflow-hidden and relative positioning */}
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index}>
              <div style={{ height: height }}>
                <img
                  src={banner || "/placeholder.svg"}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation Buttons */}
        <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" /> {/* Position Previous button */}
        <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10" /> {/* Position Next button */}
      </Carousel>
    </div>
  );
}