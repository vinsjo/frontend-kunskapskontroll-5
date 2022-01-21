export default {
	mount: {
		public: { url: '/', static: true },
		src: { url: '/dist' },
	},
	plugins: ['@snowpack/plugin-sass'],
	optimize: {
		bundle: true,
		minify: true,
		target: 'es2018',
	},
};
