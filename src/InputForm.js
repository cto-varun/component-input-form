/* eslint-disable complexity */
import React from 'react';
import { Input, Select, Button, InputNumber, Radio, Checkbox } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import { Form, Icon } from '@ant-design/compatible';

import { component as Template } from '@ivoyant/component-template';

import CryptoJS from 'crypto-js';

import get from 'lodash.get';
import moment from 'moment';

import { getNestedObject } from '../../../../src/utils/nestedObjectHelpers';
import { shouldExecuteConditionsArray } from '../../../../src/services/helpers';

// Custom functions
import ctn from './custom/ctn';

class InputFormComponent extends React.Component {
    state = {
        card: {
            active: false,
            data: '',
            visble: '',
        },
        CVV: {
            active: false,
            data: '',
            visble: '',
        },
        formData: {},
        errorData: {},
        selectData: [],
        formState: false,
    };

    componentDidMount() {
        const { dataMapingSchema, setSelectData } = this.props.properties;
        const { data, component } = this.props;

        if (this.props.component.id !== undefined) {
            window[window.sessionStorage?.tabId][
                `${this.props.component.id}`
            ] = this;
            window[window.sessionStorage?.tabId][
                `${this.props.component.id}_rerender`
            ] = () => {
                this.setState((prevState) => {
                    return { ...prevState };
                });
            };
            window[window.sessionStorage?.tabId][
                `${this.props.component.id}_setErrorData`
            ] = (errorObject) => this.setErrorState(errorObject);
            window[window.sessionStorage?.tabId][
                `${this.props.component.id}_reset`
            ] = () => {
                this.props.form.resetFields();
                this.setState((prevState) => {
                    return {
                        ...prevState,
                        card: {
                            ...prevState.card,
                            active: false,
                            data: '',
                            visible: '',
                        },
                        CSV: {
                            ...prevState.CSV,
                            active: false,
                            data: '',
                            visible: '',
                        },
                    };
                });
                if (
                    dataMapingSchema &&
                    dataMapingSchema.length > 0 &&
                    this.props &&
                    data &&
                    data.data &&
                    data.data.length > 0
                ) {
                    this.getValuesForPrePopulation(data.data, dataMapingSchema);
                }
            };
            window[window.sessionStorage?.tabId][
                `${this.props.component.id}_formState`
            ] = () => this.setState({ formState: false });

            // setting form item value from oust side of the form
            window[window.sessionStorage?.tabId][
                `${component.id}_setFormFieldItemValue`
            ] = (value, formItemId) =>
                this.setFormFieldItemValue(value, formItemId);

            window[window.sessionStorage?.tabId][
                `${component.id}_handelSubmit`
            ] = () => this.handleSubmit();
        }

        if (
            dataMapingSchema &&
            dataMapingSchema.length > 0 &&
            this.props &&
            data &&
            data.data &&
            data.data.length > 0
        ) {
            this.getValuesForPrePopulation(data.data, dataMapingSchema);
        }

        // // Get data from window object
        // window[window.sessionStorage?.tabId][this.props.component.id] =
        // {
        //     use_card_on_File: {},
        //     payment_comming_soon: {},
        //     payment_card_name: {
        //         validateStatus: 'error',
        //     },
        //     payment_card_number: {},
        //     payment_card_month: {},
        //     year: {},
        //     payment_card_security_code: {},
        //     payment_card_zip_code: {
        //         validateStatus: 'error',
        //     },
        //     payment_amount_code: {},
        //     payment_fee_code: {},
        //     payment_total_code: '123',
        //     enroll_autopay: {},
        //     submit_button: {},
        // };

        if (setSelectData && setSelectData) {
            this.getDataForSelect();
        }

        if (this.props.component.id === 'settings-marketing-preferences-form') {
            if (data && data.data && data.data[0]) {
                window[window.sessionStorage?.tabId]['subscriber-ptn-value'] =
                    data.data[0].ptn;
            }
        }
    }

    // Adding memory cleanup
    componentWillUnmount() {
        if (this.props.component.id !== undefined) {
            delete window[window.sessionStorage?.tabId][
                `${this.props.component.id}`
            ];
            delete window[window.sessionStorage?.tabId][
                `${this.props.component.id}_rerender`
            ];
            delete window[window.sessionStorage?.tabId][
                `${this.props.component.id}_setErrorData`
            ];
            delete window[window.sessionStorage?.tabId][
                `${this.props.component.id}_reset`
            ];
            delete window[window.sessionStorage?.tabId][
                `${this.props.component.id}_formState`
            ];
            delete window[window.sessionStorage?.tabId][
                `${this.props.component.id}_setFormFieldItemValue`
            ];
            delete window[window.sessionStorage?.tabId][
                `${this.props.component.id}_handelSubmit`
            ];
        }
    }

    // Bellow funtion is used to set value from different form
    setFormFieldItemValue = (value, formItemId) => {
        this.props.form.setFieldsValue({
            [formItemId]: value,
        });
    };

    getDataForSelect = () => {
        const { data } = this.props;
        if (data && data.data && data.data[0]) {
            const selectData = [];
            const arr = [];
            data.data &&
                data.data.forEach((data) => {
                    if (
                        data.ptnStatus &&
                        data.ptnStatus === 'A' &&
                        arr.includes(data.telephoneNumber) === false
                    ) {
                        const object = {
                            key: data.telephoneNumber,
                            value: data.telephoneNumber,
                        };

                        arr.push(data.telephoneNumber);

                        selectData.push(object);
                    }
                });

            this.setState({ selectData: [...selectData] });
        }
    };

    // FindById  and mapData id used to gether to get the auto populated values
    findById = (obj, id) => {
        let result;
        for (const p in obj) {
            if (p === id) {
                return obj[id];
            }
            if (typeof obj[p] === 'object') {
                result = this.findById(obj[p], id);
                if (result) {
                    return result;
                }
            }
        }
        return result;
    };

    mapData = (obj, schema) => {
        let mainObject = {};
        schema &&
            schema.map((data) => {
                mainObject = {
                    ...mainObject,
                    [data.formFieldId]: this.findById(obj, data.apiKey),
                };
            });
        return mainObject;
    };

    getValuesForPrePopulation = (data, schema) => {
        const result = this.mapData(data, schema);
        this.props.form.setFieldsValue(result);
    };

    get bodyProps() {
        const { template } = this.props.properties;
        return { template };
    }

