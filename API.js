import axios from 'axios';
import qs from 'qs';

const HTTP = axios.create({
    baseURL: '/',
    headers: {
        'Content-type': 'application/json',
    }
});

export const BX_POST = (component, action, data, onUploadProgress) => {
    const formData = new FormData();
    const headers = {'Content-Type': 'multipart/form-data'};

    for (let attribute in data) {
        formData.append(attribute, data[attribute]);
    }

    const getQuery = {
        c: component,
        action: action,
        mode: 'class',
        sessid:  BX.bitrix_sessid()
    }

    return HTTP.post(
        `/bitrix/services/main/ajax.php?` + qs.stringify(getQuery),
        formData,
        {
            headers,
            onUploadProgress
        }
    )
}