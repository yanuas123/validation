/* module Validation -------------------------------------------------------- */

/* For launch the module, execute:
 * new Validation
 * There you can to pass property argument ValidationProp (below).
 * If you omit the argument, module will get default propery that described below (const VALID_PROP).
 * For launch validation on particular form, execute method:
 * setForm
 * and pass arguments:
 * - FormArg - form properties
 * - validationCallFunc - optional - submit callback
 * Module by itself set up properties for hidden part of form.
 * If you change hidden state of form part, you should to execute method:
 * changeHidden
 * and pass arguments:
 * - form element/name string
 * - element with hidden css class - HTMLElement
 * - hidden state - boolean
 * You can attach to form some data for sending it to server.
 * To do it execute method:
 * setData
 * and pass arguments:
 * - form name string
 * - data: any
 * You can perform validation on demand and get boolean result. To do it execute:
 * validateForm
 * and add argument:
 * - form element/name string
 * You can perform submit on demand and get boolean result of validation but not callback executing. To do it execute:
 * submitForm
 * and add argument:
 * - form element/name string
 * You can to get input-elements data object (formData) from form. To do it execute:
 * getData
 * and add argument:
 * - form element/name string
 * You can reset form (form field values ...). Execute:
 * resetForm
 * and add argument:
 * - form element/name string */


// types for validation template
export type TemplateTypes = string | number | RegExp;
// types for form submit element
export type SubmitEl = HTMLInputElement | HTMLButtonElement;
// types for form initialization arguments
export interface InpArg {
	required?: boolean;
	disabled?: boolean;
	valid_template?: TemplateTypes;
	blocked_template?: TemplateTypes; // it blocks enter invalid symbols
	start_validation?: "input" | "change"; // when to perform input validation
	callback?: Function;
}
export interface FormArg {
	element: string | HTMLFormElement; // form element; string - form name
	submit_el?: string | SubmitEl; // string - form element name
	items?: {
		[item: string]: InpArg // string - input name
	};
	start_validation?: "input" | "change"; // property for entire form
}

// types for submit callback

export interface formData { // data that you can get in callback - input elements value
	[item: string]: string | number; // string - input name; value - input value
	data?: any; // any data that you attached to particular form
}
export type validationServerCall = boolean | string[]; // array of invalid input name
export interface formCallFunc { // You must to execute this function in your callback and pass here your respond
	(server_resp: validationServerCall): void;
}
export interface validationCallFunc { // callback function
	(form: HTMLFormElement, data: formData, call: formCallFunc): void;
	}


// module properties argument
export interface ValidationProp {
	readonly valid_type_template?: { // template for input type validation
		[item: string]: TemplateTypes // string - input type
	};
	readonly type_blocked_template?: { // it blocks enter invalid symbols for input type
		[item: string]: TemplateTypes // string - input type
	};
	readonly hidden_class: string; // css class name - for control hidden part of form

	readonly wrap_selector?: string; // css selector; here add invalid css class; when omitted there add class to input element
	readonly inv_require_class: string; // invalid required css class
	readonly inv_valid_class: string; // invalid validation css class
	readonly inv_custom_class?: string; // invalid server validation css class
	readonly start_validation?: "input" | "change"; // when to start validation; property for entire module

	readonly valid_template_attr?: string; // data attribute name; pass it if you want to get validation template from data attribute on input element
	readonly blocked_template_attr?: string; // data attribute name
	readonly start_validation_attr?: string; // data attribute name
}

// default module properties
const VALID_PROP: ValidationProp = {
	valid_type_template: {
		"tel": /^[0-9\+\-\(\)]{8,16}$/,
		"email": /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		"password": /^[a-zA-Z0-9]{6,}$/
	},
	type_blocked_template: {
		"number": /^[0-9]+$/,
		"tel": /^[0-9\+\-\(\)]+$/
	},
	hidden_class: "hidden",
	wrap_selector: ".input-parent",
	inv_require_class: "empty",
	inv_valid_class: "invalid",
	inv_custom_class: "invalid-server",
	start_validation: "change",
	valid_template_attr: "data-valid-template",
	blocked_template_attr: "data-blocked-template",
	start_validation_attr: "data-start-validation"
};
/* ------------------------ */