    isJson = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    };

    mapErrorObjectToValidation = (errorObject, errorsMappingObject) => {
        const { errorsSchema } = this.props.properties;
        // let errorsSchema = {
        //     "use_card_on_File": {},
        //     "payment_comming_soon": {},
        //     "payment_card_name": {},
        //     "payment_card_number": {},
        //     "payment_card_month": {},
        //     "year": {},
        //     "payment_card_security_code": {},
        //     "payment_card_zip_code": {},
        //     "payment_amount_code": {},
        //     "payment_fee_code": {},
        //     "payment_total_code": '123',
        //     "enroll_autopay": {},
        //     "submit_button": {},
        //     "enroll_ctn_select": {}
        // };

        Object.keys(errorsMappingObject).map((key) => {
            // ["payload.message", "payload.message.code", "payload.message.message"]
            // key = "payload.message"
            Object.keys(errorsMappingObject[key]).map((subKey) => {
                // ["Expiration date invalid", "MOD-10 check failed"]
                // subKey = "Expiration date invalid"
                if (this.isJson(errorObject.payload.message)) {
                    if (
                        JSON.parse(errorObject.payload.message).message ===
                        subKey
                    ) {
                        errorsMappingObject[key][subKey].map((errorKey) => {
                            errorsSchema[errorKey] = {
                                validateStatus: 'error',
                                message: subKey,
                            };
                        });
                    }
                }

                if (getNestedObject(errorObject, key) === subKey) {
                    errorsMappingObject[key][subKey].map((errorKey) => {
                        errorsSchema[errorKey] = {
                            validateStatus: 'error',
                            message: subKey,
                        };
                    });
                }
            });
        });
        return errorsSchema;
    };

    setErrorState = (errorObject) => {
        const { errorsMappingObject } = this.props.properties;
        // let errorsMappingObject = {
        //     'payload.message': {
        //         'Expiration date invalid': ['payment_card_month', 'year'],
        //         'MOD-10 check failed': ['payment_card_number'],
        //         'Card of Invalid Type': ['payment_card_number'],
        //         'creditCard Is Invalid': ['payment_card_number'],
        //     },
        //     'payload.message.code': {
        //         '110013056': [''],
        //     },
        //     'payload.message.message': {
        //         'creditCard expirationDate Is Invalid': [
        //             'payment_card_month',
        //             'year',
        //         ],
        //         'billingAccountNumber Is Invalid': ['billingaccountnumber'],
        //     },
        // };
        const newObj = this.mapErrorObjectToValidation(
            errorObject,
            errorsMappingObject
        );

        this.setState({ errorData: newObj });
    };

    sendStateMachineCommand = (
        windowFunction,
        commandString = null,
        payload = null
    ) => {
        if (windowFunction) {
            if (payload === null) {
                window[window.sessionStorage?.tabId][windowFunction](
                    commandString
                );
            } else if (commandString === null) {
                window[window.sessionStorage?.tabId][windowFunction]({
                    payload,
                });
            } else {
                let val = '';

                // For some reason this was just checking for payload.length < 15.
                // Adding some more hardcoded conditions to avoid breaking anything.
                if (
                    payload.length < 15 &&
                    windowFunction !== 'sendupdateWhitelistAsyncMachine' &&
                    windowFunction !== 'sendwhitelistValidateOTPAsyncMachine' &&
                    windowFunction !==
                        'sendinquireResourceStatusAsyncMachine' &&
                    windowFunction !== 'sendchangeCtnOtpValidateAsyncMachine'
                ) {
                    this.props.data.data.forEach((obj) => {
                        Object.keys(obj).forEach((key) => {
                            if (key === payload) {
                                val = obj[key];
                            }
                        });
                    });
                }
                if (
                    windowFunction === 'sendupdateWhitelistAsyncMachine' &&
                    commandString === 'SET.REQUEST.DATA.KEY'
                ) {
                    window[window.sessionStorage?.tabId][windowFunction](
                        commandString,
                        payload
                    );
                } else {
                    window[window.sessionStorage?.tabId][windowFunction](
                        commandString,
                        {
                            value: val.length > 0 ? val : payload,
                        }
                    );
                }
            }
        }
    };

    handleSubmit = (e) => {
        if (e) e.preventDefault();

        const {
            submitFunctions,
            encryptionKey,
            submitCondition,
            validateAnotherFormItem,
        } = this.props.properties;

        const fieldNames = [];

        if (
            validateAnotherFormItem !== undefined &&
            validateAnotherFormItem.length > 0
        ) {
            validateAnotherFormItem.map((obj) => {
                Object.keys(this.props.form.getFieldsValue()).forEach((key) => {
                    // if (
                    //     key === obj.fieldItem &&
                    //     this.props.form.getFieldsValue([key])[key] === undefined
                    // ) {
                    //     window[window.sessionStorage?.tabId][obj.functionName]();
                    // }
                });
            });
        }

        submitCondition &&
            submitCondition.map((data) => {
                if (
                    this.props.form.getFieldValue(data.lookFor) !==
                    data.assertValue
                ) {
                    this.props.form.setFieldsValue({
                        [data.lookFor]: undefined,
                    });
                    this.setState((prevState) => {
                        return {
                            ...prevState,
                            errorData: {
                                ...prevState.errorData,
                                [data.lookFor]: {
                                    validateStatus: 'error',
                                },
                            },
                        };
                    });
                }
            });

        // Control whether the masked fields will propagate submit
        let customError = false;

        // Handle credit card and cvv validation separately
        Object.keys(this.props.form.getFieldsValue()).forEach((key) => {
            if (
                key !== 'payment_card_number' &&
                key !== 'service_card_number' &&
                key !== 'update_card_number' &&
                key !== 'enroll_card_number' &&
                key !== 'payment_card_security_code' &&
                key !== 'service_card_security_code' &&
                key !== 'update_card_security_code' &&
                key !== 'enroll_card_security_code'
            ) {
                fieldNames.push(key);
            } else {
                if (this.props.form.getFieldValue(key) == '') {
                    customError = true;
                }
                if (this.props.form.getFieldValue(key) == undefined) {
                    customError = true;
                    this.setState((prevState) => {
                        return {
                            ...prevState,
                            errorData: {
                                ...prevState.errorData,
                                [key]: {
                                    validateStatus: 'error',
                                },
                            },
                        };
                    });
                }
            }
        });

        this.props.form.validateFieldsAndScroll(fieldNames, (err, values) => {
            values.payment_card_number = this.state.card.data;
            values.service_card_number = this.state.card.data;
            values.update_card_number = this.state.card.data;
            values.enroll_card_number = this.state.card.data;
            values.payment_card_security_code = this.state.CVV.data;
            values.service_card_security_code = this.state.CVV.data;
            values.update_card_security_code = this.state.CVV.data;
            values.enroll_card_security_code = this.state.CVV.data;

            // For some reason, CVV appears to be missing from the "error" object,
            // and thus is not accounted for in handleSubmit validation. checkValidPositiveNumber
            // is basically being re-done right here
            if (
                this.props.component.id === 'payment-form' ||
                this.props.component.id === 'bc-make-payment-form' ||
                this.props.component.id === 'change-ctn-make-payment-form' ||
                this.props.component.id === 'move-sub-payment-form' ||
                this.props.component.id === 'service-card-payment' ||
                this.props.component.id ===
                    'change-ctn-modal-service-card-payment' ||
                this.props.component.id === 'enroll-auto-pay' ||
                this.props.component.id === 'update-auto-pay'
            ) {
                let cvvField;
                if (
                    [
                        'payment-form',
                        'bc-make-payment-form',
                        'change-ctn-make-payment-form',
                        'move-sub-payment-form',
                    ].includes(this.props.component.id)
                ) {
                    cvvField = 'payment_card_security_code';
                }
                if (
                    [
                        'service-card-payment',
                        'change-ctn-modal-service-card-payment',
                        'move-sub-service-card-payment',
                    ].includes(this.props.component.id)
                ) {
                    cvvField = 'service_card_security_code';
                }
                if (this.props.component.id === 'enroll-auto-pay') {
                    cvvField = 'enroll_card_security_code';
                }
                if (this.props.component.id === 'update-auto-pay') {
                    cvvField = 'update_card_security_code';
                }

                const maxLength = window[window.sessionStorage?.tabId][cvvField]
                    ? window[window.sessionStorage?.tabId][cvvField].maxLength
                    : 3;

                if (
                    this.state.CVV.data &&
                    (this.state.CVV.data.length < maxLength ||
                        isNaN(this.state.CVV.data) ||
                        this.state.CVV.data < 0 ||
                        this.state.CVV.data.includes(' '))
                ) {
                    this.props.form.setFields({
                        [cvvField]: {
                            value: this.state.CVV.data,
                            errors: [new Error('Please enter a valid CVV')],
                        },
                    });
                    customError = true;
                }
            }

            if (
                this.props.component.id === 'payment-form' ||
                this.props.component.id === 'bc-make-payment-form' ||
                this.props.component.id === 'change-ctn-make-payment-form' ||
                this.props.component.id === 'move-sub-payment-form'
            ) {
                // Check for date validation
                const input = moment(
                    `20${values.year}-${values.payment_card_month}`
                );

                if (input <= moment().subtract(1, 'M')) {
                    this.props.form.setFields({
                        payment_card_month: {
                            value: values.payment_card_month,
                            errors: [
                                new Error(
                                    'Please enter a valid expiration date'
                                ),
                            ],
                        },
                        year: {
                            value: values.year,
                            errors: [
                                new Error(
                                    'Please enter a valid expiration date'
                                ),
                            ],
                        },
                    });
                    customError = true;
                }
            }
            if (
                this.props.component.id === 'service-card-payment' ||
                this.props.component.id === 'bc-modal-service-card-payment' ||
                this.props.component.id === 'move-sub-service-card-payment' ||
                this.props.component.id ===
                    'change-ctn-modal-service-card-payment'
            ) {
                const input = moment(
                    `20${values.service_card_year}-${values.service_card_month}`
                );

                if (input <= moment().subtract(1, 'M')) {
                    this.props.form.setFields({
                        service_card_month: {
                            value: values.service_card_month,
                            errors: [
                                new Error(
                                    'Please enter a valid expiration date'
                                ),
                            ],
                        },
                        service_card_year: {
                            value: values.service_card_year,
                            errors: [
                                new Error(
                                    'Please enter a valid expiration date'
                                ),
                            ],
                        },
                    });
                    customError = true;
                }
            }

            // Check for payment type validation only in regular form
            if (
                this.props.component.id === 'payment-bypass-form' ||
                this.props.component.id === 'payment-form' ||
                this.props.component.id === 'service-card-payment' ||
                this.props.component.id === 'refill-card'
            ) {
                // Empty payment type
                if (
                    window[window.sessionStorage?.tabId][
                        'payment-options-title'
                    ].props.form.getFieldValue('selectPaymentType') ===
                    undefined
                ) {
                    window[window.sessionStorage?.tabId][
                        'payment-options-title'
                    ].props.form.setFields({
                        selectPaymentType: {
                            value: undefined,
                            errors: [new Error('Please select a payment type')],
                        },
                    });
                    customError = true;
                }

                //  BP Ext

                if (
                    window[window.sessionStorage?.tabId][
                        'payment-options-title'
                    ].props.form.getFieldValue('selectPaymentType') !==
                    'OneTimePayment'
                ) {
                    if (
                        window[window.sessionStorage?.tabId][
                            'bridgepay-confirmation'
                        ].props.form.getFieldValue('agreement') !== true
                    ) {
                        window[window.sessionStorage?.tabId][
                            'bridgepay-confirmation'
                        ].props.form.setFields({
                            agreement: {
                                value: false,
                                errors: [new Error('Please confirm')],
                            },
                        });
                        customError = true;
                    }
                }
            }

            // Break
            if (customError) {
                return;
            }

            // No error
            if (!err) {
                this.setState({
                    formState: true,
                });

                const dataForPostRequest = this.mapDataToApi(
                    this.props.properties.apiResponseFormat,
                    values
                );

                // set customerCareMetadata
                if (dataForPostRequest.customerCareMetadata) {
                    dataForPostRequest.customerCareMetadata.attuid =
                        window[
                            window.sessionStorage?.tabId
                        ].COM_IVOYANT_VARS.attId;
                }
                // set phoneNumber for payment request
                if (
                    window[window.sessionStorage?.tabId].selectedCtnForPayment
                ) {
                    dataForPostRequest.phoneNumber =
                        window[
                            window.sessionStorage?.tabId
                        ].selectedCtnForPayment;
                }

                // Set PaymentType
                if (
                    this.props.component.id === 'payment-bypass-form' ||
                    this.props.component.id === 'payment-form' ||
                    this.props.component.id === 'service-card-payment' ||
                    this.props.component.id === 'refill-card'
                ) {
                    dataForPostRequest.paymentType =
                        window[window.sessionStorage?.tabId][
                            'payment-options-title'
                        ].props.form.getFieldValue('selectPaymentType') ||
                        'OneTimePayment';
                }

                // set billingaccountnumber to target ban
                if (
                    this.props.component.id === 'move-sub-payment-form' ||
                    this.props.component.id ===
                        'move-sub-service-card-payment' ||
                    this.props.component.id === 'move-sub-refill-card'
                ) {
                    if (
                        window[window.sessionStorage?.tabId][
                            'move-sub-security-question'
                        ]?.payload?.billingAccountNumber
                    ) {
                        dataForPostRequest.billingaccountnumber = window[
                            window.sessionStorage?.tabId
                        ][
                            'move-sub-security-question'
                        ].payload.billingAccountNumber.toString();
                    }
                }

                if (
                    this.props.component.id === 'crp-payment-credit-debit' ||
                    this.props.component.id === 'crp-payment-service-card' ||
                    this.props.component.id === 'crp-payment-refill-card'
                ) {
                    dataForPostRequest.paymentType = 'ChangePlan';
                    if (window[window.sessionStorage?.tabId].crpDueAmount) {
                        dataForPostRequest.paymentAmount =
                            window[window.sessionStorage?.tabId].crpDueAmount;
                    }
                }

                if (
                    this.props.component.id ===
                        'change-ctn-make-payment-form' ||
                    this.props.component.id ===
                        'change-ctn-modal-service-card-payment' ||
                    this.props.component.id === 'change-ctn-modal-refill-card'
                ) {
                    dataForPostRequest.paymentType = 'ChangeCTN';
                }

                // hardcode (withFee in make a payment CC Api)
                if (values.hasOwnProperty('payment_fee_code')) {
                    if (values.payment_fee_code === 4) {
                        dataForPostRequest.withFee = true;
                    } else {
                        dataForPostRequest.withFee = false;
                    }
                }
                // Service Card Fee
                if (values.hasOwnProperty('service_fee')) {
                    if (values.service_fee === 4) {
                        dataForPostRequest.withFee = true;
                    } else {
                        dataForPostRequest.withFee = false;
                    }
                }

                if (this.props.component.id === 'service-card-payment') {
                    // Set fee
                    // Suspended Hotline
                    if (
                        this.props.data.data[1].statusActvCode === 'SUS' &&
                        (this.props.data.data[1].statusActvRsnCode === 'CO' ||
                            this.props.data.data[1].statusActvRsnCode ===
                                'CNP1')
                    ) {
                        dataForPostRequest.withFee = false;
                    }
                }

                // Custom refill form submit logic
                if (
                    this.props.component.id === 'refill-card' ||
                    this.props.component.id === 'bc-modal-refill-card'
                ) {
                    // Set fee
                    // Suspended Hotline
                    if (
                        this.props.data.data[1].statusActvCode === 'SUS' &&
                        (this.props.data.data[1].statusActvRsnCode === 'CO' ||
                            this.props.data.data[1].statusActvRsnCode ===
                                'CNP1')
                    ) {
                        dataForPostRequest.withFee = false;
                    }
                    // CT $0 check
                    else if (this.props.data.data[2].adrStateCode === 'CT') {
                        dataForPostRequest.withFee = false;
                    }
                    // Change bill cycle
                    else if (
                        this.props.component.id === 'bc-modal-refill-card'
                    ) {
                        dataForPostRequest.withFee = false;
                    } else if (
                        window[window.sessionStorage?.tabId][
                            'payment-options-title'
                        ].props.form.getFieldValue('selectPaymentType') !==
                        'OneTimePayment'
                    ) {
                        dataForPostRequest.withFee = false;
                    }

                    //  Refill card - no billcycle
                    if (this.props.component.id === 'refill-card') {
                        if (
                            window[window.sessionStorage?.tabId][
                                'payment-options-title'
                            ].props.form.getFieldValue('selectPaymentType') ===
                            'OneTimePayment'
                        ) {
                            const total = parseFloat(
                                this.props.data.data[0].dueAmount || 0
                            );
                            // Set total amount
                            if (dataForPostRequest.withFee === true) {
                                dataForPostRequest.paymentAmount = total + 4;
                            } else {
                                dataForPostRequest.paymentAmount = total;
                            }
                        } else {
                            dataForPostRequest.paymentAmount = window[
                                window.sessionStorage?.tabId
                            ]['payment-form'].props.form.getFieldValue(
                                'payment_total_code'
                            );
                        }
                    }
                }

                // coerce payment amount to be an integer if it is a string
                if (
                    dataForPostRequest?.paymentAmount &&
                    typeof dataForPostRequest?.paymentAmount === 'string'
                ) {
                    dataForPostRequest.paymentAmount = parseFloat(
                        dataForPostRequest?.paymentAmount
                    );
                }

                const encrptedPayload =
                    encryptionKey &&
                    encryptionKey.length > 0 &&
                    this.encryptData(dataForPostRequest);

                const finalData =
                    encryptionKey && encryptionKey.length > 0
                        ? encrptedPayload
                        : dataForPostRequest;

                let shouldExecuteAlternativeSubmitFunctions = false;

                const conditionMet = shouldExecuteConditionsArray;

                const alternativeSubmitFunctions = [
                    {
                        conditionalArray: {
                            shouldExecute: [],
                            shouldNotExecute: [
                                {
                                    datasource: {
                                        id: '360_account_balances',
                                    },
                                    conditions: [
                                        {
                                            AND: [
                                                {
                                                    fieldKey:
                                                        'data.0.dueAmount',
                                                    operator: {
                                                        operand: 'lte',
                                                        value: -15,
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        submitFunctions: [
                            {
                                windowFunction:
                                    'sendchangeCtnOtpValidateAsyncMachine',
                                commandString: 'APPEND.URL',
                                nestedKey: 'value',
                            },
                            {
                                windowFunction:
                                    'sendchangeCtnOtpValidateAsyncMachine',
                                commandString: 'REFETCH',
                                nestedKey: '',
                            },
                        ],
                    },
                ];
                let outputAltSubmitFunc;
                if (alternativeSubmitFunctions) {
                    outputAltSubmitFunc = cloneDeep(alternativeSubmitFunctions);
                    alternativeSubmitFunctions.map((altSubmitFunc, index) => {
                        if (
                            hasOwnProperty.call(
                                altSubmitFunc,
                                'conditionalArray'
                            )
                        ) {
                            // if shouldExecute array exists
                            if (
                                hasOwnProperty.call(
                                    altSubmitFunc.conditionalArray,
                                    'shouldExecute'
                                ) &&
                                altSubmitFunc.conditionalArray.shouldExecute
                                    .length > 0
                            ) {
                                let shouldKeepCondition = false;
                                altSubmitFunc.conditionalArray.shouldExecute.map(
                                    (condition) => {
                                        const datasourceID = `datasource_${condition.datasource.id}`;
                                        if (
                                            conditionMet(
                                                getNestedObject(
                                                    window[
                                                        window.sessionStorage
                                                            ?.tabId
                                                    ].alasql.tables[
                                                        datasourceID
                                                    ]
                                                ),
                                                condition.conditions
                                            )
                                        ) {
                                            shouldKeepCondition = true;
                                            shouldExecuteAlternativeSubmitFunctions = true;
                                        }
                                        return condition;
                                    }
                                );

                                if (!shouldKeepCondition) {
                                    // but none of the conditions are met: then remove the index
                                    outputAltSubmitFunc.remove(index);
                                }
                            }

                            // if shouldNotExecute array exists
                            if (
                                hasOwnProperty.call(
                                    altSubmitFunc.conditionalArray,
                                    'shouldNotExecute'
                                ) &&
                                altSubmitFunc.conditionalArray.shouldNotExecute
                                    .length > 0
                            ) {
                                let shouldKeepCondition = false;
                                altSubmitFunc.conditionalArray.shouldNotExecute.map(
                                    (condition) => {
                                        const datasourceID = `datasource_${condition.datasource.id}`;
                                        if (
                                            conditionMet(
                                                getNestedObject(
                                                    window[
                                                        window.sessionStorage
                                                            ?.tabId
                                                    ].alasql.tables[
                                                        datasourceID
                                                    ]
                                                ),
                                                condition.conditions
                                            )
                                        ) {
                                            shouldKeepCondition = true;
                                        }

                                        if (!shouldKeepCondition) {
                                            // but none of the conditions are met: then remove the index
                                            outputAltSubmitFunc.remove(index);
                                        }
                                        return condition;
                                    }
                                );
                            }
                        }
                        return altSubmitFunc;
                    });
                }

                if (shouldExecuteAlternativeSubmitFunctions) {
                    alternativeSubmitFunctions.map((item) => {
                        if (item.hasOwnProperty('submitFunctions')) {
                            item.submitFunctions.map((command) => {
                                if (
                                    command.hasOwnProperty('nestedKey') &&
                                    command.hasOwnProperty('commandString')
                                ) {
                                    this.sendStateMachineCommand(
                                        command.windowFunction,
                                        command.commandString,
                                        command.nestedKey.length > 0
                                            ? getNestedObject(
                                                  finalData,
                                                  command.nestedKey
                                              )
                                            : finalData
                                    );
                                } else if (
                                    command.hasOwnProperty('nestedKey')
                                ) {
                                    this.sendStateMachineCommand(
                                        command.windowFunction,
                                        null,
                                        getNestedObject(
                                            finalData,
                                            command.nestedKey
                                        )
                                    );
                                } else if (
                                    command.hasOwnProperty('getPropsDataKey') &&
                                    command.hasOwnProperty('commandString')
                                ) {
                                    this.sendStateMachineCommand(
                                        command.windowFunction,
                                        command.commandString,
                                        command.getPropsDataKey
                                    );
                                } else {
                                    this.sendStateMachineCommand(
                                        command.windowFunction,
                                        command.commandString
                                    );
                                }
                                return command;
                            });
                            return item;
                        }
                    });
                }

                if (!shouldExecuteAlternativeSubmitFunctions) {
                    submitFunctions.map((command) => {
                        if (
                            command.hasOwnProperty('nestedKey') &&
                            command.hasOwnProperty('commandString')
                        ) {
                            this.sendStateMachineCommand(
                                command.windowFunction,
                                command.commandString,
                                command.nestedKey.length > 0
                                    ? getNestedObject(
                                          finalData,
                                          command.nestedKey
                                      )
                                    : finalData
                            );
                        } else if (command.hasOwnProperty('nestedKey')) {
                            this.sendStateMachineCommand(
                                command.windowFunction,
                                null,
                                getNestedObject(finalData, command.nestedKey)
                            );
                        } else if (
                            command.hasOwnProperty('getPropsDataKey') &&
                            command.hasOwnProperty('commandString')
                        ) {
                            this.sendStateMachineCommand(
                                command.windowFunction,
                                command.commandString,
                                command.getPropsDataKey
                            );
                        } else {
                            this.sendStateMachineCommand(
                                command.windowFunction,
                                command.commandString
                            );
                        }
                        return command;
                    });
                }
            }
        });
    };

    mapDataToApi = (format, source) => {
        /*
        This maps a flat object (source) to any nested object format (format).
        If the nested object value is not included in the flat object (source), then it will
        just keep the default value.
        */
        const result = {};

        Object.keys(format).forEach((key) => {
            const value = format[key];
            if (typeof format[key] === 'object') {
                result[key] = this.mapDataToApi(value, source);
            } else if (source[value]) {
                result[key] = source[value];
            } else {
                result[key] = value;
            }
        });
        return result;
    };

    handleReset = (event) => {
        event.preventDefault();
        this.props.form.resetFields();
    };

    getValidStatus = async (id, value, data) => {
        const { errorData } = this.state;
        const updateErrorObject = {
            [id]: {
                validateStatus: 'success',
            },
        };

        if (
            (data.fieldType === 'Input' ||
                data.fieldType === 'InputNumber' ||
                data.fieldType === 'CVV') &&
            data.type === 'number'
        ) {
            if (data.len && value.length > data.len) {
                return 'error';
            }
            if (isNaN(value)) {
                return 'error';
            }
            if (value.split('.')[1] && value.split('.')[1].length > 2) {
                return 'error';
            }

            await this.setState({
                errorData: { ...errorData, ...updateErrorObject },
            });

            return 'success';
        }

        await this.setState({
            errorData: { ...errorData, ...updateErrorObject },
        });

        return 'success';
    };

    // Method to handle the select component event change
    handleSelectChange = async (event, data) => {
        // custom logic - payment options - one time payment, bridgepay, bridgepay ext.
        if (data.id === 'selectPaymentType') {
            let bp = get(
                this,
                'props.store.response[360-payment-info].data',
                []
            );

            const bp2 = get(
                this,
                'props.store.response[360-payment-info].data2'
            );

            const table = {
                BridgePay: 'Bridge Pay',
                BridgePayExt: 'Bridge Pay Extension',
            };

            let override = false;
            let bridgePayExt = false;

            const checked = get(window, '[bridgepay-payment].state.checked');

            if (checked) {
                if (bp2) {
                    bp = bp2;
                }
            }

            // forms to modify
            const forms = {
                'payment-form': {
                    amount: 'payment_amount_code',
                    fee: 'payment_fee_code',
                    total: 'payment_total_code',
                },
                'service-card-payment': {
                    amount: 'service_amount_code',
                    fee: 'service_fee',
                    total: 'service_amount_total',
                },
            };

            let switchForms = false;

            // check to switch forms
            await bp.forEach((item) => {
                if (item.name === table[event]) {
                    if (parseFloat(item.amount.replace(/[$ ]/, ''), 10) === 0) {
                        document.querySelector(
                            '.switch-element-0'
                        ).style.display = 'none';
                        document.querySelector(
                            '.switch-element-1'
                        ).style.display = 'block';
                        switchForms = true;
                    }
                }
            });
            if (!switchForms) {
                document.querySelector('.switch-element-0').style.display =
                    'block';
                document.querySelector('.switch-element-1').style.display =
                    'none';
            }

            // set fields
            await bp.forEach((item) => {
                if (item.name === table[event]) {
                    override = true;
                    // replace value - payment form
                    Object.keys(forms).forEach((form) => {
                        window[window.sessionStorage?.tabId][
                            form
                        ].props.form.setFieldsValue({
                            [forms[form].amount]: parseFloat(
                                item.amount.replace(/[$ ]/, ''),
                                10
                            ).toFixed(2),
                            [forms[form].fee]: 0,
                        });
                        // Disable
                        window[window.sessionStorage?.tabId][
                            form
                        ].props.form.getFieldInstance(
                            forms[form].amount
                        ).input.disabled = true;

                        document
                            .querySelector(`#${forms[form].fee}`)
                            .classList.add('ant-select-disabled');

                        document.querySelector(
                            `#${forms[form].fee}`
                        ).style.pointerEvents = 'none';
                    });
                }

                if (item.name === table.BridgePayExt) {
                    bridgePayExt = true;
                    // Set agreement checkbox to true
                    document.querySelector(
                        '.bridgepay-agreement'
                    ).style.display = 'block';

                    document.querySelector(
                        '.bridgepay-agreement-checkbox-text'
                    ).innerHTML =
                        'I want to extend BridgePay. <br /> (Note: Please inform customer that any fees and/or charges paid to extend BridgePay are non-returnable/non-refundable.)';
                    document.querySelector(
                        '.payment-bypass-form-message'
                    ).innerHTML =
                        'Based on your selection, payment for Bridge Pay Extension will be adjusted from your balance. Please click Submit to proceed with Bridge Pay Extension';
                } else if (item.name === table.BridgePay) {
                    bridgePayExt = true;
                    // Set agreement checkbox to true
                    document.querySelector(
                        '.bridgepay-agreement'
                    ).style.display = 'block';

                    document.querySelector(
                        '.bridgepay-agreement-checkbox-text'
                    ).innerHTML = 'I want to enroll in BridgePay.';
                    document.querySelector(
                        '.payment-bypass-form-message'
                    ).innerHTML =
                        'Based on your selection, payment for Bridge Pay Enrollment will be adjusted from your balance. Please click Submit to proceed with Bridge Pay Enrollment';
                }
            });

            // Don't show agreement checkbox if bridge pay ext is not selected
            if (!bridgePayExt) {
                document.querySelector('.bridgepay-agreement').style.display =
                    'none';
            }

            // if override is false
            if (!override) {
                // payment form
                Object.keys(forms).forEach((form) => {
                    window[window.sessionStorage?.tabId][
                        form
                    ].props.form.setFieldsValue({
                        [forms[form].amount]: undefined,
                        [forms[form].fee]: 4,
                    });
                    window[window.sessionStorage?.tabId][
                        form
                    ].props.form.getFieldInstance(
                        forms[form].amount
                    ).input.disabled = false;
                    document
                        .querySelector(`#${forms[form].fee}`)
                        .classList.remove('ant-select-disabled');

                    document.querySelector(
                        `#${forms[form].fee}`
                    ).style.pointerEvents = 'auto';
                });

                document.querySelector('.bridgepay-agreement').style.display =
                    'none';
            }

            // bridgepay ext

            // Set total

            let total = parseFloat(
                window[window.sessionStorage?.tabId][
                    'payment-form'
                ].props.form.getFieldValue('payment_amount_code')
            );
            total += parseFloat(
                window[window.sessionStorage?.tabId][
                    'payment-form'
                ].props.form.getFieldValue('payment_fee_code')
            );
            total = total.toFixed(2);

            Object.keys(forms).forEach((form) => {
                window[window.sessionStorage?.tabId][
                    form
                ].props.form.setFieldsValue({
                    [forms[form].total]: total,
                });
            });
        }
        // end custom logic - payment options - one time payment, bridgepay, bridgepay ext.

        // hardcoded logic to modify another form input
        const setTotal = () => {
            let total = parseFloat(event);

            total += parseFloat(
                this.props.form.getFieldValue(data.addFormFieldItemValue)
            );

            total = total.toFixed(2);

            if (data.setAnotherFormFieldItem) {
                this.props.form.setFieldsValue({
                    [data.setAnotherFormFieldItem]: total,
                });
            }
        };

        if (data.setAnotherFormFieldItem && data.addFormFieldItemValue) {
            await setTotal();
        }

        // set a schema for calling a function
        // function will take the value and the id

        if (
            data.setAnotherFormItem !== undefined &&
            data.setAnotherFormItem.length > 0
        ) {
            data.setAnotherFormItem.forEach((obj) => {
                if (
                    typeof window[window.sessionStorage?.tabId][
                        obj.functionName
                    ] === 'function'
                ) {
                    window[window.sessionStorage?.tabId][obj.functionName](
                        event,
                        obj.formFieldItemId
                    );
                }
            });
        }

        if (data.id === 'settings-security-modal_ctn_select') {
            if (event) {
                window[window.sessionStorage?.tabId][
                    'settings-send-url-link-ctn-select-next_showButton'
                ]();
            } else {
                window[window.sessionStorage?.tabId][
                    'settings-send-url-link-ctn-select-next_hideButton'
                ]();
            }
        } else if (
            data.id === 'settings-security-modal-reset-pass_ctn_select'
        ) {
            if (event) {
                window[window.sessionStorage?.tabId][
                    'settings-reset-pass-step1-next-btn_showButton'
                ]();
            } else {
                window[window.sessionStorage?.tabId][
                    'settings-reset-pass-step1-next-btn_hideButton'
                ]();
            }
        } else if (
            data.id ===
            'settings-subscriber-security-modal-voicemail-reset-pass_ctn_select'
        ) {
            if (event) {
                window[window.sessionStorage?.tabId][
                    'settings-reset-voicemail-pass-step1-next-btn_showButton'
                ]();
            } else {
                window[window.sessionStorage?.tabId][
                    'settings-reset-voicemail-pass-step1-next-btn_hideButton'
                ]();
            }
        } else if (data.id === 'move_sub_select_search_type') {
            document.querySelector('#move_sub_input_number').value = '';
            window[window.sessionStorage?.tabId][
                'move-sub-step-1-next-btn_hideButton'
            ]();
        }
    };

    handleChange = async (event, data) => {
        const { formData } = this.state;

        const { id } = event.target;
        let { value } = event.target;

        // This is for spacing validation - spaces are not allowed in input fields
        const valueArr = value.length > 0 && value.split('');
        const uniqueValue = value.length > 0 && [...new Set(valueArr)];
        if (uniqueValue.length === 1 && uniqueValue[0] === ' ') {
            this.props.form.setFieldsValue({
                [id]: undefined,
            });

            value = '';

            document.querySelector(`#${id}`).value = value;

            this.props.form.setFieldsValue({
                [id]: undefined,
            });
        }

        // single white Space not allowed
        if (data.spaceAllowed !== undefined && !data.spaceAllowed) {
            value =
                value &&
                value.length > 0 &&
                event.target.value
                    .split('')
                    .filter((val) => val !== ' ')
                    .join('');

            // Internet Explorer 6-11
            const isIE = false || !!document.documentMode;
            if (isIE) {
                document.querySelector(`#${data.id}`).value = value;
            }
        }

        // Add an attachment to template
        if (data.attachment) {
            window[window.sessionStorage?.tabId][
                `${data.attachment.id}updateTemplateData`
            ]({
                [data.attachment.key]: value,
            });
        }

        const object = {
            [id]: {
                id,
                value,
                validateStatus: await this.getValidStatus(id, value, data),
            },
        };

        await this.setState({
            formData: { ...formData, ...object },
        });

        // Set total payment
        const setTotal = () => {
            let total = parseFloat(this.props.form.getFieldValue(data.id));
            total += parseFloat(
                this.props.form.getFieldValue(data.addFormFieldItemValue)
            );
            total = total.toFixed(2);
            if (data.setAnotherFormFieldItem) {
                this.props.form.setFieldsValue({
                    [data.setAnotherFormFieldItem]: total,
                });
            }
        };
        if (data.setAnotherFormFieldItem && data.addFormFieldItemValue) {
            await setTotal();
        }

        // // what is this?
        if (
            data.type === 'number' &&
            data.getCardName &&
            data.getCardName === true
        ) {
            this.setCardType(id, value, data);
            // this.encryptCard(id, value, data);
        }

        // NOTE: Refactor bellow code (letter)
        // Card masking
        if (data.fieldType === 'CreditCard') {
            let current = value;

            if (!this.state.card.active) {
                this.props.form.setFieldsValue({
                    [data.id]: current,
                });
                if (value.length < this.state.card.data.length) {
                    current = '';
                    this.props.form.setFieldsValue({
                        [data.id]: current,
                    });
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            card: {
                                ...prevState.card,
                                active: false,
                                data: current,
                                visible: current,
                            },
                        };
                    });
                } else {
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            card: {
                                ...prevState.card,
                                active: true,
                                data: value,
                                visible: value,
                            },
                        };
                    });
                }
            } else {
                this.props.form.setFieldsValue({
                    [data.id]: current,
                });

                if (value.length < this.state.card.data.length) {
                    current = '';
                    this.props.form.setFieldsValue({
                        [data.id]: current,
                    });
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            card: {
                                ...prevState.card,
                                active: true,
                                data: current,
                                visible: current,
                            },
                        };
                    });
                } else {
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            card: {
                                ...prevState.card,
                                active: true,
                                data: value,
                                visible: value,
                            },
                        };
                    });
                }
            }
        }

        if (data.fieldType === 'CVV') {
            let current = value;

            if (!this.state.CVV.active) {
                this.props.form.setFieldsValue({
                    [data.id]: current,
                });
                if (value.length < this.state.CVV.data.length) {
                    current = '';
                    this.props.form.setFieldsValue({
                        [data.id]: current,
                    });
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            CVV: {
                                ...prevState.CVV,
                                active: false,
                                data: current,
                                visible: current,
                            },
                        };
                    });
                } else {
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            CVV: {
                                ...prevState.CVV,
                                active: true,
                                data: value,
                                visible: value,
                            },
                        };
                    });
                }
            } else {
                this.props.form.setFieldsValue({
                    [data.id]: current,
                });

                if (value.length < this.state.CVV.data.length) {
                    current = '';
                    this.props.form.setFieldsValue({
                        [data.id]: current,
                    });
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            CVV: {
                                ...prevState.CVV,
                                active: true,
                                data: current,
                                visible: current,
                            },
                        };
                    });
                } else {
                    await this.setState((prevState) => {
                        return {
                            ...prevState,
                            CVV: {
                                ...prevState.CVV,
                                active: true,
                                data: value,
                                visible: value,
                            },
                        };
                    });
                }
            }
        }

        // Save for now in-case "change password" is re-implemented into the app:
        //
        // if (id === 'settings-change-password-enter-code-input') {
        //     if (value.length === 6) {
        //         const numArray = [
        //             '0',
        //             '1',
        //             '2',
        //             '3',
        //             '4',
        //             '5',
        //             '6',
        //             '7',
        //             '8',
        //             '9',
        //         ];
        //         let strArray = value.split('');
        //         let numberOnly = strArray.filter(index => {
        //             return numArray.includes(index) ? false : true;
        //         });
        //         if (numberOnly.length === 0) {
        //             window[window.sessionStorage?.tabId][
        //                 'settings-change-password-enter-code-submit_showButton'
        //             ]();
        //         }
        //     } else {
        //         window[window.sessionStorage?.tabId][
        //             'settings-change-password-enter-code-submit_hideButton'
        //         ]();
        //     }
        // }
    };

    setCardType = async (id, value, data) => {
        const { setFieldsValue } = this.props.form;
        const { formData } = this.state;

        const americanExpress = /^(?:3[47][0-9]{13})$/;
        const visa = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
        const masterCard = /^(?:5[1-5][0-9]{14})$/;
        const discover = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
        const diner = /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/;

        const regExAmericanExpress = RegExp(americanExpress);
        const regExVisa = RegExp(visa);
        const regExMasterCard = RegExp(masterCard);
        const regExDiscover = RegExp(discover);
        const regExDiner = RegExp(diner);

        let object = {
            [id]: {
                id,
                value,
                validateStatus: 'success',
            },
        };
        if (regExAmericanExpress.test(value)) {
            setFieldsValue({
                [data.setCardName]: 'AMERICANEXPRESS',
            });
            await this.setState({
                formData: { ...formData, ...object },
            });
        } else if (regExDiscover.test(value)) {
            setFieldsValue({ [data.setCardName]: 'DISCOVER' });
            await this.setState({
                formData: { ...formData, ...object },
            });
        } else if (regExMasterCard.test(value)) {
            setFieldsValue({ [data.setCardName]: 'MASTERCARD' });
            await this.setState({
                formData: { ...formData, ...object },
            });
        } else if (regExDiner.test(value)) {
            setFieldsValue({ [data.setCardName]: 'DINERS' });
            await this.setState({
                formData: { ...formData, ...object },
            });
        } else if (regExVisa.test(value)) {
            setFieldsValue({ [data.setCardName]: 'VISA' });
            await this.setState({
                formData: { ...formData, ...object },
            });
        } else {
            object = {
                [id]: {
                    id,
                    value,
                    validateStatus: 'error',
                },
            };

            setFieldsValue({ [data.setCardName]: undefined });
            await this.setState({
                formData: { ...formData, ...object },
            });
        }
    };

    encryptData = (input) => {
        const { encryptionKey } = this.props.properties;
        const srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(input));
        return CryptoJS.AES.encrypt(
            srcs,
            CryptoJS.enc.Base64.parse(encryptionKey),
            { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
        ).toString();
    };

    encryptCard = async (id, value, data) => {
        const { setFieldsValue } = this.props.form;
        const { formData } = this.state;

        const object = {
            [id]: {
                id,
                value,
                validateStatus: 'success',
            },
        };
        setFieldsValue({
            [data.encryptedCardName]: this.encryptData(value),
        });
        await this.setState({
            formData: { ...formData, ...object },
        });
    };

    handleCvvBlur = (e, data) => {
        let mask = '';

        for (let i = 0; i < this.state.CVV.data.length; i++) {
            mask += '•';
        }

        this.props.form.setFieldsValue({
            [data.id]: mask,
        });

        this.setState((prevState) => {
            return {
                ...prevState,
                CVV: {
                    ...prevState.CVV,
                    active: false,
                },
            };
        });
    };

    handleCreditCardBlur = (e, data) => {
        let mask = '';

        for (let i = 0; i < this.state.card.data.length; i++) {
            if (i < 12) {
                mask += '•';
            } else {
                mask += this.state.card.data[i];
            }
        }

        this.props.form.setFieldsValue({
            [data.id]: mask,
        });

        this.setState((prevState) => {
            return {
                ...prevState,
                card: {
                    ...prevState.card,
                    active: false,
                },
            };
        });
    };

    creditCardElement = (data) => {
        return (
            <Input
                maxLength={16}
                onChange={(e) => this.handleChange(e, data)}
                onBlur={(e) => this.handleCreditCardBlur(e, data)}
                placeholder={data.placeholder && data.placeholder}
                id={data.id && data.id}
                readOnly={data.readOnly && data.readOnly}
                disabled={data.disabled && data.disabled}
                className={`fs-exclude ${
                    data.itemClassName && data.itemClassName
                }`}
            />
        );
    };

    cvvElement = (data) => {
        return (
            <Input
                maxLength={
                    data.cardTypeFormId !== undefined &&
                    this.props.form.getFieldsValue([data.cardTypeFormId]) !==
                        undefined &&
                    this.props.form.getFieldsValue([data.cardTypeFormId])[
                        data.cardTypeFormId
                    ] !== undefined &&
                    this.props.form.getFieldsValue([data.cardTypeFormId])[
                        data.cardTypeFormId
                    ] === 'AMERICANEXPRESS'
                        ? 4
                        : 3
                }
                onChange={(e) => this.handleChange(e, data)}
                onBlur={(e) => this.handleCvvBlur(e, data)}
                placeholder={data.placeholder && data.placeholder}
                id={data.id && data.id}
                readOnly={data.readOnly && data.readOnly}
                disabled={data.disabled && data.disabled}
                className={`fs-exclude ${
                    data.itemClassName && data.itemClassName
                }`}
            />
        );
    };

    inputElement = (data) => {
        // Bill Cycle amount code and total code equal to amountDue from bill cycle put request
        const bcForms = {
            'bc-make-payment-form': true,
            'bc-modal-service-card-payment': true,
            'bc-modal-refill-card': true,
        };
        const bcInputs = {
            payment_amount_code: true,
            payment_total_code: true,
            service_amount_code: true,
            service_amount_total: true,
        };

        if (bcForms[this.props.component.id] && bcInputs[data.id]) {
            data.initialValue = window[window.sessionStorage?.tabId][
                'bc-dueAmount'
            ]
                ? window[window.sessionStorage?.tabId]['bc-dueAmount'].toFixed(
                      2
                  )
                : undefined;
            data.disabled = true;
        }
        // if (data.disabledOverride && bcForms[this.props.component.id]) {
        //     data.initialValue = 0;
        //     data.disabled = true;
        // }

        // Internet Explorer 6-11
        const isIE = false || !!document.documentMode;
        if (isIE) {
            return (
                <Input
                    onChange={(e) => this.handleChange(e, data)}
                    // type={data.type && data.type}
                    placeholder={data.placeholder && data.placeholder}
                    id={data.id && data.id}
                    readOnly={data.readOnly && data.readOnly}
                    disabled={data.disabled && data.disabled}
                    className={data.itemClassName && data.itemClassName}
                    maxLength={data.maxLength && data.maxLength}
                />
            );
        }
        return (
            <Input
                onChange={(e) => this.handleChange(e, data)}
                type={data.type && data.type}
                placeholder={data.placeholder && data.placeholder}
                id={data.id && data.id}
                readOnly={data.readOnly && data.readOnly}
                disabled={data.disabled && data.disabled}
                className={`${data.itemClassName && data.itemClassName}`}
                maxLength={data.maxLength && data.maxLength}
            />
        );
    };

    inputNumberElement = (data) => {
        return (
            <InputNumber
                readOnly={data.readOnly && data.readOnly}
                id={data.id && data.id}
                min={data.min && data.min}
                max={data.max && data.max}
            />
        );
    };

    imeiElement = (data) => {
        return (
            <Input
                onChange={(e) => this.handleChange(e, data)}
                type={data.type && data.type}
                placeholder={data.placeholder && data.placeholder}
                id={data.id && data.id}
                readOnly={data.readOnly && data.readOnly}
                disabled={data.disabled && data.disabled}
                className={data.itemClassName && data.itemClassName}
                allowClear={data.allowClear && data.allowClear}
            />
        );
    };

    simELement = (data) => {};

    getValues = (key, dataSource) => {
        const result = dataSource.map((obj) => {
            for (const objKey in dataSource) {
                const value = dataSource[objKey];
                if (value[key] !== undefined) {
                    return value[key];
                }
            }
        });
        return result[0];
    };

    selectElement = (data) => {
        const { Option } = Select;

        let selectOptions;

        // Suspended account fee
        if (
            (this.props.component.id === 'payment-form-restore' ||
                this.props.component.id === 'service-card-payment-restore') &&
            (data.id === 'service_fee' || data.id === 'payment_fee_code')
        ) {
            const { selectedCtnForPayment } = window;
            const ctnMatch = this.props.data.data.find(
                (arr) => arr.telephoneNumber === selectedCtnForPayment
            );
            if (ctnMatch && ctnMatch?.ptnStatus === 'C') {
                data.initialValue = 0;
            }
        }

        // Suspended Hotline
        if (
            data.disabledOverride &&
            this.props.data.data[1].statusActvCode === 'SUS' &&
            (this.props.data.data[1].statusActvRsnCode === 'CO' ||
                this.props.data.data[1].statusActvRsnCode === 'CNP1')
        ) {
            data.initialValue = 0;
        }
        // CT $0 check
        else if (
            data.disabledOverride &&
            this.props.data.data[2].adrStateCode === 'CT'
        ) {
            data.initialValue = 0;
        }
        // Check permissions
        else if (
            data.disabledOverride &&
            this.props.permission &&
            this.props.permission.processingFeeOverride
        ) {
            data.disabled = false;
        }

        // Bill Cycle has $0 fee always disabled
        const bcForms = {
            'bc-make-payment-form': true,
            'bc-modal-service-card-payment': true,
            'bc-modal-refill-card': true,
        };
        if (data.disabledOverride && bcForms[this.props.component.id]) {
            data.initialValue = 0;
            data.disabled = true;
        }

        if (
            data.selectData &&
            data.selectData.length === 0 &&
            this.state.selectData &&
            this.state.selectData.length > 0
        ) {
            selectOptions =
                this.state.selectData &&
                this.state.selectData.map((optionData) => {
                    return (
                        <Option
                            className={
                                data.itemOptionsClassName &&
                                data.itemOptionsClassName
                            }
                            key={optionData.key}
                            value={optionData.value}
                        >
                            {optionData.key}
                        </Option>
                    );
                });
        } else if (
            // Here data is getting selected from the json
            data.selectOption !== undefined &&
            data.selectOption.condition !== undefined
        ) {
            // pass conditionKey and data
            const condtionValue = this.getValues(
                data.selectOption.condition,
                this.props.data && this.props.data.data
            );

            // NOTE: This code is writen for the the bridge pay need to SCALE this code
            selectOptions =
                data.selectOption.selectFrom[condtionValue] &&
                data.selectOption.selectFrom[condtionValue].map(
                    (optionData) => {
                        return (
                            <Option
                                className={
                                    data.itemOptionsClassName &&
                                    data.itemOptionsClassName
                                }
                                key={optionData.key}
                                value={optionData.value}
                            >
                                {optionData.key}
                            </Option>
                        );
                    }
                );
        } else {
            selectOptions =
                data.selectData &&
                data.selectData.map((optionData) => {
                    return (
                        <Option
                            className={
                                data.itemOptionsClassName &&
                                data.itemOptionsClassName
                            }
                            key={optionData.key}
                            value={optionData.value}
                        >
                            {optionData.key}
                        </Option>
                    );
                });
        }

        return (
            <Select
                onChange={(value) => this.handleSelectChange(value, data)}
                disabled={data.disabled && data.disabled}
                className={data.itemClassName && data.itemClassName}
                placeholder={data.placeholder && data.placeholder}
            >
                {selectOptions}
            </Select>
        );
    };

    selectDataElement = (data) => {
        const { selectData = [] } = data;

        // support api/redux-store dynamic options with static json options
        let types = {
            api: get(this.props, data.path, []),
            static: selectData,
        };

        let options = [];

        const featureArray = get(
            this.props,
            'store.response[360-feature-flagging]',
            ''
        );
        const bpIndex = featureArray
            ? featureArray.filter((index) => index.feature === 'bridgePay')
            : null;
        const { enable } = bpIndex ? bpIndex[0] : false;
        const typesArray = types.api.filter(
            (index) => !index.key.includes('Bridge')
        );
        types = enable ? types : { ...types, api: typesArray };

        Object.keys(types).forEach((type) => {
            types[type].forEach((option) => {
                options.push(
                    <Select.Option
                        className={
                            data.itemOptionsClassName &&
                            data.itemOptionsClassName
                        }
                        // may need to fix this, value should be displayed, not key -- check antd api
                        key={option.key}
                        value={option.value}
                    >
                        {option.key}
                    </Select.Option>
                );
            });
        });

        // custom logic for settings-security-modal_ctn_select
        // and for settings-security-modal-reset-pass_ctn_select
        // and for settings-subscriber-security-modal-voicemail-reset-pass_ctn_select
        if (
            data.id === 'settings-security-modal_ctn_select' ||
            data.id === 'settings-security-modal-reset-pass_ctn_select' ||
            data.id ===
                'settings-subscriber-security-modal-voicemail-reset-pass_ctn_select'
        ) {
            options = ctn(this, data);
        }

        return (
            <Select
                onChange={(value) => this.handleSelectChange(value, data)}
                disabled={data.disabled && data.disabled}
                className={data.itemClassName && data.itemClassName}
                placeholder={data.placeholder && data.placeholder}
                suffixIcon={<Icon type="caret-down" />}
            >
                {options}
            </Select>
        );
    };

    redioElement = (data) => {
        // hardcode IVR
        if (
            this.props.permission &&
            this.props.permission.ivr &&
            this.props.permission.ivr === 'N'
        ) {
            data.radioData =
                data.radioData &&
                data.radioData.filter((item) => item.value !== 'IVR');
        }

        const radio =
            data.radioData &&
            data.radioData.map((radioOptions) => {
                return (
                    <Radio
                        className={
                            data.itemOptionsClassName &&
                            data.itemOptionsClassName
                        }
                        value={radioOptions.key}
                        key={radioOptions.key}
                    >
                        {radioOptions.value}
                    </Radio>
                );
            });

        return (
            <Radio.Group
                className={data.itemClassName && data.itemClassName}
                disabled={data.disabled && data.disabled}
                onChange={(event) => this.handleRadioChange(event, data)}
            >
                {radio}
            </Radio.Group>
        );
    };

    handleRadioChange = (event, data) => {
        if (data.id === 'settings-marketing-preferences-form-radio-group') {
            if (event) {
                window[window.sessionStorage?.tabId][
                    'settings-marketing-preferences-next_showButton'
                ]();
            } else {
                window[window.sessionStorage?.tabId][
                    'settings-marketing-preferences-next_hideButton'
                ]();
            }
        } else if (data.id === 'target_account_auth_type') {
            if (event.target.value === 'pin') {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-2-switch--update-visible-index'
                ](1);
            } else if (event.target.value === 'securityAnswer') {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-2-switch--update-visible-index'
                ](2);
                setTimeout(
                    () =>
                        window[window.sessionStorage?.tabId][
                            'move-sub-step-2-switch-2-question-templateupdateTemplateData'
                        ](
                            window[window.sessionStorage?.tabId][
                                'move-sub-security-question'
                            ]
                        ),
                    100
                );
            }
        }
    };

    planeTextElement = (data) => {
        return (
            <div className={data.itemClassName && data.itemClassName}>
                {data.plainText}
            </div>
        );
    };

    checkBoxElement = (data) => {
        return (
            <Checkbox>
                <div className={data.itemClassName && data.itemClassName}>
                    {data.checkBoxText}
                </div>
            </Checkbox>
        );
    };

    buttonElement = (data) => {
        return (
            <Button
                type="primary"
                // onClick={this.handleReset}
                loading={
                    data.loadingState &&
                    data.loadingState === true &&
                    this.state.formState
                }
                htmlType={data.htmlType && data.htmlType}
                onClick={eval(data.eventHandlerName && data.eventHandlerName)}
                className={data.itemClassName && data.itemClassName}
            >
                {data.buttonText && data.buttonText}
            </Button>
        );
    };

    customElement = (data) => {
        // const
        const { getFieldsValue } = this.props.form;

        let errors = false;

        // Check if there was an error after submit
        Object.keys(this.state.errorData).forEach((item) => {
            if (
                typeof this.state.errorData[item] === 'object' &&
                this.state.errorData[item].validateStatus === 'error'
            ) {
                errors = true;
            }
        });

        return (
            <div className={data.itemClassName && data.itemClassName}>
                <style
                    dangerouslySetInnerHTML={{ __html: data.params.styles }}
                />
                <Template
                    properties={data.params}
                    data={{ fields: getFieldsValue(), errors }}
                />
            </div>
        );
    };

    getFieldElement = (data) => {
        if (data.fieldType === 'Input') {
            return this.inputElement(data);
        }
        if (data.fieldType === 'Imei') {
            return this.imeiElement(data);
        }
        if (data.fieldType === 'InputNumber') {
            return this.inputNumberElement(data);
        }
        if (data.fieldType === 'Select') {
            return this.selectElement(data);
        }
        if (data.fieldType === 'SelectData') {
            return this.selectDataElement(data);
        }
        if (data.fieldType === 'Radio') {
            return this.redioElement(data);
        }
        if (data.fieldType === 'PlainText') {
            return this.planeTextElement(data);
        }
        if (data.fieldType === 'CheckBox') {
            return this.checkBoxElement(data);
        }
        if (data.fieldType === 'Button') {
            return this.buttonElement(data);
        }
        if (data.fieldType === 'CreditCard') {
            return this.creditCardElement(data);
        }
        if (data.fieldType === 'CVV') {
            return this.cvvElement(data);
        }
        if (data.fieldType === 'Custom') {
            return this.customElement(data);
        }
        return this.inputElement(data);
    };

    getValidationStatues = (id) => {
        const { formData, errorData } = this.state;

        if (
            formData &&
            formData[id] &&
            formData[id].validateStatus &&
            formData[id].validateStatus === 'error'
        ) {
            return 'error';
        }
        if (
            errorData &&
            errorData[id] &&
            errorData[id].validateStatus &&
            errorData[id].validateStatus === 'error'
        ) {
            return 'error';
        }
    };

    checkValidPositiveNumber = (rule, value, callback) => {
        if (value && isNaN(value)) {
            callback('Please enter a valid number');
        }
        if (value && value < 0) {
            callback('Please enter a positive number');
        }
        if (value && value.includes(' ')) {
            callback('White space is not allowed');
        } else {
            callback();
        }
    };

    checkZipCode = (rule, value, callback) => {
        if (value && value.length !== 5) {
            callback('Please enter a valid zip code');
        } else if (value && isNaN(value)) {
            callback('Please enter a valid zip code');
        } else if (value && value < 0) {
            callback('Please enter a valid zip code');
        } else if (value && value.split('')[0] === ' ') {
            callback('White spcae are not allowed.');
        } else {
            callback();
        }
    };

    checkCTNOrBAN = (rule, value, callback) => {
        if (value) {
            if (Number.isNaN(+value)) {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-1-next-btn_hideButton'
                ]();
                callback('Please enter a valid number');
                return;
            }
            const isCTNSelected =
                document.querySelector(
                    '.search-account-form-item .ant-select-selection-item'
                ).innerHTML === 'CTN';
            if (isCTNSelected && value.length !== 10) {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-1-next-btn_hideButton'
                ]();
                callback('Please enter a valid CTN');
                return;
            }
            if (!isCTNSelected && value.length !== 9) {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-1-next-btn_hideButton'
                ]();
                callback('Please enter a valid Account Number');
                return;
            }
            window[window.sessionStorage?.tabId][
                'move-sub-step-1-next-btn_showButton'
            ]();
            return;
        }
        window[window.sessionStorage?.tabId][
            'move-sub-step-1-next-btn_hideButton'
        ]();
    };

    checkPIN = (rule, value, callback) => {
        if (value) {
            if (Number.isNaN(+value)) {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-2-next-btn_hideButton'
                ]();
                callback('Please enter a valid number');
                return;
            }
            if (value.length !== 4) {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-2-next-btn_hideButton'
                ]();
                callback('Please enter a valid PIN');
                return;
            }
            window[window.sessionStorage?.tabId][
                'move-sub-step-2-next-btn_showButton'
            ]();
            return;
        }
        window[window.sessionStorage?.tabId][
            'move-sub-step-2-next-btn_hideButton'
        ]();
    };

    checkEmptyField = (rule, value, callback) => {
        if (value) {
            if (
                window[window.sessionStorage?.tabId][
                    'move-sub-step-2-next-btn_showButton'
                ]
            ) {
                window[window.sessionStorage?.tabId][
                    'move-sub-step-2-next-btn_showButton'
                ]();
            }
        } else if (
            window[window.sessionStorage?.tabId][
                'move-sub-step-2-next-btn_hideButton'
            ]
        ) {
            window[window.sessionStorage?.tabId][
                'move-sub-step-2-next-btn_hideButton'
            ]();
        }
    };

    checkResetCode = (rule, value, callback) => {
        if (
            value &&
            (value.length !== 6 ||
                isNaN(value) ||
                value < 0 ||
                value.split('')[0] === ' ')
        ) {
            callback('Please enter valid code');
            window[window.sessionStorage?.tabId][
                'settings-reset-pass-step2-next-btn_hideButton'
            ]();
            window[window.sessionStorage?.tabId][
                'settings-reset-pass-step2-valid-code-templateupdateTemplateData'
            ]({ display: false });
        } else {
            callback();
            if (value) {
                window[window.sessionStorage?.tabId][
                    'settings-reset-pass-step2-next-btn_showButton'
                ]();
                window[window.sessionStorage?.tabId][
                    'settings-reset-pass-step2-valid-code-templateupdateTemplateData'
                ]({ display: true });
            }
        }
    };

    checkAdjustment = (rule, value, callback) => {
        const adjustmentAmount = parseInt(this.props.permission.adjustments);
        if (isNaN(adjustmentAmount)) {
            adjustmentAmount === 0;
        }
        if (value && isNaN(value)) {
            callback('Please enter a valid number');
        }
        if (value && value < 0) {
            callback('Please enter a positive number');
        }
        if (value && this.props.permission && value > adjustmentAmount) {
            callback(
                `This amount exceeds your limit of $${
                    this.props.permission && adjustmentAmount
                }`
            );
        } else {
            callback();
        }
    };

    checkCreditCardType = (rule, value, callback) => {
        const americanExpress = /^(?:3[47][0-9]{13})$/;
        const visa = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
        const masterCard = /^(?:5[1-5][0-9]{14})$/;
        const discover = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
        const diner = /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/;

        const regExAmericanExpress = RegExp(americanExpress);
        const regExVisa = RegExp(visa);
        const regExMasterCard = RegExp(masterCard);
        const regExDiscover = RegExp(discover);
        const regExDiner = RegExp(diner);

        if (value) {
            if (value && value.includes(' ')) {
                callback('White space is not allowed');
            }
            if (regExAmericanExpress.test(value)) {
                callback();
            } else if (regExDiscover.test(value)) {
                callback();
            } else if (regExMasterCard.test(value)) {
                callback();
            } else if (regExDiner.test(value)) {
                callback();
            } else if (regExVisa.test(value)) {
                callback();
            } else {
                callback('Please enter a valid card number');
            }
        } else {
            callback();
        }
    };

    setRules = (data, table) => {
        let rules = [];

        if (data.rules) {
            rules = [...data.rules];
            rules.map((rule) => {
                // add custom numberRegex to text fields to handle for leading zeros
                if (rule.customType === 'numberRegex')
                    return { ...rule, pattern: new RegExp(/\d+/g) };
            });
        }
        if (table[data.id]) {
            rules.push({ validator: table[data.id] });
        }

        // Imei Rules
        // if(data.fieldType = 'Imei'){
        //     rules =
        // };

        return rules;
    };

    setInitialValue = (data) => {
        // One time payment, Bridge pay, Bridge pay ext
        if (data.id === 'selectPaymentType') {
            const api = get(this.props, data.path, []);
            if (api.length === 1) {
                return api[0].value;
            }

            return data.initialValue;
        }
        // default
        return data.initialValue;
    };

    isLuhn = (value) => {
        let nCheck = 0;
        let bEven = false;
        const newValue = value.replace(/\D/g, '');
        for (let n = newValue.length - 1; n >= 0; n--) {
            const cDigit = newValue.charAt(n);
            let nDigit = parseInt(cDigit, 10);
            if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
            nCheck += nDigit;
            bEven = !bEven;
        }
        return nCheck % 10 == 0;
    };

    isIMEI = (imei) => {
        return imei.trim().length === 15 && this.isLuhn(imei.trim());
    };

    isSIM = (sim) => {
        // 89    = telecom
        // 01    = united states
        // [150] = cricket
        // {13}  = sim account
        // {1}   = luhn check digit
        return (
            sim.match(/^(89)(01)(150|030|170|410|560|680)(\d{13})/g) != null &&
            this.isLuhn(sim)
        );
    };

    checkIMEI = (rule, value, callback) => {
        if (value) {
            if (this.isIMEI(value) === false) {
                if (
                    window[window.sessionStorage?.tabId][
                        'imei-change-step1-next-btn_hideButton'
                    ]
                ) {
                    window[window.sessionStorage?.tabId][
                        'imei-change-step1-next-btn_hideButton'
                    ]();
                }
                if (
                    window[window.sessionStorage?.tabId][
                        'imei-search-button_hideButton'
                    ]
                ) {
                    window[window.sessionStorage?.tabId][
                        'imei-search-button_hideButton'
                    ]();
                }
                callback('Please enter a valid IMEI');
            } else {
                if (
                    window[window.sessionStorage?.tabId][
                        'imei-change-step1-next-btn_showButton'
                    ]
                ) {
                    window[window.sessionStorage?.tabId][
                        'imei-change-step1-next-btn_showButton'
                    ]();
                }
                if (
                    window[window.sessionStorage?.tabId][
                        'imei-search-button_showButton'
                    ]
                ) {
                    window[window.sessionStorage?.tabId][
                        'imei-search-button_showButton'
                    ]();
                }
                callback();
            }
        } else {
            if (
                window[window.sessionStorage?.tabId][
                    'imei-change-step1-next-btn_hideButton'
                ]
            ) {
                window[window.sessionStorage?.tabId][
                    'imei-change-step1-next-btn_hideButton'
                ]();
            }
            if (
                window[window.sessionStorage?.tabId][
                    'imei-search-button_hideButton'
                ]
            ) {
                window[window.sessionStorage?.tabId][
                    'imei-search-button_hideButton'
                ]();
            }
            callback();
        }
    };

    checkSIM = (rule, value, callback) => {
        if (value) {
            if (this.isSIM(value) === false) {
                window[window.sessionStorage?.tabId][
                    'sim-change-step1-next-btn_hideButton'
                ]();
                callback('Please enter a valid SIM');
            } else {
                window[window.sessionStorage?.tabId][
                    'sim-change-step1-next-btn_showButton'
                ]();
                callback();
            }
        } else {
            window[window.sessionStorage?.tabId][
                'sim-change-step1-next-btn_hideButton'
            ]();
            callback();
        }
    };

    render() {
        window[window.sessionStorage?.tabId][
            `${this.props.component.id}`
        ] = this;

        const { properties } = this.props;
        const { formClassName, fieldsConfiguration } = properties;

        const { getFieldDecorator } = this.props.form;

        const validatorTable = {
            'input-imei-validate': this.checkIMEI,
            'whitelist-imei-input': this.checkIMEI,
            'input-sim-validate': this.checkSIM,

            service_card_number: this.checkCreditCardType,
            payment_card_number: this.checkCreditCardType,

            update_card_number: this.checkCreditCardType,
            enroll_card_number: this.checkCreditCardType,

            payment_amount_code: this.checkValidPositiveNumber,
            service_amount_code: this.checkValidPositiveNumber,
            refill_payment_amount: this.checkValidPositiveNumber,

            payment_card_security_code: this.checkValidPositiveNumber,
            service_card_security_code: this.checkValidPositiveNumber,
            update_card_security_code: this.checkValidPositiveNumber,
            enroll_card_security_code: this.checkValidPositiveNumber,

            payment_card_zip_code: this.checkZipCode,
            service_card_zip_code: this.checkZipCode,
            enroll_card_zip_code: this.checkZipCode,
            update_card_zip_code: this.checkZipCode,

            adjustment_amount_code: this.checkAdjustment,

            reset_pass_enter_code: this.checkResetCode,
            css_whitelist_input_code: this.checkResetCode,

            move_sub_input_number: this.checkCTNOrBAN,
            move_sub_auth_pin: this.checkPIN,
            move_sub_security_answer: this.checkEmptyField,

            'settings-change-password-enter-code-input': this
                .checkValidPositiveNumber,
        };

        return (
            <div
                className={
                    this.props.properties.inputFormMainClassName &&
                    this.props.properties.inputFormMainClassName
                }
            >
                <div
                    className={
                        this.props.properties.templateClassName &&
                        this.props.properties.templateClassName
                    }
                >
                    <Template
                        properties={this.bodyProps}
                        data={[{ ...this.state }, { ...this.props.data.data }]}
                    />
                </div>

                <Form
                    onSubmit={this.handleSubmit}
                    className={formClassName && formClassName}
                >
                    {fieldsConfiguration &&
                        fieldsConfiguration.map((data) => {
                            if (typeof data !== 'string' && data.id) {
                                return (
                                    <div
                                        className={data.itemAndInputClassName}
                                        key={data.id && data.id}
                                    >
                                        <div className={data.labalClassName}>
                                            {data.label && data.label}
                                        </div>
                                        <Form.Item
                                            validateStatus={this.getValidationStatues(
                                                data.id && data.id
                                            )}
                                            help={data.help && data.help}
                                            extra={data.extra && data.extra}
                                            className={
                                                data.formItemClassName &&
                                                data.formItemClassName
                                            }
                                        >
                                            {data.fieldType &&
                                            data.fieldType === 'CheckBox'
                                                ? getFieldDecorator(
                                                      data.id && data.id,

                                                      {
                                                          valuePropName:
                                                              'checked',
                                                          // Initial Value
                                                          initialValue:
                                                              data.initialValue &&
                                                              data.initialValue,

                                                          // Rules
                                                          rules: this.setRules(
                                                              data,
                                                              validatorTable
                                                          ),
                                                      }
                                                  )(this.getFieldElement(data))
                                                : getFieldDecorator(
                                                      data.id && data.id,

                                                      {
                                                          // Initial Value
                                                          initialValue: data.initialValue
                                                              ? data.initialValue
                                                              : this.setInitialValue(
                                                                    data
                                                                ),

                                                          // Rules
                                                          rules: this.setRules(
                                                              data,
                                                              validatorTable
                                                          ),
                                                      }
                                                  )(this.getFieldElement(data))}
                                        </Form.Item>
                                    </div>
                                );
                            }
                            return null;
                        })}
                </Form>
            </div>
        );
    }
}

export default Form.create()(InputFormComponent);
