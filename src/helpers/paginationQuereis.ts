import {SortDirection} from "mongodb";
import {RequestWithQuery} from "../types/types";

export const paginationQueries = (req:RequestWithQuery<QueryModel>) => {

    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    let pageSize = req.query.pageSize !== undefined ? +req.query.pageSize : 10
    let sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
    let sortDirection = req.query.sortDirection ? req.query.sortDirection as SortDirection : 'desc'
    let searchNameTerm = req.query.searchNameTerm ? req.query.searchNameTerm : null
    let searchLoginTerm = req.query.searchLoginTerm ? req.query.searchLoginTerm : null
    let searchEmailTerm = req.query.searchEmailTerm ? req.query.searchEmailTerm : null

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
    pageSize: number,
    sortBy: string  ,
    sortDirection: SortDirection,
    searchNameTerm?: string,
    searchLoginTerm?: string,
    searchEmailTerm?: string
}