// types for form children elements
type Inp_gen = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
/* input instance class */
interface Inp {
	readonly name: string;
	readonly tag_name: string;
	wrap_element?: HTMLElement;
	readonly type: string;
	valid_state?: boolean;
	valid_custom_state?: boolean;
	hidden?: boolean;
	callback?: Function;
}
interface InpFunctions {
	validate_input(): void;
	performBlocked?(): void;
	setFunctions(): void;
	setInvalidCustom(): void;
	resetInput(): void;
	getValue(): string | number | false;
	setHidden(): void;
	delHidden(): void;
}
abstract class SetInpProperties implements Inp {
	name: string;
	tag_name: string;
	wrap_element?: HTMLElement;
	type: string;
	valid_state?: boolean;
	valid_custom_state?: boolean;
	hidden?: boolean;
	callback?: Function;

	readonly form_el: Form;
	readonly main_el: Validation;

	constructor(el: Inp_gen, form_el: Form, main_el: Validation, arg?: InpArg) {
		this.form_el = form_el;
		this.main_el = main_el;

		this.name = el.name;
		this.tag_name = el.tagName;
		if(this.main_el.prop.wrap_selector) {
			let wrap_el = <HTMLElement> el.closest(this.main_el.prop.wrap_selector);
			if(wrap_el) {
				this.wrap_element = wrap_el;
			}
		}
		this.type = el.type;
		if(arg && arg.callback) this.callback = arg.callback;
	}
}



interface Input {
	readonly element: HTMLInputElement | HTMLTextAreaElement;
	readonly start_value?: string | number;
	value?: string | number;
	readonly start_required: boolean;
	readonly start_disabled: boolean;
	required: boolean;
	disabled: boolean;
	valid_template?: TemplateTypes;
	blocked_template?: TemplateTypes;
	start_validation?: string;
}
type InputContainer = InpFunctions & Input;
class InputInstance extends SetInpProperties implements InputContainer {
	element: HTMLInputElement | HTMLTextAreaElement;
	start_value?: string | number;
	value?: string | number;
	start_required: boolean;
	start_disabled: boolean;
	required: boolean;
	disabled: boolean;
	valid_template?: TemplateTypes;
	blocked_template?: TemplateTypes;
	start_validation?: string;

	constructor(inp_el: HTMLInputElement | HTMLTextAreaElement, form_el: Form, main_el: Validation, item_arg?: InpArg) {
		super(inp_el, form_el, main_el, item_arg);

		this.element = inp_el;

		if(inp_el.value && inp_el.value !== " ") {
			if(this.type == "number" && !isNaN(+inp_el.value)) {
				this.start_value = +inp_el.value;
			} else {
				this.start_value = inp_el.value;
			}
		}

		let start_required: boolean, start_disabled: boolean;
		let valid_template: TemplateTypes, blocked_template: TemplateTypes, start_validation: string;
		if(item_arg) {
			start_required = item_arg.required;
			start_disabled = item_arg.disabled;
			valid_template = item_arg.valid_template;
			blocked_template = item_arg.blocked_template;
			start_validation = item_arg.start_validation;
		}
		this.start_required = start_required || inp_el.required || false;
		this.start_disabled = start_disabled || inp_el.disabled || false;
		this.required = this.start_required;
		this.disabled = this.start_disabled;

		function templateParser(t: string, tp: string): TemplateTypes {
			let template: TemplateTypes;
			let reg: RegExp = new RegExp(t.substring(1, t.length - 1));
			if(tp == "number" && (typeof +t === "number")) template = +t;
			else if(t[0] == "/" && t[t.length - 1] == "/" && reg) template = reg;
			else template = t;
			return template;
		};
		if(this.main_el.prop.valid_template_attr) {
			let temp: string | number | RegExp = inp_el.getAttribute(this.main_el.prop.valid_template_attr);
			if(temp) temp = templateParser(temp, this.type);
			valid_template = valid_template || temp;
		}
		if(this.main_el.prop.blocked_template_attr) {
			let temp: string | number | RegExp = inp_el.getAttribute(this.main_el.prop.blocked_template_attr);
			if(temp) temp = templateParser(temp, this.type);
			blocked_template = blocked_template || temp;
		}
		if(this.main_el.prop.start_validation_attr) start_validation = start_validation || inp_el.getAttribute(this.main_el.prop.start_validation_attr);
		if(valid_template) this.valid_template = valid_template;
		if(blocked_template) this.blocked_template = blocked_template;
		if(start_validation) this.start_validation = start_validation;
	}

