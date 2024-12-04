import {SortDirection} from "mongodb";
import {RequestWithQuery} from "../types/types";
import {QueryBlogModel} from "../features/blogs/models/QueryBlogModels";

export const paginationQueries = (req:RequestWithQuery<QueryBlogModel>) => {

    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    let pageSize = req.query.pageSize !== undefined ? +req.query.pageSize : 10
    let sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
    let sortDirection = req.query.sortDirection ? req.query.sortDirection as SortDirection : 'desc'
    let searchNameTerm = req.query.searchNameTerm ? req.query.searchNameTerm : null

    return {pageNumber, pageSize, sortBy, sortDirection,searchNameTerm,}
}