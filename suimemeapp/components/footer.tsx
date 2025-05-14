import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <div
      className="fixed bottom-0 left-0 w-full backdrop-blur-md"
      style={{
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <footer className="sticky bottom-0 w-full max-w-360 mx-auto flex items-end justify-center gap-2 pb-5 px-4">
        {/* Do you think you really want to delete? */}
        <span className="text-xl font-bold text-white">Powered by</span>
        MemePet
      </footer>
    </div>
  );
};

export default Footer;
