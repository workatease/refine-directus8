import { CrudFilters, CrudSorting, DataProvider } from "@pankod/refine-core";


const operators = {
    eq: "_eq",
    ne: "_neq",
    lt: "_lt",
    gt: "_gt",
    lte: "_lte",
    gte: "_gte",
    in: "_in",
    nin: "_nin",
    contains: "_contains",
    containss: undefined,
    ncontains: "_ncontains",
    ncontainss: undefined,
    null: "_null",
    nnull: "_nnull",
    between: "_between",
    nbetween: "_nbetween",
};


const strToObj = (str: string, val: any) => {
    var i: number,
        obj = {},
        strarr = str.split('.');
    var x: any = obj;
    for (i = 0; i < strarr.length - 1; i++) {
        x = x[strarr[i]] = {};
    }
    x[strarr[i]] = val;
    return obj;
};

const generateSort = (sort?: CrudSorting) => {
    const _sort: string[] = [];

    if (sort) {
        sort.map((item) => {
            if (item.order) {
                item.order === "desc" ? _sort.push(`-${item.field}`) : _sort.push(`${item.field}`);
            }
        });
    }

    return _sort;
};

const generateFilter = (filters?: CrudFilters) => {
    const queryFilters: { [key: string]: any } = {};
    let search: string = '';
    if (filters) {
        queryFilters['_and'] = [];
        filters.map(({ field, operator, value }) => {
            if (value) {
                if (field === "search") {
                    search = value;
                }
                else {
                    const directusOperator = operators[operator];
                    let queryField = `${field}.${directusOperator}`;
                    let filterObj = strToObj(queryField, value);

                    queryFilters['_and'].push(filterObj);
                }
            }
        });
    }

    return { search: search, filters: queryFilters };
};

export const dataProvider = (directusClient: any): DataProvider => ({
    getList: async ({ resource, pagination, filters, sort, metaData }) => {

        const current = pagination?.current || 1;
        const pageSize = pagination?.pageSize || 50;

        //    const _sort = generateSort(sort);
        //    const paramsFilters = generateFilter(filters);

        //   const sortString: any = sort && sort.length > 0 ? _sort.join(",") : '-date_created';


        let params: any = {
            // search: paramsFilters.search,
            // filter: {
            //     // ...paramsFilters.filters,
            //     status: { _neq: 'archived' }
            // },
            meta: '*',
            page: current,
            limit: pageSize,
            //sort: sortString,
            fields: ['*.*']
        };

        try {
            const response: any = await directusClient.getItems(resource, params);

            return {
                data: response.data,
                total: response.meta.filter_count,
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        }
    },

    getMany: async ({ resource, ids, metaData }) => {


        let params: any = {
            filter: {
                id: { _in: ids },
                status: { _neq: 'archived' }
            },
            fields: ['*'],
            ...metaData
        };

        try {
            const response: any = await directusClient.getItems(resource, params);

            return {
                data: response.data,
                total: response.meta.filter_count,
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        }
    },

    create: async ({ resource, variables, metaData }) => {


        let params: any = {
            ...variables,
            ...metaData
        };

        try {
            const response: any = await directusClient.createItem(resource, params);

            return {
                data: response.data
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        }
    },

    update: async ({ resource, id, variables, metaData }) => {


        let params: any = {
            ...variables,
            ...metaData
        };

        try {
            const response: any = await directusClient.updateItem(resource, id, params);

            return {
                data: response.data
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        }
    },

    updateMany: async ({ resource, ids, variables, metaData }) => {

        throw Error(
            "'custom' method is not implemented on refine-directus8 data provider.",
        );

        // let params: any = {
        //     ...variables,
        //     ...metaData
        // };

        // try {
        //     const response: any = await directusClient.updateItems(resource,ids, params);

        //     return {
        //         data: response.data
        //     };
        // }
        // catch (e) {
        //     console.log(e);
        //     throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        // }
    },

    createMany: async ({ resource, variables, metaData }) => {

        throw Error(
            "'custom' method is not implemented on refine-directus8 data provider.",
        );

    },

    getOne: async ({ resource, id, metaData }) => {


        let params: any = {
            ...metaData
        };

        try {
            const response: any = await directusClient.getItem(resource, id, params);

            return {
                data: response.data
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        }
    },

    deleteOne: async ({ resource, id }) => {


        try {
            const response: any = await directusClient.deleteItem(resource, id);

            return {
                data: response.data
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        }
    },

    deleteMany: async ({ resource, ids }) => {
        const directus = directusClient.items(resource);

        try {
            const response: any = await directus.deleteMany(ids);

            return {
                data: response.data
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(e.errors && e.errors[0] && e.errors[0].message);
        }
    },

    getApiUrl: () => {
        return directusClient.getUrl();
    },

    custom: async ({ url, method, filters, sort, payload, query, headers }) => {

        const directusTransport = directusClient.transport;

        let response: any;
        switch (method) {
            case "put":
                response = await directusTransport.put(url, payload, { headers: headers, params: query });
                break;
            case "post":
                response = await directusTransport.post(url, payload, { headers: headers, params: query });
                break;
            case "patch":
                response = await directusTransport.patch(url, payload, { headers: headers, params: query });
                break;
            case "delete":
                response = await directusTransport.delete(url, { headers: headers, params: query });
                break;
            default:
                response = await directusTransport.get(url, { headers: headers, params: query });
                break;
        }

        return {
            ...response,
            data: response.data
        };

    },
});
