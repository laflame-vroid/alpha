import React, { useEffect, useState } from "react";
import { useAddress, useDisconnect, useMetamask, useNFTDrop, } from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityClient, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { fontWeight } from "@mui/system";
interface Props {
  collection: Collection;
}

function NFTDropPage({collection}: Props) {
  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [priceInEth, setPriceInETH] = useState<string>();
  const [loading, setloading] = useState(true);
  const nftDrop = useNFTDrop (collection.address)
   
 

  // Auth
  const connectWithMetamask = useMetamask()
  const address = useAddress()
  const disconnect = useDisconnect()
  // ---

  useEffect(() => {
    if (!nftDrop) return

    const fetchPrice = async() => {
      const claimConditions = await nftDrop.claimConditions.getAll();
      setPriceInETH(claimConditions?.[0].currencyMetadata.displayValue)

    }

    fetchPrice();
  }, [nftDrop])
   
  useEffect(() => {
    if (!nftDrop) return;

    const fetchNFTDopData =async () => {
      setloading(true);

      const claimed = await nftDrop.getAllClaimed();
      const total = await nftDrop.totalSupply();

      setClaimedSupply(claimed.length);
      setTotalSupply(total)

      setloading(false);
    }
    fetchNFTDopData();
  }, [nftDrop])

  const mintNft = () => {
    if (!nftDrop || !address) return;

    const quantity = 1;

    setloading(true)
    const notification = toast.loading('Minting...',{
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      }
    })

    nftDrop
    .claimTo(address, quantity)
    .then(async (tx) => {
     const receipt = tx[0].receipt
     const claimedTokenId = tx[0].id 
     const claimedNFT = await tx[0].data()

     toast('Minting Successful', {
      duration: 8000,
      style: {
      background: 'green',
        color: 'white',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      },
     })

     console.log(receipt)
     console.log(claimedTokenId)
     console.log(claimedNFT)
    })
    .catch((err) => {
      console.log(err)
      toast('Whoops... Something went wrong!', {
        style: {
          background: 'red',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        }

      })
    })
    .finally(() => {
      setloading(false)
      toast.dismiss(notification);

    })
  }

  return (
  <div className='flex h-screen flex-col lg:grid
  lg:grid-cols-10'>
    <Toaster position='bottom-center'/>
    
    <div className='bg-gradient-to-br from-cyan-800
    to-rose-500 lg:col-span-4'>
        <div className='flex flex-col
        items-center justify-center py-2 lg:min-h-screen'>  
            <div className='rounded-xl bg-gradient-to-br
            from-yellow-400 to-purple-600 p-2'>
            <img
             className='w-44 rounded-
            object-cover lg:h-96 lg:w-72'
             src={urlFor(collection.previewImage).url()} 
             alt=""
              />
            </div>
              <div className='space-y-2 p-5 text-center'>
                <h1 className='text-4xl font-bold
                 text-white'>THE Nomads
                </h1>
                <h2 className='text-xl text-gray-300'>
                    {collection.description}
                </h2>
              </div>
        </div>
    </div>

        <div className='flex flex-1 flex-col p-12 lg:col-span-6'>
         {/*Header*/}
         <header className='flex items-center justify-between'>
               <Link href={'/'}>
            <h1 className='w-52 cursor-pointer text-xl
            font-extralight sm:w-80'>
                The{' '}
                <span className='font-extrabold underline
                 decoration-pink-600/50'>
                    Nomads 
                    </span>{' '}
                   NFT
                </h1>
                </Link>
                
                <button onClick={() => connectWithMetamask()}
                className="rounded-full bg-rose-600 px-4 py-2text-xs font-bold
                 text-white lg:px-5 lg:py-3 lg:text-base"
             disabled={!address ? false : true}>
         {!address ? "Connect Wallet" : `${address}`}
      </button>
         </header>

      <hr className="my-2 border" />

         {/* Content */}
         <div className='mt-10 flex flex-1 flex-col items-center
         space-y-6 text-center lg:space-y-0 lg:justify-center'>
         <img  
         className='w-80 object-cover pb-10 lg:h-40' 
         src={urlFor(collection.mainImage).url()} 
         alt=""/>
         <h1 className='text-3xl font-bold lg:text-5xl lg:font-extrabold'>
             {collection.title}
             </h1>

             {loading ? (
            <p className='animate-pulse pt-2 text-xl text-green-500'>
             Loading Supply...
             </p>
             ):(
              <p className='pt-2 text-xl text-green-500'>{claimedSupply} / {totalSupply?.toString()} NFT's 
              claimed</p>
             )}
             {loading && (
              <img className="h-80 w-80 object-contain" src="https://cdn.dribbble.com/users/563824/screenshots/3633228/media/b620ccb3ae8c14ea5447d159ebb1da58.gif" alt="" />
             )}
         </div>

         {/* Mint Button*/}
         <button 
         onClick={mintNft}
         disabled={loading || claimedSupply === totalSupply?.toNumber() || !address} className='mt-10 h-16 w-full rounded-full bg-red-600
          text-white font-bold disabled:bg-gray-400'>


          {loading ? (
            <>Loading</>
          ): claimedSupply === totalSupply?.toNumber() ? (
            <>SOLD OUT</>
          ): !address ? (
            <>Sign in to Mint</>
          ): (
            <span className="font-bold">Mint NFT ({priceInEth} ETH)</span>

          )}

           
         </button>
         </div>
    </div>
  )
}

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
      asset
    },  
    previewImage {
      asset
    },
    slug {
      current
    },
    creator-> {
      _id,
      name,
      address,
      slug {
        current
      },
    },
  }`;
  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  });

  if (!collection) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection,
    },
  };
};