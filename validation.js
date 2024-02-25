function Validator(option) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    //ham thuc hien validate
    function validate(inputElement, rule) {
        var errorMessage;
        var errorElement = getParent(inputElement, option.formGroupSelector).querySelector('.form-message')
        //lay ra cac rule cua selector
        var rules = selectorRules[rule.selector]

        // lap qua tung rule vs kiem tra
        // neu co loi thi dung viec kiem tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElemnet.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }

            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, option.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, option.formGroupSelector).classList.remove('invalid');

        }
        return !errorMessage;

    }

    // lay element cua form can validate
    var formElemnet = document.querySelector(option.form)
    if (formElemnet) {
        //Khi submit form
        formElemnet.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            //lap qua tung rules va validate
            option.rules.forEach(function (rule) {
                var inputElement = formElemnet.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                }
            });


            if (isFormValid) {

                if (typeof option.onSubmit === 'function') {
                    var enableInput = formElemnet.querySelectorAll('[name]');
                    var formValues = Array.from(enableInput).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElemnet.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;

                        }
                        return values;
                    }, {});

                    option.onSubmit(formValues);
                }

            }
        }
        // lặp qua mỗi rule va xử lý 
        option.rules.forEach(function (rule) {

            // luu lai cac rules cho o input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {

                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElemnet.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElement) {

                // xu ly truong hop blur khoi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                //xu ly moi truong hop nguoi dung dang nhap vao
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, option.formGroupSelector).querySelector('.form-message')
                    errorElement.innerText = '';
                    getParent(inputElement, option.formGroupSelector).classList.remove('invalid');

                }

            });


        });


    }
}
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui long nhap truong nay'
        }

    }

}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'vui long nhap email'
        }

    }
}
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui long nhap toi thieu ${min} ki tu`;
        }

    }
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Gia tri nhap vao khong chinh xac'
        }
    }
}