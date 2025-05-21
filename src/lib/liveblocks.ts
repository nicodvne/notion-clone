import { Liveblocks } from "@liveblocks/node";

const secretKey = process.env.LIVEBLOCK_PRIVATE_KEY;

if (!secretKey) {
    throw new Error("Missing Liveblocks secret key");
}

const liveblocks = new Liveblocks({
    secret: secretKey,
});

export default liveblocks;