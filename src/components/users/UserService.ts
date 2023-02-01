import { UserRepository } from "./UserRepository";
import { CreateUserType, UpdateUserType, UserListingType, UserSelectType } from "./UserSchema";

export class UserService {
    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async getUser(username: string, userSelectOptions: UserSelectType) {
        await this.userRepository.getUser(username, userSelectOptions)
    }

    async getUsers(listingOptions: UserListingType) {
        await this.userRepository.getUsers(listingOptions)
    }

    async createUser(userInfo: CreateUserType) {
        await this.userRepository.createUser(userInfo)
    }

    async updateUser(userInfo: UpdateUserType) {
        await this.userRepository.updateUser(userInfo)
    }

    async deleteUser(username: string) {
        await this.userRepository.deleteUser(username)
    }
}