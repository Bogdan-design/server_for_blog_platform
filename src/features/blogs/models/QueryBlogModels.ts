import {SortDirection} from "mongodb";

export type QueryBlogModel = {
    pageNumber: number,
    pageSize: number,
    sortBy: string  ,
    sortDirection: SortDirection,
    searchNameTerm?: string
}