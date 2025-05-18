import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="absolute bottom-0 left-0 w-full backdrop-blur-md"
      style={{
        WebkitBackdropFilter: "blur(12px)",
      }}
    >

      <footer className="w-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card via-card/95 to-card dark:from-card dark:via-card/95 dark:to-card"></div>
        <div className="relative z-10 py-8 px-12">
          <div className="mx-auto flex flex-col md:flex-col justify-start items-start gap-8">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold">Powered by MemePet</span>
              <p className="text-muted-foreground">© {currentYear} MemePet. All rights reserved.</p>
            </div>

            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
