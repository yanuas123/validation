# Validation Plugin

This is typescript plugin for the form validation. It performs validation on the elements TNPUT, SELECT, TEXTAREA. You can get also object with data from filled fields and define default function to execute after success submit. This validator also contains functional for control hidden fields.

## Getting Started


**1.** put `validation.ts` to compilation folder

**2.** create your own `...ts` file

**3.** import plugin module to your own `...ts` file
```javascript
import { type [, types], Validation} from "./modules/validation";
```
where `types...` are interfaces or types for arguments - **[Types](#types)**; and `Validation` is `class` object

**4.** launch in your `...ts` file class `Validation` with not required argument **[ValidationProp](#validationprop)**. If you use this argument, you must define all required properties in this argument.
```javascript
let validation = new Validation(ValidationProp);
```
You can to launch only one `Validation` class and reuse it many times using method `.setForm()` on the instance of the class. In other words, one instance of the class can contain many forms.

**5.** add validation to form using method `setForm()` with required argument **[FormArg](#formarg)** and not required argument **[validationCallFunc](#types)**
```javascript
validation.setForm(FormArg [, validationCallFunc]);
```

**6.** compile typescript files to javascript using one way from described on the [TypeScript](https://github.com/microsoft/TypeScript)

## Types

- **TemplateTypes** - `string | number | RegExp` - type of validation template. If a form field match this type, the form field is valid.
- **SubmitEl** - `HTMLInputElement | HTMLButtonElement` - submit element - element on which validator should to connect submit handler
- **validationCallFunc** - `(form: HTMLFormElement, data: formData, call: formCallFunc): void` - callback function that executes after success submit. Three arguments are here available: *form* - form element, *data* - data object with values from the from fields, *call* - you must to execute this function in your code to signal to validator abuot status of server request or other actions.
- **formCallFunc** - `(server_resp: boolean | [string]): void` - function to signal to validator abuot status of server request or other actions. If you pass `true` - validator will refresh the form fields. If you pass array of strings - validator will serach a field name that match the string from array and connect to the field *server error class*.
- **[ValidationProp](#validationprop)** - global validation properties
- **[FormArg](#formarg)** - form validation properties
- **[InpArg](#inparg)** - field validation properties
- **[formData](#formdata)** - data object with values from the from fields

## Methods

| Method | Arguments | Return | Required | Description |
| ------ | --------- | ------ | :------: | ----------- |
| setForm |          |        |          | set form for validation |
|        | [FormArg](#formarg) |  | yes  |             |
|        | [validationCallFunc](#types) |  | no |      |
|        |           | void   |          |             |
| setData |          |        |          | set custom data to the form which then will be delivered with fields data in the object in the submit callback |
|        | string    |        | yes      | form name   |
|        | any       |        | yes      | data which will be attached to the form |
|        |           | void   |          |             |
| getData |          |        |          | return data object with values from the from fields |
|        | string \| HTMLFormElement | | yes | form name or form element |
|        |           | [formData](#formdata) |        |             |
| changeHidden |     |        |          | Set or unset hidden state for group of fields. Hidden fields are not connected to validation executing and data object with values. |
|        | string \| HTMLFormElement | | yes | form name or form element |
|        | HTMLElement |      | yes      | hidden HTML container |
|        | boolean   |        | yes      | if you hide container, pass true, otherwise false |
|        |           | void   |          |             |
| validateForm |     |        |          | Executes form validation. If you want to execute your own actions about form without submit, you can call this method and then `getData()` |
|        | string \| HTMLFormElement | | yes | form name or form element |
|        |           | boolean |         | if valid form, return true, otherwise false |
| submitForm |       |        |          | execute form submit (validation and submit callback) |
|        | string \| HTMLFormElement | | yes | form name or form element | 
|        |           | boolean |         | If valid form, return true, otherwise false. This does not return result from the submit callback, only validation result. |
| resetForm |        |         |         | Refresh form (set initial values to the fields) |
|        | string \| HTMLFormElement | | yes | form name or form element |
|        |           | void    |         |             |

## Options

### ValidationProp

If you define this settings, default properties does not working.

| Property | Type    | Required | Default | Description |
| -------- | :-----: | :------: | ------- | ----------- |
| valid_type_template | object | no | ```"tel": /^[0-9\+\-\(\)]{8,16}$/```, ```"email": /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/```, ```"password": /^[a-zA-Z0-9]{6,}$/``` | object contains default validation templates for some types of the fields. Here property name string is a type of the field and value - [TemplateTypes](#types) |
| type_blocked_template | object | no | ```"number": /^[0-9]+$/```, ```"tel": /^[0-9\+\-\(\)]+$/``` | object contains default validation templates for some types of the fields that does not allow to enter value which not match the template. Here property name string is a type of the field and value - [TemplateTypes](#types) |
| hidden_class | string | yes   | "hidden" | default class which uses in HTML template to hide elements |
| wrap_selector | string | no   | ".input-parent" | Element with this selector should to wrap single field and invalid class attaches to this element. If not defined, invalid class attaches to the field. |
| inv_require_class | string | yes | "empty" | class for invalid `required` validation |
| inv_valid_class | string | yes | "invalid" | class for invalid fields which does not match to the validation template |
| inv_custom_class | string | no | "invalid-server" | This class attaches to the fields which marked as invalid in a server response. |
| start_validation | "input" \| "change" | no | "change" | Defines on which event to perform validation. `input` - oninput, onchange, onsubmit; `change` - onchange, onsubmit. If no defined, uses `onsubmit`. |
| valid_template_attr | string | no | "data-valid-template" | You can define this attribute on the field and validator will be use a value as validation template. If defined validation template in the [InpArg](#inparg) options for the field, [InpArg](#inparg) options has priority. Attribute value can contain also RegEx string for template ("/.../").
| blocked_template_attr | string | no | "data-blocked-template" | You can define this attribute on the field and validator will be use a value as validation template that does not allow to enter value which not match the template. If defined validation template in the [InpArg](#inparg) options for the field, [InpArg](#inparg) options has priority. Attribute value can contain also RegEx string for template ("/.../").
| start_validation_attr | string | no | "data-start-validation" | You can define this attribute on the field and validator will be use a value to define on which event to perform validation. `input` - oninput, onchange, onsubmit; `change` - onchange, onsubmit;. If defined validation template in the [InpArg](#inparg) options for the field, [InpArg](#inparg) options has priority.

### FormArg

| Property | Type    | Required | Default | Description |
| -------- | :-----: | :------: | ------- | ----------- |
| element  | string \| HTMLFormElement | yes |  | form name or form element |
| submit_el | string \| [SubmitEl](#types) | no | | Submit element name or [SubmitEl](#types). Submit handler is attached to this element. |
| items    | object  | no       | the validator takes all fields which contain in the form | object, where property name string is a name of the field and value - [InpArg](#inparg) options |
| start_validation | "input" \| "change" | no | from the [ValidationProp](#validationprop).*start_validation* | Defines on which event to perform validation. `input` - oninput, onchange, onsubmit; `change` - onchange, onsubmit; |

### InpArg

| Property | Type    | Required | Default | Description |
| -------- | :-----: | :------: | ------- | ----------- |
| required | boolean | no       | from field property `required` |  |
| disabled | boolean | no       | from field property `disabled` |  |
| valid_template | [TemplateTypes](#types) | no | from the [ValidationProp](#validationprop).*valid_type_template* | template for validation |
| blocked_template | [TemplateTypes](#types) | no | from the [ValidationProp](#validationprop).*type_blocked_template* | does not allow to enter value which not match the template |
| start_validation | "input" \| "change" | no | from the [FormArg](#formarg).*start_validation* | Defines on which event to perform validation. `input` - oninput, onchange, onsubmit; `change` - onchange, onsubmit; |
| callback | Function | no      |         | Fires each time when performed validation to the field |

### formData

| Property | Type  | Description |
| -------- | :---: | ----------- |
| [string] | string \| number | property name is field name (INPUT or other) and value - value of the field |
| data     | any   | data which attached to the form using `setData()` method |

## Built With

- [TypeScript](https://www.typescriptlang.org/) v 3.5.3

## Author

- Yaroslav Levchenko

## License

This project is licensed under the MIT License - see the [LICENSE.md](License.md) file for details
