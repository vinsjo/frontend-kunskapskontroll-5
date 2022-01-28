export default {
	mount: {
		public: { url: '/', static: true },
		src: { url: '/dist' },
	},
	plugins: ['@snowpack/plugin-dotenv'],
	optimize: {
		minify: true,
		bundle: true,
		target: 'es2015',
		sourcemap: false,
	},
};
