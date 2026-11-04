"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { A11y, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    image: "/assets/banner-1.jpg",
    alt: "A welcoming reading space filled with books",
    eyebrow: "Find a fresh perspective",
    title: "A new chapter is waiting.",
    note: "Wander the shelves and follow your curiosity.",
  },
  {
    image: "/assets/banner-2.png",
    alt: "A cozy corner to settle in with a good story",
    eyebrow: "Read a little differently",
    title: "Let a story surprise you.",
    note: "Discover a voice, a place, or an idea you haven't met yet.",
  },
  {
    image: "/assets/banner-3.jpg",
    alt: "Books ready to be shared with the community",
    eyebrow: "Pass a good thing along",
    title: "Stories are better shared.",
    note: "Borrow a book, make it yours for a while, then return it.",
  },
];

export default function HomeCarousel() {
  return (
    <section aria-label="Featured reads" className="overflow-hidden rounded-[2rem] bg-[#00022E] text-white shadow-2xl">
      <Swiper
        className="booknook-carousel"
        modules={[A11y, Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop
        aria-label="BookNook featured stories"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.image}>
            <article className="relative isolate flex min-h-[420px] items-center overflow-hidden sm:min-h-[500px]">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={slide.image === slides[0].image}
                sizes="100vw"
                className="-z-20 object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#00022E]/95 via-[#00022E]/75 to-[#00022E]/20" />
              <div className="max-w-3xl px-8 py-16 sm:px-16 sm:py-20">
                <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-[#efb39c]">{slide.eyebrow}</p>
                <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-6xl">{slide.title}</h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/85">{slide.note}</p>
                <Link href="/books" className="btn mt-8 border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]">
                  Browse Books <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
