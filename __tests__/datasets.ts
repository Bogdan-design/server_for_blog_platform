import {authTestManager} from "./authTestManager";
import {CreateBlogModel} from "../src/features/blogs/models/CreateBlogModel";
import {SETTINGS} from "../src/settings";
import {CreatePostModel} from "../src/features/posts/models/CreatePostModel";
import {ExpectedErrorObjectType} from "../src/types/types";


export const codedAuth = authTestManager.authForTests(SETTINGS.AUTH_TOKEN)

export const newBlogModel: CreateBlogModel = {
    name: 'Bohdan',
    description: 'Something something',
    websiteUrl: 'https://www.linkedin.com/'
}

export const notValidBlogModel: CreateBlogModel = {
    name: "",
    description: "",
    websiteUrl: ""
}

export const notValidPostModel: CreatePostModel = {
    title: '',
    shortDescription: '',
    content: '',
    blogId: ''
}


export const expectedErrorBlogModel: ExpectedErrorObjectType = {
    errorsMessages: [
        {message: "Invalid value", field: "name"},
        {message: 'Invalid value', field: 'description'},
        {message: 'Invalid value', field: 'websiteUrl'},
    ]
}

export const expectedErrorPostModel: ExpectedErrorObjectType = {
    errorsMessages: [
        {message: 'Invalid value', field: 'blogId'},
        {message: "Invalid value", field: "title"},
        {message: 'Invalid value', field: 'shortDescription'},
        {message: 'Invalid value', field: 'content'},
    ]
}

