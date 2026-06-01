import Mux from '@mux/mux-node';

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || 'dummy_id',
  tokenSecret: process.env.MUX_TOKEN_SECRET || 'dummy_secret',
});

export const muxVideo = mux.video;
