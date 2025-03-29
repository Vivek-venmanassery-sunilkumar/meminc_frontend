import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import api from "@/axios/axiosInstance";

export default function BannerCarousel({ interval = 5000, height = "300px" }) {
  const [carouselApi, setCarouselApi] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get("admin/fetch-banner/");
        // Filter banners where both is_active and is_active_admin are true
        const activeBanners = response.data.filter(
          banner => banner.is_active && banner.is_active_admin
        );
        setBanners(activeBanners);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch banners");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []); // Empty dependency array since api is imported

  useEffect(() => {
    if (!carouselApi || banners.length === 0) {
      return;
    }

    const autoplay = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, interval);

    return () => clearInterval(autoplay);
  }, [carouselApi, interval, banners]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse">Loading banners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div>No active banners available</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden relative">
      <Carousel className="w-full" setApi={setCarouselApi}>
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div style={{ height: height }}>
                <img
                  src={banner.image || "/placeholder.svg"}
                  alt={`Promotional banner ${banner.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                  loading="lazy"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/50 hover:bg-white/80" />
            <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/50 hover:bg-white/80" />
          </>
        )}
      </Carousel>
    </div>
  );
}