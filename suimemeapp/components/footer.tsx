import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-gray-900 text-white py-8 md:py-12 border-t-4 border-black mt-auto">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 mb-4 md:mb-0">
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

        <div className="mt-4 pt-4 border-t border-gray-800 text-center">
          <p className="flex items-center justify-center gap-2">
            Built with <Heart size={16} className="text-red-500" fill="currentColor" /> by the MemePet Team
          </p>
          <p className="mt-2 text-gray-400">
            &copy; {currentYear} MemePet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;