	validate_input(): void {
		this.value = this.element.value;
		if(this.value === " ") this.value = "";
		if(!this.hidden) {
			let requir_b: boolean = true;
			let valid_b: boolean = true;

			if(this.required && !this.disabled && !this.value) requir_b = false;

			if(requir_b && this.valid_template && this.value) {
				if((this.valid_template instanceof RegExp) && !this.valid_template.test(this.value)) valid_b = false;
				else if((typeof this.valid_template == "number") && (+this.value !== this.valid_template)) valid_b = false;
				else if(((typeof this.valid_template == "string")) && (this.valid_template != this.value)) valid_b = false;
			}

			if(requir_b && valid_b && this.main_el.prop.valid_type_template && this.main_el.prop.valid_type_template[this.type] && this.value) {
				if(this.main_el.prop.valid_type_template[this.type] instanceof RegExp && !(<RegExp> this.main_el.prop.valid_type_template[this.type]).test(this.value)) valid_b = false;
				else if((typeof this.main_el.prop.valid_type_template[this.type] == "number") && (this.main_el.prop.valid_type_template[this.type] !== +this.value)) valid_b = false;
				else if((typeof this.main_el.prop.valid_type_template == "string") && this.main_el.prop.valid_type_template != this.value) valid_b = false;
			}

			this.valid_state = (requir_b && valid_b) || false;
			if(this.type == "number" && !isNaN(+this.value)) this.value = +this.value;

			let wrap_el: HTMLElement | HTMLInputElement | HTMLTextAreaElement = this.wrap_element || this.element;
			if(this.valid_state) {
				wrap_el.classList.remove(this.main_el.prop.inv_require_class);
				wrap_el.classList.remove(this.main_el.prop.inv_valid_class);
			} else if(!requir_b) {
				wrap_el.classList.add(this.main_el.prop.inv_require_class);
				wrap_el.classList.remove(this.main_el.prop.inv_valid_class);
			} else {
				wrap_el.classList.remove(this.main_el.prop.inv_require_class);
				wrap_el.classList.add(this.main_el.prop.inv_valid_class);
			}
			this.valid_custom_state = true;
			wrap_el.classList.remove(this.main_el.prop.inv_custom_class);
		} else this.valid_state = true;
		if(this.valid_state && this.callback) this.callback();
	}
	performBlocked(): void {
		if(this.element.value === " ") this.element.value = "";
		let value = this.element.value;
		let valid: boolean = true;
		let main_template: TemplateTypes;
		if(this.main_el.prop.type_blocked_template && this.main_el.prop.type_blocked_template[this.type]) main_template = this.main_el.prop.type_blocked_template[this.type];
		let template: TemplateTypes = this.blocked_template || main_template;

		if(value) {
			if((template instanceof RegExp) && !template.test(value)) valid = false;
			else if((typeof template == "number") && template !== +value) valid = false;
			else if((typeof template == "string") && template != value) valid = false;
		}
		if(valid) {
			if(this.type == "number" && !isNaN(+value)) this.value = +value;
			else this.value = value;
		} else if(this.value !== undefined) this.element.value = this.value.toString();
		else this.element.value = "";
	}
	setFunctions(): void {
		let input_event: boolean = false;
		let change_event: boolean = false;
		let validation: boolean = false;
		let blocked: boolean = false;

		input_event = (this.start_validation == "input") || (this.form_el.start_validation == "input") || (this.main_el.prop.start_validation == "input");
		change_event = (this.start_validation == "change") || (this.form_el.start_validation == "change") || (this.main_el.prop.start_validation == "change");
		if(this.start_required || this.valid_template || (this.main_el.prop.valid_type_template && this.main_el.prop.valid_type_template[this.type])) validation = true;
		if(this.blocked_template || (this.main_el.prop.type_blocked_template && this.main_el.prop.type_blocked_template[this.type])) blocked = true;
		input_event = validation && input_event;
		change_event = validation && change_event;

		if(blocked && input_event) {
			this.element.addEventListener("input", () => {
				this.performBlocked();
				this.validate_input();
			})
		} else {
			if(blocked) this.element.addEventListener("input", () => {
				this.performBlocked();
			});
			if(input_event) this.element.addEventListener("input", () => {
				this.validate_input();
			});
		}
		if(change_event) this.element.addEventListener("change", () => {
			this.validate_input();
		});
	}
	setInvalidCustom(): void {
		let wrap_el: HTMLElement | HTMLInputElement | HTMLTextAreaElement = this.wrap_element || this.element;
		this.valid_custom_state = false;
		wrap_el.classList.add(this.main_el.prop.inv_custom_class);
	}
	resetInput(): void {
		let wrap_el: HTMLElement | HTMLInputElement | HTMLTextAreaElement = this.wrap_element || this.element;
		wrap_el.classList.remove(this.main_el.prop.inv_require_class);
		wrap_el.classList.remove(this.main_el.prop.inv_valid_class);
		wrap_el.classList.remove(this.main_el.prop.inv_custom_class);
		this.value = undefined;
		this.valid_state = undefined;
		this.valid_custom_state = undefined;
		if(this.start_value) this.element.value = this.start_value.toString();
		else this.element.value = "";
	}
	getValue(): string | number | false {
		if(this.value && !this.hidden) return this.value;
		else return false;
	}
	setHidden(): void {
		this.hidden = true;
		this.required = false;
		this.disabled = true;
		this.element.required = false;
		this.element.disabled = true;
	}
	delHidden(): void {
		this.hidden = false;
		this.required = this.start_required;
		this.disabled = this.start_disabled;
		this.element.required = this.start_required;
		this.element.disabled = this.start_disabled;
	}
}



