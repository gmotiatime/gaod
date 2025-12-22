import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import img1 from '../assets/placeholder-1.svg';
import img2 from '../assets/placeholder-2.svg';
import img3 from '../assets/placeholder-3.svg';
import img4 from '../assets/placeholder-4.svg';

const content = [
  {
    tag: "[01] CENTRALIZE",
    title: "Centralize inspiration",
    description: "Centralize all your creative assets in one searchable library. Connect your tools to auto-import references, moodboards, and design systems.",
    // Placeholder gradient for now, user will replace with image
    color: "bg-gradient-to-br from-orange-100 to-orange-200",
    img: img1 // Replace null with your image path like: "/path/to/image1.png"
  },
  {
    tag: "[02] ANALYZE",
    title: "Identify trends",
    description: "Turn visual data into direction. Spot patterns in your inspiration and quantify what works so you can prioritize the concepts that actually matter.",
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    img: img2 // Replace null with your image path like: "/path/to/image2.png"
  },
  {
    tag: "[03] ACT",
    title: "Create with context",
    description: "Move from idea to execution instantly. Chat with your library and generate briefs, copy, and prototypes giving AI the context to ship fast.",
    color: "bg-gradient-to-br from-purple-100 to-purple-200",
    img: img3 // Replace null with your image path like: "/path/to/image3.png"
  },
  {
    tag: "[04] AUTOMATE",
    title: "Scale your output",
    description: "Cut weeks of manual work into hours. Automate everything from asset resizing to format adaptation, allowing you to ship more without adding headcount.",
    color: "bg-gradient-to-br from-green-100 to-green-200",
    img: img4 // Replace null with your image path like: "/path/to/image4.png"
  }
];

const StickyScrollSection = () => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef(null);
  
  const cardLength = content.length;

  useEffect(() => {
    const handleScroll = () => {
        if (!ref.current) return;
        
        const { top } = ref.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // -top is how many pixels we have scrolled PAST the top of the element.
        // When top is 0, we are at the start.
        // When top is -viewportHeight, we have scrolled one full screen down.
        
        // We add viewportHeight / 2 to switch images when the section is halfway up the screen
        const targetIndex = Math.floor( (-top + (viewportHeight / 2)) / viewportHeight );

        // Clamp index between 0 and last card
        const clampedIndex = Math.min(Math.max(targetIndex, 0), cardLength - 1);
        
        setActiveCard(clampedIndex);
    };

    window.addEventListener("scroll", handleScroll);
    // Call once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cardLength]);

  return (
    <div 
      ref={ref} 
      className="relative w-full max-w-6xl mx-auto px-4 box-border hidden md:flex items-start justify-between gap-10"
      // Height needs to be sufficient to scroll through all items. 
      // 4 items * 100vh seems appropriate to give enough scroll room.
      style={{ height: `${content.length * 100}vh` }} 
    >
      {/* Left Column: Text Content */}
      <div className="w-1/2 flex flex-col relative">
        {content.map((item, index) => (
          <div 
            key={index} 
            className="h-screen flex flex-col justify-center p-10"
          >
            <motion.div
              initial="inactive"
              animate={activeCard === index ? "active" : "inactive"}
              variants={{
                active: { 
                  opacity: 1, 
                  scale: 1, 
                  filter: "blur(0px)",
                  transition: { 
                    duration: 0.5, 
                    staggerChildren: 0.1,
                    ease: "easeOut"
                  }
                },
                inactive: { 
                  opacity: 0.1, 
                  scale: 0.95, 
                  filter: "blur(4px)",
                  transition: { duration: 0.5 }
                }
              }}
            >
                <motion.span 
                  variants={{
                    active: { opacity: 1, y: 0 },
                    inactive: { opacity: 0, y: 0 }
                  }}
                  className="text-orange-600 font-mono text-sm tracking-widest mb-4 block"
                >
                    {item.tag}
                </motion.span>
                <motion.h2 
                  variants={{
                    active: { opacity: 1, y: 0 },
                    inactive: { opacity: 0, y: 0 }
                  }}
                  className="font-serif text-5xl md:text-6xl text-[#1A1A1A] mb-6 leading-tight"
                >
                    {item.title}
                </motion.h2>
                <motion.p 
                  variants={{
                    active: { opacity: 1, y: 0 },
                    inactive: { opacity: 0, y: 0 }
                  }}
                  className="text-xl text-gray-500 leading-relaxed max-w-md"
                >
                    {item.description}
                </motion.p>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Right Column: Sticky Image */}
      <div className="w-1/2 sticky top-0 h-screen flex items-center justify-center p-10">
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
            {content.map((item, index) => (
                <motion.div
                    key={index}
                    className={`absolute inset-0 w-full h-full flex items-center justify-center ${item.color}`}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: activeCard === index ? 1 : 0,
                        scale: activeCard === index ? 1 : 0.95 // Subtle zoom effect
                    }}
                    transition={{ duration: 0.5 }}
                >
                    {item.img ? (
                        <img
                            src={item.img}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        /* Placeholder for user images */
                        <div className="text-center p-6">
                            <div className="mb-4 text-4xl opacity-20">🖼️</div>
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                                Image for {item.title}
                            </p>
                            <p className="text-gray-400 text-[10px] mt-2">
                                (User will insert image here)
                            </p>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StickyScrollSection;