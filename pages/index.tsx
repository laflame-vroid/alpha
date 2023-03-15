import type { GetServerSideProps, NextPage } from 'next'
import { SanityClient } from 'next-sanity'
import Head from 'next/head'
import Image from 'next/image'
//import sanityCli from '../noob/sanity.cli'
import Link from 'next/link'
import { sanityClient, urlFor } from '../sanity'
import { Collection } from '../typings'

interface props {
  collections: Collection[]
}

const Home = ({ collections }: props) => {
  return (
    <div className="mx-auto max-w-2xl">
      <Head>
        <title>noobs</title>
        <link rel="icon" href="/favicon.ico" /
        >
      </Head>
      
    <h1 className='mb-10 text-4xl font-extralight'>
      Welcome to The{' '}
    <span className='font-extrabold underline
     decoration-pink-600/50'>
      Nomads
      </span>{' '}
        NFT Club
        </h1>


        <main className='bg-green-200 p-10 shadow-xl
        shadow-red-300'>
          <div>
            {collections.map(collection => (
              <Link href={`/nft/${collection.slug.current}`}>

              <div className='flex cursor-pointer flex-col 
              items-center transition-all duration-200 
              hover:scale-105'>
                <img 
                className='h-96 w-60 rounded-2xl object-cover'
                src={urlFor(collection.mainImage).url()} 
                alt="" />

                <div className='p-5'>
                  <h2 className='text-3xl'>{collection.title}</h2>
                  <p className='mt-2 text-sm text-gray-400'> 
                   {collection.description}
                   </p>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </main>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps =async () => {
  const query = `*[_type == "collection"]{
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
  }`

const collections = await sanityClient.fetch(query)

return {
  props: {
    collections
  }
 }
}
