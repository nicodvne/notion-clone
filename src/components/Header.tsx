'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { useUser } from '@clerk/nextjs'
import React from 'react'

function Header() {

  const { user } = useUser()

  return (
    <div className='flex justify-between items-center p-5'>
      { user && (
        <h1 className='text-2xl'>{user?.fullName} {`'s`} Space</h1>
      )}

      {/* Breadcrumb */}

      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}

export default Header
