export declare const getToken: () => Promise<import("forge-apis").AuthToken>;
export declare function filterDb(m: any, attributeName: any, attributeVal: any): any;
/**
 * Retrieve the value of attributeName for each dbIds
 * @param m {Model} Forge model
 * @param attributeName {String} name of the attribute to get the value of
 * @return {*}
 */
export declare function getValues(m: any, attributeName: any): any;
