import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = ({ 
  phoneNumber, 
  message, 
  children, 
  className = "", 
  iconSize = 20,
  variant = "default", // default, icon-only, card
  showIcon = true
}) => {
  // Clean phone number for URL (remove spaces, +, etc.)
  const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message || "");
  
  // Determine if user is on mobile
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Construct URL based on device
  // Desktop: web.whatsapp.com
  // Mobile: wa.me (redirects to app)
  const whatsappUrl = isMobile
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

  const handleClick = (e) => {
    // Open in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    e.preventDefault();
  };

  if (variant === "icon-only") {
    return (
      <a 
        href={whatsappUrl} 
        onClick={handleClick}
        className={`inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:scale-110 ${className}`}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={iconSize} />
      </a>
    );
  }

  return (
    <a 
      href={whatsappUrl} 
      onClick={handleClick}
      className={`inline-flex items-center gap-2 transition-all duration-300 ${className}`}
    >
      {showIcon && <MessageCircle size={iconSize} />}
      <span>{children}</span>
    </a>
  );
};

export default WhatsAppButton;