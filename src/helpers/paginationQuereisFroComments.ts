import {QueryModel} from "../helpers/paginationQuereis";
import {SortDirection} from "mongodb";

export const paginationQueryForQueries = (query:QueryModel) => {
    let pageNumber = query.pageNumber ? +query.pageNumber : 1
    let pageSize = query.pageSize !== undefined ? query.pageSize : 10
    let sortBy = query.sortBy ? query.sortBy : 'createdAt'
    let sortDirection = query.sortDirection ? query.sortDirection as SortDirection : 'desc'

    return {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
    }
}