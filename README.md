# refine-directus8
[**Directus 8**](https://v8.docs.directus.io/) dataprovider package for refine.
This is still in Beta Testing and is not yet ready for use.

## About

[**refine**](https://refine.dev/) offers lots of out-of-the box functionality for rapid development, without compromising extreme customizability. Use-cases include, but are not limited to *admin panels*, *B2B applications* and *dashboards*.

## Documentation

For more detailed information and usage, refer to the [refine data provider documentation](https://refine.dev/docs/core/providers/data-provider).

# Features
- Data Provider
- Auth Provider

## Install

```
npm install @workatease/refine-directus8
```

## Notes

To enable perform archive instead of delete with [**DeleteButton**](https://refine.dev/docs/ui-frameworks/antd/components/buttons/delete-button/#api-reference) pass metaData={softDelete:true,field:'value'} in DeleteButton
if no field is passed then default status will be used and set to archive