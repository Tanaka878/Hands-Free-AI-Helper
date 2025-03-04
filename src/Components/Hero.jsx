import  { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import phone from '../Assets/Images/joinaiphone.png';
import { heroVideo, smallHeroVideo } from '../utils';

const Hero = () => {
  const textRef = useRef(null); // Ref for text
  const imageRef = useRef(null); // Ref for image
  const [videoSrc, setVideoSrc] = useState(heroVideo); // Manage video source

  // Update video source on resize
  useEffect(() => {
    const handleVideoSrcSet = () => {
      const isSmallScreen = window.innerWidth <= 768;
      setVideoSrc(isSmallScreen ? smallHeroVideo : heroVideo);
    };

    handleVideoSrcSet(); // Set initial video source
    window.addEventListener('resize', handleVideoSrcSet);

    return () => {
      window.removeEventListener('resize', handleVideoSrcSet);
    };
  }, []);

  // GSAP animation for the hero text
  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out' }
      );
    }
  }, []);

  // GSAP animation for the hero image
  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 2, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <section className="section-headstream w-full nav-height bg-transparent relative pt-16 pb-16">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="pointer-events-none w-full h-full object-cover"
          src={videoSrc}
          autoPlay
          loop
          muted
        />
      </div>

      {/* Text Content Overlay */}
      <div className="hero-text relative p-10 z-10 text-white" ref={textRef}>
        <h1>More For Your Money</h1>
        <p>
          Get discounts and red carpet treatment on your favorite products and services
          including parking, accessories, remittances, and more.
        </p>
        <div className="flex flex-wrap gap-5">
          <button className="button">Get Started</button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative z-10 flex justify-center mt-10">
        <div className="hero-image hidden sm:block" ref={imageRef}>
          <img src={phone} alt="iPhone" width={2000} height={2000} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
