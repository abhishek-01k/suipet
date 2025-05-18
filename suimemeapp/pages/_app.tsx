import { cn } from "@/lib/utils";
import SuiWalletProvider from "@/context/WalletContext";
import { type AppType } from "next/dist/shared/lib/utils";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Press_Start_2P } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "react-toastify";
import { AppContextProvider } from "@/context/AppContext";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import MetaTagsContainer from "@/components/containers/metaTagsContainer";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const pressStart = Press_Start_2P({
  weight: ["400"],
  subsets: ["latin"],
  variable: '--font-press-start',
});

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {isClient ? (
          <QueryClientProvider client={queryClient}>
            <SuiWalletProvider>
              <AppContextProvider>
                <TooltipProvider>
                  <div className={`${pressStart.className} min-h-screen flex flex-col`}>
                    <MetaTagsContainer />
                    <Header />
                    <Component {...pageProps} />
                    <Footer />
                    <PwaInstallPrompt />
                    <ToastContainer
                      draggable
                      theme="dark"
                      position="bottom-right"
                    />
                  </div>
                </TooltipProvider>
              </AppContextProvider>
            </SuiWalletProvider>
          </QueryClientProvider>
        ) : (
          <div className={pressStart.className}>
            <MetaTagsContainer />
          </div>
        )}
      </ThemeProvider>
    </>
  );
};

export default MyApp;
