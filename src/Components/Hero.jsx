import  { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import phone from '../Assets/Images/joinaiphone.png';
import { heroVideo, smallHeroVideo } from '../utils'; 
import { useGSAP } from '@gsap/react';
import { FaMessage } from 'react-icons/fa6';

const Hero = () => {
  const [videoSrc, setVideoSrc] = useState(
    window.innerWidth < 768 ? smallHeroVideo : heroVideo
  );

  const handleVideoSrcSet = () => {
    const newVideoSrc = window.innerWidth < 768 ? smallHeroVideo : heroVideo;
    setVideoSrc(newVideoSrc);
  };

  useEffect(() => {
    const debouncedHandleVideoSrcSet = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handleVideoSrcSet, 150);
    };

    let debounceTimer;
    window.addEventListener('resize', debouncedHandleVideoSrcSet);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', debouncedHandleVideoSrcSet);
    };
  }, []);

  const textRef = useRef(null); // Create a ref for the text
  const imageRef = useRef(null); // Create a ref for the image

  // GSAP animation for the hero image
  useGSAP(() => {
    gsap.killTweensOf('.hero-image img'); // Kill any existing tweens
    gsap.fromTo(
      '.hero-image img',
      {
        x: '100%', // Start position (off-screen right)
        opacity: 0 // Start transparent
      },
      {
        x: '0%', // End position (in view)
        scale: 1, // End scaled to normal size
        opacity: 1, // Fade in
        duration: 2,
        ease: "power2.out",
        onStart: () => {
          console.log('Hero image animation started'); // Log when the animation starts
        },
        onComplete: () => {
          console.log('Hero image animation completed'); // Log when the animation completes
        }
      }
    );
  }, []);

  // GSAP animation for the hero text
  useGSAP(() => {
    gsap.fromTo(
      textRef.current,
      {
        y: 50, // Start position (below view)
        opacity: 0 // Start transparent
      },
      {
        y: 0, // End position (in view)
        opacity: 1, // Fade in
        duration: 1.5,
        ease: "power2.out",
        onStart: () => {
          console.log('Text animation started'); // Log when the text animation starts
        },
        onComplete: () => {
          console.log('Text animation completed'); // Log when the text animation completes
        }
      }
    );
  }, []);

  return (
    <section className="section-headstream w-full nav-height bg-transparent relative pt-16 pb-16">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video className="pointer-events-none w-full h-full object-cover" autoPlay muted loop playsInline={true} key={videoSrc}>
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
      
      {/* Text Content Overlay */}
      <div className="hero-text relative p-10 z-10 text-white" ref={textRef}>
        <h1 className="">More For Your Money</h1>
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
          <img src={phone} alt="iPhone" width={2000} height={2000} style={{ transition: 'none' }} />
        </div>
      </div>
      
      {/**A chat icon for support */}
      <div>
        <FaMessage className='text-3xl bg-slate-50'/>
      </div>
    </section>
  );
};

export default Hero;