interface Select {
	readonly element: HTMLSelectElement;
	readonly start_value?: string;
	value?: string;
	readonly start_required: boolean;
	readonly start_disabled: boolean;
	required: boolean;
	disabled: boolean;
	start_validation?: "change";
}
type SelectContainer = InpFunctions & Select;
class SelectInstance extends SetInpProperties implements SelectContainer {
	element: HTMLSelectElement;
	start_value?: string;
	value?: string;
	start_required: boolean;
	start_disabled: boolean;
	required: boolean;
	disabled: boolean;
	start_validation?: "change";

	constructor(select_el: HTMLSelectElement, form_el: Form, main_el: Validation, item_arg?: InpArg) {
		super(select_el, form_el, main_el, item_arg);

		this.element = select_el;
		if(select_el.value) this.start_value = select_el.value;

		let start_required: boolean, start_disabled: boolean;
		let start_validation: "change";
		if(item_arg) {
			start_required = item_arg.required;
			start_disabled = item_arg.disabled;
			if(item_arg.start_validation && item_arg.start_validation == "change") start_validation = item_arg.start_validation;
		}
		this.start_required = start_required || select_el.required || false;
		this.start_disabled = start_disabled || select_el.disabled || false;
		this.required = this.start_required;
		this.disabled = this.start_disabled;

		if(this.main_el.prop.start_validation_attr && select_el.getAttribute(this.main_el.prop.start_validation_attr) == "change") start_validation = start_validation || "change";
		if(start_validation) this.start_validation = start_validation;
	}

	validate_input(): void {
		this.value = this.element.value;
		if(!this.hidden) {
			let requir_b: boolean = true;

			if(this.required && !this.element.disabled && !this.value) requir_b = false;
			this.valid_state = requir_b;

			let wrap_el: HTMLElement | HTMLSelectElement = this.wrap_element || this.element;
			if(this.valid_state) {
				wrap_el.classList.remove(this.main_el.prop.inv_require_class);
			} else {
				wrap_el.classList.add(this.main_el.prop.inv_require_class);
			}
			this.valid_custom_state = true;
			wrap_el.classList.remove(this.main_el.prop.inv_custom_class);
		} else this.valid_state = true;
		if(this.valid_state && this.callback) this.callback();
	}
	setFunctions(): void {
		let change_event: boolean = false;
		let validation: boolean = false;
		change_event = (this.start_validation == "change") || (this.form_el.start_validation == "change") || (this.main_el.prop.start_validation == "change");
		if(this.start_required) validation = true;
		change_event = validation && change_event;

		if(change_event) this.element.addEventListener("change", () => {
			this.validate_input();
		});
	}
	setInvalidCustom(): void {
		let wrap_el: HTMLElement | HTMLSelectElement = this.wrap_element || this.element;
		this.valid_custom_state = false;
		wrap_el.classList.add(this.main_el.prop.inv_custom_class);
	}
	resetInput(): void {
		let wrap_el: HTMLElement | HTMLSelectElement = this.wrap_element || this.element;
		wrap_el.classList.remove(this.main_el.prop.inv_require_class);
		wrap_el.classList.remove(this.main_el.prop.inv_custom_class);
		this.value = undefined;
		this.valid_state = undefined;
		this.valid_custom_state = undefined;
		if(this.start_value) this.element.value = this.start_value;
		else this.element.value = "";
	}
	getValue(): string | false {
		if(this.value && !this.hidden) return this.value;
		else return false;
	}
	setHidden(): void {
		this.hidden = true;
		this.required = false;
		this.disabled = true;
		this.element.required = false;
		this.element.disabled = true;
	}
	delHidden(): void {
		this.hidden = false;
		this.required = this.start_required;
		this.disabled = this.start_disabled;
		this.element.required = this.start_required;
		this.element.disabled = this.start_disabled;
	}
}



