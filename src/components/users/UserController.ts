import { Router } from 'express'
import { CreateUserSchema, UpdateUserSchema, UserListingSchema, UserSelectSchema } from './UserSchema';
import { UserService } from './UserService';
import { AggregateListingParams } from '../../common/middlewares/aggregateListingParams';
import { checkJWT } from '../../common/middlewares/checkJwt';
import { isRouteOwner } from '../../common/middlewares/isRouteOwner';

export class UserController {
    private readonly router: Router
    private readonly userService: UserService

    constructor(userService: UserService) {
        this.router = Router();
        this.userService = userService;
    }

    setupRouter() {

        this.router.get('/', 
        AggregateListingParams,
        async (req, res) => {
            const listingOptions = await UserListingSchema.parse(req.modifiedQuery);
            const usersData = await this.userService.getUsers(listingOptions);
            res.status(200).send({ body: usersData })
        })

        this.router.get('/:username', async (req, res) => {
            const userSelectOptions = await UserSelectSchema.parseAsync(req.query)
            const username = req.params.username;
            const userData = await this.userService.getUser(username, userSelectOptions);
            res.status(200).send({ data: userData })
        })
        
        this.router.post('/', async (req, res) => {
            const userInfo = await CreateUserSchema.parseAsync(req.body);
            const user = await this.userService.createUser(userInfo);
            return res.status(201).send({ data: user });
        })

        this.router.patch('/:username', 
        checkJWT,
        isRouteOwner('username'),
        async (req, res) => {
            const userInfo = await UpdateUserSchema.parseAsync(req.body)
            const username = req.params.username
            await this.userService.updateUser(username, userInfo)
            res.status(204).send()
        })

        this.router.delete('/:username', 
        checkJWT,
        isRouteOwner('username'),
        async (req, res) => {
            await this.userService.deleteUser(req.params.username)
            res.status(204).send();
        })

    }
    
    getRouter(): Router {
        return this.router;
    }
}