import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Hero() {
  return (
    <section className="md:px-14">
      <div className="mx-auto max-w-screen-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-last lg:h-full">
            <Image
              alt=""
              src="/doctors.jpg"
              width={800}
              height={800}
              className="absolute inset-0 h-full w-full rounded-3xl
            object-cover"
            />
          </div>

          <div className="lg:py-24">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Find & Book
              <span className="text-primary"> Appointment</span> with your
              India's Best <span className="text-primary">Doctors</span>
            </h2>

            <p className="mt-4 text-gray-600">
              Connect with top specialists, book in-person or online
              consultations, and receive quality care tailored to your needs.
              Effortlessly schedule your appointments and manage your health
              with ease.
            </p>

            <Button className="mt-10">
              <Link href={`/login`}>Explore Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