type checkValue = "no" | "yes";
interface Check {
	readonly element: HTMLInputElement;
	value: string | checkValue;
	readonly start_checked: boolean;
	checked: boolean;
	readonly start_required: boolean;
	readonly start_disabled: boolean;
	required: boolean;
	disabled: boolean;
	start_validation?: "change";
}
type CheckContainer = InpFunctions & Check;
class CheckInstance extends SetInpProperties implements CheckContainer {
	element: HTMLInputElement;
	value: string | checkValue;
	readonly start_checked: boolean;
	checked: boolean;
	start_required: boolean;
	start_disabled: boolean;
	required: boolean;
	disabled: boolean;
	start_validation?: "change";

	constructor(check_el: HTMLInputElement, form_el: Form, main_el: Validation, item_arg?: InpArg) {
		super(check_el, form_el, main_el, item_arg);

		this.element = check_el;

		if(this.element.value && this.element.value != "on") this.value = this.element.value;
		else this.value = "yes";
		let check: boolean = this.element.checked;
		this.start_checked = check;
		this.checked = check;

		let start_required: boolean, start_disabled: boolean;
		let start_validation: "change";
		if(item_arg) {
			start_required = item_arg.required;
			start_disabled = item_arg.disabled;
			if(item_arg.start_validation && item_arg.start_validation == "change") start_validation = item_arg.start_validation;
		}
		this.start_required = start_required || check_el.required || false;
		this.start_disabled = start_disabled || check_el.disabled || false;
		this.required = this.start_required;
		this.disabled = this.start_disabled;

		if(this.main_el.prop.start_validation_attr && check_el.getAttribute(this.main_el.prop.start_validation_attr) == "change") start_validation = start_validation || "change";
		if(start_validation) this.start_validation = start_validation;
	}

	validate_input(): void {
		this.checked = this.element.checked;
		if(!this.hidden) {
			let requir_b: boolean = true;

			if(this.required && !this.element.disabled && !this.checked) requir_b = false;
			this.valid_state = requir_b;

			if(this.checked) {
				if(this.element.value && this.element.value != "on") this.value = this.element.value;
				else this.value = "yes";
			}
			else this.value = "no";
			let wrap_el: HTMLElement | HTMLInputElement = this.wrap_element || this.element;
			if(this.valid_state) {
				wrap_el.classList.remove(this.main_el.prop.inv_require_class);
			} else {
				wrap_el.classList.add(this.main_el.prop.inv_require_class);
			}
			this.valid_custom_state = true;
			wrap_el.classList.remove(this.main_el.prop.inv_custom_class);
		} else this.valid_state = true;
		if(this.valid_state && this.callback) this.callback();
	}
	setFunctions(): void {
		let change_event: boolean = false;
		let validation: boolean = false;
		change_event = (this.start_validation == "change") || (this.form_el.start_validation == "change") || (this.main_el.prop.start_validation == "change");
		if(this.start_required) validation = true;
		change_event = validation && change_event;

		if(change_event) this.element.addEventListener("change", () => {
			this.validate_input();
		});
	}
	setInvalidCustom(): void {
		let wrap_el: HTMLElement | HTMLInputElement = this.wrap_element || this.element;
		this.valid_custom_state = false;
		wrap_el.classList.add(this.main_el.prop.inv_custom_class);
	}
	resetInput(): void {
		let wrap_el: HTMLElement | HTMLInputElement = this.wrap_element || this.element;
		wrap_el.classList.remove(this.main_el.prop.inv_require_class);
		wrap_el.classList.remove(this.main_el.prop.inv_custom_class);
		this.value = this.element.value || "no";
		this.checked = this.start_checked;
		this.element.checked = this.start_checked;
		this.valid_state = undefined;
		this.valid_custom_state = undefined;
	}
	getValue(): string | false {
		if(!this.hidden) return this.value;
		else return false;
	}
	setHidden(): void {
		this.hidden = true;
		this.required = false;
		this.disabled = true;
		this.element.required = false;
		this.element.disabled = true;
	}
	delHidden(): void {
		this.hidden = false;
		this.required = this.start_required;
		this.disabled = this.start_disabled;
		this.element.required = this.start_required;
		this.element.disabled = this.start_disabled;
	}
}



interface Radio {
	readonly element: RadioNodeList;
	readonly start_value?: string;
	value?: string;
	readonly start_required: boolean;
	readonly start_disabled?: Array<number>;
	disabled: Array<number>;
	start_validation?: "change";
}
type RadioContainer = InpFunctions & Radio;
class RadioInstance extends SetInpProperties implements RadioContainer {
	element: RadioNodeList;
	start_value?: string;
	value?: string;
	start_required: boolean;
	start_disabled?: Array<number>;
	disabled: Array<number>;
	start_validation?: "change";

