import {SortDirection} from "mongodb";

export const paginationQueries = (query:QueryModel):QueryModel  => {

    let pageNumber =  query.pageNumber ? +query.pageNumber : 1
    let pageSize =query.pageSize !== undefined ? +query.pageSize : 10
    let sortBy = query.sortBy ? query.sortBy : 'createdAt'
    let sortDirection = query.sortDirection ? query.sortDirection as SortDirection : 'desc'
    let searchNameTerm = query.searchNameTerm ? query.searchNameTerm : null
    let searchLoginTerm = query.searchLoginTerm ? query.searchLoginTerm : null
    let searchEmailTerm = query.searchEmailTerm ? query.searchEmailTerm : null

    return {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
        searchLoginTerm,
        searchEmailTerm
    }
}

export type QueryModel = {
    pageNumber: number,
    pageSize: number | undefined,
    sortBy: string  ,
    sortDirection: SortDirection,
    searchNameTerm?: string,
    searchLoginTerm?: string,
    searchEmailTerm?: string
}