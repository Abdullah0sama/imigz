import { CreateUserType, UpdateUserType, UserListingType, UserSelectType } from "./UserSchema";

export class UserRepository {

    constructor() {

    }

    getUser(username: string, userSelectOptions: UserSelectType) {
        console.log(username, userSelectOptions)
    }

    getUsers(listingOptions: UserListingType) {
        console.log(listingOptions)
    }

    createUser(userInfo: CreateUserType) {
        console.log(userInfo)
    }

    deleteUser(username: string) {
        console.log(username)
    }

    updateUser(userInfo: UpdateUserType) {
        console.log(userInfo)
    }
}