	constructor(radio_el: RadioNodeList, form_el: Form, main_el: Validation, item_arg?: InpArg) {
		let element = <HTMLInputElement> radio_el[0];

		super(element, form_el, main_el, item_arg);

		this.element = radio_el;
		if(this.element.value) {
			this.start_value = this.element.value;
			this.value = this.element.value;
		}

		let disabled: Array<number> = [], start_valid_attr: string, start_validation: "change";;
		if(this.main_el.prop.start_validation_attr) start_valid_attr = this.main_el.prop.start_validation_attr;
		for(let i = 0; i < radio_el.length; i++) {
			let el = <HTMLInputElement> radio_el[i];
			if(el.disabled) disabled[i] = i;
			if(el.getAttribute(this.main_el.prop.start_validation_attr) == "change") start_validation = "change";
		}

		let start_required: boolean, start_disabled: boolean;
		if(item_arg) {
			start_required = item_arg.required;
			start_disabled = item_arg.disabled;
			if(item_arg.start_validation && item_arg.start_validation == "change") start_validation = "change";
		}
		this.start_required = start_required || false;
		this.disabled = [];
		if(start_disabled) {
			for(let j = 0; j < radio_el.length; j++) {
				this.disabled[j] = j;
			}
			this.start_disabled = this.disabled;
		} else if(disabled.length) {
			this.disabled = disabled;
			this.start_disabled = disabled;
		}

		if(start_validation) this.start_validation = start_validation;
	}

	validate_input(): void {
		if(this.element.value) this.value = this.element.value;
		else this.value = null;
		if(!this.hidden) {
			let requir_b: boolean = true;
			let notdisabled: boolean = false;

			if(this.start_required) {
				for(let i = 0; i < this.element.length; i++) {
					if(!(<HTMLInputElement> this.element[i]).disabled) {
						notdisabled = true;
						break;
					}
				}
			}

			if(this.start_required && notdisabled && !this.value) requir_b = false;
			this.valid_state = requir_b;

			let wrap_el: [HTMLElement] | RadioNodeList = [this.wrap_element] || this.element;
			if(this.valid_state) {
				wrap_el.forEach((el: HTMLElement | HTMLInputElement, i: number) => {
					el.classList.remove(this.main_el.prop.inv_require_class);
				});
			} else {
				wrap_el.forEach((el: HTMLElement | HTMLInputElement, i: number) => {
					el.classList.add(this.main_el.prop.inv_require_class);
				});
			}
			if(!this.valid_custom_state) {
				this.valid_custom_state = true;
				wrap_el.forEach((el: HTMLElement | HTMLInputElement, i: number) => {
					el.classList.remove(this.main_el.prop.inv_custom_class);
				});
			}
		} else this.valid_state = true;
		if(this.valid_state && this.callback) this.callback();
	}
	setFunctions(): void {
		let change_event: boolean = false;
		let validation: boolean = false;
		change_event = (this.start_validation == "change") || (this.form_el.start_validation == "change") || (this.main_el.prop.start_validation == "change");
		if(this.start_required) validation = true;
		change_event = validation && change_event;

		if(change_event) {
			for(let i = 0; i < this.element.length; i++) {
				let el = <HTMLInputElement> this.element[i];
				el.addEventListener("change", () => {
					this.validate_input();
				});
			}
		}
	}
	setInvalidCustom(): void {
		let wrap_el: [HTMLElement] | RadioNodeList = [this.wrap_element] || this.element;
		this.valid_custom_state = false;
		wrap_el.forEach((el: HTMLElement | HTMLInputElement, i: number) => {
			el.classList.add(this.main_el.prop.inv_custom_class);
		});
	}
	resetInput(): void {
		let wrap_el: [HTMLElement] | RadioNodeList = [this.wrap_element] || this.element;
		wrap_el.forEach((el: HTMLElement | HTMLInputElement, i: number) => {
			el.classList.remove(this.main_el.prop.inv_require_class);
			el.classList.remove(this.main_el.prop.inv_custom_class);
		});
		if(this.start_value) {
			this.value = this.start_value;
			this.element.value = this.start_value;
		} else {
			this.value = undefined;
			this.element.value = "";
		}
		this.valid_state = undefined;
		this.valid_custom_state = undefined;
	}
	getValue(): string | false {
		if(!this.hidden && this.value) return this.value;
		else return false;
	}
	setHidden(): void {
		this.hidden = true;
		for(let i = 0; i < this.element.length; i++) {
			this.disabled[i] = i;
			(<HTMLInputElement> this.element[i]).disabled = true;
		}
	}
	delHidden(): void {
		this.hidden = false;
		if(this.start_disabled) {
			this.disabled = this.start_disabled;
		}
		for(let i = 0; i < this.element.length; i++) {
			if(this.start_disabled[i]) (<HTMLInputElement> this.element[i]).disabled = true;
			else(<HTMLInputElement> this.element[i]).disabled = false;
		}
	}
}





