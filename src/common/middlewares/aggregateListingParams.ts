
import express from 'express'

export const AggregateListingParams = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const query = req.query
    
    const modifiedQuery = Object.keys(query).reduce((acc: listingKeys, cur) => {

        const splitedKey = cur.split('.')
        if(splitedKey[0] === 'orderby') {

            if(!acc.orderby) {
                Object.assign(acc, {
                    'orderby': {
                        [splitedKey[1]]: query[cur]
                    }
                })
            } else {
                acc.orderby[splitedKey[1]] = query[cur]
            }

        } else if(splitedKey[0] === 'where') {

            if(!acc.where) {
                Object.assign(acc, {
                    'where': {
                        [splitedKey[1]]: {
                            [splitedKey[2]]: query[cur]
                        }
                    }
                })
            } else {
                acc.where[splitedKey[1]] = {
                        [splitedKey[2]]: query[cur]
                    }
            }

        } else {
            Object.assign(acc, {
                [cur]: query[cur]
            })
        }


        return acc;
    }, {})

    req.query = modifiedQuery
    next()
}

type listingKeys = {
    orderby?: {
        [key: string]: any
    },

    where?: {
        [key: string]: any
    }
}