import { discoveryDatasetSchema } from '../domain/discovery'
import rawItems from './content.json'

export const publishedContentItems = discoveryDatasetSchema.parse(rawItems)
