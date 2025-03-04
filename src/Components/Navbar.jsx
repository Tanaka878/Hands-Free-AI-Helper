import React from 'react';
import { appleImg } from "../utils";
import { Button } from "flowbite-react";

function Navbar() {
  return (
    <header className="font w-full py-5 sm:px-10 px-5 flex justify-between items-center">
      <nav className="flex w-full justify-between items-center sm:max-w-[80%] mx-auto">
        
        {/* Image */}
        <img src={appleImg} alt="Apple" width={50} height={18} className="flex-shrink-0 cursor-pointer" />

        {/* Navigation links */}
        <div className="hidden sm:flex flex-1 justify-center space-x-6">
          {['Send & Receive', 'Pay with Joinai', 'Help & Support', 'About Us'].map((nav, i) => (
            <div key={nav} className="text-sm cursor-pointer text-black hover:text-[#f68a4e] transition-all">
              {nav}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-baseline gap-3">
          <Button color="dark" pill>
            Sign Up
          </Button>
          <Button className='get' pill outline gradientDuoTone="redToYellow">
            Login
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
