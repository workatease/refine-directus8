import { FilterOperator } from "@directus/sdk-js/dist/types/schemes/http/Filter";
import { QueryParams } from "@directus/sdk-js/dist/types/schemes/http/Query";
import { CrudFilters, CrudOperators, CrudSorting, DataProvider } from "@pankod/refine-core";



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

const mapOperator = (operator: CrudOperators): FilterOperator => {
    switch (operator) {
        case "eq":
        case "null":
        case "nnull":
        case "lt":
        case "gt":
        case "lte":
        case "gte":
        case "in":
        case "nin":
        case "between":
        case "nbetween":
            return operator;
        case "contains":
        case "containss":
            return "contains";
        case "ne":
            return "neq"
        case "ncontains":
        case "ncontainss":
            return "ncontains";
    }
};

const generateFilter = (filters?: CrudFilters) => {
    const queryFilters: {
        [field: string]: { [operator in FilterOperator]?: any };
    } = {};

    let search: string = '';
    if (filters) {
        filters.map(({ field, operator, value }) => {
            console.log(field, operator, value);
            var obj = { [`${mapOperator(operator)}`]: value }
            if (queryFilters[`${field}`]) {
                queryFilters[`${field}`] = { ...queryFilters[`${field}`], ...obj }
            } else {
                queryFilters[`${field}`] = obj;
            }
        });
    }
    console.log(queryFilters);
    return queryFilters;
}

export const dataProvider = (directusClient: any): DataProvider => ({
    getList: async ({ resource, pagination, filters, sort, metaData }) => {

        const current = pagination?.current || 1;
        const pageSize = pagination?.pageSize || 50;

        const _sort = generateSort(sort);
        const paramsFilters = generateFilter(filters);

        const sortString: any = sort && sort.length > 0 ? _sort.join(",") : '';

        console.log('getList', filters, sort, metaData);
        let params: QueryParams = {
            filter: paramsFilters,
            // search: paramsFilters.search,
            // filter: {
            //     // ...paramsFilters.filters,
            //     status: { _neq: 'archived' }
            // },
            meta: '*',
            offset: (current - 1) * pageSize,
            limit: pageSize,
            fields: ['*.*']
        };
        if (sortString !== '') {
            params.sort = sortString;
        }

        try {
            const response: any = await directusClient.getItems(resource, params);

            return {
                data: response.data,
                total: response.meta.filter_count,
            };
        }
        catch (e) {
            console.log(e);
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("unable to get list");
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
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("unable to get Many");
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
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("unable to create");
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
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("unable to update");
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
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("unable to get One");
        }
    },

    deleteOne: async ({ resource, id, metaData }) => {


        try {
            if (metaData && metaData.softDelete) {
                delete metaData.softDelete;
                let params: any = {}
                if (metaData) {
                    params = {
                        ...metaData
                    }
                } else {
                    // if metaData is empty, then we need to set status to archived default behaviour
                    params = {
                        status: 'archived'
                    }
                }
                const response: any = await directusClient.updateItem(resource, id, params);
                return {
                    data: response.data
                };
            } else {
                const response: any = await directusClient.deleteItem(resource, id);

                return {
                    data: response.data
                };
            }

        }
        catch (e) {
            console.log(e);
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("unable to delete One");
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
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("unable to delete Many");
        }
    },

    getApiUrl: () => {

        return directusClient.config.url;
    },

    custom: async ({ url, method, filters, sort, payload, query, headers }) => {
        // TODO : implement custom method
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
