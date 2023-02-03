import { CreationError, NotFoundError } from "../../common/errors/internalErrors";
import { EntityNotCreatedError, EntityNotFoundError } from "../../common/errors/publicErrors";
import { UserRepository } from "./UserRepository";
import { CreateUserType, UpdateUserType, UserListingType, UserSelectType } from "./UserSchema";

export class UserService {
    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async getUser(username: string, userSelectOptions: UserSelectType) {
        return this.userRepository.getUser(username, userSelectOptions)
            .catch((err) => {
                if(err instanceof NotFoundError) throw new EntityNotFoundError({ 
                    message: err.message
                })
                else throw err;
            })
    }

    async getUsers(listingOptions: UserListingType) {
        return this.userRepository.getUsers(listingOptions)
    }

    async createUser(userInfo: CreateUserType) {
        return this.userRepository.createUser(userInfo)
            .catch(err => {
                if(err instanceof CreationError) {
                    throw new EntityNotCreatedError({
                        message: err.message
                    })
                }   
                throw err;
            })
    }

    async updateUser(username: string, userInfo: UpdateUserType) {
        return this.userRepository.updateUser(username, userInfo)
            .catch(err => {
                if(err instanceof NotFoundError) {
                    throw new EntityNotCreatedError({
                        message: err.message
                    })
                }   
                throw err;
            })
    }

    async deleteUser(username: string) {
        return this.userRepository.deleteUser(username)
    }
}