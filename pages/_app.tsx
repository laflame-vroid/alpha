import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThirdwebProvider } from "@thirdweb-dev/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain="optimism-goerli">
  <Component {...pageProps} /> 
  </ThirdwebProvider>
  
  )
}

export default MyApp
