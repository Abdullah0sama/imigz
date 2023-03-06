import { ZodTypeAny, z } from 'zod';
import express from 'express'
export const ComparatorsSchema = z.enum([
    'gte', 
    'gt', 
    'lte', 
    'lt', 
    'eq', 
    'neq'
])

export type ComparatorsEnum = z.infer<typeof ComparatorsSchema>

type ComparatorSymbols = '>=' | '=' | '<=' | '<' | '!=' | '>';

export const ComparatorsExpression: Record<ComparatorsEnum, ComparatorSymbols> = {
    'gte': '>=',
    'gt': '>',
    'lte': '<=',
    'lt': '<',
    'eq': '=',
    'neq': '!=',
}

export const SortOrder = z.enum([
    'asc',
    'desc'
])

export const castToArray = <T extends ZodTypeAny>(schema: T) => z.preprocess((arg) => {
    if(Array.isArray(arg)) return arg;
    else return [arg]
}, schema)

export type FileRequest = Pick<express.Request, 'headers' | 'pipe'>