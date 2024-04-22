export default {
  build: {
    index: 'public/index.html',
  },
};

export const devServer = {
  proxy: {
    '/notes': {
      target: 'http://backend:3000',
      ws: true,
      changeOrigin: true,
    },
  },
};
