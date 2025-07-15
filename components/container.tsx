import React from 'react'

interface Props {
  children: React.ReactNode
}

const Container = ({children}:Props) => {
  return (
    <section className='max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
        {children}
    </section>
  )
}

export default Container