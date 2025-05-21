'use client'

import { LiveblocksProvider } from '@liveblocks/react/suspense';

function LiveBlocksProvider({children}: {children: React.ReactNode}) {
    if (!process.env.NEXT_PUBLIC_LIVEBLOCK_PUBLIC_KEY) {
        throw new Error('Missing Liveblocks public key');
    }

    return (
        <LiveblocksProvider
            throttle={16} // en fps
            authEndpoint={'/auth-endpoint'}
        >
            {children}
        </LiveblocksProvider>
    )
}

export default LiveBlocksProvider
