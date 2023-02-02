import React from 'react';
import get from 'lodash.get';
import { Select } from 'antd';

const ctn = (ref, data) => {
    const customerView = get(ref, 'props.store.response[360-customer-view]', []);
    const lineDetails = customerView?.account?.subscribers;

    return lineDetails.map((item) => {
        return (
            <Select.Option
                className={
                    data.itemOptionsClassName && data.itemOptionsClassName
                }
                key={item?.subscriberDetails?.phoneNumber}
                value={item?.subscriberDetails?.phoneNumber}
            >
                {item?.subscriberDetails?.phoneNumber}
            </Select.Option>
        );
    });
};

export default ctn;
