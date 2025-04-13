import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../Assets/Images/joinaiphone.png';
import { heroVideo, smallHeroVideo } from '../utils';
import { useGSAP } from '@gsap/react';
import { FaMessage } from 'react-icons/fa6';

const Hero = () => {
  const [videoSrc, setVideoSrc] = useState(
    window.innerWidth < 768 ? smallHeroVideo : heroVideo
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I assist you today?' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [ticketDetails, setTicketDetails] = useState({
    email: '',
    phoneNumber: '',
    subject: '',
    content: '',
    category: '',
  });

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

  const textRef = useRef(null);
  

  useGSAP(() => {
    gsap.fromTo(
      textRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out' }
    );
  }, []);

  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleTicket = () => setIsTicketOpen(!isTicketOpen);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { type: 'user', text: inputValue }]);
    setInputValue('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'I will look into this for you.' },
      ]);
    }, 1000);
  };

  const handleTicketSubmit = async () => {
    if (
      !ticketDetails.email ||
      !ticketDetails.phoneNumber ||
      !ticketDetails.subject ||
      !ticketDetails.content ||
      !ticketDetails.category
    ) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('https://joinai-support-system-productTechnicalion.up.railway.app/ticket/launchTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      const result = await response.text();
      alert(result); // Display the response from the backend
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Your ticket has been submitted!' },
      ]);
      setTicketDetails({
        email: '',
        phoneNumber: '',
        subject: '',
        content: '',
        category: '',
      });
      setIsTicketOpen(false);
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  return (
    <section className="section-headstream w-full nav-height bg-transparent relative pt-16 pb-16">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="pointer-events-none w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          key={videoSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      {/* Chat Modal */}
      {!isChatOpen && (
        <div className="fixed bottom-5 right-5 z-50">
          <FaMessage
            className="text-5xl bg-orange-500 p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-200"
            onClick={toggleChat}
          />
        </div>
      )}
      {isChatOpen && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-40 p-5 flex flex-col">
          <button
            className="self-end text-xl mb-4 text-gray-600 hover:text-gray-900"
            onClick={toggleChat}
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold">Support</h2>
          <div className="flex-1 overflow-y-auto border p-2 rounded mb-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  msg.type === 'bot'
                    ? 'text-left bg-gray-100'
                    : 'text-right bg-orange-100'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <button
            className="bg-orange-500 text-white rounded px-4 py-2 text-sm mb-3 w-full"
            onClick={toggleTicket}
          >
            {isTicketOpen ? 'Close Ticket Form' : 'Open Support Ticket'}
          </button>
          {isTicketOpen && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Open a Ticket</h3>
              <input
                type="email"
                className="w-full border rounded p-2 mb-2 text-sm text-black"
                placeholder="Email"
                value={ticketDetails.email}
                onChange={(e) =>
                  setTicketDetails({ ...ticketDetails, email: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full border rounded p-2 mb-2 text-sm text-black"
                placeholder="Phone Number"
                value={ticketDetails.phoneNumber}
                onChange={(e) =>
                  setTicketDetails({
                    ...ticketDetails,
                    phoneNumber: e.target.value,
                  })
                }
              />
              <input
                type="text"
                className="w-full border rounded p-2 mb-2 text-sm text-black"
                placeholder="Subject"
                value={ticketDetails.subject}
                onChange={(e) =>
                  setTicketDetails({ ...ticketDetails, subject: e.target.value })
                }
              />
              <textarea
                className="w-full border rounded p-2 mb-2 text-sm text-black"
                placeholder="Content"
                rows={3}
                value={ticketDetails.content}
                onChange={(e) =>
                  setTicketDetails({ ...ticketDetails, content: e.target.value })
                }
              />
              <select
                className="w-full border rounded p-2 mb-2 text-sm text-black"
                value={ticketDetails.category}
                onChange={(e) =>
                  setTicketDetails({ ...ticketDetails, category: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="SALES">SALES</option>
                <option value="BILLING">BILLING</option>
                <option value="TECHNICAL">TECHNICAL</option>
              </select>
              <button
                className="bg-orange-500 text-white rounded px-4 py-2 text-sm w-full"
                onClick={handleTicketSubmit}
              >
                Submit Ticket
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border rounded p-2 text-sm text-black"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              className="bg-orange-500 text-white rounded px-4 py-2 text-sm"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
