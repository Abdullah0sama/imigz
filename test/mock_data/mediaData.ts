import { v4 as uuidv4 } from 'uuid'


export const mediaData1 = {
    title: 'Some title',
    description: 'Some description',
    key: uuidv4()
}

export const mediaData2 = {
    title: 'Some title',
    description: 'Some description',
    key: uuidv4(),
    fileType: 'jpeg',
    id: 1,
    created_at: new Date(),
    userRef: 12
}