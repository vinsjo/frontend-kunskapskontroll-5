import { isFn } from './helpers';

/**
 * @param {any} initialState
 * @param {Function} [onStateChange]
 * @param {Function} [validator]
 */
function initState(
	initialState = null,
	onStateChange = null,
	validator = null
) {
	let currentState,
		isValid = null,
		onChange = null;
	const handler = {
		get state() {
			return currentState;
		},
		set state(value) {
			if (value === currentState) return;
			if (isFn(isValid) && !isValid(value)) return;
			currentState = value;
			isFn(onChange) && onChange(currentState);
		},
		get onChange() {
			return onChange;
		},
		set onChange(fn) {
			if (!isFn(fn)) return;
			onChange = fn;
		},
		get validator() {
			return isValid;
		},
		set validator(fn) {
			if (!isFn(fn)) return;
			isValid = fn;
		},
	};
	handler.onChange = onStateChange;
	handler.validator = validator;
	handler.state = initialState;
	return handler;
}

export default initState;