/* form instance class */
type Inps = InputInstance | SelectInstance | CheckInstance | RadioInstance;
interface Form {
	readonly name: string;
	readonly element: HTMLFormElement;
	items: {
		[item: string]: Inps
	};
	data?: any;
	valid_state?: boolean;
	readonly start_validation?: string;
	readonly submit_el?: SubmitEl;
	callback?: validationCallFunc;
}
interface FormFunctions {
	validateForm(): boolean;
	submitForm(): boolean;
	setHidden(el: HTMLElement): void;
	delHidden(el: HTMLElement): void;
	checkHidden(): void;
	afterSubmit(server_resp: validationServerCall): void;
	getData(): formData;
	resetForm(): void;
}
type FormContainer = Form & FormFunctions;
class FormInstance implements FormContainer {
	name: string;
	element: HTMLFormElement;
	items: {
		[item: string]: Inps
	};
	data?: any;
	valid_state?: boolean;
	start_validation?: string;
	submit_el?: SubmitEl;
	callback?: validationCallFunc;

	readonly main_el: Validation;

	constructor(form: FormArg, main_el: Validation, call?: validationCallFunc) {
		this.main_el = main_el;
		if(call) this.callback = call;

		if(typeof form.element == "string") this.element = document.querySelector(`[name='${form.element}']`);
		else this.element = form.element;
		this.name = this.element.name;
		if(form.start_validation) this.start_validation = form.start_validation;
		if(form.submit_el) {
			if(typeof form.submit_el == "string") this.submit_el = this.element.querySelector(`[name='${form.submit_el}']`);
			else this.submit_el = form.submit_el;
			this.submit_el.addEventListener("click", (e: Event) => {
				e.preventDefault();
				this.submitForm();
				return false;
			});
		}

		let items: {[item: string]: Inps} = {};
		let inps = <HTMLFormControlsCollection> this.element.elements;


		let temp_radio_names: Array<string> = [];
		for(let i = 0; i < inps.length; i++) {
			let inp_el = <Inp_gen> inps[i];
			let item_arg: InpArg;
			if(form.items && form.items[inp_el.name]) item_arg = form.items[inp_el.name];
			let tag_name: string = inp_el.tagName;

			if((tag_name == "INPUT" && inp_el.type != "submit" && inp_el.type != "button" && inp_el.type != "checkbox" && inp_el.type != "radio") || tag_name == "TEXTAREA") {
				items[inp_el.name] = new InputInstance(<HTMLInputElement | HTMLTextAreaElement> inp_el, this, this.main_el, item_arg);
				items[inp_el.name].setFunctions();
			} else if(tag_name == "INPUT" && inp_el.type == "radio") {
				let tmp: boolean;
				for(let j = 0; j < temp_radio_names.length; j++) {
					if(inp_el.name == temp_radio_names[i]) tmp = true;
				}
				if(!tmp) {
					temp_radio_names.push(inp_el.name);
					items[inp_el.name] = new RadioInstance(<RadioNodeList> inps.namedItem(inp_el.name), this, this.main_el, item_arg);
					items[inp_el.name].setFunctions();
				}
			} else if(tag_name == "INPUT" && inp_el.type == "checkbox") {
				items[inp_el.name] = new CheckInstance(<HTMLInputElement> inp_el, this, this.main_el, item_arg);
				items[inp_el.name].setFunctions();
			} else if(tag_name == "SELECT") {
				items[inp_el.name] = new SelectInstance(<HTMLSelectElement> inp_el, this, this.main_el, item_arg);
				items[inp_el.name].setFunctions();
			}
		}
		this.items = items;

		this.checkHidden();
	}

