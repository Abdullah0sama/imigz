import { UserRepository } from "./UserRepository";
import { CreateUserType, UpdateUserType, UserListingType, UserSelectType } from "./UserSchema";

export class UserService {
    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async getUser(username: string, userSelectOptions: UserSelectType) {
        return this.userRepository.getUser(username, userSelectOptions)
    }

    async getUsers(listingOptions: UserListingType) {
        return this.userRepository.getUsers(listingOptions)
    }

    async createUser(userInfo: CreateUserType) {
        return this.userRepository.createUser(userInfo)
    }

    async updateUser(username: string, userInfo: UpdateUserType) {
        return this.userRepository.updateUser(username, userInfo)
    }

    async deleteUser(username: string) {
        return this.userRepository.deleteUser(username)
    }
}