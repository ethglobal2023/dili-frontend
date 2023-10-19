import React from "react";

interface ISocialBadge {
  icon: string;
  link: string;
  handle: string;
}

const SocialBadge: React.FC<ISocialBadge> = ({ icon, link, handle }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center w-fit shadow-xl drop-shadow-md hover:scale-105 transition duration-200 ease-in-out space-x-2 bg-[#fbf9fe] rounded-full p-2"
    >
      <img alt="icon" className="w-6 h-6" src={`/src/assets/${icon}.svg`} />
      <p className="text-gray-500 text-sm tracking-tighter font-semibold">
        {handle}
      </p>
    </a>
  );
};

export default SocialBadge;