	validateForm(): boolean {
		let valid: boolean = true;
		for(let key in this.items) {
			this.items[key].validate_input();
			if(!this.items[key].valid_state) valid = false;
		}
		this.valid_state = valid;
		return valid;
	}
	submitForm(): boolean {
		let valid: boolean = this.validateForm();
		let data: formData = {};

		if(valid) {
			if(this.data) data.data = this.data;
			for(let key in this.items) {
				let value = this.items[key].getValue();
				if(value) data[key] = value;
			}
			if(Object.keys(data).length) {
				if(this.callback) {
					valid = true;
					this.callback(this.element, data, (server_resp: validationServerCall) => {
						this.afterSubmit(server_resp);
					});
				} else valid = false;
			} else valid = false;
		}
		return valid;
	}
	resetForm(): void {
		if(this.data) this.data = undefined;
		for(let key in this.items) {
			this.items[key].resetInput();
		}
	}
	afterSubmit(server_resp: validationServerCall): void {
		let valid: boolean;
		if(typeof server_resp === "boolean") valid = server_resp;
		else {
			valid = false;
			if(Array.isArray(server_resp)) {
				for(let i = 0; i < server_resp.length; i++) {
					if(this.items[server_resp[i]]) {
						this.items[server_resp[i]].setInvalidCustom();
					}
				}
			}
		}
		if(valid) {
			this.resetForm();
		}
	}
	getData(): formData {
		let data: formData = {};
		if(this.data) data.data = this.data;
		for(let key in this.items) {
			let value = this.items[key].getValue();
			if(value) data[key] = value;
		}
		return data;
	}
	setHidden(el: HTMLElement): void {
		let inputs = el.querySelectorAll("input, textarea, select");
		for(let i = 0; i < inputs.length; i++) {
			let element = <Inp_gen> inputs[i];
			let tag_name: string = element.tagName;
			let inp_name: string = element.name;
			if((tag_name == "INPUT" && element.type != "submit") || tag_name == "SELECT" || tag_name == "TEXTAREA") {
				if(this.items[inp_name]) {
					this.items[inp_name].setHidden();

				}
			}
		}
	}
	delHidden(el: HTMLElement): void {
		let selector: string = `*:not(.${this.main_el.prop.hidden_class}) input, *:not(.${this.main_el.prop.hidden_class}) textarea, *:not(.${this.main_el.prop.hidden_class}) select`;
		let inputs = el.querySelectorAll(selector);

		for(let i = 0; i < inputs.length; i++) {
			let element = <Inp_gen> inputs[i];
			let tag_name: string = element.tagName;
			let inp_name: string = element.name;
			if((tag_name == "INPUT" && element.type != "submit") || tag_name == "SELECT" || tag_name == "TEXTAREA") {
				if(this.items[inp_name]) {
					this.items[inp_name].delHidden();
				}
			}
		}
	}
	checkHidden(): void {
		let hidden_elements = this.element.querySelectorAll("." + this.main_el.prop.hidden_class);
		for(let i = 0; i < hidden_elements.length; i++) {
			this.setHidden(<HTMLElement> hidden_elements[i]);
		}
	}
}



/* main validation class */
export class Validation {
	private forms: {
		[item: string]: FormInstance
	};
	readonly prop: ValidationProp;

	constructor(prop: ValidationProp = VALID_PROP) {
		this.forms = {};
		this.prop = prop;
	}

	public setForm(form: FormArg, call?: validationCallFunc): void {
		let form_name: string;
		if(typeof form.element == "string") form_name = form.element;
		else form_name = form.element.name;

		this.forms[form_name] = new FormInstance(form, this, call);
	}

	public setData(f_name: string, data: any): void {
		this.forms[f_name].data = data;
	}
	public getData(form: string | HTMLFormElement): formData {
		let form_name: string;
		if(typeof form == "string") form_name = form;
		else form_name = form.name;

		let data: formData = this.forms[form_name].getData();
		return data;
	}
	public changeHidden(form: string | HTMLFormElement, el: HTMLElement, hidden: boolean): void {
		let form_name: string;
		if(typeof form == "string") form_name = form;
		else form_name = form.name;

		if(hidden) this.forms[form_name].setHidden(el);
		else this.forms[form_name].delHidden(el);
	}
	public validateForm(form: string | HTMLFormElement): boolean {
		let form_name: string;
		if(typeof form == "string") form_name = form;
		else form_name = form.name;

		let res: boolean = this.forms[form_name].validateForm();
		return res;
	}
	public submitForm(form: string | HTMLFormElement): boolean {
		let form_name: string;
		if(typeof form == "string") form_name = form;
		else form_name = form.name;

		let res: boolean = this.forms[form_name].submitForm();
		return res;
	}
	public resetForm(form: string | HTMLFormElement): void {
		let form_name: string;
		if(typeof form == "string") form_name = form;
		else form_name = form.name;
		this.forms[form_name].resetForm();
	}
}

/* end Module Validation ---------------------------------------------------- */